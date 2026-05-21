const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();

app.use(express.json()); // 🔥 IMPORTANTE

const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

const bot = new TelegramBot(token, { polling: false });

// 🌍 teste servidor
app.get("/", (req, res) => {
  res.send("BOT ONLINE OK");
});

// 🚀 enviar mensagem manual
app.get("/send", async (req, res) => {
  try {
    await bot.sendMessage(chatId, "🚀 SINAL TESTE FOOTBALL STUDIO");
    res.send("Mensagem enviada!");
  } catch (error) {
    res.send(error.message);
  }
});

// 🔥 WEBHOOK DO TELEGRAM (FALTAVA ISTO)
app.post("/webhook", async (req, res) => {
  try {
    const update = req.body;

    console.log("Update recebido:", update);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor a correr na porta " + PORT);
});