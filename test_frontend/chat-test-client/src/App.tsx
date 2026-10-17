import { useState, useEffect } from "react";

import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Video from "./pages/Video";

import { isAuthenticated } from "./utils/auth.utils";

function App() {

  const [authenticated, setAuthenticated] =
    useState(isAuthenticated());
  const [page, setPage] = useState(
    window.location.pathname === "/video" ? "video" : "chat"
  );

  useEffect(() => {
    setAuthenticated(isAuthenticated());

    const handlePopState = () => {
      setPage(window.location.pathname === "/video" ? "video" : "chat");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (!authenticated) {
    return <Login />;
  }

  const navigate = (nextPage: "chat" | "video") => {
    window.history.pushState({}, "", `/${nextPage}`);
    setPage(nextPage);
  };

  const handleLogout = () => {
    setAuthenticated(false);
  };

  return (
    <>
      <nav className="app-navigation">
        <button
          type="button"
          className={page === "chat" ? "active" : ""}
          onClick={() => navigate("chat")}
        >
          Chat
        </button>
        <button
          type="button"
          className={page === "video" ? "active" : ""}
          onClick={() => navigate("video")}
        >
          Video
        </button>
      </nav>
      {page === "video" ? (
        <Video />
      ) : (
        <Chat onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;