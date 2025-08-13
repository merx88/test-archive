const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

async function ping() {
  const { rows } = await pool.query("SELECT 1 AS ok");
  return rows[0].ok === 1;
}

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});

module.exports = { pool, ping };
