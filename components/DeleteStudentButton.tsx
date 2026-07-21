"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteStudent } from "@/services/student.service";

export default function DeleteStudentButton({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xoá học sinh "${studentName}" khỏi lớp không?`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await deleteStudent(studentId);
      if (res.success) {
        window.location.reload();
      } else {
        alert("Có lỗi xảy ra, không thể xoá học sinh này.");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi hệ thống.");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        marginLeft: "auto",
        background: "transparent",
        border: "none",
        color: isDeleting ? "#ccc" : "#ff4d4f",
        cursor: isDeleting ? "not-allowed" : "pointer",
        padding: "5px",
        display: "flex",
        alignItems: "center",
      }}
      title="Xoá học sinh"
    >
      <Trash2 size={20} />
    </button>
  );
}
