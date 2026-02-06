import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

const API_BASE = "http://127.0.0.1:8000";
const TOKEN_KEY = "auth_token";

function StatusBadge({ status }) {
  return <span className={`qb-status qb-status--${status || "unknown"}`}>{status}</span>;
}

// Jednostavna “sledeći status” logika za shop
function getNextStatus(current) {
  if (current === "created") return "accepted";
  if (current === "accepted") return "preparing";
  if (current === "preparing") return "ready_for_delivery";
  return null;
}

export default function ShopOrders() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [shopName, setShopName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // modal state
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("accepted");
  const [actionLoading, setActionLoading] = useState(false);

  async function fetchOrders() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem(TOKEN_KEY);

      const res = await axios.get(`${API_BASE}/api/shop/shops/${shopId}/orders`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });

      if (res.data?.success !== true) {
        setError(res.data?.message || "Ne mogu da učitam porudžbine.");
        return;
      }

      const list = res.data?.data || [];
      setOrders(list);

      // Ako OrderResource sadrži shop u listi, uzmi naziv (čisto UX)
      const first = list[0];
      const name = first?.shop?.name;
      if (name) setShopName(name);
    } catch (err) {
      const apiData = err?.response?.data;
      setError(apiData?.message || "Greška pri učitavanju porudžbina.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (shopId) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  function openStatusModal(order, presetStatus = null) {
    setError("");
    setSuccess("");

    setSelected(order);

    const next = getNextStatus(order?.status);
    setStatus(presetStatus || next || "accepted");

    setOpen(true);
  }

  function closeModal() {
    if (actionLoading) return;
    setOpen(false);
    setSelected(null);
  }

  async function updateStatus() {
    if (!selected) return;

    setError("");
    setSuccess("");
    setActionLoading(true);

    try {
      const token = sessionStorage.getItem(TOKEN_KEY);

      const res = await axios.post(
        `${API_BASE}/api/shop/shops/${shopId}/orders/${selected.id}/status`,
        { status },
        { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success !== true) {
        setError(res.data?.message || "Ne mogu da promenim status.");
        return;
      }

      // Backend vraća data: OrderResource (može biti detaljniji).
      const updated = res.data?.data;

      setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
      setSuccess(res.data?.message || "Status je izmenjen.");

      closeModal();
    } catch (err) {
      const apiData = err?.response?.data;
      const msg =
        apiData?.message ||
        apiData?.errors?.status?.[0] ||
        "Greška pri promeni statusa.";
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  }

  const columns = useMemo(
    () => [
      { key: "id", header: "ID" },
      {
        key: "buyer",
        header: "Kupac",
        render: (row) => row?.buyer ? `${row.buyer.name} (${row.buyer.email})` : "-",
      },
      {
        key: "delivery_address",
        header: "Adresa dostave",
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
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row?.status} />,
      },
    ],
    []
  );

  function canShopChange(order) {
    const s = order?.status;
    return s !== "delivering" && s !== "delivered";
  }

  const modalFooter = (
    <div className="qb-flex qb-between qb-center qb-gap-10">
      <button className="qb-btn qb-btn-ghost" type="button" onClick={closeModal} disabled={actionLoading}>
        Nazad
      </button>
      <button className="qb-btn qb-btn-primary" type="button" onClick={updateStatus} disabled={actionLoading}>
        {actionLoading ? "Sačekaj..." : "Sačuvaj status"}
      </button>
    </div>
  );

  return (
    <div className="qb-page">
      <div className="qb-container">
        <PageHeader
          title={shopName ? `Porudžbine · ${shopName}` : `Porudžbine · Shop #${shopId}`}
          subtitle="Menjaj status porudžbina: accepted → preparing → ready_for_delivery."
          right={
            <div className="qb-flex qb-gap-10 qb-center">
              <button className="qb-btn qb-btn-ghost" type="button" onClick={() => navigate("/my-shops")}>
                Nazad na prodavnice
              </button>
              <button className="qb-btn qb-btn-ghost" type="button" onClick={fetchOrders} disabled={loading}>
                {loading ? "Učitavam..." : "Osveži"}
              </button>
            </div>
          }
        />

        {error && (
          <div className="qb-alert qb-alert--danger qb-mt-12">
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="qb-alert qb-alert--success qb-mt-12">
            <strong>OK:</strong> {success}
          </div>
        )}

        <div className="qb-mt-12">
          <DataTable
            title="Lista porudžbina"
            subtitle="Klikni na porudžbinu da promeniš status (ili koristi akcije desno)."
            columns={columns}
            rows={orders}
            emptyText={loading ? "Učitavanje..." : "Nema porudžbina za ovu prodavnicu."}
            rowActions={(row) => {
              const disabled = !canShopChange(row);
              const next = getNextStatus(row?.status);

              return (
                <div className="qb-flex qb-gap-10 qb-center" style={{ justifyContent: "flex-end" }}>
                  {next && !disabled && (
                    <button
                      className="qb-btn qb-btn-primary qb-btn-sm"
                      type="button"
                      onClick={() => openStatusModal(row, next)}
                    >
                      Sledeći: {next}
                    </button>
                  )}

                  <button
                    className="qb-btn qb-btn-ghost qb-btn-sm"
                    type="button"
                    onClick={() => openStatusModal(row)}
                    disabled={disabled}
                    title={disabled ? "Ne može (u dostavi ili završena)." : "Promeni status"}
                  >
                    Promeni
                  </button>

                  {!disabled && row?.status !== "cancelled" && (
                    <button
                      className="qb-btn qb-btn-ghost qb-btn-sm"
                      type="button"
                      onClick={() => openStatusModal(row, "cancelled")}
                    >
                      Otkaži
                    </button>
                  )}
                </div>
              );
            }}
          />
        </div>

        <Modal open={open} title={`Promena statusa #${selected?.id || ""}`} onClose={closeModal} footer={modalFooter}>
          <p className="qb-text qb-muted">
            Izaberi novi status. (Backend dozvoljava: accepted, preparing, ready_for_delivery, cancelled.)
          </p>

          <div className="qb-field qb-mt-12">
            <label className="qb-label">Novi status</label>
            <select className="qb-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="accepted">accepted</option>
              <option value="preparing">preparing</option>
              <option value="ready_for_delivery">ready_for_delivery</option>
              <option value="cancelled">cancelled</option>
            </select>
            <div className="qb-help">
              Napomena: ako je porudžbina već <strong>delivering</strong> ili <strong>delivered</strong>, shop ne može da menja status.
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
