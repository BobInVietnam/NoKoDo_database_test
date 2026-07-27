"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearClassTestResults } from "@/services/student.service";
import { ArrowUpDown, Trash2 } from "lucide-react";

interface StudentAttempt {
  studentName: string;
  maxScore: string;
  maxScoreValue: number;
  attemptsCount: number;
  latestDate: string;
  latestTimestamp: number;
}

interface ClassTestDetailTableProps {
  students: StudentAttempt[];
  classId: string;
  testId: string;
  testName: string;
}

export default function ClassTestDetailTable({
  students,
  classId,
  testId,
  testName
}: ClassTestDetailTableProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<"name" | "score" | "date">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [clearing, setClearing] = useState(false);

  const handleSort = (field: "name" | "score" | "date") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleClear = async () => {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xoá tất cả kết quả của bài kiểm tra "${testName}" cho lớp học này không? Hành động này không thể hoàn tác.`);
    if (!confirmed) return;

    setClearing(true);
    try {
      const res = await clearClassTestResults(classId, testId);
      if (res.success) {
        alert("Đã xoá sạch kết quả kiểm tra thành công!");
        router.replace(`/classes/${classId}`);
      } else {
        alert(res.error || "Có lỗi xảy ra khi xoá kết quả.");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi kết nối máy chủ.");
    } finally {
      setClearing(false);
    }
  };

  // Sort students list
  const sortedStudents = [...students].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.studentName.localeCompare(b.studentName, "vi-VN");
    } else if (sortBy === "score") {
      comparison = a.maxScoreValue - b.maxScoreValue;
    } else if (sortBy === "date") {
      comparison = a.latestTimestamp - b.latestTimestamp;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div style={{ marginTop: "40px", marginLeft: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h2 style={{ margin: 0 }}>
          <b>Chi tiết kết quả: {testName}</b>
        </h2>
        <button
          onClick={handleClear}
          disabled={clearing}
          className="btn-delete"
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            borderRadius: "5px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <Trash2 size={16} />
          {clearing ? "Đang xoá..." : "Xoá kết quả lớp"}
        </button>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "Arial, sans-serif",
          fontSize: "15px",
          backgroundColor: "#fff",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f9f9f9" }}>
            <th style={thStyle}>STT</th>
            
            <th style={thStyleClickable} onClick={() => handleSort("name")}>
              <div style={headerStyle}>
                Học sinh
                <ArrowUpDown size={14} />
              </div>
            </th>

            <th style={thStyleClickable} onClick={() => handleSort("score")}>
              <div style={headerStyle}>
                Điểm cao nhất
                <ArrowUpDown size={14} />
              </div>
            </th>

            <th style={thStyle}>Số lượt làm</th>

            <th style={thStyleClickable} onClick={() => handleSort("date")}>
              <div style={headerStyle}>
                Ngày làm gần nhất
                <ArrowUpDown size={14} />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((student, index) => (
            <tr key={index} className="table-row-hover">
              <td style={{ textAlign: "center", border: "1px solid #e0e0e0", padding: "12px", width: "60px" }}>
                {index + 1}
              </td>
              <td style={{ border: "1px solid #e0e0e0", padding: "12px", fontWeight: "bold", color: "#000" }}>
                {student.studentName}
              </td>
              <td style={{ border: "1px solid #e0e0e0", padding: "12px", textAlign: "center", color: "#000" }}>
                {student.maxScore}
              </td>
              <td style={{ border: "1px solid #e0e0e0", padding: "12px", textAlign: "center", color: "#000" }}>
                {student.attemptsCount}
              </td>
              <td style={{ border: "1px solid #e0e0e0", padding: "12px", textAlign: "center", color: "#000" }}>
                {student.latestDate}
              </td>
            </tr>
          ))}

          {sortedStudents.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "20px", border: "1px solid #e0e0e0" }}>
                Không có dữ liệu học sinh nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "center",
  border: "1px solid #e0e0e0",
  padding: "12px",
  fontWeight: "bold",
  color: "#333",
};

const thStyleClickable: React.CSSProperties = {
  textAlign: "center",
  border: "1px solid #e0e0e0",
  padding: "12px",
  fontWeight: "bold",
  color: "#333",
  cursor: "pointer",
  userSelect: "none",
};

const headerStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  justifyContent: "center",
  width: "100%",
};
