import { Outlet } from "react-router-dom";

// TODO: ยังไม่มีระบบ auth จริง ตอนนี้ให้ผ่านทุก role ไปก่อน
// เมื่อทำ AuthContext เสร็จแล้ว ค่อยกลับมาเช็ค isAuthenticated และ user.role ตรงนี้
export default function RoleRoute({ allowedRole }) {
    console.log(`RoleRoute mockup: bypassing check for role "${allowedRole}"`);
    return <Outlet />;
}