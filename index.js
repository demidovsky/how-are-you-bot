require('dotenv').config();
const Bot = require('node-telegram-bot-api');
const cron = require('node-cron');
const token = process.env.TOKEN;
const bot = new Bot(token, {polling: true});

const BOT_STATE = {
  WAIT_BRIEF_ANSWER: 1,
  WAIT_FULL_ANSWER: 2,
  IDLE: 3
};

let botState = BOT_STATE.IDLE;

let chatIds = [];

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  // console.log('msg', msg.text.toString());
  if (!chatIds.includes(msg.chat.id)) {
    chatIds.push(chatId);
    console.log('Registered', chatId);
  }

  switch (botState) {
    case BOT_STATE.WAIT_BRIEF_ANSWER:
      bot.sendMessage(chatId, 'Понятно, а поподробнее?');
      botState = BOT_STATE.WAIT_FULL_ANSWER;
      break;

    case BOT_STATE.WAIT_FULL_ANSWER: {
      bot.sendMessage(chatId, 'Ясно.');
      botState = BOT_STATE.IDLE;
      break;
    }

    case BOT_STATE.IDLE:
    default: {
      bot.sendMessage(chatId, 'Я напишу позже.');
    }    
  }
});

// bot.on("callback_query", (callbackQuery) => {
//   const message = callbackQuery.message;
// }

const offset = new Date().getTimezoneOffset() / 60;
const hours = [0, 12];
const cronHours = hours.map(hour => {
  let utcHour = hour + offset;
  if (utcHour < 0) utcHour = 24 - utcHour;
  if (utcHour >= 24) utcHour = utcHour - 24;
  return utcHour;
});
const schedule = `0 ${cronHours} * * *`;
// const schedule = `0,10,20,30,40,50 * * * *`;
console.log('Scheduled (UTC):', schedule);


cron.schedule(schedule, async () => {
  console.log('Cron task');
  chatIds.forEach(chatId => {
    bot.sendMessage(chatId, 'Привет! Как оно?');/*, {
      reply_markup: {
        inline_keyboard: [[
          {
            text: 'Хорошо',
            callback_data: 'Хорошо'
          },{
            text: 'Не очень',
            callback_data: 'Не очень'
          }
        ]]
      }
    });*/
    botState = BOT_STATE.WAIT_BRIEF_ANSWER;
  });
});
