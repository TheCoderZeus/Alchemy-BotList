const { SlashCommandBuilder } = require('discord.js');
const BotManager = require('../managers/BotManager');
const Validator = require('../utils/Validator');
const Collector = require('../utils/Collector');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Adiciona um bot à fila de análise'),

    async execute(interaction) {
        const botManager = new BotManager();
        
        try {
            await interaction.reply({
                content: '**Solicitação de Análise de Bot**\n\nPor favor, envie o ID numérico do bot que você deseja submeter para análise. Certifique-se de que o ID está correto e pertence a um bot válido.',
                ephemeral: true
            });

            const botId = await Collector.waitForResponse(
                interaction.channel,
                interaction.user.id,
                '',
                30000
            );

            if (!Validator.isValidBotId(botId)) {
                return interaction.followUp({
                    content: '**Erro de Validação**\n\nO ID fornecido não é válido. IDs de bots Discord devem conter entre 17 e 19 dígitos numéricos. Verifique o ID e tente novamente.',
                    ephemeral: true
                });
            }

            const botUser = await Validator.getBotInfo(interaction.client, botId);
            if (!botUser) {
                return interaction.followUp({
                    content: '**Bot Não Encontrado**\n\nNão foi possível localizar um bot com esse ID ou o usuário não é um bot válido. Certifique-se de que:\n• O ID está correto\n• O bot existe no Discord\n• O bot não foi deletado',
                    ephemeral: true
                });
            }

            await botManager.addBotToQueue(botId, interaction.user.id, interaction.channel);
            await interaction.followUp({
                content: `**Solicitação Processada**\n\nO bot **${botUser.username}** foi adicionado com sucesso à fila de análise. Um tópico dedicado será criado automaticamente para conduzir os testes necessários.`,
                ephemeral: true
            });

        } catch (error) {
            await interaction.followUp(Validator.formatError(error.message));
        }
    },
};
