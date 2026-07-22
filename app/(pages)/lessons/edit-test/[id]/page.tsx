"use client";

import { use, useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { getTestForEdit, saveTest, deleteItem } from "@/services/lessons.service";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, ArrowLeft } from "lucide-react";
import "../../../pages.css";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditTestPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const testId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [name, setName] = useState("");
  const [allowedAttempts, setAllowedAttempts] = useState(3);
  const [timeLimit, setTimeLimit] = useState(180);
  const [difficulty, setDifficulty] = useState(1);
  const [dateCreatedStr, setDateCreatedStr] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const loadTest = async () => {
      setLoading(true);
      const data = await getTestForEdit(testId);
      if (!data) {
        alert("Không tìm thấy thông tin bài kiểm tra!");
        router.push("/lessons");
        return;
      }

      setName(data.name);
      setAllowedAttempts(data.allowedAttempts || 3);
      setTimeLimit(data.timeLimit || 180);
      setDifficulty(data.difficulty || 1);
      setDateCreatedStr(new Date(data.dateCreated * 1000).toLocaleDateString("vi-VN"));

      setQuestions(
        data.questions.map((q: any) => ({
          id: q.id,
          question: q.question || "",
          answer: q.answer || "",
          isMultipleChoice: q.isMultipleChoice ?? 1,
          choices: Array.isArray(q.choices) && q.choices.length === 4
            ? q.choices
            : ["", "", "", ""],
        }))
      );
      setLoading(false);
    };

    loadTest();
  }, [testId]);

  if (loading) {
    return (
      <div className="container">
        <Sidebar />
        <h1>Đang tải dữ liệu bài kiểm tra...</h1>
      </div>
    );
  }

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        answer: "",
        isMultipleChoice: 1,
        choices: ["", "", "", ""],
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const updateQuestionField = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateChoice = (qIndex: number, choiceIndex: number, value: string) => {
    const updated = [...questions];
    const choices = [...updated[qIndex].choices];
    choices[choiceIndex] = value;
    updated[qIndex].choices = choices;
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("Vui lòng nhập tên bài kiểm tra!");

    setSaving(true);
    const res = await saveTest({
      id: testId === "new" ? null : parseInt(testId, 10),
      name,
      allowedAttempts: Number(allowedAttempts),
      timeLimit: Number(timeLimit),
      difficulty: Number(difficulty),
      questions,
    });

    if (res.success) {
      alert("Lưu bài kiểm tra thành công!");
      router.back();
    } else {
      alert(res.error || "Không thể lưu bài kiểm tra!");
      setSaving(false);
    }
  };

  const handleDeleteTest = async () => {
    if (testId === "new") {
      router.back();
      return;
    }

    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa bài kiểm tra này?");
    if (!confirmed) return;

    const res = await deleteItem(parseInt(testId, 10), "test");
    if (res.success) {
      alert("Đã xóa bài kiểm tra!");
      router.back();
    } else {
      alert(res.error || "Không thể xóa bài kiểm tra!");
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
            title="Sửa tên bài kiểm tra"
          >
            <Pencil size={22} />
          </button>
        </div>

        <span style={{ fontSize: "16px", color: "#555" }}>
          Ngày thêm: {dateCreatedStr}
        </span>
      </div>

      {/* Metadata Inputs */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
        <div style={metaRowStyle}>
          <label style={labelStyle}>Giới hạn số lần làm:</label>
          <input
            type="number"
            value={allowedAttempts}
            onChange={(e) => setAllowedAttempts(parseInt(e.target.value, 10) || 1)}
            style={blueInputStyle}
          />
        </div>

        <div style={metaRowStyle}>
          <label style={labelStyle}>Thời gian (giây):</label>
          <input
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(parseInt(e.target.value, 10) || 60)}
            style={blueInputStyle}
          />
        </div>

        <div style={metaRowStyle}>
          <label style={labelStyle}>Độ khó (từ 1 đến 3):</label>
          <input
            type="number"
            min={1}
            max={3}
            value={difficulty}
            onChange={(e) => setDifficulty(parseInt(e.target.value, 10) || 1)}
            style={blueInputStyle}
          />
        </div>
      </div>

      {/* Main Question Table Container */}
      <div style={{ marginTop: "30px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", textAlign: "center", marginBottom: "15px" }}>
          Danh sách câu hỏi
        </h2>

        <div style={{ border: "2px solid #333", borderRadius: "10px", padding: "15px", backgroundColor: "#fff" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px" }}>
            <thead>
              <tr style={{ backgroundColor: "#eaeaea" }}>
                <th style={thStyle}>STT</th>
                <th style={thStyle}>Câu hỏi</th>
                <th style={thStyle}>Dạng bài</th>
                <th style={thStyle}>Đáp án A</th>
                <th style={thStyle}>Đáp án B</th>
                <th style={thStyle}>Đáp án C</th>
                <th style={thStyle}>Đáp án D</th>
                <th style={thStyle}>Đáp án đúng</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <tr key={idx} style={{ backgroundColor: "#f9f9f9" }}>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: "bold" }}>{idx + 1}</td>
                  <td style={tdStyle}>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => updateQuestionField(idx, "question", e.target.value)}
                      placeholder="Nhập câu hỏi"
                      style={tableInputStyle}
                    />
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <select
                      value={q.isMultipleChoice}
                      onChange={(e) => updateQuestionField(idx, "isMultipleChoice", parseInt(e.target.value, 10))}
                      style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
                    >
                      <option value={1}>TN (Trắc nghiệm)</option>
                      <option value={0}>TL (Tự luận)</option>
                    </select>
                  </td>
                  {q.isMultipleChoice === 1 ? (
                    <>
                      <td style={tdStyle}>
                        <input
                          type="text"
                          value={q.choices[0] || ""}
                          onChange={(e) => updateChoice(idx, 0, e.target.value)}
                          style={tableInputStyle}
                        />
                      </td>
                      <td style={tdStyle}>
                        <input
                          type="text"
                          value={q.choices[1] || ""}
                          onChange={(e) => updateChoice(idx, 1, e.target.value)}
                          style={tableInputStyle}
                        />
                      </td>
                      <td style={tdStyle}>
                        <input
                          type="text"
                          value={q.choices[2] || ""}
                          onChange={(e) => updateChoice(idx, 2, e.target.value)}
                          style={tableInputStyle}
                        />
                      </td>
                      <td style={tdStyle}>
                        <input
                          type="text"
                          value={q.choices[3] || ""}
                          onChange={(e) => updateChoice(idx, 3, e.target.value)}
                          style={tableInputStyle}
                        />
                      </td>
                    </>
                  ) : (
                    <td colSpan={4} style={{ ...tdStyle, textAlign: "center", color: "#888", fontStyle: "italic" }}>
                      Câu hỏi tự luận không dùng các đáp án A-D
                    </td>
                  )}
                  <td style={tdStyle}>
                    <input
                      type="text"
                      value={q.answer}
                      onChange={(e) => updateQuestionField(idx, "answer", e.target.value)}
                      placeholder="Đáp án đúng"
                      style={tableInputStyle}
                    />
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <button
                      onClick={() => handleRemoveQuestion(idx)}
                      style={{ border: "none", background: "none", cursor: "pointer", color: "#ff4d4f" }}
                      title="Xóa câu hỏi"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add Question Button */}
          <button
            onClick={handleAddQuestion}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "10px",
              border: "1px solid #aaa",
              borderRadius: "6px",
              backgroundColor: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontWeight: "bold",
              fontSize: "15px",
            }}
          >
            <Plus size={18} />
            Thêm câu hỏi
          </button>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-action"
          style={{ padding: "12px 36px", fontSize: "16px", borderRadius: "6px" }}
        >
          {saving ? "Đang lưu..." : "Lưu"}
        </button>
        <button
          onClick={handleDeleteTest}
          className="btn-delete"
          style={{ padding: "12px 36px", fontSize: "16px", borderRadius: "6px" }}
        >
          Xóa bài kiểm tra
        </button>
      </div>
    </div>
  );
}

const metaRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
};

const labelStyle: React.CSSProperties = {
  width: "200px",
  fontWeight: "bold",
  fontSize: "16px",
};

const blueInputStyle: React.CSSProperties = {
  width: "220px",
  padding: "8px 12px",
  border: "2px solid #3b82f6", // Blue outline matching wireframe
  borderRadius: "4px",
  outline: "none",
  fontSize: "15px",
};

const tableInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  border: "1.5px solid #3b82f6", // Blue outline matching wireframe
  borderRadius: "4px",
  outline: "none",
  fontSize: "14px",
  boxSizing: "border-box",
};

const thStyle: React.CSSProperties = {
  padding: "10px",
  textAlign: "left",
  borderBottom: "1px solid #ccc",
  fontSize: "14px",
  fontWeight: "bold",
};

const tdStyle: React.CSSProperties = {
  padding: "8px",
  borderBottom: "1px solid #eee",
};

const greenOutlineBtnStyle: React.CSSProperties = {
  padding: "12px 36px",
  border: "2px solid #16a34a", // Green outline matching wireframe
  backgroundColor: "#f0fdf4",
  color: "#16a34a",
  fontWeight: "bold",
  fontSize: "16px",
  borderRadius: "6px",
  cursor: "pointer",
};

const greenDeleteBtnStyle: React.CSSProperties = {
  padding: "12px 36px",
  border: "2px solid #16a34a", // Green outline matching wireframe
  backgroundColor: "#f0fdf4",
  color: "#16a34a",
  fontWeight: "bold",
  fontSize: "16px",
  borderRadius: "6px",
  cursor: "pointer",
};
