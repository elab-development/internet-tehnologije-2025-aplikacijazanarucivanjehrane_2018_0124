import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";

const API_BASE = "http://127.0.0.1:8000";
const TOKEN_KEY = "auth_token";

function formatPrice(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return "-";
  return `${n.toFixed(2)} RSD`;
}

export default function Products() {
  const [shops, setShops] = useState([]);
  const [shopId, setShopId] = useState("");

  const [products, setProducts] = useState([]);

  const [loadingShops, setLoadingShops] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState("");

  // EDIT modal
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    image_url: "",
    is_available: true,
  });
  const [actionLoading, setActionLoading] = useState(false);

  // DELETE modal
  const [delOpen, setDelOpen] = useState(false);
  const [delItem, setDelItem] = useState(null);

  function authHeaders() {
    const token = sessionStorage.getItem(TOKEN_KEY);
    return {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async function fetchMyShops() {
    setError("");
    setLoadingShops(true);

    try {
      const res = await axios.get(`${API_BASE}/api/shop/shops`, {
        headers: authHeaders(),
      });

      if (res.data?.success !== true) {
        setError(res.data?.message || "Ne mogu da učitam prodavnice.");
        return;
      }

      const list = res.data?.data || [];
      setShops(list);

      // auto-select prvu prodavnicu ako nema selekcije
      if (!shopId && list.length > 0) {
        setShopId(String(list[0].id));
      }
    } catch (err) {
      const apiData = err?.response?.data;
      setError(apiData?.message || "Greška pri učitavanju prodavnica.");
    } finally {
      setLoadingShops(false);
    }
  }

  async function fetchProducts(forShopId) {
    if (!forShopId) {
      setProducts([]);
      return;
    }

    setError("");
    setLoadingProducts(true);

    try {
      const res = await axios.get(`${API_BASE}/api/shop/shops/${forShopId}/products`, {
        headers: authHeaders(),
      });

      if (res.data?.success !== true) {
        setError(res.data?.message || "Ne mogu da učitam proizvode.");
        return;
      }

      setProducts(res.data?.data || []);
    } catch (err) {
      const apiData = err?.response?.data;
      setError(apiData?.message || "Greška pri učitavanju proizvoda.");
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    fetchMyShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (shopId) fetchProducts(shopId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  function openEdit(p) {
    setEditItem(p);
    setEditForm({
      name: p?.name || "",
      price: p?.price ?? "",
      image_url: p?.image_url || "",
      is_available: p?.is_available ?? true,
    });
    setEditOpen(true);
  }

  function closeEdit() {
    if (actionLoading) return;
    setEditOpen(false);
    setEditItem(null);
  }

  async function saveEdit() {
    if (!editItem || !shopId) return;

    setError("");
    setActionLoading(true);

    try {
      const payload = {
        name: editForm.name,
        price: Number(editForm.price),
        image_url: editForm.image_url ? editForm.image_url : null,
        is_available: !!editForm.is_available,
      };

      const res = await axios.put(
        `${API_BASE}/api/shop/shops/${shopId}/products/${editItem.id}`,
        payload,
        { headers: authHeaders() }
      );

      if (res.data?.success !== true) {
        setError(res.data?.message || "Ne mogu da sačuvam izmene.");
        return;
      }

      const updated = res.data?.data;

      // update u tabeli
      setProducts((prev) => prev.map((x) => (x.id === editItem.id ? updated : x)));

      closeEdit();
      alert("Proizvod je izmenjen.");
    } catch (err) {
      const apiData = err?.response?.data;
      setError(apiData?.message || "Greška pri izmeni proizvoda.");
    } finally {
      setActionLoading(false);
    }
  }

  function openDelete(p) {
    setDelItem(p);
    setDelOpen(true);
  }

  function closeDelete() {
    if (actionLoading) return;
    setDelOpen(false);
    setDelItem(null);
  }

  async function confirmDelete() {
    if (!delItem || !shopId) return;

    setError("");
    setActionLoading(true);

    try {
      const res = await axios.delete(
        `${API_BASE}/api/shop/shops/${shopId}/products/${delItem.id}`,
        { headers: authHeaders() }
      );

      if (res.data?.success !== true) {
        setError(res.data?.message || "Ne mogu da obrišem proizvod.");
        return;
      }

      setProducts((prev) => prev.filter((x) => x.id !== delItem.id));
      closeDelete();
      alert("Proizvod je obrisan.");
    } catch (err) {
      const apiData = err?.response?.data;
      setError(apiData?.message || "Greška pri brisanju proizvoda.");
    } finally {
      setActionLoading(false);
    }
  }

  const columns = useMemo(
    () => [
      { key: "id", header: "ID" },
      { key: "name", header: "Naziv" },
      {
        key: "price",
        header: "Cena",
        render: (row) => formatPrice(row?.price),
      },
      {
        key: "is_available",
        header: "Dostupno",
        render: (row) =>
          row?.is_available ? (
            <span className="qb-badge qb-badge--success">Da</span>
          ) : (
            <span className="qb-badge qb-badge--warning">Ne</span>
          ),
      },
      {
        key: "image_url",
        header: "Slika",
        render: (row) =>
          row?.image_url ? (
            <a className="qb-link" href={row.image_url} target="_blank" rel="noreferrer">
              Otvori
            </a>
          ) : (
            <span className="qb-muted">-</span>
          ),
      },
    ],
    []
  );

  const currentShop = shops.find((s) => String(s.id) === String(shopId));

  return (
    <div className="qb-page">
      <div className="qb-container">
        <PageHeader
          title="Proizvodi"
          subtitle="Upravljanje proizvodima po prodavnici (edit + delete)."
          right={
            <div className="qb-flex qb-gap-10 qb-center">

              <button
                className="qb-btn qb-btn-ghost"
                type="button"
                onClick={() => fetchProducts(shopId)}
                disabled={loadingProducts || !shopId}
              >
                {loadingProducts ? "..." : "Osveži proizvode"}
              </button>
            </div>
          }
        />

        {error && (
          <div className="qb-alert qb-alert--danger qb-mt-12">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Shop selector */}
        <div className="qb-card qb-mt-12">
          <div className="qb-card-body">
            <h3 className="qb-h3 qb-mb-6">Izaberi prodavnicu</h3>
            <p className="qb-text qb-muted qb-mb-12">
              Proizvodi se učitavaju za selektovanu prodavnicu vlasnika.
            </p>

            <div className="qb-flex qb-gap-10 qb-center">
              <select
                className="qb-input"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                disabled={loadingShops || shops.length === 0}
              >
                {shops.length === 0 ? (
                  <option value="">Nema prodavnica</option>
                ) : (
                  shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.address})
                    </option>
                  ))
                )}
              </select>

              <div className="qb-text qb-muted">
                {currentShop ? (
                  <>
                    Selektovano: <strong>{currentShop.name}</strong>
                  </>
                ) : (
                  "Nije selektovano"
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="qb-mt-12">
          <DataTable
            title="Lista proizvoda"
            subtitle="Klikni Edit za izmenu, ili Obriši za uklanjanje proizvoda."
            columns={columns}
            rows={products}
            emptyText={
              !shopId
                ? "Prvo izaberi prodavnicu."
                : loadingProducts
                ? "Učitavanje..."
                : "Nema proizvoda."
            }
            rowActions={(row) => (
              <div className="qb-flex qb-gap-10">
                <button
                  className="qb-btn qb-btn-ghost qb-btn-sm"
                  type="button"
                  onClick={() => openEdit(row)}
                >
                  Edit
                </button>
                <button
                  className="qb-btn qb-btn-primary qb-btn-sm"
                  type="button"
                  onClick={() => openDelete(row)}
                >
                  Obriši
                </button>
              </div>
            )}
          />
        </div>

        {/* Edit modal */}
        <Modal
          open={editOpen}
          title="Izmena proizvoda"
          onClose={closeEdit}
          footer={
            <div className="qb-flex qb-between qb-center qb-gap-10">
              <button className="qb-btn qb-btn-ghost" type="button" onClick={closeEdit} disabled={actionLoading}>
                Nazad
              </button>
              <button className="qb-btn qb-btn-primary" type="button" onClick={saveEdit} disabled={actionLoading}>
                {actionLoading ? "Sačekaj..." : "Sačuvaj"}
              </button>
            </div>
          }
          closeText="X"
        >
          <div className="qb-grid qb-gap-10">
            <div>
              <label className="qb-label">Naziv</label>
              <input
                className="qb-input"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="npr. Pizza Capricciosa"
              />
            </div>

            <div>
              <label className="qb-label">Cena</label>
              <input
                className="qb-input"
                type="number"
                step="0.01"
                value={editForm.price}
                onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
                placeholder="npr. 799.99"
              />
            </div>

            <div>
              <label className="qb-label">Image URL (opciono)</label>
              <input
                className="qb-input"
                value={editForm.image_url}
                onChange={(e) => setEditForm((p) => ({ ...p, image_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="qb-flex qb-gap-10 qb-center qb-mt-8">
              <input
                id="is_available"
                type="checkbox"
                checked={!!editForm.is_available}
                onChange={(e) => setEditForm((p) => ({ ...p, is_available: e.target.checked }))}
              />
              <label htmlFor="is_available" className="qb-text">
                Dostupan proizvod
              </label>
            </div>
          </div>
        </Modal>

        {/* Delete modal */}
        <Modal
          open={delOpen}
          title="Brisanje proizvoda"
          onClose={closeDelete}
          footer={
            <div className="qb-flex qb-between qb-center qb-gap-10">
              <button className="qb-btn qb-btn-ghost" type="button" onClick={closeDelete} disabled={actionLoading}>
                Nazad
              </button>
              <button className="qb-btn qb-btn-primary" type="button" onClick={confirmDelete} disabled={actionLoading}>
                {actionLoading ? "Sačekaj..." : "Obriši"}
              </button>
            </div>
          }
          closeText="X"
        >
          <p className="qb-text">
            Da li si siguran/na da želiš da obrišeš proizvod <strong>{delItem?.name}</strong>?
          </p>
          <p className="qb-text qb-muted qb-mt-8">Ova akcija je trajna.</p>
        </Modal>
      </div>
    </div>
  );
}