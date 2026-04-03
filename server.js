const express = require("express");
const bodyParser = require("body-parser");
const { join } = require("path");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");

const app = express();
const dbFilePath = join(__dirname, "confessions.json");
const adapter = new JSONFile(dbFilePath);
const db = new Low(adapter, { confessions: [] });

app.use(bodyParser.json());
app.use(express.static(join(__dirname, "public")));

async function initDb() {
  await db.read();
  db.data = db.data || { confessions: [] };
  await db.write();
}

function now() {
  return new Date().toISOString();
}

app.get("/api/confessions", async (req, res) => {
  await db.read();
  const rows = [...(db.data.confessions || [])].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  );
  res.json(rows);
});

app.post("/api/confessions", async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Confession is required" });
  }
  await db.read();
  const confession = {
    id: Date.now(),
    text: text.trim(),
    created_at: now(),
  };
  db.data.confessions.unshift(confession);
  await db.write();
  res.status(201).json(confession);
});

const port = process.env.PORT || 3000;
initDb().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
