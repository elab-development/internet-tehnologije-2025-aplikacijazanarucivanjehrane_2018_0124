import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";

const API_BASE = "http://127.0.0.1:8000";
const TOKEN_KEY = "auth_token";

export default function MyShops() {
  const navigate = useNavigate();

  const [shops, setShops] = useState([]);
  const [pexels, setPexels] = useState([]); // 2 slike

  const [loading, setLoading] = useState(false);
  const [loadingImgs, setLoadingImgs] = useState(false);
  const [error, setError] = useState("");

  async function fetchMyShops() {
    setError("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem(TOKEN_KEY);

      const res = await axios.get(`${API_BASE}/api/shop/shops`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });

      if (res.data?.success !== true) {
        setError(res.data?.message || "Ne mogu da učitam prodavnice.");
        return;
      }

      setShops(res.data?.data || []);
    } catch (err) {
      const apiData = err?.response?.data;
      setError(apiData?.message || "Greška pri učitavanju prodavnica.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchPexelsImages() {
    const key = process.env.REACT_APP_PEXELS_API_KEY;
    if (!key) return;

    setLoadingImgs(true);
    try {
      const res = await axios.get("https://api.pexels.com/v1/search", {
        params: { query: "restaurant ambiance", per_page: 2, orientation: "landscape" },
        headers: { Authorization: key },
      });

      const photos = res.data?.photos || [];
      // Uzimamo 2 slike (src.large je super).
      setPexels(photos.slice(0, 2));
    } catch {
      // Ako pexels pukne, nije kritično za MVP.
      setPexels([]);
    } finally {
      setLoadingImgs(false);
    }
  }

  useEffect(() => {
    fetchMyShops();
    fetchPexelsImages();
  }, []);

  return (
    <div className="qb-page">
      <div className="qb-container">
        <PageHeader
          title="Moje prodavnice"
          subtitle="Izaberi prodavnicu da vidiš porudžbine i menjaš status."
          right={
            <button className="qb-btn qb-btn-ghost" type="button" onClick={fetchMyShops} disabled={loading}>
              {loading ? "Učitavam..." : "Osveži"}
            </button>
          }
        />

        {error && (
          <div className="qb-alert qb-alert--danger qb-mt-12">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Pexels banner (2 slike) */}
        <div className="qb-mt-12 qb-hero">
          {loadingImgs && <div className="qb-hero-skeleton" />}
          {!loadingImgs && pexels.length > 0 ? (
            <div className="qb-hero-grid">
              {pexels.map((p) => (
                <div key={p.id} className="qb-hero-imgwrap">
                  <img className="qb-hero-img" src={p.src?.large} alt={p.alt || "restaurant"} />
                </div>
              ))}
            </div>
          ) : (
            <div className="qb-card qb-card--soft">
              <div className="qb-card-body">
                <p className="qb-text qb-muted">
                  (Pexels slike nisu učitane — proveri REACT_APP_PEXELS_API_KEY u .env.local.)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Shop cards */}
        <div className="qb-mt-12">
          {loading ? (
            <div className="qb-card qb-card--soft">
              <div className="qb-card-body">
                <p className="qb-text qb-muted">Učitavanje prodavnica...</p>
              </div>
            </div>
          ) : shops.length === 0 ? (
            <div className="qb-card qb-card--soft">
              <div className="qb-card-body">
                <p className="qb-text qb-muted">Nemaš nijednu prodavnicu.</p>
              </div>
            </div>
          ) : (
            <div className="qb-grid">
              {shops.map((s) => (
                <div key={s.id} className="qb-card qb-shop-card">
                  <div className="qb-card-body">
                    <div className="qb-flex qb-between qb-center qb-gap-10">
                      <div>
                        <h3 className="qb-h3">{s.name}</h3>
                        <p className="qb-text qb-muted qb-mt-6">{s.address}</p>
                        <p className="qb-small qb-muted qb-mt-6">
                          Lokacija: {Number(s.lat).toFixed(4)}, {Number(s.lng).toFixed(4)}
                        </p>
                      </div>

                      <div className="qb-flex qb-gap-10">
                        <button
                          className="qb-btn qb-btn-primary qb-btn-sm"
                          type="button"
                          onClick={() => navigate(`/shop-orders/${s.id}`)}

                        >
                          Porudžbine
                        </button>

                        <button
                          className="qb-btn qb-btn-ghost qb-btn-sm"
                          type="button"
                          onClick={() => navigate(`/products/${s.id}`)}
                        >
                          Proizvodi
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
