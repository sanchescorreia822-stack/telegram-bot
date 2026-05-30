const express = require("express");
const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");

const app = express();

app.use(cors());
app.use(express.json());

const bot = new TelegramBot(process.env.BOT_TOKEN || "", { polling: false });
const chatId = process.env.CHAT_ID || "";

app.post("/signal", async (req, res) => {
  const { entrada, protecao } = req.body;

  try {
    await bot.sendMessage(
      chatId,
      `📊 SINAL FOOTBALL STUDIO\n\nEntrada: ${entrada}\nProteção: ${protecao}`
    );

    res.status(200).send("Sinal enviado para Telegram ✅");
  } catch (error) {
    console.log("ERRO TELEGRAM:", error.message);
    res.status(500).send("Erro ao enviar mensagem");
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor online na porta ${PORT}`));