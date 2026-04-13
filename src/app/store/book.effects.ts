import { Injectable, inject } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { of, from } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as BookActions from './book.actions';
import { Bookscleaned } from '../services/bookscleaned'; // Service for fetching cleaned book data

// NgRx Effects class that handles side effects for book-related actions
// Effects listen to actions and perform async operations like API calls
@Injectable()
export class BookEffects {
  // Injected dependencies using Angular's inject function
  private actions$ = inject(Actions); // Stream of all dispatched actions
  private cleanedService = inject(Bookscleaned); // Service to fetch book data
  private store = inject(Store<{ books: any }>); // NgRx store for state access

  // Effect that handles loading the list of books
  // Listens for loadBooks action and fetches books if not already loaded
  loadBooks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookActions.loadBooks), // Filter for loadBooks actions
      withLatestFrom(this.store.select(state => state.books.loaded)), // Get current loaded state
      mergeMap(([action, loaded]) => {
        // If books are already loaded, return success with empty array
        if (loaded) {
          return of(BookActions.loadBooksSuccess({ books: [] }));
        }

        // Call the service to fetch cleaned book data
        return this.cleanedService.getCleanedBooks().pipe(
          map(books => BookActions.loadBooksSuccess({ books })), // Dispatch success with fetched books
          catchError(error => of(BookActions.loadBooksFailure({ error }))) // Dispatch failure on error
        );
      })
    )
  );

  // Effect that handles loading details for a specific book
  // Checks if details are already cached, otherwise fetches from service
  loadBookDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookActions.loadBookDetails), // Filter for loadBookDetails actions
      withLatestFrom(this.store.select(state => state.books.detailsById)), // Get current cached details
      mergeMap(([{ id }, detailsById]) => {
        // If this book's details are already cached, return success immediately
        if (detailsById?.[id]) {
          return of(BookActions.loadBookDetailsSuccess({ id, book: detailsById[id] }));
        }

        // Fetch book details from the service
        return this.cleanedService.getCleanedBookDetails(id).pipe(
          map(book => BookActions.loadBookDetailsSuccess({ id, book })), // Dispatch success with book details
          catchError(error => of(BookActions.loadBookDetailsFailure({ id, error }))) // Dispatch failure on error
        );
      })
    )
  );

  // Effect that preloads book details for all books after the list is loaded
  // Ccaching bookdetails in the background
  preloadBookDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookActions.loadBooksSuccess), // Trigger after books list is successfully loaded
      withLatestFrom(this.store.select(state => state.books.detailsById)), // Get current cached details
      switchMap(([{ books }, detailsById]) => {
        // Find book keys that don't have details cached yet
        const keysToFetch = books
          .filter(book => book.key && !detailsById?.[book.key.replace('/works/', '')])
          .map(book => book.key.replace('/works/', ''));

        
        if (keysToFetch.length === 0) {
          return of();
        }

        
        return from(keysToFetch).pipe(
          mergeMap(
            key =>
              this.cleanedService.getCleanedBookDetails(key).pipe(
                map(book => BookActions.loadBookDetailsSuccess({ id: key, book })), // Cache the fetched details
                catchError(error => of(BookActions.loadBookDetailsFailure({ id: key, error }))) // Handle fetch errors
              ),
            3 // Limit to 3 concurrent requests to avoid overwhelming the API
          )
        );
      })
    )
  );
}
