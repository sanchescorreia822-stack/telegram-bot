const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔐 COLOCA AQUI OS TEUS DADOS
const TELEGRAM_TOKEN = "SEU_TOKEN_DO_BOT";
const CHAT_ID = "SEU_CHAT_ID";

// 📩 FUNÇÃO QUE ENVIA PARA TELEGRAM
async function sendTelegram(msg) {
  await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: CHAT_ID,
    text: msg,
  });
}

// ⚽ WEBHOOK DO FOOTBALL STUDIO
app.post("/webhook", async (req, res) => {
  const event = req.body;

  if (event.type === "entrada_confirmada") {
    console.log("Entrada confirmada ✔️");

    await sendTelegram(
      `⚽ Entrada confirmada!\nJogo: ${event.jogo}\nOdds: ${event.odds}`
    );
  }

  res.sendStatus(200);
});

// 🚀 LIGAR SERVIDOR
app.listen(3000, () => {
  console.log("Servidor a correr na porta 3000");
});