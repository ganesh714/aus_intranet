// App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import RoutesConfig from "./routes";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);

  return (
    <Router>
      <RoutesConfig
        setIsLoggedIn={setIsLoggedIn}
        setUserRole={setUserRole}
        setUserId={setUserId}
      />
    </Router>
  );
}

export default App;
