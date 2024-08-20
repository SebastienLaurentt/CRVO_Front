import { useAuth } from "@/lib/auth";
import AdminOngoing from "./AdminOngoing";
import MemberOngoing from "./MemberOngoing";
import Nav from "@/components/Nav";

const OngoingDashboard = () => {
  const { isLogged, role } = useAuth();

  if (!isLogged) {
    return <p>Please log in to view this page.</p>;
  }

  return (
<div className="flex flex-row gap-x-4 my-8 ml-8">
  {role === "admin" && (
    <>
      <Nav />
      <AdminOngoing />
    </>
  )}
  {role === "member" && <MemberOngoing />}
  {!role && <p>Loading...</p>}
</div>

  );
};

export default OngoingDashboard;
