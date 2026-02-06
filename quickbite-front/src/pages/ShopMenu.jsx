import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";

const API_BASE = "http://127.0.0.1:8000";
const TOKEN_KEY = "auth_token";

function getProductImage(p) {
  return p?.image_url || p?.imageUrl || p?.image || "";
}

export default function ShopMenu() {
  const { id } = useParams(); // shop id
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);

  // korpa: { [productId]: quantity }
  const [cart, setCart] = useState({});
  const [deliveryAddress, setDeliveryAddress] = useState("Knez Mihailova 1, Beograd");

  const [loading, setLoading] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [error, setError] = useState("");

  async function fetchMenu() {
    setError("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem(TOKEN_KEY);

      const res = await axios.get(`${API_BASE}/api/shops/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data;

      if (data?.success !== true) {
        setError(data?.message || "Ne mogu da učitam meni.");
        return;
      }

      const s = data?.data;
      setShop(s || null);
      setProducts(s?.products || []);
    } catch (err) {
      const apiData = err?.response?.data;
      setError(apiData?.message || "Greška pri učitavanju menija.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cartItems = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    const items = Object.entries(cart)
      .map(([pid, qty]) => {
        const productId = Number(pid);
        const product = byId.get(productId);
        if (!product || qty <= 0) return null;
        return {
          product_id: productId,
          name: product.name,
          unit_price: Number(product.price),
          qty: Number(qty),
          line_total: Number(product.price) * Number(qty),
        };
      })
      .filter(Boolean);

    return items;
  }, [cart, products]);

  const total = useMemo(() => {
    return cartItems.reduce((sum, it) => sum + it.line_total, 0);
  }, [cartItems]);

  function inc(p) {
    if (!p?.is_available) return;
    setCart((prev) => {
      const next = { ...prev };
      next[p.id] = (next[p.id] || 0) + 1;
      return next;
    });
  }

  function dec(p) {
    setCart((prev) => {
      const next = { ...prev };
      const current = next[p.id] || 0;
      const newQty = current - 1;
      if (newQty <= 0) delete next[p.id];
      else next[p.id] = newQty;
      return next;
    });
  }

  function clearCart() {
    setCart({});
  }

  async function submitOrder() {
    setError("");

    if (!deliveryAddress.trim()) {
      setError("Unesi adresu za dostavu.");
      return;
    }
    if (cartItems.length === 0) {
      setError("Korpa je prazna.");
      return;
    }

    setLoadingOrder(true);
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);

      const payload = {
        shop_id: Number(id),
        delivery_address: deliveryAddress.trim(),
        delivery_lat: null,
        delivery_lng: null,
        items: cartItems.map((it) => ({
          product_id: it.product_id,
          quantity: it.qty,
        })),
      };

      const res = await axios.post(`${API_BASE}/api/orders`, payload, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data;

      if (data?.success !== true) {
        setError(data?.message || "Porudžbina nije kreirana.");
        return;
      }

      // uspeh
      clearCart();
      navigate("/my-orders", { replace: true });
    } catch (err) {
      const apiData = err?.response?.data;
      const msg =
        apiData?.errors?.items?.[0] ||
        apiData?.message ||
        "Greška pri kreiranju porudžbine.";
      setError(msg);
    } finally {
      setLoadingOrder(false);
    }
  }

  return (
    <div className="qb-page">
      <div className="qb-container">
        <PageHeader
          title={shop?.name ? `Meni: ${shop.name}` : "Meni prodavnice"}
          subtitle={shop?.address || "Izaberi proizvode i potvrdi porudžbinu."}
          right={
            <button className="qb-btn qb-btn-ghost" type="button" onClick={() => navigate("/shops")}>
              Nazad na prodavnice
            </button>
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
              <p className="qb-text qb-muted">Učitavanje menija...</p>
            </div>
          </div>
        ) : (
          <div className="qb-two-col qb-mt-12">
            {/* LEFT: products */}
            <div className="qb-col">
              <div className="qb-card">
                <div className="qb-card-body">
                  <h3 className="qb-h3 qb-mb-6">Proizvodi</h3>
                  <p className="qb-text qb-muted qb-mb-12">
                    Klikni + da dodaš u korpu.
                  </p>

                  <div className="qb-product-list">
                    {products.map((p) => {
                      const qty = cart[p.id] || 0;
                      const img = getProductImage(p);

                      return (
                        <div key={p.id} className={`qb-product ${p.is_available ? "" : "is-disabled"}`}>
                          <div className="qb-product-left">
                            <div className="qb-product-imgwrap">
                              {img ? (
                                <img className="qb-product-img" src={img} alt={p.name} />
                              ) : (
                                <div className="qb-product-img qb-product-img--placeholder" />
                              )}
                            </div>

                            <div className="qb-product-info">
                              <div className="qb-product-title">{p.name}</div>
                              <div className="qb-small qb-muted">
                                Cena: <strong>{Number(p.price).toFixed(0)} RSD</strong>
                              </div>
                              {!p.is_available && (
                                <div className="qb-badge qb-badge--muted qb-mt-6">
                                  Nije dostupno
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="qb-product-actions">
                            <button
                              className="qb-btn qb-btn-ghost qb-btn-sm"
                              type="button"
                              onClick={() => dec(p)}
                              disabled={qty <= 0}
                            >
                              -
                            </button>

                            <div className="qb-qty">{qty}</div>

                            <button
                              className="qb-btn qb-btn-primary qb-btn-sm"
                              type="button"
                              onClick={() => inc(p)}
                              disabled={!p.is_available}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {products.length === 0 && (
                      <div className="qb-card qb-card--soft">
                        <div className="qb-card-body">
                          <p className="qb-text qb-muted">Nema proizvoda u ovoj prodavnici.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: cart */}
            <div className="qb-col qb-sticky-col">
              <div className="qb-card">
                <div className="qb-card-body">
                  <div className="qb-flex qb-between qb-center">
                    <h3 className="qb-h3">Korpa</h3>
                    <button className="qb-btn qb-btn-ghost qb-btn-sm" type="button" onClick={clearCart}>
                      Očisti
                    </button>
                  </div>

                  <div className="qb-field qb-mt-12">
                    <label className="qb-label">Adresa dostave</label>
                    <input
                      className="qb-input"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="npr. Knez Mihailova 1, Beograd"
                    />
                    <div className="qb-help">
                      Za MVP unosimo samo tekst adrese (lat/lng možemo dodati kasnije).
                    </div>
                  </div>

                  <div className="qb-divider qb-mt-12 qb-mb-12" />

                  {cartItems.length === 0 ? (
                    <p className="qb-text qb-muted">Korpa je prazna.</p>
                  ) : (
                    <div className="qb-cart-list">
                      {cartItems.map((it) => (
                        <div key={it.product_id} className="qb-cart-row">
                          <div className="qb-cart-main">
                            <div className="qb-cart-name">{it.name}</div>
                            <div className="qb-small qb-muted">
                              {it.qty} × {it.unit_price.toFixed(0)} RSD
                            </div>
                          </div>
                          <div className="qb-cart-total">{it.line_total.toFixed(0)} RSD</div>
                        </div>
                      ))}

                      <div className="qb-divider qb-mt-12 qb-mb-12" />

                      <div className="qb-flex qb-between qb-center">
                        <div className="qb-text">
                          Ukupno:
                        </div>
                        <div className="qb-h3">{total.toFixed(0)} RSD</div>
                      </div>
                    </div>
                  )}

                  <button
                    className="qb-btn qb-btn-primary qb-btn-block qb-mt-12"
                    type="button"
                    disabled={loadingOrder || cartItems.length === 0}
                    onClick={submitOrder}
                  >
                    {loadingOrder ? "Kreiram..." : "Potvrdi porudžbinu"}
                  </button>

                  <div className="qb-help qb-mt-8">
                    Porudžbina se kreira tek klikom na “Potvrdi porudžbinu”.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
