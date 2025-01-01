const { SlashCommandBuilder, REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { token, client_id } = require('../../config.json'); // Adjust path to your config.json

const rest = new REST({ version: '10' }).setToken(token);

async function listCommands() {
  try {
    // Fetch all slash commands for the application
    const slashCommands = await rest.get(Routes.applicationCommands(client_id));
    const prefixCommandFiles = fs.readdirSync(path.join(__dirname, '../../commands/prefix')).filter(file => file.endsWith('.js'));

    // Store commands in objects for easy comparison
    const slashCommandMap = {};
    const prefixCommandMap = {};

    // Collect slash commands
    slashCommands.forEach(command => {
      if (command.name !== "launch") {
        slashCommandMap[command.name] = command.description;
      }
    });

    // Collect prefix commands
    for (const file of prefixCommandFiles) {
      const command = require(`../../commands/prefix/${file}`);
      if (command.name !== 'launch') {
        prefixCommandMap[command.name] = command.description;
      }
    }

    // Find common commands
    const commonCommands = [];
    const uniqueSlashCommands = [];
    const uniquePrefixCommands = [];

    for (const name in slashCommandMap) {
      if (name in prefixCommandMap) {
        commonCommands.push({ name, description: slashCommandMap[name] });
      } else {
        uniqueSlashCommands.push({ name, description: slashCommandMap[name] });
      }
    }

    for (const name in prefixCommandMap) {
      if (!(name in slashCommandMap)) {
        uniquePrefixCommands.push({ name, description: prefixCommandMap[name] });
      }
    }

    // Create fields for the embed
    const fields = [];

    if (commonCommands.length > 0) {
      fields.push({
        name: 'COMMON COMMANDS',
        value: commonCommands.map((command, index) => `${index + 1}. **${command.name}:** ${command.description}`).join('\n'),
      });
    }

    if (uniqueSlashCommands.length > 0) {
      fields.push({
        name: 'SLASH COMMANDS',
        value: uniqueSlashCommands.map((command, index) => `${index + 1}. **${command.name}:** ${command.description}`).join('\n'),
      });
    }

    if (uniquePrefixCommands.length > 0) {
      fields.push({
        name: 'PREFIX COMMANDS',
        value: uniquePrefixCommands.map((command, index) => `${index + 1}. **${command.name}:** ${command.description}`).join('\n'),
      });
    }

    // If no commands found, return a message
    if (fields.length === 0) {
      return new EmbedBuilder()
        .setColor('Red  ')
        .setTitle('No Commands Available')
        .setDescription('No commands were found in either category.');
    }

    // Construct the embed
    const embed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle('Available Commands')
      .addFields(fields)
      .setTimestamp();

    return embed;
  } catch (error) {
    console.error('Error fetching commands:', error);
    return new EmbedBuilder()
      .setColor('Red')
      .setTitle('Error')
      .setDescription(`Failed to fetch commands. Error: ${error.message}`);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('commands')
    .setDescription('Shows all the registered slash and prefix commands'),
    
  async execute(interaction) {
    const commandEmbed = await listCommands(); // Fetch the commands and get the embed
    await interaction.reply({ embeds: [commandEmbed] }); // Reply with the embed
  },
};