require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.BOT_TOKEN;
const webappUrl = process.env.WEBAPP_URL;
const apiUrl = process.env.API_URL || 'http://localhost:5000';

if (!token) {
  console.error('BOT_TOKEN topilmadi!');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log('Telegram Bot ishga tushdi...');

// /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '🛒 Do\'konga kirish',
          web_app: { url: `${webappUrl}?tgId=${user.id}` }
        }
      ],
      [
        { text: '📦 Buyurtmalarim', callback_data: 'my_orders' },
        { text: '📞 Aloqa', callback_data: 'contact' }
      ]
    ]
  };

  await bot.sendMessage(chatId, 
    `Salom, ${user.first_name}! 👋\n\nDo'konimizga xush kelibsiz!\n\n` +
    `Mahsulotlarni ko'rish va buyurtma berish uchun pastdagi tugmani bosing:`,
    { reply_markup: keyboard }
  );
});

// Callback handler
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  await bot.answerCallbackQuery(callbackQuery.id);

  if (data === 'my_orders') {
    await bot.sendMessage(chatId, '📦 Buyurtmalaringizni ko\'rish uchun ilovani oching:', {
      reply_markup: {
        inline_keyboard: [[{
          text: '📋 Buyurtmalar',
          web_app: { url: `${webappUrl}/orders?tgId=${callbackQuery.from.id}` }
        }]]
      }
    });
  }

  if (data === 'contact') {
    await bot.sendMessage(chatId, '📞 Biz bilan bog\'lanish:\n\nTel: +998 90 000 00 00\nEmail: info@shop.uz');
  }
});

// Web App data qabul qilish
bot.on('web_app_data', async (msg) => {
  const chatId = msg.chat.id;
  try {
    const data = JSON.parse(msg.web_app_data.data);
    
    if (data.type === 'order_created') {
      await bot.sendMessage(chatId,
        `✅ Buyurtmangiz qabul qilindi!\n\n` +
        `📋 Buyurtma #${data.orderNumber}\n` +
        `💰 Jami: ${data.total.toLocaleString()} so'm\n\n` +
        `Tez orada siz bilan bog'lanamiz!`
      );
    }
  } catch (err) {
    console.error('Web app data error:', err);
  }
});

// Error handling
bot.on('error', (error) => {
  console.error('Bot xatosi:', error);
});

module.exports = bot;
