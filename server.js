const TelegramBot = require("node-telegram-bot-api");

process.on("uncaughtException", (err) => {
  console.log("❌ ERROR:", err);
});

process.on("unhandledRejection", (err) => {
  console.log("❌ PROMISE ERROR:", err);
});

const { startSignalGenerator } = require("./signalGenerator");
const { startResultChecker } = require("./resultChecker");

const TOKEN = process.env.TELEGRAM_TOKEN;

if (!TOKEN) throw new Error("Missing TELEGRAM_TOKEN");

const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🚀 Bot ativo");
});

console.log("🚀 SYSTEM RUNNING");

startSignalGenerator();
startResultChecker();