async function getResult() {
  try {
    const res = await axios.get("TEU_URL", {
      timeout: 5000
    });

    console.log("✅ API OK");
    return res.data;

  } catch (err) {
    console.log("❌ FS ERROR:", err.message);
    return null;
  }
}