let running = false;
let lastCheckedRound = null;

function startResultChecker() {
  setInterval(async () => {
    if (running) return;
    running = true;

    try {
      const state = await getResult();

      if (!state?.round || !state?.result) return;

      if (state.round === lastCheckedRound) return;
      lastCheckedRound = state.round;

      const history = loadHistory();

      const pending = history.find(h => h.status === "PENDING");
      if (!pending) return;

      pending.result = state.result;
      pending.status = "DONE";
      pending.win = pending.signal === state.result;

      saveHistory(history);

      sendSignal({
        signal: `Resultado: ${state.result} | ${pending.win ? "WIN ✅" : "LOSS ❌"}`,
        confidence: 80
      });

      console.log("✔ FECHADO:", pending);
   setInterval(async () => {
      if (running) return;
     running = true;

  console.log("🔄 checking...");

  try {
    const state = await getResult();
    console.log("STATE:", state);

    if (!state) return;

  } finally {
    running = false;
  }

}, 5000);
    