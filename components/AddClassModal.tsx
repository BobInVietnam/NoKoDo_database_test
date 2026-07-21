"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { addClass } from "@/services/classes.service";

export default function AddClassModal({
  firebaseUid,
}: {
  firebaseUid: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [classname, setClassname] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.ChangeEvent) => {
    e.preventDefault();
    if (!classname) return alert("Vui lòng nhập tên lớp");

    setLoading(true);
    try {
      const res = await addClass(classname, firebaseUid);
      if (res.success) {
        setIsOpen(false);
        setClassname("");
        window.location.reload();
      } else {
        alert(res.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="add-btn" onClick={() => setIsOpen(true)}>
        <Plus size={20} strokeWidth={2.5} />
        Thêm lớp
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "25px",
              borderRadius: "10px",
              width: "400px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
              }}
            >
              <h3 style={{ margin: 0 }}>Thêm lớp học mới</h3>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  Tên lớp học:
                </label>
                <input
                  type="text"
                  value={classname}
                  onChange={(e) => setClassname(e.target.value)}
                  placeholder="Ví dụ: Lớp 10A1"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px",
                  backgroundColor: "#2b78c5",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {loading ? "Đang lưu..." : "Xác nhận"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
