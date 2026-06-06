const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
});
const chatId = process.env.CHAT_ID;

const express = require("express");
const app = express();
console.log("ODDS KEY:", process.env.ODDS_API_KEY);

app.get("/", (req, res) => {
  res.send("HOME OK");
});
app.get("/teste-chat", async (req, res) => {
  try {
    console.log("CHAT_ID:", chatId);
    await bot.sendMessage(chatId, "TESTE CHAT ID OK");
    res.send("ENVIADO");
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});
app.get("/teste", (req, res) => {
  res.send("TESTE OK");
});
setInterval(() => {
  bot.sendMessage(chatId, "Sinal automático");
}, 60000);

app.listen(process.env.PORT || 3000, () => {
  console.log("ONLINE");
});