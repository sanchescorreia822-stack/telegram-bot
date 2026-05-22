const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();

app.use(express.json());

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: false });

app.get("/", (req, res) => {
  res.send("Football Studio Bot Online ✅");
});

app.post("/signal", async (req, res) => {
  const { entrada, protecao } = req.body || {};

  const chatId = process.env.CHAT_ID; // melhor usar env

  try {
    await bot.sendMessage(
      chatId,
`⚽ FOOTBALL STUDIO VIP

🎯 ENTRADA: ${entrada}
🛡️ PROTEÇÃO: ${protecao}

🔥 SINAL AUTOMÁTICO`
    );

    res.sendStatus(200);
  } catch (error) {
    console.log("Erro ao enviar mensagem:", error);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor online na porta ${PORT}`);
});