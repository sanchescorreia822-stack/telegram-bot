const TelegramBot = require("node-telegram-bot-api");

const { startSignalGenerator } = require("./signalGenerator");
const { startResultChecker } = require("./resultChecker");
const { getStats } = require("./stats");

const TOKEN = process.env.TELEGRAM_TOKEN;

if (!TOKEN) throw new Error("❌ Missing TOKEN");

const bot = new TelegramBot(TOKEN, { polling: true });

// 🔥 start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🚀 Bot PRO ativo");
});

// 📊 stats real
bot.onText(/\/stats/, (msg) => {
  const s = getStats();

  bot.sendMessage(
    msg.chat.id,
    `📊 STATS\n\nWins: ${s.wins}\nLosses: ${s.losses}\nWin Rate: ${s.winRate}%`
  );
});

startSignalGenerator();
startResultChecker();

console.log("🚀 SYSTEM PRO RUNNING");