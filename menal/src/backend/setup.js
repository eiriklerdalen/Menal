export function initializeDatabase(db) {
  db.pragma("foreign_keys = ON");

  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS calendars (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    max_rating INTEGER NOT NULL DEFAULT 6,
    position INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS calendar_rating_colors (
    id INTEGER PRIMARY KEY,
    calendar_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    color TEXT NOT NULL,
    UNIQUE(calendar_id, rating),
    FOREIGN KEY (calendar_id) REFERENCES calendars(id)
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
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    journal_text TEXT NOT NULL,
    UNIQUE(user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  `);
}
