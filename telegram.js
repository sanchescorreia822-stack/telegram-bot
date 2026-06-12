const axios = require("axios");
const { bot, chatId } = require("./telegram");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function sendSignal({ signal, confidence }) {
  const message = `
📊 SINAL GERADO
🎯 Direção: ${signal}
📈 Confiança: ${confidence}%
`;

  try {
    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: message
      }
    );
  } catch (err) {
    console.log("Erro Telegram:", err.message);
  }
}

module.exports = { sendSignal };