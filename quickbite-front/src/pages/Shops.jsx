import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";

//sve od javnog apija sta nam treba
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

//namestanje markera
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

//url i token
const API_BASE = "http://127.0.0.1:8000";
const TOKEN_KEY = "auth_token";

export default function Shops() {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [shops, setShops] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //vracanje radnji sa backenda, sa pretragom
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

  const onSearchSubmit = (e) => {
    e.preventDefault();
    fetchShops(q.trim());
  };

  // Centar mape (Beograd) + fallback ako nema shopova.
  const mapCenter = [44.7866, 20.4489];
  const firstShop = shops?.[0];
  const initialCenter =
    firstShop?.lat && firstShop?.lng ? [firstShop.lat, firstShop.lng] : mapCenter;

  return (
    <div className="qb-page">
      <div className="qb-container">
        <PageHeader
          title="Restorani u ponudi"
          subtitle="Izaberi restoran i poruči."
          right={
            <form className="qb-flex qb-gap-10" onSubmit={onSearchSubmit}>
              <input
                className="qb-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Pretraga po nazivu ili adresi..."
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

        {/* MAPA */}
        <div className="qb-card qb-mt-12">
          <div className="qb-card-body">
            <h3 className="qb-h3 qb-mb-6">Mapa restorana</h3>
            <p className="qb-text qb-muted qb-mb-12">
              Markeri su postavljeni na osnovu lat/lng koordinata (OpenStreetMap).
            </p>

            <div className="qb-map">
              <MapContainer center={initialCenter} zoom={12} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {shops.map((s) => (
                  <Marker key={s.id} position={[s.lat, s.lng]}>
                    <Popup>
                      <div className="qb-popup">
                        <div className="qb-popup-title">{s.name}</div>
                        <div className="qb-popup-sub">{s.address}</div>
                        <button
                          className="qb-btn qb-btn-primary qb-btn-sm qb-mt-8"
                          onClick={() => navigate(`/shops/${s.id}`)}
                          type="button"
                        >
                          Otvori meni
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* LISTA */}
        {!loading && !error && shops.length === 0 ? (
          <div className="qb-card qb-card--soft qb-mt-12">
            <div className="qb-card-body">
              <p className="qb-text qb-muted">Nema restorana za zadati kriterijum.</p>
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
                <p className="qb-text qb-muted">Adresa: {s.address}</p>
                <div className="qb-divider qb-mt-12 qb-mb-12" />
                <p className="qb-text qb-muted">Lokacija: {s.lat}, {s.lng} </p>
                
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
