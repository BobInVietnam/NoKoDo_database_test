"use client";

export default function LogoutButton({ logOutAction }: { logOutAction: () => Promise<void> }) {
  return (
    <button 
      className="btn-delete" 
      onClick={() => logOutAction()}
    >
      <span></span> Đăng xuất
    </button>
  );
}