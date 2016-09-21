var TelegramBot = require('node-telegram-bot-api');
var config = require ('./config');

var token = config.telegramToken;
var bot = new TelegramBot(token, {polling: true});

try {
  bot.onText(/\/rules/, function (msg, match) {
    var fromId = msg.from.id;
    bot.sendMessage(fromId, config.rules);
  });
} catch (e) {
  console.log('exception: ', e.result);
}


