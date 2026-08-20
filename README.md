# ![Menal logo](/menal/public/favicon-menal-small.svg) Menal
A personal journal and tracking application. Users can write about their day and give custom ratings in various ascepts of their day. Such as:
* How was your day? (Rating 1 - 6)
* Did you work out today? (Rating y/n)

---

![Dashboard view](/menal/src/assets//dashboard.png)

---
#### Main functions
- Daily journaling
- Custom calendars and rating scales
- Custom rating color coding
- Dashboard with statistics and streaks
- Yearly overview and history
- User-account system
- Light- and darkmode
- Mobile-friendly navigation

---
### Tech stack
- React 19 and TypeScript
- Vite
- Express
- SQLite with `better-sqlite3`
- Redis for sessions and rate limiting
- Vitest and Supertest
- Docker compose for Redis

--- 
### How to start
Assumptions:
- Node.js 20.19+ or 20.12+
- npm
- docker

Then install and start by:
```
npm install
docker compose up -d
```

Create an `.env` file containing the following:
```
SESSION_SECRET=<secret>
REDIS_URL=redis://localhost:6379
PORT=3000
DATABASE_PATH=./src/backend/menal.db
```

Start backend and frontend in their own terminal:
```
npm run start
npm run dev
```

---
### Structure
```
src/
├── backend/        # Express, database and API routes
├── components/     # Reusable React components
├── config/         # Configuration for API calls and CSRF tokens
├── contexts/       # Authentication
├── hooks/          # Custom React hooks
├── pages/          # Webapps pages
└── utils/          # Date, periode and streak functions

tests/backend/      # API, security and functionality tests
```

---
### TO-DO
- Create landing page that explains what Menal is and its functionality
- Improve statistics-panel in `DashboardPage`
- When creating a new user, one calendar should already exist
- "Average" in `AverageRatingPanel` should count non-registered days as a rating 0
    - For example: boolean calendar with only 1 entry displays "Average" as "1/1", but should be "1/7"
- Users should be able to switch languages