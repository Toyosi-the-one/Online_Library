import { Injectable } from '@angular/core';
import { BookRawService } from './bookraw';
import { map, tap, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { debugLog, logError } from '../utils/log';

export interface Book {
  id: string;
  key?: string;
  title: string;
  author: string;
  coverImage: string;
  isbn: string;
  publishYear: number;
  description: string;
  pages?: number;
  genre?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Bookscleaned {
  constructor(private bookRaw: BookRawService) {} // Keep it private (best practice)

  // =====================
  // READ Operations
  // =====================

  getCleanedBooks(): Observable<Book[]> {
    return this.bookRaw.getRawBooks().pipe(
      map((books: any[]) =>
        books.map((book: any) => ({
          id: book.id || book.key || '',
          key: book.id || book.key,
          title: book.title || 'Untitled',
          author: book.author || 'Unknown Author',
          coverImage: book.coverImage || book.cover || '',
          isbn: book.isbn || '',
          publishYear: book.publishYear || book.year || 0,
          description: book.description || '',
          pages: book.pages,
          genre: book.genre,
        })),
      ),
    );
  }

  getCleanedBookDetails(id: string): Observable<Book> {
    debugLog(`🔍 Bookscleaned.getCleanedBookDetails called for ID: ${id}`);

    return this.bookRaw.getBookByKey(id).pipe(
      tap((rawBook: any) => {
        debugLog(`📦 Raw data from Firestore for ${id}:`, rawBook);
      }),
      map((book: any): Book => {
        const cleaned: Book = {
          id: book.id || book.key || id,
          key: book.id || book.key,
          title: book.title || 'Untitled',
          author: book.author || 'Unknown Author',
          coverImage: book.coverImage || book.cover || '',
          isbn: book.isbn || '',
          publishYear: book.publishYear || book.year || 0,
          description: book.description || '',
          pages: book.pages,
          genre: book.genre,
        };
        debugLog(`🧼 Cleaned book created: "${cleaned.title}" (ID: ${cleaned.id})`);
        return cleaned;
      }),
      catchError((err: any) => {
        logError(`❌ getCleanedBookDetails FAILED for ${id}`, err);
        throw err;
      }),
    );
  }
  // =====================
  // WRITE Operations (CRUD)
  // =====================

  /** CREATE - Add new book */
  async addBook(book: Book): Promise<any> {
    debugLog('📤 Bookscleaned.addBook called:', book.title);
    try {
      const result = await this.bookRaw.addBook(book);
      debugLog('✅ Bookscleaned.addBook successful');
      return result;
    } catch (error) {
      logError('❌ Bookscleaned.addBook failed', error);
      throw error;
    }
  }

  /** UPDATE - Update existing book */
  async updateBook(book: Book): Promise<any> {
    if (!book.id) {
      throw new Error('Book ID is required for update');
    }

    debugLog('📤 Bookscleaned.updateBook called for ID:', book.id);
    try {
      const result = await this.bookRaw.updateBook(book);
      debugLog('✅ Bookscleaned.updateBook successful');
      return result;
    } catch (error) {
      logError('❌ Bookscleaned.updateBook failed', error);
      throw error;
    }
  }

  /** DELETE - Delete a book */
  async deleteBook(id: string): Promise<void> {
    if (!id) {
      throw new Error('Book ID is required for delete');
    }

    debugLog('🗑️ Bookscleaned.deleteBook called for ID:', id);
    try {
      await this.bookRaw.deleteBook(id);
      debugLog('✅ Bookscleaned.deleteBook successful');
    } catch (error) {
      logError('❌ Bookscleaned.deleteBook failed', error);
      throw error;
    }
  }
}
