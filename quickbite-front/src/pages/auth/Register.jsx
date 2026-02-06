import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../../components/AuthCard";
import axios from "axios";


const API_BASE = "http://127.0.0.1:8000";

export default function Register({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

async function handleRegister({ name, email, password }) {
    setFormError("");

    if (!name || !email || !password) {
        setFormError("Popuni ime, email i lozinku.");
        return;
    }

    setLoading(true);
    try {
        const res = await axios.post(
        `${API_BASE}/api/register`,
        { name, email, password }, // role ne šaljemo => backend default buyer
        { headers: { Accept: "application/json" } }
        );

        const data = res.data;

        if (data?.success !== true) {
        const msg =
            data?.message ||
            data?.errors?.email?.[0] ||
            data?.errors?.password?.[0] ||
            "Registracija nije uspela.";
        setFormError(msg);
        return;
        }

        const token = data?.data?.token;
        const user = data?.data?.user;

        if (!token || !user) {
        setFormError("Nedostaje token ili user u odgovoru API-ja.");
        return;
        }

        onLoginSuccess?.({ token, user });
        navigate("/dashboard", { replace: true });
    } catch (err) {
        const apiData = err?.response?.data;

        // Laravel validation 422 često vraća errors objekt.
        const msg =
        apiData?.message ||
        apiData?.errors?.email?.[0] ||
        apiData?.errors?.password?.[0] ||
        "Ne mogu da se povežem sa serverom. Proveri backend.";

        setFormError(msg);
    } finally {
        setLoading(false);
    }
}


  return (
    <div className="qb-page">
      <div className="qb-container qb-auth-page">
        <div className="qb-auth-wrap">
          <AuthCard
            mode="register"
            loading={loading}
            error={formError}
            defaults={{ name: "Ana", email: "ana@quickbite.test", password: "quickbite" }} 
            onSubmit={handleRegister}
          />
          <p className="qb-small qb-mt-12 qb-text-center">
            Nakon registracije bićeš automatski ulogovana.
          </p>
        </div>
      </div>
    </div>
  );
}
