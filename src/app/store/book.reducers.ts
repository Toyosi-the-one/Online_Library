import { createReducer, on } from '@ngrx/store';
import * as BookActions from './book.actions';

// The shape of the book feature state stored in NgRx
export interface BookState {
    books: any[];
    loading: boolean;
    error: any;
    loaded: boolean;
    detailsById: Record<string, any>;
    detailsLoadingById: Record<string, boolean>;
    detailsErrorById: Record<string, any>;
    totalFetched: number;
    bookLimit: number;
}

// Initial default state for the book feature
export const initialState: BookState = {
    books: [],
    loading: false,
    error: null,
    loaded: false,
    detailsById: {},
    detailsLoadingById: {},
    detailsErrorById: {},
    totalFetched: 40,
    bookLimit: 20
};

export const bookReducer = createReducer(
    initialState,

    // Start book list loading
    on(BookActions.loadBooks, state => ({
        ...state,
        loading: true
    })),

    // Save loaded books and mark as loaded
    on(BookActions.loadBooksSuccess, (state, { books }) => ({
        ...state,
        books,
        loading: false,
        loaded: true
    })),

    // Track book list fetch failures
    on(BookActions.loadBooksFailure, (state, { error }) => ({
        ...state,
        error,
        loading: false
    })),

    // Mark a single book detail request as loading
    on(BookActions.loadBookDetails, (state, { id }) => ({
        ...state,
        detailsLoadingById: { ...state.detailsLoadingById, [id]: true },
        detailsErrorById: { ...state.detailsErrorById, [id]: null }
    })),

    // Save a fetched book detail by id
    on(BookActions.loadBookDetailsSuccess, (state, { id, book }) => ({
        ...state,
        detailsById: { ...state.detailsById, [id]: book },
        detailsLoadingById: { ...state.detailsLoadingById, [id]: false }
    })),

    // Track book detail fetch errors
    on(BookActions.loadBookDetailsFailure, (state, { id, error }) => ({
        ...state,
        detailsLoadingById: { ...state.detailsLoadingById, [id]: false },
        detailsErrorById: { ...state.detailsErrorById, [id]: error }
    })),

    // Update how many books should be fetched from the API/store
    on(BookActions.setTotalFetched, (state, { totalFetched }) => ({
        ...state,
        totalFetched
    })),

    // Update how many books are shown per page in the UI
    on(BookActions.setBookLimit, (state, { bookLimit }) => ({
        ...state,
        bookLimit
    }))
);