const BotManager = require('../managers/BotManager');
const Validator = require('../utils/Validator');
const Collector = require('../utils/Collector');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;
        
        const content = message.content.trim();
        if (!content.startsWith('.')) return;

        const args = content.slice(1).split(' ');
        const command = args[0].toLowerCase();

        const botManager = new BotManager();

        try {
            switch (command) {
                case 'add':
                    await handleAdd(message, botManager);
                    break;
                case 'aprovar':
                    await handleAprovar(message, botManager);
                    break;
                case 'reprovar':
                    await handleReprovar(message, botManager);
                    break;
                case 'lista':
                    await handleLista(message, botManager);
                    break;
            }
        } catch (error) {
            await message.reply(`❌ Erro: ${error.message}`);
        }
    },
};

async function handleAdd(message, botManager) {
    try {
        await message.reply('**Solicitação de Análise de Bot**\n\nPor favor, envie o ID numérico do bot que você deseja submeter para análise. Certifique-se de que o ID está correto e pertence a um bot válido.');

        const botId = await Collector.collectBotId(message.channel, message.author.id, 30000);

        if (!Validator.isValidBotId(botId)) {
            return message.reply('**Erro de Validação**\n\nO ID fornecido não é válido. IDs de bots Discord devem conter entre 17 e 19 dígitos numéricos. Verifique o ID e tente novamente.');
        }

        const botUser = await Validator.getBotInfo(message.client, botId);
        if (!botUser) {
            return message.reply('**Bot Não Encontrado**\n\nNão foi possível localizar um bot com esse ID ou o usuário não é um bot válido. Certifique-se de que:\n• O ID está correto\n• O bot existe no Discord\n• O bot não foi deletado');
        }

        await botManager.addBotToQueue(botId, message.author.id, message.channel);
        await message.reply(`**Solicitação Processada**\n\nO bot **${botUser.username}** foi adicionado com sucesso à fila de análise. Um tópico dedicado será criado automaticamente para conduzir os testes necessários.`);

    } catch (error) {
        await message.reply(`**Erro no Processamento**\n\n${error.message}\n\nSe o problema persistir, entre em contato com a administração.`);
    }
}

async function handleAprovar(message, botManager) {
    if (!Validator.isInThread(message.channel)) {
        return message.reply('**Comando Restrito**\n\nEste comando só pode ser executado dentro de um tópico de teste específico. Para aprovar um bot, você deve:\n\n• Estar no tópico criado para o teste do bot\n• Ter concluído a análise necessária\n• Utilizar o comando apenas após verificar todas as funcionalidades');
    }

    const result = await botManager.approveBot(message.channel.id, message.author.id);
    
    await message.reply({
        embeds: [result.embed]
    });

    setTimeout(async () => {
        try {
            await message.channel.setArchived(true);
        } catch (error) {
            console.log('Erro ao arquivar tópico:', error);
        }
    }, 5000);
}

async function handleReprovar(message, botManager) {
    if (!Validator.isInThread(message.channel)) {
        return message.reply('**Comando Restrito**\n\nEste comando só pode ser executado dentro de um tópico de teste específico. Para reprovar um bot, você deve:\n\n• Estar no tópico criado para o teste do bot\n• Ter identificado problemas durante a análise\n• Documentar os motivos da reprovação antes de executar o comando');
    }

    const result = await botManager.rejectBot(message.channel.id, message.author.id);
    
    await message.reply({
        embeds: [result.embed]
    });

    setTimeout(async () => {
        try {
            await message.channel.setArchived(true);
        } catch (error) {
            console.log('Erro ao arquivar tópico:', error);
        }
    }, 5000);
}

async function handleLista(message, botManager) {
    const embed = botManager.getQueueList();
    await message.reply({ embeds: [embed] });
}
