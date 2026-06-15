import express from "express";
import Database from "better-sqlite3";

import cors from "cors";

const app = express();
const db = new Database("menal.db");

app.use(cors());

app.get("/entries", (req, res) => {
    const entries = db.prepare(`
        SELECT *
        FROM entries
        WHERE profile_id = 1
    `).all();

    res.json(entries);
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://10.0.0.74:3000");
});