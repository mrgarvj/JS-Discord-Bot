const { sleep } = require('../Utility/sleep function');

module.exports = {
  name: 'ping',
  description: 'Replies with Pong and the latency in ms!',
  async execute(message, args) {
    const msg = await message.channel.send('Pinging...');
    await sleep(2000);
    const latency = msg.createdTimestamp - message.createdTimestamp; // Calculate latency

    // Reply with the latency information
    msg.edit(`Pong! in ${latency}ms :ping_pong:`);
  },
};
