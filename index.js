var TelegramBot = require('node-telegram-bot-api');
var config = require ('./config');

var token = config.telegramToken;
var bot = new TelegramBot(token, {polling: true});

bot.onText(/\/rules/, function (msg, match) {
  var fromId = msg.from.id;
  var resp = match[1];
  bot.sendMessage(fromId, config.rules);
});

