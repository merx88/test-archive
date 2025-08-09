const express = require("express");
const { ping, pool } = require("./db");
require("dotenv").config();

const app = express();
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    res.json({ ok: await ping() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, created_at FROM users ORDER BY id DESC"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id=$1",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/users", async (req, res) => {
  const { name, email } = req.body ?? {};
  if (!name || !email)
    return res.status(400).json({ error: "name, email required" });
  try {
    const { rows } = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at",
      [name, email]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === "23505")
      return res.status(409).json({ error: "Email already exists" });
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API running http://localhost:${port}`));
