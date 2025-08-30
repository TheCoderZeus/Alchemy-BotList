const { SlashCommandBuilder } = require('discord.js');
const BotManager = require('../managers/BotManager');
const Validator = require('../utils/Validator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reprovar')
        .setDescription('Reprova o bot em teste no tópico atual'),

    async execute(interaction) {
        const botManager = new BotManager();
        
        try {
            if (!Validator.isInThread(interaction.channel)) {
                return interaction.reply({
                    content: '**Comando Restrito**\n\nEste comando só pode ser executado dentro de um tópico de teste específico. Para reprovar um bot, você deve:\n\n• Estar no tópico criado para o teste do bot\n• Ter identificado problemas durante a análise\n• Documentar os motivos da reprovação antes de executar o comando',
                    ephemeral: true
                });
            }

            const result = await botManager.rejectBot(interaction.channel.id, interaction.user.id);
            
            await interaction.reply({
                embeds: [result.embed]
            });

            setTimeout(async () => {
                try {
                    await interaction.channel.setArchived(true);
                } catch (error) {
                    console.log('Erro ao arquivar tópico:', error);
                }
            }, 5000);

        } catch (error) {
            await interaction.reply(Validator.formatError(error.message));
        }
    },
};
