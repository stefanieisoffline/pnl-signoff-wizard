import { useState, useMemo } from 'react';
import { Book, mockBooks, getLastWorkingDays } from '@/lib/mockData';
import { Header } from './Header';
import { StatsCard } from './StatsCard';
import { TraderSignOffGrid } from './TraderSignOffGrid';
import { TraderBookDetailPanel } from './TraderBookDetailPanel';
import { FilterBar } from './FilterBar';
import { BookOpen, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';

// Mock trader user - Robert Allan is a primary trader on many books
export const traderUser = {
  id: 'trader-1',
  name: 'Robert Allan',
  email: 'robert.allan@sefe.com',
  role: 'trader' as const,
};

export function TraderDashboard() {
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesk, setSelectedDesk] = useState('all');

  const workingDays = getLastWorkingDays(5);

  // Filter books where current trader is primary trader, secondary trader, or desk head
  const myBooks = useMemo(() => {
    return books.filter(
      book => 
        book.primaryTrader === traderUser.name || 
        book.secondaryTrader === traderUser.name ||
        book.deskHead === traderUser.name
    );
  }, [books]);

  // Apply filters
  const filteredBooks = useMemo(() => {
    return myBooks.filter(book => {
      const matchesSearch = 
        book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.desk.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDesk = selectedDesk === 'all' || book.desk === selectedDesk;

      return matchesSearch && matchesDesk && !book.isRetired;
    });
  }, [myBooks, searchQuery, selectedDesk]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeBooks = myBooks.filter(b => !b.isRetired);
    const todaySignOffs = activeBooks.flatMap(b => 
      b.signOffs.filter(s => s.date === workingDays[0])
    );

    const pendingBooks = activeBooks.filter(b => {
      const todaySignOff = b.signOffs.find(s => s.date === workingDays[0]);
      return todaySignOff?.status === 'pending';
    });

    // Count overdue (pending from previous days)
    const overdueCount = activeBooks.reduce((count, book) => {
      const overdueSignOffs = book.signOffs.filter(
        (s, idx) => idx > 0 && s.status === 'pending'
      );
      return count + overdueSignOffs.length;
    }, 0);

    return {
      totalBooks: activeBooks.length,
      signedToday: todaySignOffs.filter(s => s.status === 'signed').length,
      pendingToday: pendingBooks.length,
      overdue: overdueCount,
    };
  }, [myBooks, workingDays]);

  const handleUpdateBook = (updatedBook: Book) => {
    setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
    setSelectedBook(updatedBook);
  };

  const handleQuickSignOff = (book: Book, date: string) => {
    const updatedSignOffs = book.signOffs.map(s => 
      s.date === date 
        ? { ...s, status: 'signed' as const, signedBy: traderUser.name, signedAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }
        : s
    );
    const updatedBook = { ...book, signOffs: updatedSignOffs };
    handleUpdateBook(updatedBook);
    toast({
      title: "Report Signed",
      description: `${book.name} signed off successfully.`,
    });
  };

  const handleSignAllPending = () => {
    const today = workingDays[0];
    let signedCount = 0;

    const updatedBooks = books.map(book => {
      if (book.primaryTrader !== traderUser.name && book.secondaryTrader !== traderUser.name) {
        return book;
      }
      const todaySignOff = book.signOffs.find(s => s.date === today);
      if (todaySignOff?.status === 'pending') {
        signedCount++;
        return {
          ...book,
          signOffs: book.signOffs.map(s =>
            s.date === today
              ? { ...s, status: 'signed' as const, signedBy: traderUser.name, signedAt: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }
              : s
          ),
        };
      }
      return book;
    });

    setBooks(updatedBooks);
    toast({
      title: "Batch Sign-Off Complete",
      description: `${signedCount} reports signed off successfully.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Welcome back, {traderUser.name.split(' ')[0]}
            </h2>
            <p className="mt-1 text-muted-foreground">
              Review and sign off your P&L reports for the last 5 working days.
            </p>
          </div>
          {stats.pendingToday > 0 && (
            <Button onClick={handleSignAllPending} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Sign All Pending ({stats.pendingToday})
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Assigned Books"
            value={stats.totalBooks}
            subtitle="Primary & secondary trader"
            icon={BookOpen}
          />
          <StatsCard
            title="Signed Today"
            value={stats.signedToday}
            subtitle={`of ${stats.totalBooks} reports`}
            icon={CheckCircle}
            variant="success"
          />
          <StatsCard
            title="Pending Today"
            value={stats.pendingToday}
            subtitle="Awaiting your sign-off"
            icon={AlertTriangle}
            variant="warning"
          />
          <StatsCard
            title="Overdue"
            value={stats.overdue}
            subtitle="From previous days"
            icon={Clock}
            variant="danger"
          />
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedDesk={selectedDesk}
            onDeskChange={setSelectedDesk}
            showRetired={false}
            onShowRetiredChange={() => {}}
            hideRetiredToggle
          />
        </div>

        {/* Sign Off Grid */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">My P&L Reports</h3>
            <span className="text-sm text-muted-foreground">
              Showing {filteredBooks.length} of {myBooks.filter(b => !b.isRetired).length} books
            </span>
          </div>
          <TraderSignOffGrid 
            books={filteredBooks} 
            onBookClick={setSelectedBook}
            onQuickSignOff={handleQuickSignOff}
            traderName={traderUser.name}
          />
        </div>

        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No books found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your filters or search query.
            </p>
          </div>
        )}
      </main>

      {/* Book Detail Panel */}
      <TraderBookDetailPanel
        book={selectedBook}
        open={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        onUpdateBook={handleUpdateBook}
        traderName={traderUser.name}
      />
    </div>
  );
}
