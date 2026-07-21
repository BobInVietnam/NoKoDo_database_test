import Sidebar from "@/components/Sidebar";
import { getStudentData } from "@/services/student.service";
import AddStudentModal from "@/components/AddStudentModal";
import DeleteStudentButton from "@/components/DeleteStudentButton";
import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) {
      redirect("/");
    }

    const { id } = await params;
    const data = await getStudentData(id);

    const { className, students = [] } = data || {};

    return (
      <div className="container">
        <Sidebar />
        <div className="title">
          <h1>
            <b>{className}</b>
          </h1>
        </div>
        <div className="edit-btn">
          <AddStudentModal classId={id} />
        </div>

        {/* Danh sách học sinh */}
        <div style={{ marginTop: "20px", marginLeft: "20px" }}>
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
                <th
                  style={{
                    width: "60px",
                    textAlign: "center",
                    border: "1px solid #e0e0e0",
                    padding: "12px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  STT
                </th>

                <th
                  style={{
                    textAlign: "left",
                    border: "1px solid #e0e0e0",
                    padding: "12px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Học sinh
                </th>
                <th
                  style={{
                    textAlign: "left",
                    border: "1px solid #e0e0e0",
                    padding: "12px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Ngày sinh
                </th>
                <th
                  style={{
                    textAlign: "left",
                    border: "1px solid #e0e0e0",
                    padding: "12px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Giới tính
                </th>

                {/* Cột xoá */}
                <th
                  style={{
                    width: "80px",
                    border: "1px solid #e0e0e0",
                    padding: "12px",
                  }}
                ></th>
              </tr>
            </thead>
            <tbody>
              {students.map((student: any, index: number) => (
                <tr key={student.studentId} className="table-row-hover">
                  <td
                    style={{
                      textAlign: "center",
                      border: "1px solid #e0e0e0",
                      padding: "12px",
                    }}
                  >
                    {index + 1}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e0e0e0",
                      padding: "12px",
                      fontWeight: "bold",
                      color: "#000",
                    }}
                  >
                    {student.studentName}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e0e0e0",
                      padding: "12px",
                      color: "#000",
                    }}
                  >
                    {student.birthday}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e0e0e0",
                      padding: "12px",
                      color: "#000",
                    }}
                  >
                    {student.gender}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      border: "1px solid #e0e0e0",
                      padding: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <DeleteStudentButton
                        studentId={student.studentId}
                        studentName={student.studentName}
                      />
                    </div>
                  </td>
                </tr>
              ))}

              {students.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    Lớp học này chưa có học sinh nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching classes:", error);
    return <div>Đã xảy ra lỗi khi kết nối đến cơ sở dữ liệu.</div>;
  }
}
