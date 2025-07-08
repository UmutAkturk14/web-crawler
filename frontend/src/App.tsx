import React, { useState, useEffect } from "react";
import Dashboard from "./components/dashboard/Dashboard";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false); // This will trigger re-render to show login page
  };

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex mb-6 border-b border-gray-300">
          <button
            className={`flex-1 py-2 text-center font-semibold ${
              activeTab === "login"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 text-center font-semibold ${
              activeTab === "register"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("register")}
            type="button"
          >
            Register
          </button>
        </div>

        {activeTab === "login" ? (
          <Login onSuccess={handleAuthSuccess} />
        ) : (
          <Register onSuccess={handleAuthSuccess} />
        )}
      </div>
    </div>
  );
};

export default App;
