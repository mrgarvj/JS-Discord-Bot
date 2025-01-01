const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const { token, prefix } = require('./config.json'); // Removed mongoURI
const agreed_users = require('./db/schemas/agreed_users.js');

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Collection to store prefix and slash commands
client.commands = new Collection();
client.slashCommands = new Collection();

// Load prefix commands
const prefixCommandFiles = fs.readdirSync('./commands/prefix').filter(file => file.endsWith('.js'));
for (const file of prefixCommandFiles) {
  const command = require(`./commands/prefix/${file}`);
  client.commands.set(command.name, command);
}

// Load slash commands
const slashCommandFiles = fs.readdirSync('./commands/slash').filter(file => file.endsWith('.js'));
for (const file of slashCommandFiles) {
  const command = require(`./commands/slash/${file}`);
  client.slashCommands.set(command.data.name, command);
}

// Load events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Message handling for prefix commands
client.on('messageCreate', async (message) => {
  // Ignore messages from bots or without the prefix
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Check if the command exists
  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    // Check if the user has agreed to the terms
    const userAgreement = await agreed_users.findOne({ userID: message.author.id });

    // If user hasn't agreed yet, show rules and ask for agreement
    if (!userAgreement) {
      const botRulesEmbed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Bot Rules and Terms of Use')
        .setDescription('By using this bot, you agree to follow these rules and regulations:')
        .addFields(
          { name: '1. No Misuse of Commands', value: 'Do not spam or misuse commands in any way that could disrupt others.' },
          { name: '2. Follow Bot-Specific Guidelines', value: 'Adhere to any specific rules or restrictions associated with certain commands.' },
          { name: '3. Respect Cooldowns', value: 'Avoid trying to bypass command cooldowns to ensure fair usage for everyone.' },
          { name: '4. No Automated Usage', value: 'Do not use scripts, macros, or automation tools to interact with the bot.' },
          { name: '5. Report Issues', value: 'If you encounter bugs or problems, report them to the bot developer instead of exploiting them.' },
          { name: '6. No Malicious Activity', value: 'Do not attempt to hack, exploit, or harm the bot or its associated services.' },
          { name: '7. Privacy Respect', value: 'Avoid using commands to gather personal or sensitive information about others.' },
          { name: '8. Terms Subject to Change', value: 'These rules may be updated at any time. Continued usage of the bot implies agreement to the latest terms.' }
        )
        .setFooter({ text: 'Thank you for using the bot responsibly!' })
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('agree_button')
            .setLabel('Agree')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('disagree_button')
            .setLabel('Disagree')
            .setStyle(ButtonStyle.Danger)
        );

      await message.reply({
        embeds: [botRulesEmbed],
        components: [row],
        ephemeral: true
      });

      return;
    }

    // Execute the command if the user has agreed
    await command.execute(message, args);
  } catch (error) {
    console.error('Error executing command:', error);
    await message.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

// Handle interactions like button clicks (Agree/Disagree)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return; // Check if it's a button interaction

  try {
    // Check if the interaction has already been acknowledged or replied to
    if (interaction.replied || interaction.deferred) {
      console.log("Interaction already acknowledged");
      return; // If already replied or deferred, return to prevent further response
    }

    // Handle the button interaction
    if (interaction.customId === 'agree_button') {
      // Store agreement in the database (ensure this is called only once)
      await agreed_users.create({ userID: interaction.user.id });

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('agree_button')
            .setLabel('Agree')
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('disagree_button')
            .setLabel('Disagree')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true)
        );

      // Send a response or update the interaction
      await interaction.update({
        components: [row],
        content: 'You have agreed to the terms! You can now use the bot.',
        ephemeral: true
      });
    } else if (interaction.customId === 'disagree_button') {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('agree_button')
            .setLabel('Agree')
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('disagree_button')
            .setLabel('Disagree')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true)
        );

      // Update the interaction only once
      await interaction.update({
        components: [row],
        content: 'You have disagreed with the terms. You cannot use the bot. Please contact support for further assistance.',
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error handling interaction:', error);

    // Ensure no further replies if already acknowledged
    if (!interaction.replied) {
      await interaction.reply({
        content: 'An error occurred while processing your request.',
        ephemeral: true
      });
    }
  }
});

// Login to Discord
client.login(token);
