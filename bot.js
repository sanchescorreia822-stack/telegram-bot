const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });
const chatId = process.env.CHAT_ID;

function getGameData() {
  return {
    outcomes: [
      { name: "Casa", probability: Math.random() },
      { name: "Azul", probability: Math.random() },
      { name: "Vermelho", probability: Math.random() }
    ]
  };
}

setInterval(async () => {
  try {
    const game = getGameData();

    const pred = await axios.post("http://localhost:4000/predict", game);

    const signal = pred.data;

    if (signal.confidence > 0.7) {

      await bot.sendMessage(chatId,
`🧠 SAAS AI BOT

🎯 PICK: ${signal.pick}
📊 Confiança: ${(signal.confidence * 100).toFixed(1)}%

⏳ A aguardar resultado...`
      );

      const fakeResult = game.outcomes
        .sort((a, b) => b.probability - a.probability)[0].name;

      const result = await axios.post("http://localhost:4000/result", {
        result: fakeResult,
        pick: signal.pick,
        confidence: signal.confidence
      });

      await bot.sendMessage(chatId,
`📊 RESULTADO

🏁 ${fakeResult}
${result.data.win ? "🟢 WIN" : "🔴 RED"}`
      );
    }

  } catch (err) {
    console.log(err.message);
  }
}, 60000);