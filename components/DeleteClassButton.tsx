"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteClass } from "@/services/classes.service";

interface Props {
  classId: string;
  classname: string;
  firebaseUid: string;
}

export default function DeleteClassButton({
  classId,
  classname,
  firebaseUid,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (classname === "Học sinh tự do") {
    return <div style={{ width: "30px" }}></div>;
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();

    const confirmed = window.confirm(
      `Bạn có chắc muốn xoá lớp "${classname}" không? Các học sinh trong lớp sẽ được chuyển sang danh sách "Học sinh tự do".`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await deleteClass(classId, firebaseUid);
      if (res.success) {
        window.location.reload();
      } else {
        alert(res.error || "Không thể xoá lớp này");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi hệ thống");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        background: "transparent",
        border: "none",
        color: isDeleting ? "#ccc" : "#ff4d4f",
        cursor: isDeleting ? "not-allowed" : "pointer",
        padding: "5px",
        display: "flex",
        alignItems: "center",
      }}
      title="Xoá lớp học"
    >
      <Trash2 size={20} />
    </button>
  );
}
