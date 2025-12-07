import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminBookManagement } from './admin/AdminBookManagement';
import { AdminUserManagement } from './admin/AdminUserManagement';
import { AdminSignOffOverview } from './admin/AdminSignOffOverview';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Full access to manage books, users, and sign-off status</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Sign-Off Overview</TabsTrigger>
          <TabsTrigger value="books">Book Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AdminSignOffOverview />
        </TabsContent>

        <TabsContent value="books">
          <AdminBookManagement />
        </TabsContent>

        <TabsContent value="users">
          <AdminUserManagement />
        </TabsContent>
      </Tabs>
    </main>
  );
}
