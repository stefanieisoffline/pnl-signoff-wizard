import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockBooks as books, getLastWorkingDays, formatWorkingDay, SignOffStatus } from '@/lib/mockData';
import { Check, X, Clock, Search, Filter } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export function AdminSignOffOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deskFilter, setDeskFilter] = useState<string>('all');
  const [selectedBook, setSelectedBook] = useState<typeof books[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const workingDays = getLastWorkingDays(5);
  const desks = [...new Set(books.map(b => b.desk))].sort();

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.primaryTrader.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.productController.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDesk = deskFilter === 'all' || book.desk === deskFilter;
    
    if (statusFilter === 'all') return matchesSearch && matchesDesk;
    
    const hasStatus = book.signOffs.some(s => 
      workingDays.includes(s.date) && s.status === statusFilter
    );
    return matchesSearch && matchesDesk && hasStatus;
  });

  const getStatusCounts = () => {
    let signed = 0, pending = 0, rejected = 0;
    books.forEach(book => {
      book.signOffs.forEach(signOff => {
        if (workingDays.includes(signOff.date)) {
          if (signOff.status === 'signed') signed++;
          else if (signOff.status === 'pending') pending++;
          else if (signOff.status === 'rejected') rejected++;
        }
      });
    });
    return { signed, pending, rejected, total: signed + pending + rejected };
  };

  const counts = getStatusCounts();

  const handleChangeStatus = (book: typeof books[0], date: string, newStatus: SignOffStatus) => {
    const signOff = book.signOffs.find(s => s.date === date);
    if (signOff) {
      signOff.status = newStatus;
      signOff.signedBy = newStatus === 'signed' ? 'Admin Override' : undefined;
      signOff.signedAt = newStatus === 'signed' ? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : undefined;
      toast.success(`Status updated to ${newStatus} for ${book.name} on ${formatWorkingDay(date)}`);
      setSelectedBook(null);
      setSelectedDate(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Signed</p>
                <p className="text-2xl font-bold text-emerald-600">{counts.signed}</p>
              </div>
              <Check className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{counts.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
              </div>
              <X className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Books</p>
                <p className="text-2xl font-bold">{books.length}</p>
              </div>
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sign-Off Status (Last 5 Working Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search books, traders, or PCs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="signed">Signed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={deskFilter} onValueChange={setDeskFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Desk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Desks</SelectItem>
                {desks.map((desk: string) => (
                  <SelectItem key={desk} value={desk}>{desk}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Book Name</TableHead>
                  <TableHead>Desk</TableHead>
                  <TableHead>Primary Trader</TableHead>
                  <TableHead>Product Controller</TableHead>
                  {workingDays.map(day => (
                    <TableHead key={day} className="text-center w-24">
                      {formatWorkingDay(day)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.slice(0, 50).map(book => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{book.desk}</Badge>
                    </TableCell>
                    <TableCell>{book.primaryTrader}</TableCell>
                    <TableCell>{book.productController}</TableCell>
                    {workingDays.map(day => {
                      const signOff = book.signOffs.find(s => s.date === day);
                      return (
                        <TableCell key={day} className="text-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <button 
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => {
                                  setSelectedBook(book);
                                  setSelectedDate(day);
                                }}
                              >
                                <StatusBadge status={signOff?.status || 'none'} />
                              </button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Change Status - {book.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                  Date: {formatWorkingDay(day)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Current Status: <StatusBadge status={signOff?.status || 'none'} />
                                </p>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    className="flex-1 text-emerald-600 hover:bg-emerald-50"
                                    onClick={() => handleChangeStatus(book, day, 'signed')}
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Sign Off
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="flex-1 text-amber-600 hover:bg-amber-50"
                                    onClick={() => handleChangeStatus(book, day, 'pending')}
                                  >
                                    <Clock className="mr-2 h-4 w-4" />
                                    Set Pending
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="flex-1 text-red-600 hover:bg-red-50"
                                    onClick={() => handleChangeStatus(book, day, 'rejected')}
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredBooks.length > 50 && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing 50 of {filteredBooks.length} books. Use filters to narrow down results.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
