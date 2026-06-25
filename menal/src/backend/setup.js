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
    position INTEGER NOT NULL,
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

  INSERT OR IGNORE INTO calendars (id, profile_id, name, max_rating, position)
  VALUES
    (1, 1, 'Hvordan var dagen din?', 6, 1),
    (2, 1, 'Trente du?', 1, 2);

  INSERT OR IGNORE INTO entries (id, calendar_id, date, rating)
  VALUES
    (1, 1, '2026-06-08', 5),
    (2, 1, '2026-06-09', 3),
    (3, 1, '2026-06-12', 6),
    (4, 2, '2026-06-20', 1),
    (5, 2, '2026-06-22', 1);

  INSERT OR IGNORE INTO calendar_rating_colors (
    calendar_id,
    rating,
    color
  )
  VALUES
      (1, 1, '#FF4D4D'),
      (1, 2, '#FF8A3D'),
      (1, 3, '#FFD93D'),
      (1, 4, '#C7F464'),
      (1, 5, '#6EEB83'),
      (1, 6, '#2ECC71'),
      (2, 1, '#2ECC71');

  INSERT OR IGNORE INTO journal_entries (id, profile_id, date, journal_text)
  VALUES
    (1, 1, '2026-06-17', 'Spiste kinesisk til middag.'),
    (2, 1, '2026-06-16', 'Norge vant mot Irak.');
`);