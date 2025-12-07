import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { admins, productControllers, traders, deskHeads, UserRole, RoleUser } from '@/contexts/RoleContext';
import { Search, UserPlus, Shield, Trash2, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AdminUserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');

  // Combine all users with their roles
  const allUsers: (RoleUser & { roleLabel: string })[] = [
    ...admins.map(u => ({ ...u, roleLabel: 'Admin' })),
    ...productControllers.map(u => ({ ...u, roleLabel: 'Product Controller' })),
    ...traders.map(u => ({ ...u, roleLabel: 'Trader' })),
    ...deskHeads.map(u => ({ ...u, roleLabel: 'Desk Head' })),
  ];

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'product_controller': return 'default';
      case 'trader': return 'secondary';
      case 'desk_head': return 'outline';
      default: return 'outline';
    }
  };

  const handleAddAdmin = () => {
    if (!newAdminEmail || !newAdminName) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Check if already an admin
    if (admins.some(a => a.email.toLowerCase() === newAdminEmail.toLowerCase())) {
      toast.error('User is already an admin');
      return;
    }

    // Add to admins array (in real app, this would be a database call)
    const newAdmin: RoleUser = {
      id: `admin-${admins.length + 1}`,
      name: newAdminName,
      email: newAdminEmail,
      role: 'admin',
    };
    admins.push(newAdmin);
    
    toast.success(`${newAdminName} has been added as an admin`);
    setShowAddAdmin(false);
    setNewAdminEmail('');
    setNewAdminName('');
  };

  const handleRemoveAdmin = (admin: RoleUser) => {
    const index = admins.findIndex(a => a.id === admin.id);
    if (index > -1) {
      admins.splice(index, 1);
      toast.success(`${admin.name} has been removed from admins`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Management Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" />
                Admin Users
              </CardTitle>
              <CardDescription>
                Manage users with full administrative access
              </CardDescription>
            </div>
            <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Admin</DialogTitle>
                  <DialogDescription>
                    Grant administrative access to a user. They will be able to manage all books, users, and sign-offs.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      placeholder="John Smith"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input 
                      type="email"
                      placeholder="john.smith@sefe.eu"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddAdmin(false)}>Cancel</Button>
                  <Button onClick={handleAddAdmin}>Add Admin</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map(admin => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveAdmin(admin)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* All Users Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users
          </CardTitle>
          <CardDescription>
            View all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="product_controller">Product Controller</SelectItem>
                <SelectItem value="trader">Trader</SelectItem>
                <SelectItem value="desk_head">Desk Head</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.slice(0, 50).map(user => (
                  <TableRow key={`${user.role}-${user.id}`}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.roleLabel}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredUsers.length > 50 && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing 50 of {filteredUsers.length} users. Use filters to narrow down results.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
