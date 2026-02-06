import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Shops from "./pages/Shops";
import MyOrders from "./pages/MyOrders";
import MyShops from "./pages/MyShops";
import Products from "./pages/Products";
import ShopOrders from "./pages/ShopOrders";
import ReadyOrders from "./pages/ReadyOrders";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";
import ShopMenu from "./pages/ShopMenu";
import OrderDetails from "./pages/OrderDetails";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

const DEFAULT_BY_ROLE = {
  buyer: "/shops",
  shop: "/my-shops",
  delivery: "/ready-orders",
  admin: "/users",
};

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

function getUser() {
  const raw = sessionStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearAuth() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

// ako nisi ulogovan -> login
function PrivateRoute({ token, children }) {
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RoleRoute({ user, allowed, children }) {
  const role = user?.role;
  if (!role || !allowed.includes(role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());

  const isAuthed = !!token;

  const onLoginSuccess = ({ token, user }) => {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const onLogout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
  };

  return (
    <div className="qb-app">
      <Navbar user={isAuthed ? user : null} onLogout={onLogout} logoSrc="/logo.png" />

      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={isAuthed ? <Navigate to="/" replace /> : <Login onLoginSuccess={onLoginSuccess} />}
        />
        <Route
          path="/register"
          element={isAuthed ? <Navigate to="/" replace /> : <Register onLoginSuccess={onLoginSuccess} />}
        />

        {/* Home: preusmeri po roli */}
        <Route
          path="/"
          element={
            !isAuthed ? (
              <Navigate to="/login" replace />
            ) : (
              <Navigate to={DEFAULT_BY_ROLE[user?.role] || "/login"} replace />
            )
          }
        />

        {/* Buyer */}
        <Route
          path="/shops"
          element={
            <PrivateRoute token={token}>
              <RoleRoute user={user} allowed={["buyer"]}>
                <Shops />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/shops/:id"
          element={
            <PrivateRoute token={token}>
              <RoleRoute user={user} allowed={["buyer"]}>
                <ShopMenu />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <PrivateRoute token={token}>
              <RoleRoute user={user} allowed={["buyer"]}>
                <MyOrders />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-orders/:id"
          element={
            <PrivateRoute token={token}>
              <RoleRoute user={user} allowed={["buyer"]}>
                <OrderDetails />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        


        {/* Shop */}
        <Route
          path="/my-shops"
          element={
            <PrivateRoute token={token}>
              <RoleRoute user={user} allowed={["shop"]}>
                <MyShops />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/shop-orders/:shopId"
          element={
            <PrivateRoute token={token}>
              <RoleRoute user={user} allowed={["shop"]}>
                <ShopOrders />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route
          path="/products/:shopId"
          element={
            <PrivateRoute token={token}>
              <RoleRoute user={user} allowed={["shop"]}>
                <Products />
              </RoleRoute>
            </PrivateRoute>
          }
        />


        {/* Delivery */}
        <Route
          path="/ready-orders"
          element={
            <PrivateRoute token={token}>
              <RoleRoute user={user} allowed={["delivery"]}>
                <ReadyOrders />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        

        {/* Admin */}
        <Route
          path="/users"
          element={
            <PrivateRoute token={token}>
              <RoleRoute user={user} allowed={["admin"]}>
                <Users />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
