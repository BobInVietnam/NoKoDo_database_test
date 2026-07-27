import Sidebar from "@/components/Sidebar";
import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { verifyAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cookies } from "next/headers";
import LogoutButton from "@/components/LogOutButton"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default async function UserPage() {
  const decoded = await verifyAuth();
  if (!decoded) {
    redirect('/');
  }

  const teacher = await prisma.teacher.findUnique({
    where: { uid: decoded.uid },
  });

  if (!teacher) {
    redirect('/');
  }

  const user = {
    full_name: `${teacher.firstname} ${teacher.lastname || ''}`.trim(),
    email: teacher.email,
    created_at: new Date().toISOString(),
  };

  async function logOut() {
    "use server"
    const cookieStore = await cookies();
    cookieStore.delete("session");
    redirect("/");
  }

  return (
    <div className="container">
      <Sidebar />

      <div className="title">
        <h1>
          <b>User</b>
        </h1>
      </div>

      <div className="profile-header">
        <div className="avatar">
          <span>{user.full_name?.[0] || "U"}</span>
        </div>

        <div className="profile">
          <p style={{ fontSize: "30px" }}>
            <b>{user.full_name}</b>
          </p>

          <p>
            <b>Email</b>
          </p>
          <p>{user.email}</p>

          <p>
            <b>Ngày tạo</b>
          </p>
          <p>{new Date(user.created_at).toLocaleDateString()}</p>
        </div>
        <div className="edit-btn">
          <button>
            <span></span> ✎ Edit Profile
          </button>
        </div>
      </div>
      <div>
        <LogoutButton logOutAction={logOut} />
      </div>
    </div>
  );
}
