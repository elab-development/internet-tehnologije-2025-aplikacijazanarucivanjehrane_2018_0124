import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

const API_BASE = "http://127.0.0.1:8000";
const TOKEN_KEY = "auth_token";

function StatusBadge({ status }) {
  return <span className={`qb-status qb-status--${status || "unknown"}`}>{status}</span>;
}

export default function ReadyOrders() {
  // Lista "ready_for_delivery" (sa servera).
  const [readyOrders, setReadyOrders] = useState([]);

  // Lista "delivering" (MVP lokalno, jer backend nema GET /delivery/orders/my).
  const [deliveringOrders, setDeliveringOrders] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal state.
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("take"); // "take" ili "delivered"
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function fetchReady() {
    setError("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem(TOKEN_KEY);

      const res = await axios.get(`${API_BASE}/api/delivery/orders/ready`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success !== true) {
        setError(res.data?.message || "Ne mogu da učitam porudžbine.");
        return;
      }

      setReadyOrders(res.data?.data || []);
    } catch (err) {
      const apiData = err?.response?.data;
      setError(apiData?.message || "Greška pri učitavanju porudžbina.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReady();
  }, []);

  // Otvaranje modala: preuzmi
  function openTakeModal(order) {
    setSelected(order);
    setModalMode("take");
    setModalOpen(true);
  }

  // Otvaranje modala: delivered
  function openDeliveredModal(order) {
    setSelected(order);
    setModalMode("delivered");
    setModalOpen(true);
  }

  function closeModal() {
    if (actionLoading) return;
    setModalOpen(false);
    setSelected(null);
  }

  // Akcija: PREUZMI
  async function takeOrder() {
    if (!selected) return;

    setError("");
    setActionLoading(true);

    try {
      const token = sessionStorage.getItem(TOKEN_KEY);

      const res = await axios.post(
        `${API_BASE}/api/delivery/orders/${selected.id}/take`,
        {},
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success !== true) {
        setError(res.data?.message || "Ne mogu da preuzmem porudžbinu.");
        return;
      }

      alert("Porudžbina je preuzeta.");

      // MVP: ukloni iz ready liste i prebaci u delivering listu (lokalno).
      setReadyOrders((prev) => prev.filter((o) => o.id !== selected.id));
      setDeliveringOrders((prev) => [res.data.data, ...prev]);

      closeModal();
    } catch (err) {
      const apiData = err?.response?.data;
      const msg = apiData?.message || "Greška pri preuzimanju porudžbine.";
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  }

  // Akcija: DELIVERED
  async function markDelivered() {
    if (!selected) return;

    setError("");
    setActionLoading(true);

    try {
      const token = sessionStorage.getItem(TOKEN_KEY);

      const res = await axios.post(
        `${API_BASE}/api/delivery/orders/${selected.id}/delivered`,
        {},
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success !== true) {
        setError(res.data?.message || "Ne mogu da završim porudžbinu.");
        return;
      }

      alert("Porudžbina je označena kao delivered.");

      // Ukloni iz delivering liste.
      setDeliveringOrders((prev) => prev.filter((o) => o.id !== selected.id));

      closeModal();
    } catch (err) {
      const apiData = err?.response?.data;
      const msg = apiData?.message || "Greška pri završavanju porudžbine.";
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  }

  const readyColumns = useMemo(
    () => [
      { key: "id", header: "ID" },
      { key: "shop", header: "Prodavnica", render: (row) => row?.shop?.name || "-" },
      { key: "status", header: "Status", render: (row) => <StatusBadge status={row?.status} /> },
      { key: "delivery_address", header: "Adresa", render: (row) => row?.delivery_address || "-" },
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
    ],
    []
  );

  const deliveringColumns = useMemo(
    () => [
      { key: "id", header: "ID" },
      { key: "shop", header: "Prodavnica", render: (row) => row?.shop?.name || "-" },
      { key: "status", header: "Status", render: (row) => <StatusBadge status={row?.status} /> },
      { key: "delivery_address", header: "Adresa", render: (row) => row?.delivery_address || "-" },
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
    ],
    []
  );

  const modalTitle = modalMode === "take" ? "Preuzimanje porudžbine" : "Završavanje dostave";
  const modalText =
    modalMode === "take"
      ? `Da li želiš da preuzmeš porudžbinu #${selected?.id}.`
      : `Da li želiš da označiš porudžbinu #${selected?.id} kao delivered.`;

  const modalFooter = (
    <div className="qb-flex qb-between qb-center qb-gap-10">
      <button className="qb-btn qb-btn-ghost" type="button" onClick={closeModal} disabled={actionLoading}>
        Nazad
      </button>

      {modalMode === "take" ? (
        <button className="qb-btn qb-btn-primary" type="button" onClick={takeOrder} disabled={actionLoading}>
          {actionLoading ? "Sačekaj..." : "Preuzmi"}
        </button>
      ) : (
        <button className="qb-btn qb-btn-primary" type="button" onClick={markDelivered} disabled={actionLoading}>
          {actionLoading ? "Sačekaj..." : "Delivered"}
        </button>
      )}
    </div>
  );

  return (
    <div className="qb-page">
      <div className="qb-container">
        <PageHeader
          title="Dostave"
          subtitle="Preuzmi porudžbine koje su spremne i završi dostavu kada isporučiš."
          right={
            <button className="qb-btn qb-btn-ghost" type="button" onClick={fetchReady} disabled={loading}>
              {loading ? "Učitavam..." : "Osveži ready"}
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
            title="Spremno za dostavu"
            subtitle="Ovo su porudžbine u statusu ready_for_delivery koje još niko nije preuzeo."
            columns={readyColumns}
            rows={readyOrders}
            emptyText={loading ? "Učitavanje..." : "Nema porudžbina spremnih za dostavu."}
            rowActions={(row) => (
              <button className="qb-btn qb-btn-primary qb-btn-sm" type="button" onClick={() => openTakeModal(row)}>
                Preuzmi
              </button>
            )}
          />
        </div>

        <div className="qb-mt-12">
          <DataTable
            title="U dostavi"
            subtitle="MVP: nakon preuzimanja porudžbina se prikazuje ovde (lokalno)."
            columns={deliveringColumns}
            rows={deliveringOrders}
            emptyText="Nema porudžbina u dostavi."
            rowActions={(row) => (
              <button className="qb-btn qb-btn-primary qb-btn-sm" type="button" onClick={() => openDeliveredModal(row)}>
                Delivered
              </button>
            )}
          />
        </div>

        <Modal open={modalOpen} title={modalTitle} onClose={closeModal} footer={modalFooter}>
          <p className="qb-text qb-muted">{modalText}</p>
        </Modal>
      </div>
    </div>
  );
}
