"use client";

import { use, useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import {
  getManageData,
  assignToClass,
  removeFromClass,
  deleteItem,
} from "@/services/lessons.service";
import { useRouter } from "next/navigation";
import { Plus, X, ArrowLeft } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ classId?: string; type?: string }>;
}

export default function LessonsManagePage({ searchParams }: PageProps) {
  const resolvedSearchParams = use(searchParams);
  const classId = resolvedSearchParams.classId || "";
  const type = (resolvedSearchParams.type as "lesson" | "test") || "lesson";

  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClassItemId, setSelectedClassItemId] = useState<number | null>(null);
  const [selectedGeneralItemId, setSelectedGeneralItemId] = useState<number | null>(null);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await getManageData(classId, type);
    if (!res) {
      alert("Lỗi xác thực hoặc không tìm thấy dữ liệu!");
      router.push("/lessons");
      return;
    }
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    if (classId) {
      loadData();
    } else {
      router.push("/lessons");
    }
  }, [classId, type]);

  if (loading || !data) {
    return (
      <div className="container">
        <Sidebar />
        <h1>Đang tải dữ liệu...</h1>
      </div>
    );
  }

  const typeLabel = type === "lesson" ? "bài tập" : "bài kiểm tra";

  const handleEdit = (itemId: number) => {
    if (type === "test") {
      router.push(`/lessons/edit-test/${itemId}`);
    } else {
      router.push(`/lessons/edit-lesson/${itemId}`);
    }
  };

  const handleAddNew = () => {
    if (type === "test") {
      router.push("/lessons/edit-test/new");
    } else {
      setShowAddTypeModal(true);
    }
  };

  const handleAssign = async (itemId: number) => {
    const res = await assignToClass(classId, itemId, type);
    if (res.success) {
      loadData();
    } else {
      alert(res.error || "Có lỗi xảy ra");
    }
  };

  const handleRemove = async (itemId: number) => {
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa ${typeLabel} này khỏi lớp học?`);
    if (!confirmed) return;

    const res = await removeFromClass(classId, itemId, type);
    if (res.success) {
      setSelectedClassItemId(null);
      loadData();
    } else {
      alert(res.error || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (itemId: number) => {
    const confirmed = window.confirm(
      `CẢNH BÁO: Hành động này sẽ xóa hoàn toàn ${typeLabel} khỏi hệ thống và tất cả các lớp học. Bạn có chắc muốn tiếp tục?`
    );
    if (!confirmed) return;

    const res = await deleteItem(itemId, type);
    if (res.success) {
      setSelectedGeneralItemId(null);
      loadData();
    } else {
      alert(res.error || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="container" style={{ color: "#171717" }}>
      <Sidebar />

      <div className="title" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <button
          onClick={() => router.push(`/lessons/classes?type=${type}`)}
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
          title="Quay lại danh sách lớp"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ margin: 0, display: "flex", flexGrow: 1 }}>
          <b>Lớp {data.className} - Quản lý {typeLabel}</b>
        </h1>
      </div>

      <div style={{ display: "flex", gap: "30px", marginTop: "20px" }}>
        {/* Cột trái: Bài tập/kiểm tra của lớp */}
        <div style={columnStyle}>
          <h2 style={columnTitleStyle}>Danh sách {typeLabel} của lớp</h2>

          <div style={listContainerStyle}>
            {data.assigned.length === 0 ? (
              <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>
                Chưa có {typeLabel} nào được gán cho lớp này.
              </p>
            ) : (
              data.assigned.map((item: any) => {
                const isSelected = selectedClassItemId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedClassItemId(isSelected ? null : item.id)}
                    style={{
                      ...cardStyle,
                      border: isSelected ? "2px solid #2b78c5" : "1px solid #ddd",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <p style={{ fontWeight: "bold", fontSize: "18px", margin: "0 0 5px 0" }}>
                        {item.name}
                      </p>
                      <span style={{ fontSize: "13px", color: "#666" }}>
                        {item.dateAdded}
                      </span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#666", margin: "0 0 5px 0" }}>
                      {item.typeLabel}
                    </p>
                    <p style={{ fontSize: "14px", color: "#333", margin: "0" }}>
                      {item.description}
                    </p>

                    {isSelected && (
                      <div style={actionRowStyle} onClick={(e) => e.stopPropagation()}>
                        <button
                          style={actionBtnStyle}
                          onClick={() => handleEdit(item.id)}
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          style={deleteBtnStyle}
                          onClick={() => handleRemove(item.id)}
                        >
                          Xóa khỏi lớp
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Cột phải: Danh sách bài tập/kiểm tra chung */}
        <div style={columnStyle}>
          <h2 style={columnTitleStyle}>Danh sách {typeLabel} chung</h2>

          <div style={listContainerStyle}>
            {data.all.length === 0 ? (
              <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>
                Chưa có {typeLabel} nào trong kho dữ liệu chung.
              </p>
            ) : (
              data.all.map((item: any) => {
                const isSelected = selectedGeneralItemId === item.id;
                const isAlreadyAssigned = data.assigned.some((a: any) => a.id === item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedGeneralItemId(isSelected ? null : item.id)}
                    style={{
                      ...cardStyle,
                      border: isSelected ? "2px solid #2b78c5" : "1px solid #ddd",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <p style={{ fontWeight: "bold", fontSize: "18px", margin: "0 0 5px 0" }}>
                        {item.name}
                      </p>
                      <span style={{ fontSize: "13px", color: "#666" }}>
                        {item.dateAdded}
                      </span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#666", margin: "0 0 5px 0" }}>
                      {item.typeLabel}
                    </p>
                    <p style={{ fontSize: "14px", color: "#333", margin: "0" }}>
                      {item.description}
                    </p>

                    {isSelected && (
                      <div style={actionRowStyle} onClick={(e) => e.stopPropagation()}>
                        <button
                          style={{
                            ...actionBtnStyle,
                            backgroundColor: isAlreadyAssigned ? "#ccc" : "#2b78c5",
                            color: "white",
                            cursor: isAlreadyAssigned ? "not-allowed" : "pointer",
                          }}
                          disabled={isAlreadyAssigned}
                          onClick={() => handleAssign(item.id)}
                        >
                          {isAlreadyAssigned ? "Đã trong lớp" : "Thêm vào lớp"}
                        </button>
                        <button
                          style={actionBtnStyle}
                          onClick={() => handleEdit(item.id)}
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          style={deleteBtnStyle}
                          onClick={() => handleDelete(item.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Thêm bài tập / kiểm tra button */}
            <button
              onClick={handleAddNew}
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor: "#f9f9f9",
                border: "2px dashed #ccc",
                borderRadius: "10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#666",
                marginTop: "15px",
              }}
            >
              <Plus size={20} />
              Thêm {typeLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Modal lựa chọn dạng bài tập mới */}
      {showAddTypeModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "18px" }}>Chọn dạng bài tập mới</h3>
              <button onClick={() => setShowAddTypeModal(false)} style={{ border: "none", background: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <button
                onClick={() => {
                  setShowAddTypeModal(false);
                  router.push("/lessons/edit-lesson/new?type=0");
                }}
                style={typeOptionBtnStyle}
              >
                <b>1. Bài tập đọc</b>
                <span style={{ fontSize: "13px", color: "#666" }}>Luyện đọc văn bản và nghe phát âm</span>
              </button>
              <button
                onClick={() => {
                  setShowAddTypeModal(false);
                  router.push("/lessons/edit-lesson/new?type=1");
                }}
                style={typeOptionBtnStyle}
              >
                <b>2. Bài luyện tìm chữ</b>
                <span style={{ fontSize: "13px", color: "#666" }}>Trò chơi tìm chữ cái trong lưới chữ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const columnStyle: React.CSSProperties = {
  flex: 1,
  backgroundColor: "#fff",
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  minHeight: "500px",
};

const columnTitleStyle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "bold",
  borderBottom: "2px solid #eee",
  paddingBottom: "10px",
  marginBottom: "20px",
};

const listContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const cardStyle: React.CSSProperties = {
  padding: "16px",
  borderRadius: "10px",
  backgroundColor: "#fcfcfc",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const actionRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  marginTop: "15px",
  borderTop: "1px solid #eee",
  paddingTop: "10px",
};

const actionBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  border: "1px solid #ccc",
  backgroundColor: "#eee",
  color: "#333",
  cursor: "pointer",
  borderRadius: "5px",
  fontWeight: "bold",
  fontSize: "14px",
};

const deleteBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  border: "none",
  backgroundColor: "#ff4d4f",
  color: "white",
  cursor: "pointer",
  borderRadius: "5px",
  fontWeight: "bold",
  fontSize: "14px",
  marginLeft: "auto",
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
  width: "380px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  fontFamily: "Arial, sans-serif",
  color: "#171717",
};

const typeOptionBtnStyle: React.CSSProperties = {
  padding: "15px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  backgroundColor: "#f9f9f9",
  cursor: "pointer",
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};
