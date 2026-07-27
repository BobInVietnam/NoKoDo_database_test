"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Trash2, Plus, Upload } from "lucide-react";
import "@/app/(pages)/pages.css";

interface DictionaryEntry {
  id?: string;
  word: string;
  description: string;
  imageName: string;
  tempId?: string;
  file?: File;
}

export default function DictionaryPage() {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [dbEntries, setDbEntries] = useState<DictionaryEntry[]>([]);
  const [version, setVersion] = useState("v1");
  const [dateEdited, setDateEdited] = useState("N/A");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dictionary");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
        // Clone for reset functionality
        setDbEntries(JSON.parse(JSON.stringify(data.entries || [])));
        setVersion(data.version || "v1");
        setDateEdited(data.dateEdited || "N/A");
      }
    } catch (e) {
      console.error("Failed to load dictionary:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddWord = () => {
    const newEntry: DictionaryEntry = {
      word: "",
      description: "",
      imageName: "",
      tempId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setEntries([...entries, newEntry]);
  };

  const handleDeleteWord = (indexToDelete: number) => {
    setEntries(entries.filter((_, idx) => idx !== indexToDelete));
  };

  const handleFieldChange = (index: number, field: keyof DictionaryEntry, value: any) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  const handleFileUpload = (index: number, file: File) => {
    const updated = [...entries];
    updated[index] = {
      ...updated[index],
      file: file,
      imageName: file.name
    };
    setEntries(updated);
  };

  const handleReset = () => {
    setEntries(JSON.parse(JSON.stringify(dbEntries)));
  };

  const handleSave = async () => {
    // Validate inputs
    const invalid = entries.some(e => !e.word.trim() || !e.description.trim());
    if (invalid) {
      alert("Vui lòng điền đầy đủ Từ và Nghĩa của từ cho mọi mục!");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      
      // Serialize entries metadata (excluding file object itself)
      const entriesMeta = entries.map(e => ({
        id: e.id,
        word: e.word.trim(),
        description: e.description.trim(),
        imageName: e.imageName,
        tempId: e.tempId
      }));

      formData.append("entries", JSON.stringify(entriesMeta));

      // Append files matching their ids or tempIds
      entries.forEach(e => {
        if (e.file) {
          const key = e.id ? `file_${e.id}` : `file_${e.tempId}`;
          formData.append(key, e.file);
        }
      });

      const res = await fetch("/api/dictionary/save", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const result = await res.json();
        alert("Lưu từ điển thành công!");
        loadData();
      } else {
        const err = await res.json();
        alert(`Lỗi: ${err.error || "Không thể lưu từ điển"}`);
      }
    } catch (e) {
      console.error("Save dictionary error:", e);
      alert("Đã xảy ra lỗi kết nối khi lưu từ điển.");
    } finally {
      setSaving(false);
    }
  };

  const filteredEntries = entries.filter(e => 
    e.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container" style={{ paddingBottom: "60px", fontFamily: "Arial, sans-serif" }}>
      <Sidebar />
      
      <div style={{ marginTop: "10px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: "0 0 10px 0", color: "#111" }}>
          Từ điển của học sinh
        </h1>
        <p style={{ margin: "5px 0", fontSize: "16px", color: "#444" }}>
          <b>Phiên bản:</b> {version}
        </p>
        <p style={{ margin: "5px 0 20px 0", fontSize: "16px", color: "#444" }}>
          <b>Lần chỉnh sửa gần nhất:</b> {dateEdited}
        </p>
      </div>

      {loading ? (
        <h2 style={{ color: "#555" }}>Đang tải dữ liệu từ điển...</h2>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Search bar */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "6px", color: "#333" }}>
              Danh sách các từ
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 15px",
                border: "1.5px solid #2b78c5",
                borderRadius: "6px",
                fontSize: "15px",
                outline: "none"
              }}
            />
          </div>

          {/* Dictionary Table Container */}
          <div style={{ 
            border: "2px solid #333", 
            borderRadius: "10px", 
            padding: "15px",
            backgroundColor: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "15px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ccc" }}>
                  <th style={thStyle}>STT</th>
                  <th style={thStyle}>Từ</th>
                  <th style={thStyle}>Nghĩa của từ</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>File ảnh</th>
                  <th style={{ ...thStyle, width: "60px" }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, idx) => (
                  <tr key={entry.id || entry.tempId} style={{ borderBottom: "1.5px solid #eee" }}>
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: "bold", width: "60px" }}>
                      {idx + 1}
                    </td>
                    <td style={{ ...tdStyle, width: "200px" }}>
                      <input
                        type="text"
                        value={entry.word}
                        onChange={(e) => handleFieldChange(idx, "word", e.target.value)}
                        placeholder="Nhập từ..."
                        style={tableInputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="text"
                        value={entry.description}
                        onChange={(e) => handleFieldChange(idx, "description", e.target.value)}
                        placeholder="Nhập nghĩa của từ..."
                        style={tableInputStyle}
                      />
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", width: "320px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
                        <label style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          backgroundColor: "#f0fdf4",
                          color: "#16a34a",
                          border: "1px solid #16a34a",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "14px"
                        }}>
                          <Upload size={14} />
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(idx, file);
                            }}
                            style={{ display: "none" }}
                          />
                        </label>
                        <span style={{ 
                          fontSize: "14px", 
                          color: "#555", 
                          maxWidth: "160px", 
                          overflow: "hidden", 
                          textOverflow: "ellipsis", 
                          whiteSpace: "nowrap"
                        }}>
                          {entry.imageName || "Chưa có ảnh"}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center", width: "60px" }}>
                      <button 
                        onClick={() => handleDeleteWord(idx)}
                        style={{ border: "none", background: "none", cursor: "pointer", color: "#ef4444" }}
                        title="Xóa từ này"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredEntries.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                      Không có từ vựng nào phù hợp.
                    </td>
                  </tr>
                )}

                {/* Add word row */}
                <tr>
                  <td colSpan={5} style={{ padding: "0" }}>
                    <button 
                      onClick={handleAddWord}
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "none",
                        backgroundColor: "#f8fafc",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        fontSize: "15px",
                        fontWeight: "bold",
                        color: "#2b78c5",
                        outline: "none"
                      }}
                    >
                      <Plus size={16} />
                      Thêm từ
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Save & Reset Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-action"
              style={{
                width: "10%"
              }}
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>

            <button
              onClick={handleReset}
              className="btn-action"
              style={{
                width: "15%"
              }}
            >
              Trở về ban đầu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  fontWeight: "bold",
  color: "#333",
  borderBottom: "2px solid #ccc"
};

const tdStyle: React.CSSProperties = {
  padding: "8px 12px",
  verticalAlign: "middle",
  color: "#000"
};

const tableInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 10px",
  border: "1.5px solid #d1d5db",
  borderRadius: "4px",
  outline: "none",
  fontSize: "14px"
};
