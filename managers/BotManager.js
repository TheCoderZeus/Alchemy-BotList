const { EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const DatabaseManager = require('../database/DatabaseManager');

class BotManager {
    constructor() {
        this.db = new DatabaseManager();
    }

    async addBotToQueue(botId, userId, channel) {
        try {
            const bot = this.db.addBot(botId, userId);
            
                    const embed = new EmbedBuilder()
            .setTitle('📋 Solicitação de Análise Recebida')
            .setDescription(`O bot <@${botId}> foi adicionado com sucesso à nossa fila de análise. Nossa equipe iniciará a avaliação em breve para verificar se atende aos padrões de qualidade e segurança da plataforma.\n\nUm tópico dedicado será criado automaticamente para conduzir os testes necessários.`)
            .addFields(
                { name: 'Status Atual', value: 'Aguardando análise', inline: true },
                { name: 'Solicitado por', value: `<@${userId}>`, inline: true },
                { name: 'Próximos Passos', value: 'Aguarde a criação do tópico de teste', inline: false }
            )
            .setColor(0x3498db)
            .setTimestamp()
            .setFooter({ text: 'Sistema de Gerenciamento de Bots' });

            await channel.send({ embeds: [embed] });
            
            const topic = await this.createTestTopic(channel, botId);
            this.db.updateBotStatus(botId, 'testing', topic.id);
            this.db.addTopic(topic.id, botId);
            
            return bot;
        } catch (error) {
            throw new Error(`Erro ao adicionar bot: ${error.message}`);
        }
    }

    async createTestTopic(channel, botId) {
        let botName = 'Desconhecido';
        try {
            const botUser = await channel.client.users.fetch(botId);
            botName = botUser.username;
        } catch (error) {
            console.log('Erro ao buscar nome do bot:', error);
        }

        const topic = await channel.threads.create({
            name: `Teste - ${botName} (${botId})`,
            type: ChannelType.PublicThread,
            reason: 'Tópico para teste de bot'
        });

        const embed = new EmbedBuilder()
            .setTitle('🔬 Ambiente de Teste Criado')
            .setDescription(`Este é o ambiente oficial de teste para análise do bot **${botName}**. Aqui será realizada uma avaliação completa das funcionalidades, performance e conformidade com nossos padrões.\n\n**Instruções para a Equipe:**\nApós concluir todos os testes necessários, utilize os comandos de decisão disponíveis exclusivamente neste tópico.`)
            .addFields(
                { name: 'Bot em Teste', value: `<@${botId}> (${botName})`, inline: true },
                { name: 'Comandos Disponíveis', value: '`.aprovar` - Aceitar o bot na plataforma\n`.reprovar` - Rejeitar a solicitação', inline: true },
                { name: 'Status', value: 'Análise em andamento', inline: false }
            )
            .setColor(0xe67e22)
            .setTimestamp()
            .setFooter({ text: 'Tópico será arquivado automaticamente após decisão' });

        const deleteButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`delete_topic_${topic.id}`)
                    .setLabel('Excluir Tópico')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🗑️')
            );

        await topic.send({ 
            content: `<@${botId}> - Bot em teste: **${botName}**`,
            embeds: [embed],
            components: [deleteButton]
        });

        return topic;
    }

    async approveBot(topicId, userId) {
        const bot = this.db.getBotByTopic(topicId);
        if (!bot) {
            throw new Error('Nenhum bot encontrado para este tópico.');
        }

        this.db.updateBotStatus(bot.id, 'approved');
        
        const embed = new EmbedBuilder()
            .setTitle('✅ Análise Concluída - Bot Aprovado')
            .setDescription(`Após uma análise detalhada, o bot <@${bot.id}> foi **aprovado** e agora faz parte da nossa plataforma oficial. O bot atendeu a todos os critérios de qualidade, segurança e funcionalidade estabelecidos.\n\n**Parabéns!** O bot está agora disponível para uso pelos usuários da comunidade.`)
            .addFields(
                { name: 'Decisão Tomada Por', value: `<@${userId}>`, inline: true },
                { name: 'Status Final', value: 'Aprovado e Ativo', inline: true },
                { name: 'Data da Aprovação', value: new Date().toLocaleDateString('pt-BR'), inline: true }
            )
            .setColor(0x27ae60)
            .setTimestamp()
            .setFooter({ text: 'Este tópico será arquivado em alguns segundos' });

        return { embed, botId: bot.id };
    }

    async rejectBot(topicId, userId) {
        const bot = this.db.getBotByTopic(topicId);
        if (!bot) {
            throw new Error('Nenhum bot encontrado para este tópico.');
        }

        this.db.updateBotStatus(bot.id, 'rejected');
        
        const embed = new EmbedBuilder()
            .setTitle('❌ Análise Concluída - Bot Não Aprovado')
            .setDescription(`Após uma avaliação criteriosa, o bot <@${bot.id}> **não foi aprovado** para integração à nossa plataforma. Infelizmente, alguns aspectos não atenderam aos nossos padrões estabelecidos.\n\n**Recomendação:** O desenvolvedor pode corrigir os pontos identificados e solicitar uma nova análise no futuro.`)
            .addFields(
                { name: 'Decisão Tomada Por', value: `<@${userId}>`, inline: true },
                { name: 'Status Final', value: 'Não Aprovado', inline: true },
                { name: 'Data da Decisão', value: new Date().toLocaleDateString('pt-BR'), inline: true }
            )
            .setColor(0xe74c3c)
            .setTimestamp()
            .setFooter({ text: 'Este tópico será arquivado em alguns segundos' });

        return { embed, botId: bot.id };
    }

    getQueueList() {
        const queue = this.db.getBotQueue();
        
        if (queue.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle('📊 Status da Fila de Análise')
                .setDescription('**Fila Vazia**\n\nAtualmente não há bots aguardando análise em nossa plataforma. Todos os bots solicitados foram processados com sucesso.\n\nPara adicionar um novo bot à fila, utilize o comando `.add` ou `/add` e siga as instruções.')
                .addFields(
                    { name: 'Bots na Fila', value: '0', inline: true },
                    { name: 'Status do Sistema', value: 'Disponível para novas solicitações', inline: true }
                )
                .setColor(0x95a5a6)
                .setTimestamp()
                .setFooter({ text: 'Sistema de Gerenciamento de Bots' });
            return embed;
        }

        const description = `**Bots Aguardando Análise**\n\nEsta é a lista atual de bots que estão aguardando revisão e aprovação pela nossa equipe. Cada bot passará por um processo rigoroso de teste antes da decisão final.\n\n${queue.map((bot, index) => 
            `**${index + 1}.** <@${bot.id}>\n└ Solicitado por: <@${bot.addedBy}>\n└ Data: ${new Date(bot.addedAt).toLocaleDateString('pt-BR')}`
        ).join('\n\n')}`;

        const embed = new EmbedBuilder()
            .setTitle('📊 Fila de Análise de Bots')
            .setDescription(description)
            .addFields(
                { name: 'Total na Fila', value: queue.length.toString(), inline: true },
                { name: 'Status', value: 'Processando solicitações', inline: true },
                { name: 'Tempo Médio', value: 'Varia conforme complexidade', inline: true }
            )
            .setColor(0x3498db)
            .setTimestamp()
            .setFooter({ text: `Sistema de Gerenciamento de Bots • ${queue.length} bot${queue.length > 1 ? 's' : ''} na fila` });

        return embed;
    }

    async deleteTopic(topicId, userId) {
        try {
            const bot = this.db.getBotByTopic(topicId);
            if (bot) {
                this.db.removeBot(bot.id);
            }
            
            return {
                success: true,
                message: 'Tópico será excluído em alguns segundos.'
            };
        } catch (error) {
            return {
                success: false,
                message: `Erro ao excluir tópico: ${error.message}`
            };
        }
    }
}

module.exports = BotManager;
