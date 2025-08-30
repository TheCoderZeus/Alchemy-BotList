class Validator {
    static isValidBotId(id) {
        return /^\d{17,19}$/.test(id);
    }

    static isInThread(channel) {
        return channel.isThread();
    }

    static async getBotInfo(client, botId) {
        try {
            const user = await client.users.fetch(botId);
            return user.bot ? user : null;
        } catch (error) {
            return null;
        }
    }

    static formatError(message) {
        return {
            content: `**Erro no Sistema**\n\n${message}\n\nVerifique os dados fornecidos e tente novamente. Se o problema persistir, contate a administração.`,
            ephemeral: true
        };
    }

    static formatSuccess(message) {
        return {
            content: `**Operação Realizada**\n\n${message}`,
            ephemeral: true
        };
    }
}

module.exports = Validator;
