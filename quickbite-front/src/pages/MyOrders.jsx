import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";

const API_BASE = "http://127.0.0.1:8000";
const TOKEN_KEY = "auth_token";

function StatusBadge({ status }) {
  return <span className={`qb-status qb-status--${status || "unknown"}`}>{status}</span>;
}

export default function MyOrders() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //vracanje porudzbina od korisnika trenutno ulogovanog
  async function fetchMyOrders() {
    setError("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem(TOKEN_KEY);

      const res = await axios.get(`${API_BASE}/api/orders/my`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success !== true) {
        setError(res.data?.message || "Ne mogu da učitam porudžbine.");
        return;
      }

      setRows(res.data?.data || []);
    } catch (err) {
      const apiData = err?.response?.data;
      setError(apiData?.message || "Greška pri učitavanju porudžbina.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMyOrders();
  }, []);


  //kolone za tabelu za prikaz porudzbina
  const columns = [
    { key: "id", header: "ID" },
    {
      key: "shop",
      header: "Prodavnica",
      render: (row) => row?.shop?.name || "-",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row?.status} />,
    },
    {
      key: "delivery_address",
      header: "Adresa",
      render: (row) => row?.delivery_address || "-",
    },
    {
      key: "estimated",
      header: "Procena",
      render: (row) => {
        const km = row?.estimated_km;
        const min = row?.estimated_min;
        if (km == null && min == null) return "-";
        return `${km ?? "?"} km • ${min ?? "?"} min`;
      },
    },
  ];

  return (
    <div className="qb-page">
      <div className="qb-container">
        <PageHeader
          title="Moje porudžbine"
          subtitle="Pregled svih porudžbina koje si kreirala."
          right={
            <button className="qb-btn qb-btn-ghost" type="button" onClick={fetchMyOrders} disabled={loading}>
              {loading ? "Učitavam..." : "Osveži"}
            </button>
          }
        />

        {error && (
          <div className="qb-alert qb-alert--danger qb-mt-12">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="qb-mt-12">
          <DataTable
            title="Lista porudžbina"
            subtitle="Klikni na Detalji da vidiš stavke i status."
            columns={columns}
            rows={rows}
            emptyText={loading ? "Učitavanje..." : "Nema porudžbina."}
            rowActions={(row) => (
              <button
                className="qb-btn qb-btn-primary qb-btn-sm"
                type="button"
                onClick={() => navigate(`/my-orders/${row.id}`)}
              >
                Detalji
              </button>
            )}
          />
        </div>
      </div>
    </div>
  );
}
