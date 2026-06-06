const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(express.json());

const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

const bot = new TelegramBot(token); // ❌ SEM polling

console.log("ODDS KEY:", process.env.ODDS_API_KEY);

// HOME
app.get("/", (req, res) => {
  res.send("HOME OK");
});

// TESTE CHAT
app.get("/teste-chat", async (req, res) => {
  try {
    console.log("CHAT_ID:", chatId);
    await bot.sendMessage(chatId, "TESTE CHAT ID OK");
    res.send("ENVIADO");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

// TESTE
app.get("/teste", (req, res) => {
  res.send("TESTE OK");
});

// 🔥 WEBHOOK (OBRIGATÓRIO)
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// 🔔 SINAL AUTOMÁTICO (CONTROLADO)
setInterval(() => {
  if (chatId) {
    bot.sendMessage(chatId, "Sinal automático");
  }
}, 60000);

// START SERVER
app.listen(process.env.PORT || 3000, () => {
  console.log("ONLINE");
});

