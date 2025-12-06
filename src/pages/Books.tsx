import { BookListPage } from '@/components/BookListPage';
import { Header } from '@/components/Header';

const Books = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <BookListPage />
      </main>
    </div>
  );
};

export default Books;
