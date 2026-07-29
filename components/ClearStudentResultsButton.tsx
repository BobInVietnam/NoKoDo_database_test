"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearStudentTestResults } from "@/services/student.service";

interface ClearStudentResultsButtonProps {
  studentId: string;
  testId: string;
  testName: string;
}

export default function ClearStudentResultsButton({
  studentId,
  testId,
  testName
}: ClearStudentResultsButtonProps) {
  const router = useRouter();
  const [clearing, setClearing] = useState(false);

  const handleClear = async () => {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa tất cả kết quả của bài kiểm tra "${testName}" cho học sinh này không?`);
    if (!confirmed) return;

    setClearing(true);
    try {
      const res = await clearStudentTestResults(studentId, testId);
      if (res.success) {
        alert("Đã xóa kết quả kiểm tra thành công!");
        router.refresh();
      } else {
        alert(res.error || "Có lỗi xảy ra");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi kết nối");
    } finally {
      setClearing(false);
    }
  };

  return (
    <button
      onClick={handleClear}
      disabled={clearing}
      className="btn-delete" 
    >
      {clearing ? "Đang xóa..." : "Xóa kết quả"}
    </button>
  );
}
