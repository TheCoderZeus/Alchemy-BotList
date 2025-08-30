module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`✅ Ligado em ${client.user.tag}`);
        console.log(`📊 Servindo ${client.guilds.cache.size} servidores`);
        console.log(`👥 Conectado a ${client.users.cache.size} usuários`);

        client.user.setActivity('Gerenciando lista de bots', { type: 'WATCHING' });
    },
};
