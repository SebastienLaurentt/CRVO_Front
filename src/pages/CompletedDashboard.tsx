import Nav from "@/components/Nav";
import { useAuth } from "@/lib/auth";
import AdminCompleted from "./AdminCompleted";
import MemberCompleted from "./MemberCompleted";

const CompletedDashboard = () => {
  const { isLogged, role } = useAuth();

  if (!isLogged) {
    return <p>Please log in to view this page.</p>;
  }

  return (
    <div className="flex flex-row gap-x-4 my-20 ml-8">
      {role === "admin" && (
        <>
          <Nav />
          <AdminCompleted />
        </>
      )}
      {role === "member" && (
        <>
          <Nav />
          <MemberCompleted />
        </>
      )}
      {!role && <p>Loading...</p>}
    </div>
  );
};

export default CompletedDashboard;
