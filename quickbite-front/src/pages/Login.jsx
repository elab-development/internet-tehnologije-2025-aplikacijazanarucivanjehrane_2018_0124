import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import axios from "axios";


const API_BASE = "http://127.0.0.1:8000";

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

 async function handleLogin({ email, password }) {
    setFormError("");

    if (!email || !password) {
        setFormError("Popuni email i lozinku.");
        return;
    }

    setLoading(true);
    try {
        const res = await axios.post(
        `${API_BASE}/api/login`,
        { email, password },
        { headers: { Accept: "application/json" } }
        );

        const data = res.data;

        if (data?.success !== true) {
        const msg =
            data?.errors?.auth?.[0] ||
            data?.message ||
            "Email ili lozinka nisu ispravni.";
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
        // Axios: validation/401 poruke često dođu u err.response.data
        const apiData = err?.response?.data;

        const msg =
        apiData?.errors?.auth?.[0] ||
        apiData?.message ||
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
            mode="login"
            loading={loading}
            error={formError}
            defaults={{ email: "petar@quickbite.test", password: "quickbite" }} 
            onSubmit={handleLogin}
          />
         
        </div>
      </div>
    </div>
  );
}
