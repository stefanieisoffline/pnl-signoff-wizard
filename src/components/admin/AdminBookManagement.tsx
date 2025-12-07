import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockBooks as books } from '@/lib/mockData';
import { productControllers, traders, deskHeads } from '@/contexts/RoleContext';
import { Search, Edit, Archive, ArchiveRestore, UserCog } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

export function AdminBookManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deskFilter, setDeskFilter] = useState<string>('all');
  const [showRetired, setShowRetired] = useState(false);
  const [editingBook, setEditingBook] = useState<typeof books[0] | null>(null);
  const [editForm, setEditForm] = useState({
    primaryTrader: '',
    secondaryTrader: '',
    deskHead: '',
    productController: '',
    desk: '',
  });

  const desks = [...new Set(books.map(b => b.desk))].sort();
  const allTraders = [...new Set([...traders.map(t => t.name), ...books.map(b => b.primaryTrader), ...books.map(b => b.secondaryTrader)])].sort();
  const allDeskHeads = [...new Set([...deskHeads.map(d => d.name), ...books.map(b => b.deskHead)])].sort();
  const allPCs = [...new Set([...productControllers.map(p => p.name), ...books.map(b => b.productController)])].sort();

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.primaryTrader.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.productController.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDesk = deskFilter === 'all' || book.desk === deskFilter;
    const matchesRetired = showRetired ? book.isRetired : !book.isRetired;
    
    return matchesSearch && matchesDesk && matchesRetired;
  });

  const handleEditBook = (book: typeof books[0]) => {
    setEditingBook(book);
    setEditForm({
      primaryTrader: book.primaryTrader,
      secondaryTrader: book.secondaryTrader,
      deskHead: book.deskHead,
      productController: book.productController,
      desk: book.desk,
    });
  };

  const handleSaveBook = () => {
    if (editingBook) {
      editingBook.primaryTrader = editForm.primaryTrader;
      editingBook.secondaryTrader = editForm.secondaryTrader;
      editingBook.deskHead = editForm.deskHead;
      editingBook.productController = editForm.productController;
      editingBook.desk = editForm.desk;
      toast.success(`Book "${editingBook.name}" updated successfully`);
      setEditingBook(null);
    }
  };

  const handleToggleRetire = (book: typeof books[0]) => {
    book.isRetired = !book.isRetired;
    toast.success(`Book "${book.name}" ${book.isRetired ? 'retired' : 'restored'} successfully`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Book Management</CardTitle>
            <div className="flex items-center gap-2">
              <Switch 
                id="show-retired" 
                checked={showRetired} 
                onCheckedChange={setShowRetired}
              />
              <Label htmlFor="show-retired" className="text-sm">Show Retired Books</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search books..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
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
                  <TableHead>Secondary Trader</TableHead>
                  <TableHead>Desk Head</TableHead>
                  <TableHead>Product Controller</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.slice(0, 50).map(book => (
                  <TableRow key={book.id} className={book.isRetired ? 'opacity-60' : ''}>
                    <TableCell className="font-medium">{book.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{book.desk}</Badge>
                    </TableCell>
                    <TableCell>{book.primaryTrader}</TableCell>
                    <TableCell>{book.secondaryTrader}</TableCell>
                    <TableCell>{book.deskHead}</TableCell>
                    <TableCell>{book.productController}</TableCell>
                    <TableCell>
                      {book.isRetired ? (
                        <Badge variant="secondary">Retired</Badge>
                      ) : (
                        <Badge variant="default" className="bg-emerald-600">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditBook(book)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Edit Book - {book.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Desk</Label>
                                <Select 
                                  value={editForm.desk} 
                                  onValueChange={(v) => setEditForm({...editForm, desk: v})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {desks.map((desk: string) => (
                                      <SelectItem key={desk} value={desk}>{desk}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Primary Trader</Label>
                                <Select 
                                  value={editForm.primaryTrader} 
                                  onValueChange={(v) => setEditForm({...editForm, primaryTrader: v})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {allTraders.map(trader => (
                                      <SelectItem key={trader} value={trader}>{trader}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Secondary Trader</Label>
                                <Select 
                                  value={editForm.secondaryTrader} 
                                  onValueChange={(v) => setEditForm({...editForm, secondaryTrader: v})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {allTraders.map(trader => (
                                      <SelectItem key={trader} value={trader}>{trader}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Desk Head</Label>
                                <Select 
                                  value={editForm.deskHead} 
                                  onValueChange={(v) => setEditForm({...editForm, deskHead: v})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {allDeskHeads.map(dh => (
                                      <SelectItem key={dh} value={dh}>{dh}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Product Controller</Label>
                                <Select 
                                  value={editForm.productController} 
                                  onValueChange={(v) => setEditForm({...editForm, productController: v})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {allPCs.map(pc => (
                                      <SelectItem key={pc} value={pc}>{pc}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditingBook(null)}>Cancel</Button>
                              <Button onClick={handleSaveBook}>Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleRetire(book)}
                        >
                          {book.isRetired ? (
                            <ArchiveRestore className="h-4 w-4" />
                          ) : (
                            <Archive className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
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
