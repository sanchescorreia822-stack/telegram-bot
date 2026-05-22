app.post("/webhook", async (req, res) => {
  const msg = req.body.message;

  if (msg && msg.text) {

    const chatId = msg.chat.id;
    const text = msg.text.toLowerCase();

    if (text === "/start") {

      await bot.sendMessage(chatId,
`⚽ FOOTBALL STUDIO VIP

🤖 Bot Online 24H
📊 Sinais automáticos
🔥 Bem-vindo ao canal VIP`
      );

    } else if (text === "sinal") {

      await bot.sendMessage(chatId,
`⚽ FOOTBALL STUDIO SIGNAL

🔴 ENTRADA: PLAYER
🟢 PROTEÇÃO: BANKER

⏰ Aguarde o próximo round`
      );

    } else {

      await bot.sendMessage(chatId,
"✅ Comando recebido");
    }
  }

  res.sendStatus(200);
});