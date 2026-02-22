import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

const API_BASE = "http://127.0.0.1:8000";
const TOKEN_KEY = "auth_token";

function RoleBadge({ role }) {
  const r = (role || "unknown").toLowerCase();

  const cls =
    r === "admin"
      ? "qb-badge qb-badge--primary"
      : r === "shop"
      ? "qb-badge qb-badge--warning"
      : r === "delivery"
      ? "qb-badge qb-badge--success"
      : "qb-badge";

  return <span className={cls}>{role || "unknown"}</span>;
}

export default function Users() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  function getMe() {
    try {
      const raw = sessionStorage.getItem("auth_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async function fetchUsers() {
    setError("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem(TOKEN_KEY);

      const res = await axios.get(`${API_BASE}/api/users`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success !== true) {
        setError(res.data?.message || "Ne mogu da učitam korisnike.");
        return;
      }

      setUsers(res.data?.data || []);
    } catch (err) {
      const apiData = err?.response?.data;
      setError(apiData?.message || "Greška pri učitavanju korisnika.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function openDeleteModal(user) {
    setSelected(user);
    setModalOpen(true);
  }

  function closeModal() {
    if (actionLoading) return;
    setModalOpen(false);
    setSelected(null);
  }

  async function deleteUser() {
    if (!selected) return;

    setError("");
    setActionLoading(true);

    try {
      const token = sessionStorage.getItem(TOKEN_KEY);

      const res = await axios.delete(`${API_BASE}/api/users/${selected.id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success !== true) {
        setError(res.data?.message || "Ne mogu da obrišem korisnika.");
        return;
      }

      alert("Korisnik je obrisan.");

      // Optimistic update: ukloni iz liste
      setUsers((prev) => prev.filter((u) => u.id !== selected.id));

      closeModal();
    } catch (err) {
      const apiData = err?.response?.data;
      const msg =
        apiData?.message ||
        (apiData?.errors?.auth?.[0] ? apiData.errors.auth[0] : null) ||
        "Greška pri brisanju korisnika.";
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  }

  const columns = useMemo(
    () => [
      { key: "id", header: "ID" },
      { key: "name", header: "Ime" },
      { key: "email", header: "Email" },
      { key: "role", header: "Uloga", render: (row) => <RoleBadge role={row?.role} /> }
    ],
    []
  );

  const me = getMe();
  const modalTitle = "Brisanje korisnika";
  const modalFooter = (
    <div className="qb-flex qb-between qb-center qb-gap-10">
      <button className="qb-btn qb-btn-ghost" type="button" onClick={closeModal} disabled={actionLoading}>
        Nazad
      </button>

      <button className="qb-btn qb-btn-primary" type="button" onClick={deleteUser} disabled={actionLoading}>
        {actionLoading ? "Sačekaj..." : "Obriši"}
      </button>
    </div>
  );

  return (
    <div className="qb-page">
      <div className="qb-container">
        <PageHeader
          title="Korisnici"
          subtitle="Administracija korisnika (pregled i brisanje)."
          right={
            <button className="qb-btn qb-btn-ghost" type="button" onClick={fetchUsers} disabled={loading}>
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
            title="Lista korisnika"
            subtitle="Brisanje korisnika je moguće samo za admina (nije moguće obrisati sopstveni nalog)."
            columns={columns}
            rows={users}
            emptyText={loading ? "Učitavanje..." : "Nema korisnika."}
            rowActions={(row) => {
              const isMe = me?.id && row?.id === me.id;

              return (
                <button
                  className="qb-btn qb-btn-primary qb-btn-sm"
                  type="button"
                  onClick={() => openDeleteModal(row)}
                  disabled={isMe}
                  title={isMe ? "Ne možete obrisati sopstveni nalog." : "Obriši korisnika"}
                >
                  Obriši
                </button>
              );
            }}
          />
        </div>

        <Modal open={modalOpen} title={modalTitle} onClose={closeModal} footer={modalFooter} closeText="X">
          <p className="qb-text">
            Da li si siguran/na da želiš da obrišeš korisnika{" "}
            <strong>{selected?.name}</strong> ({selected?.email})?
          </p>
          <p className="qb-text qb-muted qb-mt-8">
            Ova akcija je trajna. Backend blokira brisanje sopstvenog naloga.
          </p>
        </Modal>
      </div>
    </div>
  );
}