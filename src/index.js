'use strict';

const TelegramBot = require('node-telegram-bot-api');
const config = require('../config/config');
const messages = require('../config/messages');
const winston = require('winston');
const path = require('path');
const moment = require('moment');

const token = config.telegramToken;
const bot = new TelegramBot(token, {polling: true});
let currentList = {
  askedAlready: []
};

winston
  .add(winston.transports.File, {filename: path.join(__dirname, './logs/debug.log')})
  .remove(winston.transports.Console);

try {
  bot.on('new_chat_participant', newChatParticipant);
  bot.onText(/\/rules/, newMsg);
  bot.onText(/\/list_do (10|15|20|25|30|40|50)$/, doList);
} catch (e) {
  winston.log('debug', 'exception found: ', {data: e});
}

function doList(msg, match) {
  let warSize = match[1];
  let username = msg.from.username || '';
  
  if (config.leaders.indexOf(msg.from.username) === -1) {
    bot.sendMessage(
      msg.chat.id,
      messages.onlyLeadersCanCreateLists,
      {reply_to_message_id: msg.message_id, parse_mode: 'Markdown'}
    );
  } else if (currentList.hasOwnProperty('expirationDate')) {
    // if expired, then send warning message
    // else send populated list
    bot.sendMessage(
      msg.chat.id,
      'ya la lista está creada gonorrea malparido...',
      {reply_to_message_id: msg.message_id, parse_mode: 'Markdown'}
    );
  } else {
    currentList.expirationDate = moment().add(40, 'hours');

    bot.sendMessage(
      msg.chat.id,
      setList(warSize)
    );
  }
}

function currentListExpired() {
  let nowIsGreaterThanExpDate = moment().diff(currentList.expirationDate, 'hours') > 0;
  console.log('nowIsGreaterThanExpDate: ', nowIsGreaterThanExpDate);
  if (currentList.hasOwnProperty('expirationDate') && nowIsGreaterThanExpDate) {
    return true;
  }

  return false;
}

function setList(warSize) {
  let list = messages.warListHeader;

  for (let i = 1; i <= warSize; i++) {
    list += `${i}.- \n`;
  }

  return list;
}

function newChatParticipant(msg) {
  winston.log('debug', 'msg: ', {data: msg});
  bot.sendMessage(
    msg.chat.id,
    getFullWelcomeMsg(msg),
    {reply_to_message_id: msg.message_id, parse_mode: 'Markdown'}
  );
}

function newMsg(msg) {
  winston.log('debug', 'msg: ', {data: msg});
  const fromId = msg.from.id;
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


