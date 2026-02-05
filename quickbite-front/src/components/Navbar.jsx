import React from "react";
import { Link } from "react-router-dom";

export default function Navbar({ user = null, onLogout, logoSrc }) {
  const role = user?.role || "guest";

  const linksByRole = {
    guest: [
      { to: "/login", label: "Login" },
      { to: "/register", label: "Register" },
    ],
    buyer: [
      { to: "/shops", label: "Prodavnice" },
      { to: "/my-orders", label: "Moje porudžbine" },
    ],
    shop: [
      { to: "/my-shops", label: "Moje prodavnice" },
      { to: "/products", label: "Proizvodi" },
      { to: "/shop-orders", label: "Porudžbine" },
    ],
    delivery: [
      { to: "/ready-orders", label: "Spremno za dostavu" },
      { to: "/delivering", label: "U dostavi" },
    ],
    admin: [{ to: "/users", label: "Korisnici" }],
  };

  const links = linksByRole[role] || linksByRole.guest;

  return (
    <header className="qb-navbar">
      <div className="qb-nav-inner">
        <Link to="/" className="qb-brand">
          <img className="qb-brand-logo" src={logoSrc || "/logo.png"} alt="QuickBite" />
          <div className="qb-brand-title">
            <strong>QuickBite</strong>
            <span>Deliver • Study • Eat</span>
          </div>
        </Link>

        <nav className="qb-nav-links" aria-label="Main navigation">
          {links.map((l, idx) => (
            <Link key={idx} to={l.to} className="qb-nav-link">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="qb-nav-actions">
          {user ? (
            <>
              <span className="qb-small">
                {user.name} · <strong>{user.role}</strong>
              </span>
              <button className="qb-btn qb-btn-primary qb-btn-sm" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="qb-btn qb-btn-primary qb-btn-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
