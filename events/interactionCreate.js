const agreed_users = require('../db/schemas/agreed_users.js');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      try {
        // Check if the user has agreed to the terms
        const userAgreement = await agreed_users.findOne({ userID: interaction.user.id });

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

          await interaction.reply({
            embeds: [botRulesEmbed],
            components: [row],
            ephemeral: true
          });

          return;
        }

        // If the user has agreed, proceed with the original command
        await command.execute(interaction);

      } catch (error) {
        console.error('Error executing command:', error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
  }
};
