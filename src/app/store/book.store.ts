import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Bookscleaned } from '../services/bookscleaned';
import { switchMap, tap, withLatestFrom, exhaustMap, catchError, mergeMap } from 'rxjs/operators';
import { of, from } from 'rxjs';

export interface BookState {
  books: any[];
  loading: boolean;
  error: any;
  loaded: boolean;

  detailsById: Record<string, any>;
  detailsLoadingById: Record<string, boolean>;
  detailsErrorById: Record<string, any>;
  detailsFullyLoaded: boolean;

  totalFetched: number;
  bookLimit: number;
}

@Injectable({ providedIn: 'root' }) // 👈 keeps state across pages
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
      detailsFullyLoaded: false,
      totalFetched: 40,
      bookLimit: 20,
    });
  }

  // ======================
  // SELECTORS
  // ======================
  readonly books$ = this.select((state) => state.books);
  readonly loading$ = this.select((state) => state.loading);
  readonly detailsById$ = this.select((state) => state.detailsById);
  readonly detailsFullyLoaded$ = this.select((state) => state.detailsFullyLoaded);
  readonly totalFetched$ = this.select((state) => state.totalFetched);
  readonly bookLimit$ = this.select((state) => state.bookLimit);

  // ======================
  // UPDATERS
  // ======================
  readonly setLoading = this.updater((state, loading: boolean) => ({
    ...state,
    loading,
  }));

  readonly setBooks = this.updater((state, books: any[]) => ({
    ...state,
    books,
    loading: false,
    loaded: true,
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

  readonly setBookDetailLoading = this.updater((state, id: string) => ({
    ...state,
    detailsLoadingById: {
      ...state.detailsLoadingById,
      [id]: true,
    },
    detailsErrorById: {
      ...state.detailsErrorById,
      [id]: null,
    },
  }));

  readonly setBookDetail = this.updater((state, data: { id: string; book: any }) => ({
    ...state,
    detailsById: {
      ...state.detailsById,
      [data.id]: data.book,
    },
    detailsLoadingById: {
      ...state.detailsLoadingById,
      [data.id]: false,
    },
  }));

  readonly setBookDetailError = this.updater((state, data: { id: string; error: any }) => ({
    ...state,
    detailsLoadingById: {
      ...state.detailsLoadingById,
      [data.id]: false,
    },
    detailsErrorById: {
      ...state.detailsErrorById,
      [data.id]: data.error,
    },
  }));

  readonly setDetailsFullyLoaded = this.updater((state, loaded: boolean) => ({
    ...state,
    detailsFullyLoaded: loaded,
  }));

  readonly setBatchDetails = this.updater((state, detailsMap: Record<string, any>) => {
    const updatedDetails = { ...state.detailsById };
    const updatedLoadingById = { ...state.detailsLoadingById };

    Object.entries(detailsMap).forEach(([id, book]) => {
      updatedDetails[id] = book;
      updatedLoadingById[id] = false;
    });

    return {
      ...state,
      detailsById: updatedDetails,
      detailsLoadingById: updatedLoadingById,
    };
  });

  // ======================
  // EFFECTS
  // ======================

  readonly loadBooks = this.effect((trigger$) =>
    trigger$.pipe(
      withLatestFrom(this.select((state) => state.loaded)),
      switchMap(([_, loaded]) => {
        if (loaded) return of();

        this.setLoading(true);

        return this.cleanedService.getCleanedBooks().pipe(
          tap({
            next: (books) => {
              this.setBooks(books);
              // Preload details for the first 20 books
              this.preloadInitialDetails(books, 20);
            },
            error: (err) => this.setError(err),
          }),
        );
      }),
    ),
  );

  readonly loadBookDetails = this.effect((id$: any) =>
    id$.pipe(
      withLatestFrom(
        this.detailsById$,
        this.select((state) => state.detailsLoadingById),
      ),
      exhaustMap(([id, details, loadingById]) => {
        // Return empty if already cached
        if (details?.[id]) return of();

        // Return empty if already loading (prevents duplicate requests)
        if (loadingById?.[id]) return of();

        this.setBookDetailLoading(id);

        return this.cleanedService.getCleanedBookDetails(id).pipe(
          tap({
            next: (book) => this.setBookDetail({ id, book }),
            error: (err) => this.setBookDetailError({ id, error: err }),
          }),
        );
      }),
    ),
  );

  // ======================
  // SMART PRELOAD - Load first N book details in background
  // ======================
  preloadInitialDetails(books: any[], limit: number = 20) {
    const existing = this.get().detailsById;

    // Get the first N book IDs
    const ids = books
      .slice(0, limit)
      .filter((b) => b.key)
      .map((b) => b.key.replace('/works/', ''))
      .filter((id) => !existing[id]);

    if (ids.length === 0) {
      this.setDetailsFullyLoaded(true);
      return;
    }

    // Load them with concurrency limit of 3
    from(ids)
      .pipe(
        mergeMap(
          (id) =>
            this.cleanedService.getCleanedBookDetails(id).pipe(
              tap({
                next: (book) => this.setBookDetail({ id, book }),
                error: (err) => {
                  console.warn(`Failed to preload details for ${id}:`, err);
                  this.setBookDetailError({ id, error: err });
                },
              }),
              catchError(() => of(null)),
            ),
          3,
        ),
      )
      .subscribe({
        complete: () => this.setDetailsFullyLoaded(true),
      });
  }
}
