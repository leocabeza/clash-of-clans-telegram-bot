'use strict';

const TelegramBot = require('node-telegram-bot-api');
const config = require('../config/config');
const messages = require('../config/messages');
const moment = require('moment');
const r = require('rethinkdb');

let connection;
const token = config.telegramToken;
const bot = new TelegramBot(token, {polling: true});

try {
  bot.on('new_chat_participant', newChatParticipant);
  bot.onText(/\/rules/, newMsg);
  bot.onText(/\/list_do (10|15|20|25|30|40|50)$/, doList);
} catch (e) {
  console.debug('exception found: ', {data: e});
}

function doList(msg, match) {
  let warSize = match[1];
  let username = msg.from.username || '';
  
  // https://github.com/yagop/node-telegram-bot-api#telegrambotgetchatadministratorschatid--promise
  if (config.leaders.indexOf(msg.from.username) === -1) {
    bot.sendMessage(
      msg.chat.id,
      messages.onlyLeadersCanCreateLists,
      {reply_to_message_id: msg.message_id, parse_mode: 'Markdown'}
    );
  } else {
    bot.sendMessage(
      msg.chat.id,
      setList(warSize)
    );
  }
}

function setList(warSize) {
  let list = messages.warListHeader;

  for (let i = 1; i <= warSize; i++) {
    list += `${i}.- \n`;
  }

  return list;
}

function newChatParticipant(msg) {
  bot.sendMessage(
    msg.chat.id,
    getFullWelcomeMsg(msg),
    {reply_to_message_id: msg.message_id, parse_mode: 'Markdown'}
  );
}

function newMsg(msg) {
  let fromId = msg.from.id;
  bot.sendMessage(fromId, messages.rules);
}

function getFullWelcomeMsg(msg) {
  let nameToBeShown = msg.new_chat_member.first_name;
  if (msg.new_chat_member.username) {
    nameToBeShown = '@' + msg.new_chat_member.username;
  } else if (msg.new_chat_member.hasOwnProperty('last_name')) {
    nameToBeShown = nameToBeShown + ' ' + msg.new_chat_member.last_name;
  }

  return messages.welcomeMsg.replace('#{name}', nameToBeShown);
}
