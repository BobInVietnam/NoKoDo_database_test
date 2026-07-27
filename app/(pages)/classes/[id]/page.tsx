import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { getStudentData, getClassTestDetail } from "@/services/student.service";
import AddStudentModal from "@/components/AddStudentModal";
import DeleteStudentButton from "@/components/DeleteStudentButton";
import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ClassTestDetailTable from "@/components/ClassTestDetailTable";

export default async function ClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ testid?: string }>;
}) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) {
      redirect("/");
    }

    const { id } = await params;
    const { testid } = await searchParams;
    const data = await getStudentData(id);

    const { className, students = [], exams = [] } = data || {};
    const testDetail = testid ? await getClassTestDetail(id, testid) : null;

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
          <h1 style={{display: "flex", flexGrow: 1 }}>
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

        {/* Danh sách bài kiểm tra */}
        <div style={{ marginTop: "40px", marginLeft: "20px" }}>
          <h2><b>Danh sách bài kiểm tra</b></h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "Arial, sans-serif",
              fontSize: "15px",
              backgroundColor: "#fff",
              marginTop: "10px",
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
                  Tên bài kiểm tra
                </th>
                <th
                  style={{
                    textAlign: "center",
                    border: "1px solid #e0e0e0",
                    padding: "12px",
                    fontWeight: "bold",
                    color: "#333",
                    width: "180px",
                  }}
                >
                  Điểm trung bình
                </th>
                <th
                  style={{
                    textAlign: "center",
                    border: "1px solid #e0e0e0",
                    padding: "12px",
                    fontWeight: "bold",
                    color: "#333",
                    width: "220px",
                  }}
                >
                  Số học sinh hoàn thành
                </th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam: any, index: number) => (
                <tr key={exam.id} className="table-row-hover">
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
                    <Link href={`/classes/${id}?testid=${exam.id}`} style={{ color: "#2b78c5", textDecoration: "underline" }}>
                      {exam.name}
                    </Link>
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      border: "1px solid #e0e0e0",
                      padding: "12px",
                      color: "#000",
                    }}
                  >
                    {exam.averageScore} điểm
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      border: "1px solid #e0e0e0",
                      padding: "12px",
                      color: "#000",
                    }}
                  >
                    {exam.finishedCount} / {exam.totalCount} học sinh
                  </td>
                </tr>
              ))}

              {exams.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    Lớp học này chưa được giao bài kiểm tra nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Selected Test Detail breakdown (drill-down table) */}
        {testDetail && (
          <ClassTestDetailTable
            students={testDetail.students}
            classId={id}
            testId={testid!}
            testName={testDetail.testName}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching classes:", error);
    return <div>Đã xảy ra lỗi khi kết nối đến cơ sở dữ liệu.</div>;
  }
}
