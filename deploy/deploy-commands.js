const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

async function deployCommands(clientId, guildId, token) {
    const commands = [];
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            console.log(`✅ Comando ${command.data.name} carregado`);
        } else {
            console.log(`⚠️ Comando em ${filePath} está faltando "data" ou "execute"`);
        }
    }

    const rest = new REST().setToken(token);

    try {
        console.log(`🔄 Iniciando atualização de ${commands.length} comandos...`);

        let data;
        if (guildId) {
            data = await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands },
            );
            console.log(`✅ ${data.length} comandos registrados no servidor ${guildId}`);
        } else {
            data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );
            console.log(`✅ ${data.length} comandos registrados globalmente`);
        }
    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
        throw error;
    }
}

module.exports = { deployCommands };
