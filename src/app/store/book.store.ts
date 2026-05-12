import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Bookscleaned, Book } from '../services/bookscleaned';
import { switchMap, tap, catchError, mergeMap, exhaustMap } from 'rxjs/operators';
import { of, from } from 'rxjs';
import { debugLog, logError } from '../utils/log';

export interface BookState {
  books: Book[];
  loading: boolean;
  error: any;
  loaded: boolean;

  detailsById: Record<string, Book>;
  detailsLoadingById: Record<string, boolean>;
  detailsErrorById: Record<string, any>;

  totalFetched: number;
  bookLimit: number;
}

@Injectable({ providedIn: 'root' })
export class BookStore extends ComponentStore<BookState> {
  constructor(private cleanedService: Bookscleaned) {
    super({
      books: [],
      loading: false,
      error: null,
      loaded: false,
      detailsById: {},
      detailsLoadingById: {},
      detailsErrorById: {},
      totalFetched: 40,
      bookLimit: 20,
    });
  }

  // SELECTORS 
  readonly books$ = this.select((state) => state.books);
  readonly loading$ = this.select((state) => state.loading);
  readonly error$ = this.select((state) => state.error);
  readonly detailsById$ = this.select((state) => state.detailsById);


  readonly totalFetched$ = this.select((state) => state.totalFetched);
  readonly bookLimit$ = this.select((state) => state.bookLimit);

  // UPDATERS 
  readonly setLoading = this.updater((state, loading: boolean) => ({ ...state, loading }));

  readonly setBooks = this.updater((state, books: Book[]) => ({
    ...state,
    books: books || [],
    loading: false,
    loaded: true,
    error: null,
  }));

  readonly setError = this.updater((state, error: any) => ({
    ...state,
    error,
    loading: false,
  }));

  readonly setTotalFetched = this.updater((state, totalFetched: number) => ({
    ...state,
    totalFetched,
  }));

  readonly setBookLimit = this.updater((state, bookLimit: number) => ({
    ...state,
    bookLimit,
  }));

  readonly addBookToState = this.updater((state, newBook: Book) => ({
    ...state,
    books: [newBook, ...state.books],
  }));

  readonly updateBookInState = this.updater((state, updatedBook: Book) => ({
    ...state,
    books: state.books.map((book) => (book.id === updatedBook.id ? { ...updatedBook } : book)),
    detailsById: {
      ...state.detailsById,
      [updatedBook.id]: { ...updatedBook },
    },
  }));

  readonly deleteBookInState = this.updater((state, bookId: string) => ({
    ...state,
    books: state.books.filter((book) => book.id !== bookId),
    detailsById: Object.fromEntries(
      Object.entries(state.detailsById).filter(([id]) => id !== bookId),
    ),
  }));

  readonly setBookDetailLoading = this.updater((state, id: string) => ({
    ...state,
    detailsLoadingById: { ...state.detailsLoadingById, [id]: true },
    detailsErrorById: { ...state.detailsErrorById, [id]: null },
  }));

  readonly setBookDetail = this.updater((state, data: { id: string; book: Book }) => ({
    ...state,
    detailsById: { ...state.detailsById, [data.id]: data.book },
    detailsLoadingById: { ...state.detailsLoadingById, [data.id]: false },
  }));

  readonly setBookDetailError = this.updater((state, data: { id: string; error: any }) => ({
    ...state,
    detailsLoadingById: { ...state.detailsLoadingById, [data.id]: false },
    detailsErrorById: { ...state.detailsErrorById, [data.id]: data.error },
  }));

  // EFFECTS

  readonly loadBooks = this.effect<{ force?: boolean }>((trigger$) =>
    trigger$.pipe(
      exhaustMap(({ force = false }) => {
        if (!force && this.get().loaded) {
          this.preloadInitialDetails(20);
          return of(null);
        }

        this.setLoading(true);
        debugLog('📡 Fetching all books...');

        return this.cleanedService.getCleanedBooks().pipe(
          tap((books: Book[]) => {
            debugLog(`✅ Loaded ${books.length} books`);
            this.setBooks(books);
            setTimeout(() => this.preloadInitialDetails(20), 1000);
          }),
          catchError((err) => {
            logError('Failed to load books', err);
            this.setError(err);
            return of(null);
          }),
        );
      }),
    ),
  );

  readonly loadBookDetails = this.effect<string>((id$) =>
    id$.pipe(
      switchMap((id) => {
        if (!id) return of(null);

        const state = this.get();

        if (state.detailsById[id]) {
          debugLog(`✅ Book ${id} already cached`);
          return of(null);
        }

        if (state.detailsLoadingById[id]) {
          debugLog(`⏳ Book ${id} is already being loaded`);
          return of(null);
        }

        debugLog(`🚀 Loading details for book ID: ${id}`);
        this.setBookDetailLoading(id);

        return this.cleanedService.getCleanedBookDetails(id).pipe(
          tap((book: Book) => {
            debugLog(`✅ Successfully loaded book: "${book.title}" (${id})`);
            this.setBookDetail({ id, book });
          }),
          catchError((err) => {
            logError(`❌ Failed to load book ${id}`, err);
            this.setBookDetailError({ id, error: err });
            return of(null);
          }),
        );
      }),
    ),
  );

  readonly addBook = this.effect<Book>((book$) =>
    book$.pipe(
      exhaustMap((newBook) => {
        debugLog('📤 Adding new book to Firebase:', newBook.title);

        return from(this.cleanedService.addBook(newBook)).pipe(
          tap((savedBook: Book) => {
            debugLog('✅ Book successfully added to Firebase');
            this.addBookToState(savedBook);
          }),
          catchError((err: any) => {
            logError('❌ Failed to add book to Firebase:', err);
            throw err;
          }),
        );
      }),
    ),
  );

  readonly updateBook = this.effect<Book>((book$) =>
    book$.pipe(
      exhaustMap((updatedBook) => {
        if (!updatedBook?.id) {
          logError('Cannot update book without ID');
          return of(null);
        }

        debugLog('📤 Updating book in Firebase:', updatedBook.id);

        return from(this.cleanedService.updateBook(updatedBook)).pipe(
          tap(() => {
            debugLog('✅ Book updated successfully');
            this.updateBookInState(updatedBook);
          }),
          catchError((err: any) => {
            logError('❌ Update failed:', err);
            throw err;
          }),
        );
      }),
    ),
  );

  readonly deleteBook = this.effect<string>((bookId$) =>
    bookId$.pipe(
      exhaustMap((bookId) => {
        if (!bookId) return of(null);

        debugLog('🗑️ Deleting book from Firebase:', bookId);

        return from(this.cleanedService.deleteBook(bookId)).pipe(
          tap(() => {
            debugLog('✅ Book deleted successfully');
            this.deleteBookInState(bookId);
          }),
          catchError((err: any) => {
            logError('❌ Delete failed:', err);
            throw err;
          }),
        );
      }),
    ),
  );

  //  To Preload Data Method
  preloadInitialDetails(limit: number = 20): void {
    const state = this.get();
    const idsToLoad = state.books
      .slice(0, limit)
      .map((b) => b.id)
      .filter((id): id is string => !!id && !state.detailsById[id]);

    if (idsToLoad.length === 0) return;

    debugLog(`🔄 Preloading details for ${idsToLoad.length} books...`);

    from(idsToLoad)
      .pipe(
        mergeMap(
          (id) =>
            this.cleanedService.getCleanedBookDetails(id).pipe(
              tap((book) => this.setBookDetail({ id, book })),
              catchError(() => of(null)),
            ),
          2,
        ),
      )
      .subscribe();
  }

  reloadBooks(): void {
    this.loadBooks({ force: true });
  }
}
