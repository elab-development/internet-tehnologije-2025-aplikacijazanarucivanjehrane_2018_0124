import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

const API_BASE = "http://127.0.0.1:8000";
const TOKEN_KEY = "auth_token";

function StatusBadge({ status }) {
  return <span className={`qb-status qb-status--${status || "unknown"}`}>{status}</span>;
}

function canCancel(status) {
  const notAllowed = ["delivering", "delivered", "cancelled"];
  return status && !notAllowed.includes(status);
}

export default function OrderDetails() {
  const { id } = useParams(); // order id
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  //detalji jedne porudzbine sa backenda
  async function fetchOrder() {
    setError("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem(TOKEN_KEY);

      const res = await axios.get(`${API_BASE}/api/orders/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success !== true) {
        setError(res.data?.message || "Ne mogu da učitam porudžbinu.");
        return;
      }

      setOrder(res.data?.data || null);
    } catch (err) {
      const apiData = err?.response?.data;
      setError(apiData?.message || "Greška pri učitavanju porudžbine.");
    } finally {
      setLoading(false);
    }
  }

  //svaki put kad se promeni id, ucitaj taj order
  useEffect(() => {
    fetchOrder();
  }, [id]);

  //redovi za order iteme
  const itemsRows = useMemo(() => {
    const items = order?.items || [];
    return items.map((it) => {
      const unit = Number(it?.unit_price ?? it?.unitPrice ?? 0);
      const qty = Number(it?.quantity ?? 0);
      return {
        id: it?.id ?? `${it?.product?.id}-${Math.random()}`,
        name: it?.product?.name || "-",
        quantity: qty,
        unit_price: unit,
        line_total: unit * qty,
      };
    });
  }, [order]);

  const total = useMemo(() => {
    return itemsRows.reduce((sum, r) => sum + Number(r.line_total || 0), 0);
  }, [itemsRows]);

  async function cancelOrder() {
    setCancelLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem(TOKEN_KEY);

      const res = await axios.post(
        `${API_BASE}/api/orders/${id}/cancel`,
        {},
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success !== true) {
        setError(res.data?.message || "Ne mogu da otkažem porudžbinu.");
        return;
      }

      alert("Porudžbina je otkazana.");
      setCancelOpen(false);
      await fetchOrder();
    } catch (err) {
      const apiData = err?.response?.data;
      const msg = apiData?.message || "Greška pri otkazivanju porudžbine.";
      setError(msg);
    } finally {
      setCancelLoading(false);
    }
  }

  //kolone u tabeli koje cemo prikazivati
  const itemColumns = [
    { key: "name", header: "Proizvod" },
    { key: "quantity", header: "Količina" },
    {
      key: "unit_price",
      header: "Cena",
      render: (row) => `${Number(row.unit_price).toFixed(0)} RSD`,
    },
    {
      key: "line_total",
      header: "Ukupno",
      render: (row) => `${Number(row.line_total).toFixed(0)} RSD`,
    },
  ];

  return (
    <div className="qb-page">
      <div className="qb-container">
        <PageHeader
          title={`Porudžbina #${id}`}
          subtitle={order?.shop?.name ? `Prodavnica: ${order.shop.name}.` : "Detalji porudžbine."}
          right={
            <div className="qb-flex qb-gap-10 qb-center">
              <button className="qb-btn qb-btn-ghost" type="button" onClick={() => navigate("/my-orders")}>
                Nazad
              </button>

              {canCancel(order?.status) && (
                <button
                  className="qb-btn qb-btn-danger"
                  type="button"
                  onClick={() => setCancelOpen(true)}
                  disabled={loading}
                >
                  Otkaži
                </button>
              )}
            </div>
          }
        />

        {error && (
          <div className="qb-alert qb-alert--danger qb-mt-12">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className="qb-card qb-card--soft qb-mt-12">
            <div className="qb-card-body">
              <p className="qb-text qb-muted">Učitavanje...</p>
            </div>
          </div>
        ) : !order ? (
          <div className="qb-card qb-card--soft qb-mt-12">
            <div className="qb-card-body">
              <p className="qb-text qb-muted">Porudžbina nije pronađena.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="qb-card qb-mt-12">
              <div className="qb-card-body">
                <div className="qb-summary-grid">
                  <div>
                    <div className="qb-small qb-muted">Status.</div>
                    <div className="qb-mt-6">
                      <StatusBadge status={order.status} />
                    </div>
                  </div>

                  <div>
                    <div className="qb-small qb-muted">Adresa dostave.</div>
                    <div className="qb-text qb-mt-6">{order.delivery_address || "-"}</div>
                  </div>

                  <div>
                    <div className="qb-small qb-muted">Procena.</div>
                    <div className="qb-text qb-mt-6">
                      {order.estimated_km == null && order.estimated_min == null
                        ? "-"
                        : `${order.estimated_km ?? "?"} km • ${order.estimated_min ?? "?"} min`}
                    </div>
                  </div>

                  <div>
                    <div className="qb-small qb-muted">Dostavljač.</div>
                    <div className="qb-text qb-mt-6">{order?.delivery?.name || "-"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="qb-mt-12">
              <DataTable
                title="Stavke porudžbine"
                subtitle={`Ukupno: ${total.toFixed(0)} RSD.`}
                columns={itemColumns}
                rows={itemsRows}
                emptyText="Nema stavki."
              />
            </div>
          </>
        )}

        <Modal
          open={cancelOpen}
          title="Otkazivanje porudžbine"
          onClose={() => (cancelLoading ? null : setCancelOpen(false))}
          footer={
            <div className="qb-flex qb-between qb-center qb-gap-10">
              <button className="qb-btn qb-btn-ghost" type="button" onClick={() => setCancelOpen(false)} disabled={cancelLoading}>
                Nazad
              </button>
              <button className="qb-btn qb-btn-danger" type="button" onClick={cancelOrder} disabled={cancelLoading}>
                {cancelLoading ? "Otkazujem..." : "Potvrdi otkaz"}
              </button>
            </div>
          }
        >
          <p className="qb-text qb-muted">
            Da li si sigurna da želiš da otkažeš ovu porudžbinu.
          </p>
          <p className="qb-small qb-muted qb-mt-8">
            Otkazivanje nije moguće ako je porudžbina u dostavi ili je završena.
          </p>
        </Modal>
      </div>
    </div>
  );
}
