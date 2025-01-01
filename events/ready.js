const { ActivityType, escapeBold } = require('discord.js');
const cowsay = require('cowsay');
const mongoose = require('mongoose');
const { mongoURL } = require('../config.json')

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {

        client.user.setActivity({
            name: 'With Your Mom',
            type: ActivityType.Playing,
        });

        if (!mongoURL) {
            console.log(cowsay.say({
                text: 'Im started & ready!',
                f : 'daemon'
            }));
            return
        };

        await mongoose.connect(mongoURL || '');

        if (mongoose.connect) {
            console.log(cowsay.say({
                text: 'Im started & ready with database!!',
                f : 'cheese'
            }));
        }
    },
};