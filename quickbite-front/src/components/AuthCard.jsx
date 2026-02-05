import React, { useState } from "react";

export default function AuthCard({
  mode = "login", // login ili register
  loading = false,
  error = "",
  defaults = { name: "", email: "", password: "" }, 
  onSubmit, // ({name,email,password})
}) {
  const [name, setName] = useState(defaults?.name || "");
  const [email, setEmail] = useState(defaults?.email || "");
  const [password, setPassword] = useState(defaults?.password || "");

  const isRegister = mode === "register";

  const submit = (e) => {
    e.preventDefault();
    onSubmit?.({ name, email, password });
  };

  return (
    <div className="qb-card qb-auth-card">
      <div className="qb-card-header">
        <h2 className="qb-h2">{isRegister ? "Registracija" : "Prijava"}</h2>
        <p className="qb-card-subtitle">
          {isRegister ? "Napravi nalog kao kupac." : "Uloguj se u aplikaciju."}
        </p>
      </div>

      <div className="qb-card-body">
        {error && (
          <div className="qb-alert qb-alert--danger qb-mt-8">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form className="qb-form qb-mt-12" onSubmit={submit}>
          {isRegister && (
            <div className="qb-field">
              <label className="qb-label">Ime</label>
              <input
                className="qb-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="npr. Petar"
              />
            </div>
          )}

          <div className="qb-field">
            <label className="qb-label">Email</label>
            <input
              className="qb-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="petar@quickbite.test"
              autoComplete="email"
            />
          </div>

          <div className="qb-field">
            <label className="qb-label">Lozinka</label>
            <input
              className="qb-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
            <div className="qb-help">Minimalno 6 karaktera.</div>
          </div>

          <button className="qb-btn qb-btn-primary qb-btn-block" disabled={loading} type="submit">
            {loading ? "Sačekaj..." : isRegister ? "Registruj se" : "Uloguj se"}
          </button>
        </form>
      </div>
    </div>
  );
}
