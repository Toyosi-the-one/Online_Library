import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from '../../../../services/bookscleaned';
import { Bookcard } from '../../../../components/pages/homepage/collection/bookcard/bookcard';
import { Search } from '../../../../services/search';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { loadBooks, setTotalFetched, setBookLimit } from '../../../../store/book.actions';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, Bookcard, FormsModule],
  templateUrl: './collection.html',
  styleUrls: ['./collection.scss'],
})
export class Collection implements OnInit, OnDestroy {
  // Observable stream of the full book list from the NgRx store
  books$: Observable<Book[]>;       

  // Observable streams for dropdown values stored in NgRx
  totalFetched$: Observable<number>;
  bookLimit$: Observable<number>;

  // Used to unsubscribe from all observable subscriptions in ngOnDestroy
  private readonly destroy$ = new Subject<void>();

  // Cache of all loaded books for filtering / pagination
  private allBooks: Book[] = [];

  // Current search term used to filter the book list
  private lastSearchTerm = '';

  // Local values used by the dropdown controls
  totalFetched = 40;   
  bookLimit = 20;      

  // Filtered and paged book lists displayed by the UI
  filteredBooks: Book[] = [];
  pagedBooks: Book[] = [];

  // Pagination state
  currentPage = 1;
  totalPages = 1;

  constructor(
    private store: Store<{ books: any }>,  // 🔥 inject store
    private search: Search,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.books$ = this.store.select(state => state.books.books);
    this.totalFetched$ = this.store.select(state => state.books.totalFetched);
    this.bookLimit$ = this.store.select(state => state.books.bookLimit);
  }

  ngOnInit(): void {
    // 🔥 dispatch loadBooks only if not already loaded
    this.store.select(state => state.books.loaded).pipe(
      takeUntil(this.destroy$)
    ).subscribe(loaded => {
      if (!loaded) {
        this.store.dispatch(loadBooks());
      }
    });

    // subscribe to dropdown values from store
    this.totalFetched$.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.totalFetched = value;
      this.applyFiltersAndPaginate({ resetToFirstPage: true });
      this.cdr.detectChanges();
    });

    this.bookLimit$.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.bookLimit = value;
      this.applyFiltersAndPaginate({ resetToFirstPage: true });
      this.cdr.detectChanges();
    });

    // subscribe to store updates
    this.books$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.allBooks = Array.isArray(data) ? data : [];
      this.applyFiltersAndPaginate({ resetToFirstPage: true });
      this.cdr.detectChanges();
    });

    // subscribe to search
    this.search.searchTerm$.pipe(takeUntil(this.destroy$)).subscribe(term => {
      this.lastSearchTerm = term || '';
      this.applyFiltersAndPaginate({ resetToFirstPage: true });
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to avoid memory leaks
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyFiltersAndPaginate(opts?: { resetToFirstPage?: boolean }) {
    const resetToFirstPage = opts?.resetToFirstPage ?? false;

    // Slice the loaded books to the selected fetch limit
    const books = this.allBooks.slice(0, this.totalFetched);
    const term = (this.lastSearchTerm || '').trim().toLowerCase();

    // Filter books by the search term if one exists
    if (!term) {
      this.filteredBooks = [...books];
    } else {
      this.filteredBooks = books.filter(book =>
        (book.title || '').toLowerCase().includes(term)
      );
    }

    if (resetToFirstPage) {
      this.currentPage = 1;
    }

    // Recalculate the number of pages and the current page slice
    this.updateTotalPages();

    if (this.totalPages > 0 && this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    this.updatePagedBooks();
  }

  // Recalculate total pages based on the current filtered list and items per page
  updateTotalPages() {
    const limit = Math.max(1, Number(this.bookLimit) || 1);
    this.totalPages = Math.ceil(this.filteredBooks.length / limit);
  }

  // Update the currently visible page of books
  updatePagedBooks() {
    const limit = Math.max(1, Number(this.bookLimit) || 1);
    const start = (this.currentPage - 1) * limit;
    const end = start + limit;
    this.pagedBooks = this.filteredBooks.slice(start, end);
  }

  // Dispatch the fetch size update to NgRx state
  onTotalFetchedChange() {
    this.store.dispatch(setTotalFetched({ totalFetched: this.totalFetched }));
  }

  // Dispatch the page size update to NgRx state
  onBookLimitChange() {
    this.store.dispatch(setBookLimit({ bookLimit: this.bookLimit }));
  }

  // Navigate to the previous page of results
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedBooks();
    }
  }

  // Navigate to the next page of results
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedBooks();
    }
  }

  // Navigate to the details page for the selected book
  goToDetails(book: Book) {
    if (!book.key) {
      return;
    }

    const id = book.key.replace('/works/', '');
    if (!id) {
      return;
    }

    this.router.navigate(['/details', id]);
  }
}