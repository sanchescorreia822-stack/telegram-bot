const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: false
});

function sendSignal(data) {
  const { signal, confidence } = data;

  const msg =
`📊 FOOTBALL STUDIO PRO

🎯 Sinal: ${signal.toUpperCase()}
🔥 Confiança: ${confidence}%

⏱ Hora: ${new Date().toLocaleString()}`;

  bot.sendMessage(process.env.TELEGRAM_CHAT_ID, msg)
    .catch(err => {
      console.log("TELEGRAM ERROR:", err.message);
    });
}

module.exports = { sendSignal };