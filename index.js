const TelegramBot = require("node-telegram-bot-api");

const { startResultChecker } = require("./resultChecker");
const { addPendingSignal } = require("./history");

// 🔥 CONFIG (Render / .env)
const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// 🔥 CRIAR BOT
const bot = new TelegramBot(TOKEN, { polling: true });

// 🔥 GLOBAL (para outros ficheiros usarem)
global.bot = bot;
global.chatId = CHAT_ID;

// 🔥 TESTE /START
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🤖 Bot ativo com sucesso!");
});

// 🔥 TESTE SINAL
bot.onText(/\/test/, () => {
  addPendingSignal("blue");

  bot.sendMessage(CHAT_ID, "📡 SINAL TESTE: BLUE");
});

// 🔥 INICIAR SISTEMA DE RESULTADOS
startResultChecker();

console.log("🚀 BOT INICIADO COM SUCESSO");