const express = require("express");
const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");

const app = express();

app.use(cors());
app.use(express.json());

const bot = new TelegramBot(process.env.BOT_TOKEN || "", { polling: false });
const chatId = process.env.CHAT_ID || "";

app.get("/", (req, res) => {
  res.send("Football Studio Bot Online ✅");
});
app.post("/signal", async (req, res) => {
  const { entrada, protecao, gale, resultado } = req.body;

  let mensagem = `⚽ FOOTBALL STUDIO ⚽

🎯 Entrada: ${entrada}
🛡️ Proteção: ${protecao}`;

  if (gale) {
    mensagem += `

🔁 Gale: ${gale}`;
  }

  if (resultado) {
    mensagem += `

📢 Resultado: ${resultado}`;
  }

  mensagem += `

⏰ ${new Date().toLocaleTimeString("pt-PT")}`;

  try {
    await bot.sendMessage(chatId, mensagem);
    res.status(200).send("Sinal enviado ✅");
  } catch (error) {
    console.log("ERRO TELEGRAM:", error.message);
    res.status(500).send("Erro");
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor online na porta ${PORT}`));