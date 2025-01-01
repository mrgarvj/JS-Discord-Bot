const { REST, Routes } = require('discord.js');
const { token, client_id } = require('./config.json'); // Adjust path to your config.json

const rest = new REST({ version: '10' }).setToken(token);

// Fetch all commands, then selectively delete
async function clearCommands() {
  try {
    // Fetch all registered commands
    const commands = await rest.get(Routes.applicationCommands(client_id));

    console.log('Attempting to clear non-entry point commands...');
    for (const command of commands) {
      await rest.delete(Routes.applicationCommand(client_id, command.id));
      console.log(`Deleted command: ${command.name}`);
    }
    
    console.log('Successfully cleared all non-entry point commands.');
  } catch (error) {
    console.error('Error clearing commands:', error);
  }
}

clearCommands();
