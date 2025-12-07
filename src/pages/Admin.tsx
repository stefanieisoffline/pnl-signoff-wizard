import { Header } from '@/components/Header';
import { AdminDashboard } from '@/components/AdminDashboard';

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AdminDashboard />
    </div>
  );
}
