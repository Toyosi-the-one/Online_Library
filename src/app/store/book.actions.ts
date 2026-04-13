import { createAction, props } from '@ngrx/store';

// Load the list of books from the service or API
export const loadBooks = createAction('[Book] Load Books');

// Dispatch when books are successfully loaded into the store
export const loadBooksSuccess = createAction(
  '[Book] Load Books Success',
  props<{ books: any[] }>()
);

// Dispatch when loading books fails
export const loadBooksFailure = createAction(
  '[Book] Load Books Failure',
  props<{ error: any }>()
);

// Load details for a single book by its id
export const loadBookDetails = createAction(
  '[Book] Load Book Details',
  props<{ id: string }>()
);

// Dispatch when the book detail is successfully fetched
export const loadBookDetailsSuccess = createAction(
  '[Book] Load Book Details Success',
  props<{ id: string; book: any }>()
);

// Dispatch when the book detail fetch fails
export const loadBookDetailsFailure = createAction(
  '[Book] Load Book Details Failure',
  props<{ id: string; error: any }>()
);

// Update how many books should be fetched from the backend/store
export const setTotalFetched = createAction(
  '[Book] Set Total Fetched',
  props<{ totalFetched: number }>()
);

// Update how many books should display on each page
export const setBookLimit = createAction(
  '[Book] Set Book Limit',
  props<{ bookLimit: number }>()
);