let lastCheckedRound = null;
let running = false;

function startResultChecker() {
  setInterval(async () => {
    if (running) return;
    running = true;

    try {
      const state = await getResult();

      if (!state || !state.round || !state.result) return;

      if (state.round === lastCheckedRound) return;
      lastCheckedRound = state.round;

      const history = loadHistory();

      // pega o último PENDING (mais seguro que find)
      const pendingIndex = history
        .map((h, i) => ({ ...h, i }))
        .filter(h => h.status === "PENDING")
        .pop();

      if (!pendingIndex) return;

      const pending = history[pendingIndex.i];

      pending.result = state.result;
      pending.status = "DONE";
      pending.win = pending.signal === state.result;

      saveHistory(history);

      sendSignal({
        signal: `Resultado: ${state.result} | ${pending.win ? "WIN ✅" : "LOSS ❌"}`,
        confidence: pending.confidence || 0
      });

      console.log("📊 CLOSED REAL:", pending);

    } finally {
      running = false;
    }

  }, 5000);
}