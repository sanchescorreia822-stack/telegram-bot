const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(express.json());

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });
const chatId = process.env.CHAT_ID;

app.get("/", (req, res) => {
  res.send("Football Studio Bot Online ✅");
});

app.post("/signal", async (req, res) => {
  try {
    await bot.sendMessage(chatId, "⚽ SINAL RECEBIDO");
    res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    res.status(500).send("erro");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor online na porta ${PORT}`));