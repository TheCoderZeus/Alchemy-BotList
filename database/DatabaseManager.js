const fs = require('fs');
const path = require('path');

class DatabaseManager {
    constructor() {
        this.dataPath = path.join(__dirname, 'queue.json');
        this.ensureDataFile();
    }

    ensureDataFile() {
        if (!fs.existsSync(this.dataPath)) {
            this.saveData({ bots: [], topics: {} });
        }
    }

    loadData() {
        try {
            const data = fs.readFileSync(this.dataPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return { bots: [], topics: {} };
        }
    }

    saveData(data) {
        fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    }

    addBot(botId, userId) {
        const data = this.loadData();
        const bot = {
            id: botId,
            addedBy: userId,
            addedAt: new Date().toISOString(),
            status: 'waiting',
            topicId: null
        };
        data.bots.push(bot);
        this.saveData(data);
        return bot;
    }

    getBotQueue() {
        const data = this.loadData();
        return data.bots.filter(bot => bot.status === 'waiting');
    }

    getBotByTopic(topicId) {
        const data = this.loadData();
        return data.bots.find(bot => bot.topicId === topicId);
    }

    updateBotStatus(botId, status, topicId = null) {
        const data = this.loadData();
        const botIndex = data.bots.findIndex(bot => bot.id === botId);
        if (botIndex !== -1) {
            data.bots[botIndex].status = status;
            if (topicId) data.bots[botIndex].topicId = topicId;
            this.saveData(data);
            return data.bots[botIndex];
        }
        return null;
    }

    addTopic(topicId, botId) {
        const data = this.loadData();
        data.topics[topicId] = { botId, createdAt: new Date().toISOString() };
        this.saveData(data);
    }

    removeBot(botId) {
        const data = this.loadData();
        data.bots = data.bots.filter(bot => bot.id !== botId);
        this.saveData(data);
    }
}

module.exports = DatabaseManager;
