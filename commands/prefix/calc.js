module.exports = {
    name: 'calc',
    description: 'Calculates and gives you an accurate answer... sometimes approx.',
    async execute(message, args) {
      // Join the args into a single string expression
      const equation = args.join(' ');
  
      // Validate the expression to only allow numbers and basic math operators
      const validExpression = /^[0-9+\-*/().\s]*$/;
  
      if (!validExpression.test(equation)) {
        return message.channel.send('Invalid expression. Please use numbers and the operators +, -, *, /.');
      }
  
      try {
        // Evaluate the expression
        const result = eval(equation);
        message.channel.send(`The answer is ${result}`);
      } catch (error) {
        message.channel.send('Error calculating the expression. Please try again.');
      }
    },
  };