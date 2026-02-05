import React, { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";

export default function App() {
  const [active, setActive] = useState("home");

  // Demo: promeni role da vidiš menije
  const [user, setUser] = useState({ name: "Petar", role: "buyer" });
  // const [user, setUser] = useState(null);

  return (
    <div className="qb-app">
      <Navbar
        user={user}
        active={active}
        onNavigate={(key) => setActive(key)}
        onLogout={() => {
          setUser(null);
          setActive("home");
        }}
        logoSrc="/logo.png"
      />

      <main className="qb-page">
        <div className="qb-container">
          <h1 className="qb-h1">Active: {active}</h1>
          <p className="qb-text qb-muted">
            Ovo je samo demo navigacije. Kasnije ćemo povezati sa pages + router.
          </p>

          <div className="qb-mt-16 qb-flex qb-gap-10" style={{ flexWrap: "wrap" }}>
            <button className="qb-btn qb-btn-ghost" onClick={() => setUser(null)}>
              Set guest
            </button>
            <button className="qb-btn qb-btn-ghost" onClick={() => setUser({ name: "Petar", role: "buyer" })}>
              Set buyer
            </button>
            <button className="qb-btn qb-btn-ghost" onClick={() => setUser({ name: "Mihailo", role: "shop" })}>
              Set shop
            </button>
            <button className="qb-btn qb-btn-ghost" onClick={() => setUser({ name: "Aca", role: "delivery" })}>
              Set delivery
            </button>
            <button className="qb-btn qb-btn-ghost" onClick={() => setUser({ name: "admin", role: "admin" })}>
              Set admin
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
