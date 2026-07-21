"use client";

import "./main.css";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const email = event.currentTarget.email.value;
    const password = event.currentTarget.password.value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Email hoặc mật khẩu không chính xác");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Login Error:", err);
      setError("Đã xảy ra lỗi kết nối hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="login-box">
        <div className="header">
          <h2>Đăng nhập hệ thống</h2>
        </div>
        <div className="content">
          <form onSubmit={handleLogin}>
            {error && (
              <div
                style={{
                  color: "#ff4d4f",
                  backgroundColor: "#fff2f0",
                  border: "1px solid #ffccc7",
                  padding: "10px",
                  borderRadius: "4px",
                  marginBottom: "15px",
                  fontWeight: "bold",
                }}
              >
                {error}
              </div>
            )}

            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              required
              disabled={loading}
            />
            <br />
            <br />
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Nhập mật khẩu"
              required
              disabled={loading}
            />
            <br />
            <br />
            <button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
            <br />
            <br />
            <label htmlFor="remember-password">
              <input
                type="checkbox"
                id="remember-password"
                name="remember-password"
                defaultChecked
                disabled={loading}
              />
              {" Nhớ mật khẩu"}
            </label>
          </form>
        </div>
      </div>
    </div>
  );
}
