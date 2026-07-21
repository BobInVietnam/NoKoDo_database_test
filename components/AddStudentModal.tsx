"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { addStudent } from "@/services/student.service";
import "../app/(pages)/pages.css";

interface AddStudentModalProps {
  classId: string;
}

export default function AddStudentModal({ classId }: AddStudentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("Nam");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.ChangeEvent) => {
    e.preventDefault();
    if (!firstName || !lastName)
      return alert("Vui lòng điền đủ thông tin");

    setLoading(true);
    try {
      const res = await addStudent({ firstName, lastName, birthday, gender, classId });
      if (res && res.id) {
        alert("Thêm học sinh thành công!");
        setIsOpen(false);
        setFirstName("");
        setLastName("");
        setBirthday("");
        setGender("Nam");
        window.location.reload();
      } else {
        alert("Có lỗi xảy ra, không thể thêm học sinh.");
      }
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="add-btn" onClick={() => setIsOpen(true)}>
        <Plus size={20} strokeWidth={2.5} />
        Thêm học sinh
      </button>

      {isOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "20px", color: "#333" }}>
                Thêm học sinh mới
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  padding: "5px",
                }}
              >
                <X size={20} color="#666" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <div>
                <label style={labelStyle}>Họ và tên đệm:</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Tên học sinh:</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ví dụ: An"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Ngày sinh (Tùy chọn):</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Giới tính:</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={inputStyle}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <button type="submit" disabled={loading} style={submitBtnStyle}>
                {loading ? "Đang lưu..." : "Xác nhận thêm"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "25px",
  borderRadius: "10px",
  width: "420px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  fontFamily: "Arial, sans-serif",
  color: "#171717",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  color: "#444",
  fontSize: "14px",
  fontWeight: "bold",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
  fontSize: "15px",
  color: "#333",
  outline: "none",
};

const submitBtnStyle: React.CSSProperties = {
  padding: "12px",
  backgroundColor: "#2b78c5",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginTop: "10px",
  fontSize: "16px",
  fontWeight: "bold",
};
