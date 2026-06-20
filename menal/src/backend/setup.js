import Database from 'better-sqlite3'

const db = new Database('menal.db');

db.exec(`
  CREATE TABLE profiles (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE calendars (
    id INTEGER PRIMARY KEY,
    profile_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    max_rating INTEGER NOT NULL DEFAULT 6,
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
  );

  CREATE TABLE calendar_rating_colors (
    id INTEGER PRIMARY KEY,
    calendar_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    color TEXT NOT NULL,
    UNIQUE(calendar_id, rating),
    FOREIGN KEY (calendar_id) REFERENCES calendars(id)
  );

  CREATE TABLE entries (
    id INTEGER PRIMARY KEY,
    calendar_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    rating INTEGER NOT NULL,
    UNIQUE(calendar_id, date),
    FOREIGN KEY (calendar_id) REFERENCES calendars(id)
  );
  
  CREATE TABLE journal_entries (
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
    (1, 1, 'How was your day?');

  INSERT OR IGNORE INTO entries (id, calendar_id, date, rating)
  VALUES
    (1, 1, '2026-06-08', 5),
    (2, 1, '2026-06-09', 3),
    (3, 1, '2026-06-12', 6);

  INSERT OR IGNORE INTO journal_entries (id, profile_id, date, journal_text)
  VALUES
    (1, 1, '2026-06-17', 'Spiste kinesisk til middag.'),
    (2, 1, '2026-06-16', 'Norge vant mot Irak.');
`);