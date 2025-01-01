const { REST, Routes } = require('discord.js');
const fs = require('fs');
const { token, client_id } = require('../config.json'); // Adjust path to your config.json

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}!`);

    const slashCommands = [];

    // Load slash commands
    const slashCommandFiles = fs.readdirSync('./commands/slash').filter(file => file.endsWith('.js'));
    for (const file of slashCommandFiles) {
      const command = require(`../commands/slash/${file}`);
      slashCommands.push(command.data.toJSON()); // Prepare for registration
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
      console.log('Started registering application (slash) commands.');

      // Retrieve existing commands
      const existingCommands = await rest.get(Routes.applicationCommands(client_id));

      // Merge existing commands with new commands
      const mergedCommands = [...existingCommands, ...slashCommands];

      // Remove duplicate commands
      const uniqueCommands = mergedCommands.filter((command, index, self) => self.findIndex((t) => t.name === command.name) === index);

      // Register commands globally
      await rest.put(
        Routes.applicationCommands(client_id), // Replace with your bot's client ID
        { body: uniqueCommands }
      );

      console.log('Successfully registered application (slash) commands.');
    } catch (error) {
      console.error('Error while registering slash commands:', error);
    }
  },
};