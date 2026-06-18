import Database from 'better-sqlite3'

const db = new Database('menal.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS calendars (
    id INTEGER PRIMARY KEY,
    profile_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
  );

  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY,
    calendar_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    rating INTEGER NOT NULL,
    UNIQUE(calendar_id, date),
    FOREIGN KEY (calendar_id) REFERENCES calendars(id)
  );
  
  CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY,
    profile_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    journal_text TEXT NOT NULL,
    UNIQUE(profile_id, date),
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
  );
`);

db.exec(`
  INSERT OR IGNORE INTO profiles (id, name)
  VALUES (1, 'Eirik');  

  INSERT OR IGNORE INTO calendars (id, profile_id, name)
  VALUES
    (1, 1, 'How was your day?'),
    (2, 1, 'Training'),
    (3, 1, 'Sleep'),
    (4, 1, 'Productivity');

  INSERT OR IGNORE INTO entries (id, calendar_id, date, rating)
  VALUES
    (1, 1, '2026-06-08', 5),
    (2, 1, '2026-06-09', 3),
    (3, 1, '2026-06-12', 6),

    (4, 2, '2026-06-08', 6),
    (5, 2, '2026-06-09', 0),
    (6, 2, '2026-06-12', 6),

    (7, 3, '2026-06-08', 4),
    (8, 3, '2026-06-09', 2),
    (9, 3, '2026-06-12', 5),

    (10, 4, '2026-06-08', 3),
    (11, 4, '2026-06-09', 5),
    (12, 4, '2026-06-12', 4);

  INSERT OR IGNORE INTO journal_entries (id, profile_id, date, journal_text)
  VALUES
    (1, 1, '2026-06-17', 'Spiste kinesisk til middag.'),
    (2, 1, '2026-06-16', 'Norge vant mot Irak.');
`);