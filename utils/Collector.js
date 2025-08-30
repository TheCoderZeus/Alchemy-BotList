const { ComponentType } = require('discord.js');

class Collector {
    static async collectBotId(channel, userId, timeLimit = 60000) {
        return new Promise((resolve, reject) => {
            const filter = (m) => m.author.id === userId;
            
            const collector = channel.createMessageCollector({
                filter,
                max: 1,
                time: timeLimit
            });

            collector.on('collect', (message) => {
                const botId = message.content.trim();
                resolve(botId);
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    reject(new Error('Tempo limite excedido. A solicitação foi cancelada por inatividade. Tente novamente quando estiver pronto para fornecer o ID do bot.'));
                }
            });
        });
    }

    static async waitForResponse(channel, userId, prompt, timeLimit = 60000) {
        await channel.send(prompt);
        return this.collectBotId(channel, userId, timeLimit);
    }
}

module.exports = Collector;
