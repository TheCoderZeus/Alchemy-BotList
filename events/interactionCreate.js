const BotManager = require('../managers/BotManager');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`❌ Comando ${interaction.commandName} não encontrado.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`❌ Erro ao executar ${interaction.commandName}:`, error);
                
                const errorMessage = {
                    content: '**Erro no Sistema**\n\nOcorreu um erro ao executar este comando. Tente novamente em alguns instantes.',
                    ephemeral: true
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        } else if (interaction.isButton()) {
            try {
                await handleButtonInteraction(interaction);
            } catch (error) {
                console.error('❌ Erro ao processar botão:', error);
                
                const errorMessage = {
                    content: '**Erro no Sistema**\n\nOcorreu um erro ao processar sua solicitação. Tente novamente.',
                    ephemeral: true
                };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }
    },
};

async function handleButtonInteraction(interaction) {
    const botManager = new BotManager();
    
    if (interaction.customId.startsWith('delete_topic_')) {
        const topicId = interaction.customId.replace('delete_topic_', '');
        
        await interaction.reply({
            content: '**Confirmação de Exclusão**\n\nO tópico e todos os dados relacionados serão removidos permanentemente.',
            ephemeral: true
        });

        const result = await botManager.deleteTopic(topicId, interaction.user.id);
        
        if (result.success) {
            setTimeout(async () => {
                try {
                    await interaction.channel.delete();
                } catch (error) {
                    console.log('Erro ao deletar tópico:', error);
                }
            }, 3000);
        } else {
            await interaction.followUp({
                content: `**Erro na Exclusão**\n\n${result.message}`,
                ephemeral: true
            });
        }
    }
}
