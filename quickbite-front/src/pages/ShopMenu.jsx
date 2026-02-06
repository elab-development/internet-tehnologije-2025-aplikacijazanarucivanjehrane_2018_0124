import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";

const API_BASE = "http://127.0.0.1:8000";
const TOKEN_KEY = "auth_token";

/**
 * MVP: Geocode adrese (tekst -> lat/lng) preko OpenStreetMap Nominatim.
 * Pozivamo samo 1x kad korisnik klikne "Potvrdi porudžbinu".
 */
async function geocodeAddress(addressText) {
  // Dodamo "Beograd" da bude pouzdanije
  const q = `${addressText}, Beograd, Serbia`;

  const res = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: {
      q,
      format: "json",
      limit: 1,
    },
    headers: { Accept: "application/json" },
  });

  const hit = res.data?.[0];
  if (!hit) return null;

  return {
    lat: Number(hit.lat),
    lng: Number(hit.lon),
  };
}

function productImage(p) {
  return p?.image_url 
}

export default function ShopMenu() {
  const { id } = useParams(); // shop id iz URL-a: /shops/:id
  const navigate = useNavigate();

  // Podaci prodavnice + proizvodi
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);

  // Korpa je najjednostavnije: array objekata [{ product, quantity }]
  const [cart, setCart] = useState([]);

  // Dostava
  const [deliveryAddress, setDeliveryAddress] = useState("Knez Mihailova 1");

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [error, setError] = useState("");

  /**
   * Učitaj meni prodavnice.
   * GET /api/shops/{id} (buyer ruta, treba token).
   */
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

      if (res.data?.success !== true) {
        setError(res.data?.message || "Ne mogu da učitam meni.");
        return;
      }

      setShop(res.data?.data || null);
      setProducts(res.data?.data?.products || []);
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

  /**
   * Dodaj proizvod u korpu (+1).
   * Ako već postoji u korpi, samo povećaj quantity.
   */
  function addToCart(product) {
    if (!product.is_available) return;

    setCart((prev) => {
      const found = prev.find((x) => x.product.id === product.id);

      if (!found) {
        // Nije u korpi -> dodaj novi.
        return [...prev, { product, quantity: 1 }];
      }

      // Jeste u korpi -> uvećaj quantity.
      return prev.map((x) =>
        x.product.id === product.id ? { ...x, quantity: x.quantity + 1 } : x
      );
    });
  }

  /**
   * Smanji količinu (-1). Ako padne na 0, izbaci iz korpe.
   */
  function removeFromCart(product) {
    setCart((prev) => {
      const found = prev.find((x) => x.product.id === product.id);
      if (!found) return prev;

      const newQty = found.quantity - 1;
      if (newQty <= 0) {
        return prev.filter((x) => x.product.id !== product.id);
      }

      return prev.map((x) =>
        x.product.id === product.id ? { ...x, quantity: newQty } : x
      );
    });
  }

  function clearCart() {
    setCart([]);
  }

  // Ukupna cena korpe (računa se automatski).
  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = Number(item.product.price);
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  /**
   * Potvrdi porudžbinu:
   * 1) Geocode adrese -> lat/lng
   * 2) POST /api/orders sa items (product_id, quantity)
   */
  async function submitOrder() {
    setError("");

    if (!deliveryAddress.trim()) {
      setError("Unesi adresu za dostavu.");
      return;
    }
    if (cart.length === 0) {
      setError("Korpa je prazna.");
      return;
    }

    setLoadingOrder(true);

    try {
      // 1) Geocode adrese (adresu pretvaramo u lat/lng).
      const geo = await geocodeAddress(deliveryAddress.trim());

      if (!geo) {
        setError("Ne mogu da pronađem lokaciju za unetu adresu. Probaj preciznije.");
        setLoadingOrder(false);
        return;
      }

      // 2) Payload za backend (tačno kako BuyerController očekuje).
      const payload = {
        shop_id: Number(id),
        delivery_address: deliveryAddress.trim(),
        delivery_lat: geo.lat,
        delivery_lng: geo.lng,
        items: cart.map((x) => ({
          product_id: x.product.id,
          quantity: x.quantity,
        })),
      };

      const token = sessionStorage.getItem(TOKEN_KEY);

      const res = await axios.post(`${API_BASE}/api/orders`, payload, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success !== true) {
        setError(res.data?.message || "Porudžbina nije kreirana.");
        return;
      }

      // Uspeh -> isprazni korpu i idi na moje porudžbine.
      alert("Porudžbina je uspešno kreirana.");
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
              Nazad
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
            {/* LEVO: proizvodi */}
            <div className="qb-col">
              <div className="qb-card">
                <div className="qb-card-body">
                  <h3 className="qb-h3 qb-mb-12">Proizvodi</h3>

                  <div className="qb-product-list">
                    {products.map((p) => {
                      // Ako je u korpi, nađi quantity.
                      const inCart = cart.find((x) => x.product.id === p.id);
                      const qty = inCart ? inCart.quantity : 0;

                      return (
                        <div key={p.id} className={`qb-product ${p.is_available ? "" : "is-disabled"}`}>
                          <div className="qb-product-left">
                            <div className="qb-product-imgwrap">
                              {productImage(p) ? (
                                <img className="qb-product-img" src={productImage(p)} alt={p.name} />
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
                                <div className="qb-badge qb-badge--muted qb-mt-6">Nije dostupno</div>
                              )}
                            </div>
                          </div>

                          <div className="qb-product-actions">
                            <button
                              className="qb-btn qb-btn-ghost qb-btn-sm"
                              type="button"
                              onClick={() => removeFromCart(p)}
                              disabled={qty <= 0}
                            >
                              -
                            </button>

                            <div className="qb-qty">{qty}</div>

                            <button
                              className="qb-btn qb-btn-primary qb-btn-sm"
                              type="button"
                              onClick={() => addToCart(p)}
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
                          <p className="qb-text qb-muted">Nema proizvoda.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* DESNO: korpa */}
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
                      placeholder="npr. Knez Mihailova 1"
                    />
                    <div className="qb-help">
                      Unesemo adresu, a sistem preko OSM API-ja pronađe lat/lng.
                    </div>
                  </div>

                  <div className="qb-divider qb-mt-12 qb-mb-12" />

                  {cart.length === 0 ? (
                    <p className="qb-text qb-muted">Korpa je prazna.</p>
                  ) : (
                    <div className="qb-cart-list">
                      {cart.map((x) => (
                        <div key={x.product.id} className="qb-cart-row">
                          <div className="qb-cart-main">
                            <div className="qb-cart-name">{x.product.name}</div>
                            <div className="qb-small qb-muted">
                              {x.quantity} × {Number(x.product.price).toFixed(0)} RSD
                            </div>
                          </div>
                          <div className="qb-cart-total">
                            {(Number(x.product.price) * x.quantity).toFixed(0)} RSD
                          </div>
                        </div>
                      ))}

                      <div className="qb-divider qb-mt-12 qb-mb-12" />

                      <div className="qb-flex qb-between qb-center">
                        <div className="qb-text">Ukupno:</div>
                        <div className="qb-h3">{total.toFixed(0)} RSD</div>
                      </div>
                    </div>
                  )}

                  <button
                    className="qb-btn qb-btn-primary qb-btn-block qb-mt-12"
                    type="button"
                    disabled={loadingOrder || cart.length === 0}
                    onClick={submitOrder}
                  >
                    {loadingOrder ? "Kreiram..." : "Potvrdi porudžbinu"}
                  </button>

                  <div className="qb-help qb-mt-8">
                    Porudžbina se kreira tek kada klikneš na dugme.
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
