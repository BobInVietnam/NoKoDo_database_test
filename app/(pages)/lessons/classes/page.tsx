import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { getClassesData } from "@/services/classes.service";
import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function LessonsClassesPage({ searchParams }: PageProps) {
  const decoded = await verifyAuth();
  if (!decoded) {
    redirect("/");
  }

  const { type = "lesson" } = await searchParams;
  const classes = await getClassesData();

  if (!classes) {
    return (
      <div className="container">
        <Sidebar />
        <h1>Lỗi kết nối cơ sở dữ liệu.</h1>
      </div>
    );
  }

  const typeLabel = type === "lesson" ? "bài tập" : "bài kiểm tra";

  return (
    <div className="container">
      <Sidebar />

      <div className="title" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <Link
          href="/lessons"
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
            textDecoration: "none",
          }}
          title="Quay lại"
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 style={{ margin: 0, display: "flex", flexGrow: 1 }}>
          <b>Chọn lớp học để quản lý {typeLabel}</b>
        </h1>
      </div>

      {classes.length === 0 ? (
        <div style={{ marginTop: "20px", marginLeft: "20px" }}>
          Bạn chưa có lớp học nào. Vui lòng thêm lớp ở mục "Danh sách lớp học"!
        </div>
      ) : (
        <div className="class-list" style={{ marginTop: "20px" }}>
          {classes.map((cls) => (
            <div key={cls.id}>
              <Link
                href={`/lessons/manage?classId=${cls.id}&type=${type}`}
                className="class-item"
                style={{
                  flexGrow: 1,
                  textDecoration: "none",
                  color: "inherit",
                  fontWeight: "bold",
                  display: "flex",
                }}
              >
                {cls.classname}
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#666",
                    marginLeft: "15px",
                  }}
                >
                  - {cls.studentCount} HS
                </span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
