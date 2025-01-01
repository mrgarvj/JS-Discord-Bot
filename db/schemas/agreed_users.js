const { Schema, model } = require('mongoose');

const agreedUsersSchema = new Schema({
    name: String, // Username of the user
    userID: String, // Discord User ID
    timestamp: { type: Date, default: Date.now }, // Timestamp of agreement
});

module.exports = model('AgreedUser', agreedUsersSchema);