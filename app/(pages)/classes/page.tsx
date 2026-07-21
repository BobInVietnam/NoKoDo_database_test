import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { getClassesData } from "@/services/classes.service";
import AddClassModal from "@/components/AddClassModal";
import DeleteClassButton from "@/components/DeleteClassButton";
import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ClassesPage() {
  const decoded = await verifyAuth();
  if (!decoded) {
    redirect("/");
  }

  const classes = await getClassesData();

  if (!classes) {
    return (
      <div className="container">
        <Sidebar />
        <h1>Lỗi kết nối cơ sở dữ liệu hoặc bạn chưa đăng nhập.</h1>
      </div>
    );
  }

  return (
    <div className="container">
      <Sidebar />

      <div className="title">
        <h1>
          <b>Classes</b>
        </h1>
      </div>

      <div className="edit-btn">
        <AddClassModal firebaseUid={decoded.uid} />
      </div>

      {classes.length === 0 ? (
        <div style={{ marginTop: "20px", marginLeft: "20px" }}>
          Bạn chưa có lớp học nào. Hãy thêm lớp mới!
        </div>
      ) : (
        <div className="class-list">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="class-item"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Link
                href={`/classes/${cls.id}`}
                style={{
                  flexGrow: 1,
                  textDecoration: "none",
                  color: "inherit",
                  fontWeight: "bold",
                }}
              >
                {cls.classname}

                <span
                  style={{
                    fontWeight: "bold",
                    color: "#333",
                    marginLeft: "15px",
                  }}
                >
                  - {cls.studentCount} HS
                </span>
              </Link>
              <DeleteClassButton
                classId={cls.id}
                classname={cls.classname}
                firebaseUid={decoded.uid}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
