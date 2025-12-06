import { useState, useMemo } from 'react';
import { Book, mockBooks, desks, mockUsers } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Archive, RotateCcw, Users } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EditBookDialogProps {
  book: Book;
  open: boolean;
  onClose: () => void;
  onSave: (book: Book) => void;
}

function EditBookDialog({ book, open, onClose, onSave }: EditBookDialogProps) {
  const [formData, setFormData] = useState({
    primaryTrader: book.primaryTrader,
    secondaryTrader: book.secondaryTrader,
    deskHead: book.deskHead,
    productController: book.productController,
  });

  const traders = mockUsers.filter(u => u.role === 'trader');
  const deskHeads = mockUsers.filter(u => u.role === 'desk_head');
  const controllers = mockUsers.filter(u => u.role === 'product_controller');

  const handleSave = () => {
    onSave({ ...book, ...formData });
    toast.success('Book updated successfully');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Edit Team for {book.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Primary Trader</Label>
            <Select value={formData.primaryTrader} onValueChange={(v) => setFormData({ ...formData, primaryTrader: v })}>
              <SelectTrigger className="bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {traders.map(t => (
                  <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Secondary Trader</Label>
            <Select value={formData.secondaryTrader} onValueChange={(v) => setFormData({ ...formData, secondaryTrader: v })}>
              <SelectTrigger className="bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {traders.map(t => (
                  <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Desk Head</Label>
            <Select value={formData.deskHead} onValueChange={(v) => setFormData({ ...formData, deskHead: v })}>
              <SelectTrigger className="bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {deskHeads.map(t => (
                  <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Product Controller</Label>
            <Select value={formData.productController} onValueChange={(v) => setFormData({ ...formData, productController: v })}>
              <SelectTrigger className="bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {controllers.map(t => (
                  <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BookListPage() {
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesk, setSelectedDesk] = useState('all');
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Active books filtered
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch =
        book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.primaryTrader.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.productController.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDesk = selectedDesk === 'all' || book.desk === selectedDesk;

      return matchesSearch && matchesDesk && !book.isRetired;
    });
  }, [books, searchQuery, selectedDesk]);

  // Retired books filtered
  const retiredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch =
        book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.primaryTrader.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.productController.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDesk = selectedDesk === 'all' || book.desk === selectedDesk;

      return matchesSearch && matchesDesk && book.isRetired;
    });
  }, [books, searchQuery, selectedDesk]);

  const handleUpdateBook = (updatedBook: Book) => {
    setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
  };

  const handleToggleRetire = (book: Book) => {
    const updated = { ...book, isRetired: !book.isRetired };
    handleUpdateBook(updated);
    toast.success(`Book ${updated.isRetired ? 'retired' : 'restored'} successfully`);
  };

  const groupedByDesk = useMemo(() => {
    const groups: Record<string, Book[]> = {};
    filteredBooks.forEach(book => {
      if (!groups[book.desk]) groups[book.desk] = [];
      groups[book.desk].push(book);
    });
    return groups;
  }, [filteredBooks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Book List Management</h1>
          <p className="text-muted-foreground">Manage all trading books and team assignments across desks</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Book
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search books, traders, controllers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/30 border-border"
          />
        </div>
        <Select value={selectedDesk} onValueChange={setSelectedDesk}>
          <SelectTrigger className="w-[180px] bg-muted/30 border-border">
            <SelectValue placeholder="All Desks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Desks</SelectItem>
            {desks.map((desk) => (
              <SelectItem key={desk} value={desk}>{desk}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <div className="rounded-lg bg-muted/30 px-4 py-2">
          <span className="text-muted-foreground">Total Books:</span>
          <span className="ml-2 font-semibold text-foreground">{books.filter(b => !b.isRetired).length}</span>
        </div>
        <div className="rounded-lg bg-muted/30 px-4 py-2">
          <span className="text-muted-foreground">Retired:</span>
          <span className="ml-2 font-semibold text-foreground">{books.filter(b => b.isRetired).length}</span>
        </div>
        <div className="rounded-lg bg-muted/30 px-4 py-2">
          <span className="text-muted-foreground">Desks:</span>
          <span className="ml-2 font-semibold text-foreground">{desks.length}</span>
        </div>
      </div>

      {/* Tables by Desk */}
      {Object.entries(groupedByDesk).map(([desk, deskBooks]) => (
        <div key={desk} className="space-y-3 fade-in">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">{desk}</h2>
            <Badge variant="secondary" className="text-xs">
              {deskBooks.length} {deskBooks.length === 1 ? 'book' : 'books'}
            </Badge>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold">Book Name</TableHead>
                  <TableHead className="font-semibold">Primary Trader</TableHead>
                  <TableHead className="font-semibold">Secondary Trader</TableHead>
                  <TableHead className="font-semibold">Desk Head</TableHead>
                  <TableHead className="font-semibold">Product Controller</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deskBooks.map((book) => (
                  <TableRow
                    key={book.id}
                    className={cn(
                      'transition-colors',
                      book.isRetired && 'opacity-50'
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{book.name}</span>
                        {book.isRetired && (
                          <Badge variant="outline" className="text-[10px] bg-muted/50">
                            RETIRED
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                          {book.primaryTrader.split(' ').map(n => n[0]).join('')}
                        </div>
                        {book.primaryTrader}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground">
                          {book.secondaryTrader.split(' ').map(n => n[0]).join('')}
                        </div>
                        {book.secondaryTrader}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-warning/20 flex items-center justify-center text-[10px] font-bold text-warning">
                          {book.deskHead.split(' ').map(n => n[0]).join('')}
                        </div>
                        {book.deskHead}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-success/20 flex items-center justify-center text-[10px] font-bold text-success">
                          {book.productController.split(' ').map(n => n[0]).join('')}
                        </div>
                        {book.productController}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingBook(book)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleRetire(book)}
                        >
                          {book.isRetired ? (
                            <RotateCcw className="h-4 w-4" />
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
        </div>
      ))}

      {filteredBooks.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
          <Users className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No active books found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or search query.
          </p>
        </div>
      )}

      {/* Retired Books Section */}
      {retiredBooks.length > 0 && (
        <div className="space-y-3 mt-8 fade-in">
          <div className="flex items-center gap-3 border-t border-border pt-6">
            <Archive className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-muted-foreground">Retired Books</h2>
            <Badge variant="outline" className="text-xs">
              {retiredBooks.length} {retiredBooks.length === 1 ? 'book' : 'books'}
            </Badge>
          </div>
          <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="font-semibold text-muted-foreground">Book Name</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Desk</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Primary Trader</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Product Controller</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {retiredBooks.map((book) => (
                  <TableRow
                    key={book.id}
                    className="opacity-60 hover:opacity-80 transition-opacity"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{book.name}</span>
                        <Badge variant="outline" className="text-[10px] bg-muted/50">
                          RETIRED
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{book.desk}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                          {book.primaryTrader.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-muted-foreground">{book.primaryTrader}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                          {book.productController.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-muted-foreground">{book.productController}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingBook(book)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleToggleRetire(book)}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Restore
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editingBook && (
        <EditBookDialog
          book={editingBook}
          open={!!editingBook}
          onClose={() => setEditingBook(null)}
          onSave={handleUpdateBook}
        />
      )}
    </div>
  );
}
