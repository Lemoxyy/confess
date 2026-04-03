const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const dbFilePath = path.join(__dirname, "confessions.json");

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

async function loadData() {
  try {
    const json = await fs.readFile(dbFilePath, "utf8");
    const data = JSON.parse(json);
    return data && Array.isArray(data.confessions) ? data : { confessions: [] };
  } catch (err) {
    if (err.code === "ENOENT") return { confessions: [] };
    throw err;
  }
}

async function saveData(data) {
  await fs.writeFile(dbFilePath, JSON.stringify(data, null, 2), "utf8");
}

app.get("/api/confessions", async (req, res) => {
  try {
    const data = await loadData();
    const rows = [...data.confessions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Unable to load confessions" });
  }
});

app.post("/api/confessions", async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Confession is required" });
  }

  try {
    const data = await loadData();
    const confession = {
      id: Date.now(),
      text: text.trim(),
      created_at: new Date().toISOString(),
    };
    data.confessions.unshift(confession);
    await saveData(data);
    res.status(201).json(confession);
  } catch (err) {
    res.status(500).json({ error: "Unable to save confession" });
  }
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
} else {
  module.exports = app;
}

