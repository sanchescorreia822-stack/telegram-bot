module.exports = {
  getResult: async () => {
    return {
      round: Date.now(),
      result: Math.random() > 0.5 ? "red" : "blue"
    };
  }
};