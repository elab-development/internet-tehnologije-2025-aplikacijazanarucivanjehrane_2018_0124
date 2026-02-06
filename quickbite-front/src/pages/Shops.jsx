import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";

const API_BASE = "http://127.0.0.1:8000";
const TOKEN_KEY = "auth_token";

export default function Shops() {
  const navigate = useNavigate();

  //ako pretrazujemo kriterijum pretrage
  const [q, setQ] = useState("");
  const [shops, setShops] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //vracanje restorana sa backenda
  async function fetchShops(searchQ = "") {
    setError("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem(TOKEN_KEY);

      const res = await axios.get(`${API_BASE}/api/shops`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        params: searchQ ? { q: searchQ } : {},
      });

      const data = res.data;

      if (data?.success !== true) {
        setError(data?.message || "Ne mogu da učitam prodavnice.");
        return;
      }

      setShops(data?.data || []);
    } catch (err) {
      const apiData = err?.response?.data;
      setError(apiData?.message || "Greška pri učitavanju prodavnica.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchShops("");
  }, []);

  //svaki put kad korisnik novo pretrazuje, ponovo se vracaju radnje sa filterom
  const onSearchSubmit = (e) => {
    e.preventDefault();
    fetchShops(q.trim());
  };

  return (
    <div className="qb-page">
      <div className="qb-container">
        <PageHeader
          title="Prodavnice"
          subtitle="Izaberi prodavnicu i poruči."
          right={
            <form className="qb-flex qb-gap-10" onSubmit={onSearchSubmit}>
              <input
                className="qb-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Pretraga po nazivu"
              />
              <button className="qb-btn qb-btn-primary" type="submit" disabled={loading}>
                {loading ? "..." : "Traži"}
              </button>
            </form>
          }
        />

        {error && (
          <div className="qb-alert qb-alert--danger qb-mt-12">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && !shops.length ? (
          <div className="qb-card qb-card--soft qb-mt-12">
            <div className="qb-card-body">
              <p className="qb-text qb-muted">Učitavanje...</p>
            </div>
          </div>
        ) : null}

        {!loading && !error && shops.length === 0 ? (
          <div className="qb-card qb-card--soft qb-mt-12">
            <div className="qb-card-body">
              <p className="qb-text qb-muted">Nema prodavnica za zadati kriterijum.</p>
            </div>
          </div>
        ) : null}

        <div className="qb-grid qb-mt-12">
          {shops.map((s) => (
            <button
              key={s.id}
              className="qb-card qb-card--click"
              onClick={() => navigate(`/shops/${s.id}`)}
              type="button"
            >
              <div className="qb-card-body">
                <h3 className="qb-h3 qb-mb-6">{s.name}</h3>
                <p className="qb-text qb-muted">{s.address}</p>
                <div className="qb-divider qb-mt-12 qb-mb-12" />
                <div className="qb-small qb-muted">
                  Lokacija: {s.lat}, {s.lng}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
