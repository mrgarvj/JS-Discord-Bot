const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('calc')
    .setDescription('Calculates and gives you an accurate answer... sometimes approx.')
    .addStringOption(option =>
      option.setName('expression')
        .setDescription('Enter the expression here')
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply(); // Acknowledge the interaction

    const equation = interaction.options.getString('expression');

    // Validate the expression to only allow numbers and basic math operators
    const validExpression = /^[0-9+\-*/().\s]*$/;

    if (!validExpression.test(equation)) {
      await interaction.editReply('Invalid expression. Please use numbers and the operators +, -, *, /.');
      return;
    }

    try {
      // Evaluate the expression
      const result = eval(equation);
      await interaction.editReply(`The answer is ${result}`);
    } catch (error) {
      await interaction.editReply('Error calculating the expression. Please try again.');
    }
  }
};
