const { SlashCommandBuilder } = require('discord.js');
const BotManager = require('../managers/BotManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lista')
        .setDescription('Mostra a fila de bots esperando análise'),

    async execute(interaction) {
        const botManager = new BotManager();
        
        try {
            const embed = botManager.getQueueList();
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: `**Erro no Sistema**\n\nNão foi possível recuperar a lista de bots no momento: ${error.message}\n\nTente novamente em alguns instantes. Se o problema persistir, contate a administração.`,
                ephemeral: true
            });
        }
    },
};
