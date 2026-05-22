const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();

app.use(express.json()); // 👈 aqui em cima

const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

const bot = new TelegramBot(token, { polling: false });

app.get("/", (req, res) => {
  res.send("FOOTBALL STUDIO BOT ONLINE OK");
});

app.get("/send", async (req, res) => {
  try {
    await bot.sendMessage(chatId, "🚀 SINAL TESTE FOOTBALL STUDIO");
    res.send("Mensagem enviada!");
  } catch (error) {
    res.send(error.message);
  }
});

// 🔥 AQUI É ONDE TU COLOCAS O WEBHOOK
app.post("/webhook", async (req, res) => {
  const msg = req.body.message;

  if (msg && msg.text) {
    const chatId = msg.chat.id;

    await bot.sendMessage(chatId, "📊 SINAL FOOTBALL STUDIO RECEBIDO");
  }

  res.sendStatus(200);
});

// 👇 SEMPRE NO FINAL
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor a correr na porta " + PORT);
});