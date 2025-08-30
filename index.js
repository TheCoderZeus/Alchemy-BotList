const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { deployCommands } = require('./deploy/deploy-commands');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.commands = new Collection();

async function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`✅ Comando ${command.data.name} carregado`);
        } else {
            console.log(`⚠️ Comando em ${filePath} está faltando "data" ou "execute"`);
        }
    }
}

async function loadEvents() {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        console.log(`✅ Event ${event.name} carregado`);
    }
}

async function initialize() {
    try {
        let config;
        try {
            config = require('./config.js');
        } catch (error) {
            config = {
                token: process.env.DISCORD_TOKEN,
                clientId: process.env.CLIENT_ID,
                guildId: process.env.GUILD_ID
            };
        }

        const { token, clientId, guildId } = config;

        if (!token) {
            console.error('❌ TOKEN não encontrado');
            console.log('💡 Crie um arquivo config.js baseado no config.example.js');
            process.exit(1);
        }

        if (!clientId) {
            console.error('❌ CLIENT_ID não encontrado');
            console.log('💡 Adicione o CLIENT_ID no arquivo config.js');
            process.exit(1);
        }

        console.log('🔄 Carregando comandos...');
        await loadCommands();

        console.log('🔄 Carregando eventos...');
        await loadEvents();

        console.log('🔄 Fazendo deploy dos comandos...');
        await deployCommands(clientId, guildId, token);

        console.log('🔄 Conectando o bot...');
        await client.login(token);

    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        process.exit(1);
    }
}

process.on('unhandledRejection', error => {
    console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('❌ Uncaught exception:', error);
    process.exit(1);
});

initialize();
