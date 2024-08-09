import { useAuth } from '@/lib/auth';
import AdminDashboard from './AdminDashboard';
import MemberDashboard from './MemberDashboard';

const Dashboard = () => {
  const { isLogged, role } = useAuth();

  if (!isLogged) {
    return <p>Please log in to view this page.</p>;
  }

  return (
    <div>
      {role === 'admin' && <AdminDashboard />}
      {role === 'member' && <MemberDashboard />}
      {!role && <p>Loading...</p>}
    </div>
  );
};



export default Dashboard;
