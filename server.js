const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(express.json());

const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

const bot = new TelegramBot(token, { polling: false });

/* 👇 AQUI É O LUGAR CERTO (FORA DAS ROTAS) */
setInterval(() => {
  const sinais = [
    "📊 SINAL AUTOMÁTICO: AZUL",
    "📊 SINAL AUTOMÁTICO: VERMELHO",
    "📊 SINAL AUTOMÁTICO: EMPATE"
  ];

  const random = sinais[Math.floor(Math.random() * sinais.length)];

  bot.sendMessage(chatId, random);
}, 60000);

/* ROTAS NORMALMENTE EM BAIXO */
app.get("/", (req, res) => {
  res.send("Football Studio Bot Online ✅");
});
app.post("/api/data", (req, res) => {
  const { oddAzul, oddVermelho } = req.body;

  let sinal = "";

  if (oddAzul < oddVermelho) {
    sinal = "📊 SINAL BASEADO EM ODDS: AZUL";
  } else {
    sinal = "📊 SINAL BASEADO EM ODDS: VERMELHO";
  }

  bot.sendMessage(chatId, sinal);

  res.sendStatus(200);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bot a correr na porta " + PORT);
});