import React, { useState } from "react";

export default function AuthCard({
  mode = "login", // login ili register
  loading = false,
  error = "",
  onSubmit, // ({name,email,password}) 
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isRegister = mode === "register";

  const submit = (e) => {
    e.preventDefault();
    onSubmit?.({ name, email, password });
  };

  return (
    <div className="qb-card" style={{ maxWidth: 520, margin: "0 auto" }}>
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
