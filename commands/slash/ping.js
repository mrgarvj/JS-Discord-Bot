const { SlashCommandBuilder } = require('discord.js');
const { sleep } = require('../Utility/sleep function');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong and the latency in ms!'),
  
  async execute(interaction) {
    // Reply to interaction and fetch the message object
    const msg = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    
    // Wait for 2 seconds before calculating latency
    await sleep(2000);

    // Calculate latency
    const latency = msg.createdTimestamp - interaction.createdTimestamp;

    // Edit reply with the latency
    await interaction.editReply(`Pong! in ${latency}ms :ping_pong:`);
  },
};
