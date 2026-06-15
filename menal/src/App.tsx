import { useState } from "react";
import CalendarPage from "./pages/calendars";

function App() {

  const [page, setPage] = useState("home");

  function renderPage() {
  if (page === "home") {
    return <h1>Velkommen tilbake!</h1>
  }

  if (page === "log") {
    return <h1>Logger</h1>
  }

  if (page === "calendars") {
    return <CalendarPage/>
  }

  if (page === "settings") {
    return <h1>Innstillinger</h1>
  }
}

  return (
    <>
    <div className='app-layout'>
      <aside className='sidebar'>
        <h1>Menal</h1>

        <nav>
          <button onClick={() => setPage("log")}>Logg</button>
          <button onClick={() => setPage("calendars")}>Kalendre</button>
          <button onClick={() => setPage("settings")}>Innstillinger</button>
        </nav>
      </aside>

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
    </>
  )
}

export default App