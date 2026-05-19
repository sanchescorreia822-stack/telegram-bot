const bot = require("./bot");

const CHANNEL_ID = "@seucanal";

async function sendSignal(color) {

    await bot.sendMessage(CHANNEL_ID,
`🚨 ANALISANDO 🚨`);

    setTimeout(async () => {

        let emoji = color === "blue" ? "🔵" : "🔴";

        await bot.sendMessage(CHANNEL_ID,
`🎯 ENTRADA CONFIRMADA

${emoji} Entrar no ${color.toUpperCase()}
🟡 Proteção no EMPATE
🎯 Fazer até 2 GALES`);

    }, 3000);
}

module.exports = sendSignal;