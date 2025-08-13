const express = require("express");
require("dotenv").config();

const app = express();
const { ping } = require("./db");
const usersRouter = require("./routes/users");
const usersV2Router = require("./routes/users_v2");

app.use(express.json());

app.use(usersRouter);
app.use(usersV2Router);

app.get("/health", async (req, res) => {
  res.json({ ok: await ping() });
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
