const axios = require("axios");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

console.log("BOT_TOKEN:", BOT_TOKEN ? "OK" : "MISSING");
console.log("CHAT_ID:", CHAT_ID ? "OK" : "MISSING");

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
    console.log("Erro Telegram FULL:", err.response?.data || err.message);
  }
}
module.exports = { sendSignal };