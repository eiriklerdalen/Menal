import Database from 'better-sqlite3'

const db = new Database('menal.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY,
    profile_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    rating INTEGER NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
  );
`);

db.exec(`
  INSERT OR IGNORE INTO profiles (id, name)
  VALUES (1, 'Eirik');

  INSERT OR IGNORE INTO entries (id, profile_id, date, rating)
  VALUES
    (1, 1, '2026-06-08', 5),
    (2, 1, '2026-06-09', 3),
    (3, 1, '2026-06-12', 6);
`);