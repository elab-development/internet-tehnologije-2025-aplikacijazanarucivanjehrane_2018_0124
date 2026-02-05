import React from "react";


export default function Navbar({
  user = null,
  active = "home",
  onNavigate,
  onLogout,
  logoSrc,
}) {
  const role = user?.role || "guest";

  const linksByRole = {
    guest: [
      { key: "home", label: "Home" },
      { key: "login", label: "Login" },
      { key: "register", label: "Register" },
    ],
    buyer: [
      { key: "shops", label: "Prodavnice" },
      { key: "my-orders", label: "Moje porudžbine" },
      { key: "profile", label: "Profil" },
    ],
    shop: [
      { key: "my-shops", label: "Moje prodavnice" },
      { key: "products", label: "Proizvodi" },
      { key: "shop-orders", label: "Porudžbine" },
    ],
    delivery: [
      { key: "ready-orders", label: "Spremno za dostavu" },
      { key: "delivering", label: "U dostavi" },
    ],
    admin: [
      { key: "users", label: "Korisnici" },
    ],
  };

  const links = linksByRole[role] || linksByRole.guest;

  const handleNav = (e, key) => {
    e.preventDefault();
    onNavigate?.(key);
  };

  return (
    <header className="qb-navbar">
      <div className="qb-nav-inner">
        <a
          href="#"
          className="qb-brand"
          onClick={(e) => handleNav(e, role === "guest" ? "home" : links[0]?.key || "home")}
        >
          <img
            className="qb-brand-logo"
            src={logoSrc || "https://via.placeholder.com/80x80.png?text=QB"}
            alt="QuickBite"
          />
          <div className="qb-brand-title">
            <strong>QuickBite</strong>
            <span>Deliver • Study • Eat</span>
          </div>
        </a>

        <nav className="qb-nav-links" aria-label="Main navigation">
          {links.map((l) => (
            <a
              key={l.key}
              href="#"
              onClick={(e) => handleNav(e, l.key)}
              className={`qb-nav-link ${active === l.key ? "is-active" : ""}`}
            >
              {l.label}
            </a>
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
            <button className="qb-btn qb-btn-primary qb-btn-sm" onClick={(e) => handleNav(e, "login")}>
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
