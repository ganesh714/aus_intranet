// backend/events/AuthEvents.js
const EventEmitter = require('events');
class AuthEmitter extends EventEmitter { }
const authEmitter = new AuthEmitter();
module.exports = authEmitter;
