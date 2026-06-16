const axios = require("axios");

// 🔥 COLOCA AQUI O LINK REAL DO WINWIN / FOOTBALL STUDIO
const URL = "COLOCA_AQUI_O_ENDPOINT";

async function getGameState() {
  try {
    const res = await axios.get(URL);

    return res.data;
  } catch (err) {
    console.log("FS ERROR:", err.message);
    return null;
  }
}

module.exports = { getGameState };