import { useState, useMemo } from 'react';
import { Book, mockBooks, currentUser, getLastWorkingDays } from '@/lib/mockData';
import { Header } from './Header';
import { StatsCard } from './StatsCard';
import { SignOffGrid } from './SignOffGrid';
import { BookDetailPanel } from './BookDetailPanel';
import { FilterBar } from './FilterBar';
import { CommentsSummary } from './CommentsSummary';
import { BookOpen, CheckCircle, AlertTriangle, XCircle, MessageSquare } from 'lucide-react';

export function Dashboard() {
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesk, setSelectedDesk] = useState('all');
  const [showRetired, setShowRetired] = useState(false);

  const workingDays = getLastWorkingDays(5);

  // Filter books owned by current user
  const myBooks = useMemo(() => {
    return books.filter(book => book.productController === currentUser.name);
  }, [books]);

  // Apply filters
  const filteredBooks = useMemo(() => {
    return myBooks.filter(book => {
      const matchesSearch = 
        book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.primaryTrader.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.secondaryTrader.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.deskHead.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.desk.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDesk = selectedDesk === 'all' || book.desk === selectedDesk;
      const matchesRetired = showRetired || !book.isRetired;

      return matchesSearch && matchesDesk && matchesRetired;
    });
  }, [myBooks, searchQuery, selectedDesk, showRetired]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeBooks = myBooks.filter(b => !b.isRetired);
    const todaySignOffs = activeBooks.flatMap(b => 
      b.signOffs.filter(s => s.date === workingDays[0])
    );

    const totalComments = activeBooks.reduce((sum, b) => sum + b.comments.length, 0);

    return {
      totalBooks: activeBooks.length,
      signedToday: todaySignOffs.filter(s => s.status === 'signed').length,
      pendingToday: todaySignOffs.filter(s => s.status === 'pending').length,
      rejectedToday: todaySignOffs.filter(s => s.status === 'rejected').length,
      totalComments,
    };
  }, [myBooks, workingDays]);

  const handleUpdateBook = (updatedBook: Book) => {
    setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
    setSelectedBook(updatedBook);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            Welcome back, {currentUser.name.split(' ')[0]}
          </h2>
          <p className="mt-1 text-muted-foreground">
            Here's an overview of your P&L report sign-offs for the last 5 working days.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            title="Total Books"
            value={stats.totalBooks}
            subtitle="Active books in portfolio"
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
            title="Pending"
            value={stats.pendingToday}
            subtitle="Awaiting sign-off"
            icon={AlertTriangle}
            variant="warning"
          />
          <StatsCard
            title="Rejected"
            value={stats.rejectedToday}
            subtitle="Needs attention"
            icon={XCircle}
            variant="danger"
          />
          <StatsCard
            title="Comments"
            value={stats.totalComments}
            subtitle="From traders"
            icon={MessageSquare}
          />
        </div>

        {/* Comments Summary */}
        <CommentsSummary books={myBooks} onBookClick={setSelectedBook} />

        {/* Filter Bar */}
        <div className="mb-6">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedDesk={selectedDesk}
            onDeskChange={setSelectedDesk}
            showRetired={showRetired}
            onShowRetiredChange={setShowRetired}
          />
        </div>

        {/* Sign Off Grid */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">P&L Reports</h3>
            <span className="text-sm text-muted-foreground">
              Showing {filteredBooks.length} of {myBooks.length} books
            </span>
          </div>
          <SignOffGrid books={filteredBooks} onBookClick={setSelectedBook} />
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
      <BookDetailPanel
        book={selectedBook}
        open={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        onUpdateBook={handleUpdateBook}
      />
    </div>
  );
}
