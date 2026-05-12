import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc, // ← Added for delete functionality
  serverTimestamp,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { debugLog, logError } from '../utils/log';

@Injectable({
  providedIn: 'root',
})
export class BookRawService {
  constructor(private firestore: Firestore) {}

  // READ all books
  getRawBooks(): Observable<any[]> {
    debugLog('📡 getRawBooks called');
    const booksRef = collection(this.firestore, 'books');
    return collectionData(booksRef, { idField: 'id' }).pipe(
      tap((data) => debugLog('📡 Raw books received:', data?.length || 0)),
    );
  }

  // READ one book
  getBookByKey(key: string): Observable<any> {
    const bookDoc = doc(this.firestore, `books/${key}`);
    return docData(bookDoc, { idField: 'id' });
  }

  // CREATE book
  async addBook(book: any): Promise<any> {
    try {
      debugLog('📤 addBook called with:', book);

      const cleanBook: any = {};
      Object.keys(book).forEach((key) => {
        const value = book[key];
        if (value !== undefined && value !== null && value !== '') {
          cleanBook[key] = value;
        }
      });

      const bookToSave = {
        ...cleanBook,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const booksRef = collection(this.firestore, 'books');
      const docRef = await addDoc(booksRef, bookToSave);

      debugLog('✅ Book added with ID:', docRef.id);
      return { ...bookToSave, id: docRef.id };
    } catch (error: any) {
      logError('❌ addBook failed:', error);
      throw error;
    }
  }

  // UPDATE book
  async updateBook(book: any): Promise<any> {
    try {
      if (!book.id) {
        throw new Error('Book ID is required for update');
      }

      debugLog('📤 updateBook called for ID:', book.id);

      // Clean data
      const cleanBook: any = {};
      Object.keys(book).forEach((key) => {
        const value = book[key];
        if (value !== undefined && value !== null && value !== '') {
          cleanBook[key] = value;
        }
      });

      const bookToUpdate = {
        ...cleanBook,
        updatedAt: serverTimestamp(),
      };

      const bookDoc = doc(this.firestore, `books/${book.id}`);
      await updateDoc(bookDoc, bookToUpdate);

      debugLog('✅ Book updated successfully in Firebase:', book.id);
      return { ...bookToUpdate, id: book.id };
    } catch (error: any) {
      logError('❌ updateBook FAILED:', {
        code: error.code,
        message: error.message,
      });
      throw error;
    }
  }

  // DELETE book - NEW METHOD
  async deleteBook(bookId: string): Promise<void> {
    try {
      if (!bookId) {
        throw new Error('Book ID is required for deletion');
      }

      debugLog('🗑️ deleteBook called for ID:', bookId);

      const bookDoc = doc(this.firestore, `books/${bookId}`);
      await deleteDoc(bookDoc);

      debugLog('✅ Book deleted successfully from Firebase:', bookId);
    } catch (error: any) {
      logError('❌ deleteBook FAILED:', {
        code: error.code,
        message: error.message,
      });
      throw error;
    }
  }
}
