const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const inMemoryDB = { confessions: [] };

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/confessions", (req, res) => {
  const rows = [...inMemoryDB.confessions].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );
  res.json(rows);
});

app.post("/api/confessions", (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Confession is required" });
  }

  const confession = {
    id: Date.now(),
    text: text.trim(),
    created_at: new Date().toISOString(),
  };
  inMemoryDB.confessions.unshift(confession);
  res.status(201).json(confession);
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
} else {
  module.exports = app;
}
