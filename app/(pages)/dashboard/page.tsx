import Sidebar from "@/components/Sidebar";
import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const decoded = await verifyAuth();
  if (!decoded) {
    redirect("/");
  }

  const activities = [
    "Hoạt động 1: Cập nhật danh sách học sinh",
    "Hoạt động 2: Thêm lớp học mới",
    "Hoạt động 3: Đồng bộ điểm bài tập",
    "Hoạt động 4: Tra cứu từ điển",
    "Hoạt động 5: Xem lịch sử làm bài",
  ];
  return (
    <div className="container">
      <Sidebar />
      <div className="title">
        <h1>
          <b>Dashboard</b>
        </h1>
      </div>
      <div className="recent-activity">
        <p>Hoạt động gần đây</p>
      </div>
      <div className="activity-list">
        {activities.map((activity, index) => (
          <div key={index} className="activity-item">
            {activity}
          </div>
        ))}
      </div>
    </div>
  );
}
