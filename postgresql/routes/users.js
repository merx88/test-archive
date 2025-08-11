const express = require('express');
const router = express.Router();
const { pool } = require('../db');


router.get('/users-v2', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit ?? '10', 10), 100);
  const offset = Math.max(parseInt(req.query.offset ?? '0', 10), 0);
  const { city } = req.query;

  try {
    const args = [limit, offset];
    let sql =
      `SELECT id, name, email, profile, created_at
       FROM users_v2`;

    if (city) {
      sql += ` WHERE profile->'address'->>'city' = $3`;
      args.unshift(city); 
      sql = sql.replace('LIMIT $1 OFFSET $2', ''); 
      sql += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
    } else {
      sql += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
    }

    const { rows } = await pool.query(sql, args);
    res.json({ limit, offset, data: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


router.post('/users-v2', async (req, res) => {
  const { name, email, profile } = req.body ?? {};
  if (!name || !email) return res.status(400).json({ error: 'name, email required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO users_v2 (name, email, profile)
       VALUES ($1, $2, COALESCE($3::jsonb, '{}'::jsonb))
       RETURNING id, name, email, profile, created_at`,
      [name, email, profile ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: e.message });
  }
});


router.patch('/users-v2/:id', async (req, res) => {
  const { name, profile } = req.body ?? {};
  const sets = [];
  const values = [];
  let i = 1;

  if (name !== undefined) { sets.push(`name = $${i++}`); values.push(name); }
  if (profile !== undefined) {
    sets.push(`profile = COALESCE(profile, '{}'::jsonb) || COALESCE($${i++}::jsonb, '{}'::jsonb)`);
    values.push(JSON.stringify(profile));
  }
  if (!sets.length) return res.status(400).json({ error: 'No fields to update' });

  try {
    values.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE users_v2 SET ${sets.join(', ')}
       WHERE id = $${i}
       RETURNING id, name, email, profile, created_at`,
      values
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


router.get('/users-v2/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, profile, created_at FROM users_v2 WHERE id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/users-v2/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM users_v2 WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
