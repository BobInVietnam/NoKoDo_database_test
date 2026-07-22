"use client";

import { use, useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { getLessonForEdit, saveLesson, deleteItem } from "@/services/lessons.service";
import { useRouter } from "next/navigation";
import { Pencil, Copy, Trash2, Plus, ArrowLeft, X } from "lucide-react";
import "../../../pages.css";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}

export default function EditLessonPage({ params, searchParams }: PageProps) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);

  const lessonId = resolvedParams.id;
  const initialType = parseInt(resolvedSearchParams.type || "0", 10);

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState(0); // 0: Reading, 1: Letter Search
  const [description, setDescription] = useState("");
  const [dateCreatedStr, setDateCreatedStr] = useState("");

  // Content for Type 0
  const [readingText, setReadingText] = useState("");

  // Content for Type 1
  const [cases, setCases] = useState<any[]>([]);
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [noiseInput, setNoiseInput] = useState("");

  // OCR Modal States
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrImageFile, setOcrImageFile] = useState<File | null>(null);
  const [ocrResultText, setOcrResultText] = useState("");
  const [isLoadingOcr, setIsLoadingOcr] = useState(false);

  useEffect(() => {
    const loadLesson = async () => {
      setLoading(true);
      const data = await getLessonForEdit(lessonId, initialType);
      if (!data) {
        alert("Không tìm thấy thông tin bài tập!");
        router.push("/lessons");
        return;
      }

      setName(data.name);
      setType(data.type ?? 0);
      setDescription(data.description || "");
      setDateCreatedStr(new Date(data.dateCreated * 1000).toLocaleDateString("vi-VN"));

      const contentObj = (data.content as any) || {};

      if (data.type === 0) {
        setReadingText(contentObj.text || "");
      } else {
        const loadedCases = contentObj.cases || [];
        if (loadedCases.length === 0) {
          setCases([
            {
              height: 7,
              width: 9,
              target: "a",
              noise: ["á", "à", "ạ"],
              chance: 0.35,
              spacing: 0,
              size: 42,
            },
          ]);
        } else {
          setCases(
            loadedCases.map((c: any) => ({
              height: c.height || 7,
              width: c.width || 9,
              target: c.target || "a",
              noise: Array.isArray(c.noise) ? c.noise : (c.noise ? [c.noise] : ["b"]),
              chance: c.chance || 0.35,
              spacing: c.spacing ?? 0,
              size: c.size || 42,
            }))
          );
        }
      }
      setLoading(false);
    };

    loadLesson();
  }, [lessonId]);

  // Synchronize noiseInput textbox when activeCaseIndex or cases load
  useEffect(() => {
    if (cases && cases[activeCaseIndex]) {
      const activeCase = cases[activeCaseIndex];
      const noiseVal = activeCase.noise;
      const noiseStr = Array.isArray(noiseVal) ? noiseVal.join(", ") : (noiseVal || "");
      setNoiseInput(noiseStr);
    }
  }, [activeCaseIndex, cases.length]);

  if (loading) {
    return (
      <div className="container">
        <Sidebar />
        <h1>Đang tải dữ liệu bài tập...</h1>
      </div>
    );
  }

  // Type 1 Helpers
  const currentCase = cases[activeCaseIndex] || {
    height: 7,
    width: 9,
    target: "a",
    noise: ["b"],
    spacing: 0,
    size: 40,
  };

  const handleAddCase = () => {
    const newCase = {
      height: 7,
      width: 9,
      target: "a",
      noise: ["b", "c"],
      chance: 0.35,
      spacing: 0,
      size: 42,
    };
    setCases([...cases, newCase]);
    setActiveCaseIndex(cases.length);
  };

  const handleCopyCase = () => {
    if (!cases[activeCaseIndex]) return;
    const copy = JSON.parse(JSON.stringify(cases[activeCaseIndex]));
    setCases([...cases, copy]);
    setActiveCaseIndex(cases.length);
  };

  const handleDeleteCase = () => {
    if (cases.length <= 1) {
      alert("Bài tập phải có ít nhất 1 màn chơi!");
      return;
    }
    const updated = cases.filter((_, idx) => idx !== activeCaseIndex);
    setCases(updated);
    setActiveCaseIndex(Math.max(0, activeCaseIndex - 1));
  };

  const updateCurrentCaseField = (field: string, value: any) => {
    const updated = [...cases];
    if (!updated[activeCaseIndex]) return;
    updated[activeCaseIndex][field] = value;
    setCases(updated);
  };

  const handleNoiseInputChange = (val: string) => {
    setNoiseInput(val);
    const arr = val.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
    const updated = [...cases];
    if (updated[activeCaseIndex]) {
      updated[activeCaseIndex].noise = arr.length > 0 ? arr : [""];
      setCases(updated);
    }
  };

  // Generate Letter Grid Preview for Type 1 (Emulating Medium Android Tablet)
  const renderPreviewGrid = () => {
    const rows = Number(currentCase.height) || 5;
    const cols = Number(currentCase.width) || 5;
    const target = currentCase.target || "a";
    const noiseArr = Array.isArray(currentCase.noise) && currentCase.noise.length > 0
      ? currentCase.noise
      : ["b"];

    const grid = [];
    for (let r = 0; r < rows; r++) {
      const rowCells = [];
      for (let c = 0; c < cols; c++) {
        const isTarget = (r + c) % 3 === 0;
        const letter = isTarget
          ? target
          : noiseArr[(r * cols + c) % noiseArr.length];
        rowCells.push(letter);
      }
      grid.push(rowCells);
    }

    const fontSizeDp = Number(currentCase.size) || 32;
    const spacingDp = currentCase.spacing !== undefined ? Number(currentCase.spacing) : 0;

    return (
      <div
        style={{
          width: "100%",
          height: "260px",
          backgroundColor: "#ffffff",
          border: "2px solid #333",
          borderRadius: "10px",
          padding: "10px",
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxSizing: "border-box",
          boxShadow: "inset 0 0 8px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, auto)`,
            gap: `${spacingDp}px`,
            justifyContent: "center",
            alignItems: "center",
            lineHeight: 1.0,
          }}
        >
          {grid.map((row, rIdx) =>
            row.map((char, cIdx) => (
              <span
                key={`${rIdx}-${cIdx}`}
                style={{
                  fontSize: `${fontSizeDp}px`,
                  fontWeight: "bold",
                  color: "#2f4b8f",
                  lineHeight: 1.0,
                  margin: 0,
                  padding: 0,
                  display: "inline-flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {char}
              </span>
            ))
          )}
        </div>
      </div>
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("Vui lòng nhập tên bài tập!");

    setSaving(true);

    const content =
      type === 0
        ? { text: readingText }
        : { cases };

    const res = await saveLesson({
      id: lessonId === "new" ? null : parseInt(lessonId, 10),
      name,
      type,
      description,
      content,
    });

    if (res.success) {
      alert("Lưu bài tập thành công!");
      router.back();
    } else {
      alert(res.error || "Không thể lưu bài tập!");
      setSaving(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (lessonId === "new") {
      router.back();
      return;
    }

    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa bài tập này?");
    if (!confirmed) return;

    const res = await deleteItem(parseInt(lessonId, 10), "lesson");
    if (res.success) {
      alert("Đã xóa bài tập!");
      router.back();
    } else {
      alert(res.error || "Không thể xóa bài tập!");
    }
  };

  // OCR Form submission
  const handleOcrSubmit = async () => {
    if (!ocrImageFile) return;

    setIsLoadingOcr(true);
    setOcrResultText("");

    try {
      const formData = new FormData();
      formData.append("image", ocrImageFile);

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Không thể nhận diện văn bản OCR");
        return;
      }

      setOcrResultText(data.text || "Không phát hiện thấy văn bản nào trong hình ảnh.");
    } catch (err) {
      console.error("OCR Request Error:", err);
      alert("Đã xảy ra lỗi kết nối với máy chủ OCR.");
    } finally {
      setIsLoadingOcr(false);
    }
  };

  return (
    <div className="container" style={{ color: "#171717", paddingBottom: "40px" }}>
      <Sidebar />

      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button
            onClick={() => router.back()}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
              color: "#333",
              cursor: "pointer",
            }}
            title="Quay lại"
          >
            <ArrowLeft size={22} />
          </button>
          {isEditingTitle ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              autoFocus
              style={{ fontSize: "28px", fontWeight: "bold", padding: "4px 8px", border: "2px solid #2b78c5", borderRadius: "5px" }}
            />
          ) : (
            <h1 style={{ fontSize: "32px", margin: 0, fontWeight: "bold" }}>
              {name}
            </h1>
          )}
          <button
            onClick={() => setIsEditingTitle(!isEditingTitle)}
            style={{ border: "none", background: "none", cursor: "pointer", color: "#444" }}
            title="Sửa tên bài tập"
          >
            <Pencil size={22} />
          </button>
        </div>

        <span style={{ fontSize: "16px", color: "#555" }}>
          Ngày thêm: {dateCreatedStr}
        </span>
      </div>

      <p style={{ fontSize: "16px", fontWeight: "bold", color: "#444", marginTop: "10px" }}>
        Dạng bài tập: {type === 0 ? "Bài tập đọc" : "Bài luyện tìm chữ"}
      </p>

      {/* Description Field */}
      <div style={{ marginTop: "15px" }}>
        <label style={labelBlockStyle}>Mô tả:</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nhập mô tả bài tập..."
          style={blueTextareaStyle}
        />
      </div>

      {/* TYPE 0: READING LESSON EDITOR (IMAGE 2) */}
      {type === 0 && (
        <div style={{ marginTop: "25px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>Nội dung bài luyện tập</h2>
            <button onClick={() => setShowOcrModal(true)} className="btn-action" style={{ padding: "8px 24px" }}>
              OCR
            </button>
          </div>

          <textarea
            rows={10}
            value={readingText}
            onChange={(e) => setReadingText(e.target.value)}
            placeholder="Nhập nội dung đoạn văn bản luyện đọc..."
            style={blueTextareaStyle}
          />
        </div>
      )}

      {/* TYPE 1: LETTER SEARCH LESSON EDITOR (IMAGE 3) */}
      {type === 1 && (
        <div style={{ marginTop: "25px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}>Nội dung bài luyện tập</h2>

          <div style={{ display: "flex", gap: "25px" }}>
            {/* Left Box: List of cases */}
            <div style={leftCaseBoxStyle}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {cases.map((c, idx) => {
                  const isActive = idx === activeCaseIndex;
                  const noiseStr = Array.isArray(c.noise) ? c.noise.join(", ") : (c.noise || "");

                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveCaseIndex(idx)}
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        backgroundColor: isActive ? "#eff6ff" : "#fff",
                        border: isActive ? "2px solid #2b78c5" : "1.5px solid #2b78c5",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                      }}
                    >
                      <span style={{ fontWeight: "bold", fontSize: "16px" }}>{idx + 1}</span>
                      <span style={{ fontWeight: "bold", fontSize: "18px" }}>{c.target}</span>
                      <span style={{ fontSize: "14px", color: "#555" }}>Nhiễu: ({noiseStr})</span>
                    </div>
                  );
                })}
              </div>

              <button onClick={handleAddCase} style={addCaseBtnStyle}>
                <Plus size={18} />
                Thêm bài mới
              </button>
            </div>

            {/* Right Box: Live preview & Grid Parameters */}
            <div style={rightConfigBoxStyle}>
              {/* Top Bar with Copy & Delete icons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginBottom: "10px" }}>
                <button onClick={handleCopyCase} style={iconBtnStyle} title="Nhân bản màn chơi này">
                  <Copy size={20} />
                </button>
                <button onClick={handleDeleteCase} style={iconBtnStyle} title="Xóa màn chơi này">
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Grid Preview Container */}
              {renderPreviewGrid()}

              {/* Grid Parameter Controls */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginTop: "20px" }}>
                <div style={inputGroupStyle}>
                  <label style={paramLabelStyle}>Số hàng</label>
                  <input
                    type="number"
                    value={currentCase.height}
                    onChange={(e) => updateCurrentCaseField("height", parseInt(e.target.value, 10) || 1)}
                    style={blueInputStyle}
                  />
                </div>

                <div style={inputGroupStyle}>
                  <label style={paramLabelStyle}>Số cột</label>
                  <input
                    type="number"
                    value={currentCase.width}
                    onChange={(e) => updateCurrentCaseField("width", parseInt(e.target.value, 10) || 1)}
                    style={blueInputStyle}
                  />
                </div>

                <div style={inputGroupStyle}>
                  <label style={paramLabelStyle}>Chữ mục tiêu</label>
                  <input
                    type="text"
                    value={currentCase.target}
                    onChange={(e) => updateCurrentCaseField("target", e.target.value)}
                    style={blueInputStyle}
                  />
                </div>

                <div style={inputGroupStyle}>
                  <label style={paramLabelStyle}>Chữ nhiễu (VD: á,à,ả,ã)</label>
                  <input
                    type="text"
                    value={noiseInput}
                    onChange={(e) => handleNoiseInputChange(e.target.value)}
                    style={blueInputStyle}
                  />
                </div>

                <div style={inputGroupStyle}>
                  <label style={paramLabelStyle}>Cỡ chữ</label>
                  <input
                    type="number"
                    value={currentCase.size}
                    onChange={(e) => updateCurrentCaseField("size", parseInt(e.target.value, 10) || 12)}
                    style={blueInputStyle}
                  />
                </div>

                <div style={inputGroupStyle}>
                  <label style={paramLabelStyle}>Khoảng cách chữ</label>
                  <input
                    type="number"
                    value={currentCase.spacing}
                    onChange={(e) => updateCurrentCaseField("spacing", parseInt(e.target.value, 10) || 0)}
                    style={blueInputStyle}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Action Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "35px" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-action"
          style={{ padding: "12px 36px", fontSize: "16px", borderRadius: "6px" }}
        >
          {saving ? "Đang lưu..." : "Lưu"}
        </button>
        <button
          onClick={handleDeleteLesson}
          className="btn-delete"
          style={{ padding: "12px 36px", fontSize: "16px", borderRadius: "6px" }}
        >
          Xóa bài tập
        </button>
      </div>

      {/* OCR Dialog Popup Modal */}
      {showOcrModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "18px" }}>Nhận diện văn bản OCR</h3>
              <button onClick={() => setShowOcrModal(false)} style={{ border: "none", background: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>
                Chọn hình ảnh chứa văn bản để trích xuất tự động:
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setOcrImageFile(file);
                }}
                style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "4px", width: "100%" }}
              />

              <button
                onClick={handleOcrSubmit}
                disabled={!ocrImageFile || isLoadingOcr}
                className="btn-action"
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: !ocrImageFile || isLoadingOcr ? "#ccc" : "#2b78c5",
                  color: "white",
                  cursor: !ocrImageFile || isLoadingOcr ? "not-allowed" : "pointer",
                }}
              >
                {isLoadingOcr ? "Đang xử lý nhận diện..." : "Bắt đầu nhận diện"}
              </button>

              {ocrResultText && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
                  <label style={{ fontWeight: "bold", fontSize: "14px" }}>Văn bản trích xuất:</label>
                  <textarea
                    rows={6}
                    value={ocrResultText}
                    onChange={(e) => setOcrResultText(e.target.value)}
                    style={blueTextareaStyle}
                  />

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(ocrResultText);
                        alert("Đã sao chép vào bộ nhớ tạm!");
                      }}
                      className="btn-action"
                      style={{ flex: 1 }}
                    >
                      Sao chép
                    </button>
                    <button
                      onClick={() => {
                        setReadingText(readingText ? readingText + "\n" + ocrResultText : ocrResultText);
                        setShowOcrModal(false);
                      }}
                      className="btn-action"
                      style={{ flex: 1, backgroundColor: "#16a34a", color: "white", border: "none" }}
                    >
                      Dùng văn bản
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelBlockStyle: React.CSSProperties = {
  display: "block",
  fontWeight: "bold",
  marginBottom: "6px",
  fontSize: "16px",
};

const blueTextareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  border: "2px solid #3b82f6",
  borderRadius: "6px",
  outline: "none",
  fontSize: "15px",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const blueInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "2px solid #3b82f6",
  borderRadius: "6px",
  outline: "none",
  fontSize: "15px",
  boxSizing: "border-box",
};

const leftCaseBoxStyle: React.CSSProperties = {
  flex: 1,
  border: "2px solid #333",
  borderRadius: "10px",
  padding: "15px",
  backgroundColor: "#fff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  minHeight: "380px",
};

const rightConfigBoxStyle: React.CSSProperties = {
  flex: 1.2,
  border: "2px solid #333",
  borderRadius: "10px",
  padding: "15px",
  backgroundColor: "#fff",
};

const addCaseBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  marginTop: "15px",
  border: "1.5px solid #2b78c5",
  borderRadius: "6px",
  backgroundColor: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontWeight: "bold",
  fontSize: "15px",
  color: "#2b78c5",
};

const iconBtnStyle: React.CSSProperties = {
  border: "none",
  background: "none",
  cursor: "pointer",
  color: "#444",
  padding: "4px",
};

const inputGroupStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const paramLabelStyle: React.CSSProperties = {
  width: "120px",
  fontSize: "14px",
  fontWeight: "bold",
};

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
  width: "440px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  fontFamily: "Arial, sans-serif",
  color: "#171717",
};
