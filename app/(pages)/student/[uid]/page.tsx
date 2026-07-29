import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { getStudentDetailData } from "@/services/student.service";
import ClearStudentResultsButton from "@/components/ClearStudentResultsButton";
import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import "../../pages.css";

interface StudentDetailPageProps {
  params: Promise<{ uid: string }>;
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  try {
    const decoded = await verifyAuth();
    if (!decoded) {
      redirect("/");
    }

    const { uid } = await params;
    const student = await getStudentDetailData(uid);

    if (!student) {
      return (
        <div className="container" style={{ padding: "20px" }}>
          <Sidebar />
          <h2 style={{ color: "#ef4444" }}>Không tìm thấy thông tin học sinh</h2>
        </div>
      );
    }

    return (
      <div className="container" style={{ fontFamily: "Arial, sans-serif", paddingBottom: "60px" }}>
        <Sidebar />
        
        {/* Header navigation back */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}>
          <Link
            href={`/classes/${student.classId}`}
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
            title="Quay lại danh sách lớp"
          >
            <ArrowLeft size={22} />
          </Link>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0, color: "#111" }}>
            {student.name} <span style={{ fontSize: "20px", fontWeight: "normal", color: "#666" }}>({student.email})</span>
          </h1>
        </div>

        {/* Info Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "16px", color: "#333", marginBottom: "30px" }}>
          <div>
            <b>Giới tính:</b> {student.gender}
          </div>
          <div>
            <b>Ngày sinh:</b> {student.birthday}
          </div>
        </div>

        {/* Study info block */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "16px", color: "#333" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", borderBottom: "2.5px solid #333", paddingBottom: "6px", width: "fit-content", margin: "10px 0" }}>
            Thông tin học tập
          </h2>
          <div>
            <b>Lớp:</b> {student.className}
          </div>
          <div>
            <b>Thời gian sử dụng ứng dụng:</b> {student.usageTime}
          </div>
          <div>
            <b>Bài luyện tập:</b> {student.lessonsRatio}
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "600px" }}>
            <div>
              <b>Bài kiểm tra:</b> {student.examsRatio}
            </div>
            <div style={{ fontWeight: "bold" }}>
              Điểm trung bình: {student.averageScore}
            </div>
          </div>
        </div>

        {/* Exam Breakdown Table Box */}
        <div style={{ 
          border: "2px solid #333", 
          borderRadius: "8px", 
          padding: "20px",
          marginTop: "20px",
          backgroundColor: "#fff"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "15px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #333" }}>
                <th style={thStyle}>STT</th>
                <th style={{ ...thStyle, textAlign: "left" }}>Tên bài kiểm tra</th>
                <th style={thStyle}>Số lần thử</th>
                <th style={thStyle}>Ngày làm bài</th>
                <th style={thStyle}>Điểm cao nhất</th>
                <th style={{ ...thStyle, width: "200px" }}></th>
              </tr>
            </thead>
            <tbody>
              {student.exams.map((exam, index) => (
                <tr key={exam.id} style={{ borderBottom: "1px solid #ccc" }}>
                  <td style={{ ...tdStyle, textAlign: "center", width: "60px" }}>{index + 1}</td>
                  <td style={{ ...tdStyle, fontWeight: "bold" }}>{exam.name}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    {exam.attemptsCount}/{exam.allowedAttempts}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{exam.latestDate}</td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: "bold" }}>
                    {exam.maxScore !== "--" ? `${exam.maxScore} điểm` : "--"}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    {exam.attemptsCount > 0 && (
                      <ClearStudentResultsButton
                        studentId={student.uid}
                        testId={exam.id}
                        testName={exam.name}
                      />
                    )}
                  </td>
                </tr>
              ))}

              {student.exams.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                    Chưa được giao bài kiểm tra nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    );
  } catch (error) {
    console.error("Student detail page error:", error);
    return <div>Đã xảy ra lỗi khi kết nối cơ sở dữ liệu.</div>;
  }
}

const thStyle: React.CSSProperties = {
  padding: "12px 15px",
  fontWeight: "bold",
  color: "#333",
  textAlign: "center"
};

const tdStyle: React.CSSProperties = {
  padding: "12px 15px",
  verticalAlign: "middle",
  color: "#000"
};
