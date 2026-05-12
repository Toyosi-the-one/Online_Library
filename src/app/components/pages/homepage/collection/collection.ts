import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from '../../../../services/bookscleaned';
import { Bookcard } from '../../../../components/pages/homepage/collection/bookcard/bookcard';
import { Search } from '../../../../services/search';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { BookStore } from '../../../../store/book.store';
import { debugLog } from '../../../../utils/log';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, Bookcard, FormsModule, RouterLink],
  templateUrl: './collection.html',
  styleUrls: ['./collection.scss'],
})
export class Collection implements OnInit, OnDestroy {
  // Observables
  books$!: Observable<Book[]>;
  totalFetched$!: Observable<number>;
  bookLimit$!: Observable<number>;

  private readonly destroy$ = new Subject<void>();

  // Local state
  allBooks: Book[] = [];
  filteredBooks: Book[] = [];
  pagedBooks: Book[] = [];

  lastSearchTerm = '';
  totalFetched = 40;
  bookLimit = 20;
  currentPage = 1;
  totalPages = 1;

  // Injected services
  private readonly bookStore = inject(BookStore);
  private readonly search = inject(Search);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.books$ = this.bookStore.books$;
    this.totalFetched$ = this.bookStore.totalFetched$;
    this.bookLimit$ = this.bookStore.bookLimit$;

    // Initial load
    this.loadBooks();

    // Reload books when returning via back button or navigation
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        debugLog('🔄 NavigationEnd detected - reloading collection');
        this.loadBooks();
      });

    // Subscribe to books
    this.books$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.allBooks = Array.isArray(data) ? data : [];
      this.applyFiltersAndPaginate({ resetToFirstPage: true });
      this.cdr.detectChanges();
    });

    // Total Fetched
    this.totalFetched$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.totalFetched = value;
      this.applyFiltersAndPaginate({ resetToFirstPage: true });
      this.cdr.detectChanges();
    });

    // Books per page
    this.bookLimit$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.bookLimit = value;
      this.applyFiltersAndPaginate({ resetToFirstPage: true });
      this.cdr.detectChanges();
    });

    // Search
    this.search.searchTerm$.pipe(takeUntil(this.destroy$)).subscribe((term) => {
      this.lastSearchTerm = (term || '').trim();
      this.applyFiltersAndPaginate({ resetToFirstPage: true });
      this.cdr.detectChanges();
    });
  }

  private loadBooks(): void {
    this.bookStore.loadBooks({ force: true }); // Always force reload on revisit
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========================
  // FILTER + PAGINATION
  // ========================
  private applyFiltersAndPaginate(opts?: { resetToFirstPage?: boolean }) {
    const reset = opts?.resetToFirstPage ?? false;
    const term = this.lastSearchTerm.toLowerCase();

    let books = this.allBooks.slice(0, this.totalFetched);

    this.filteredBooks = term
      ? books.filter((book) => (book.title || '').toLowerCase().includes(term))
      : [...books];

    if (reset) this.currentPage = 1;

    this.updateTotalPages();
    this.updatePagedBooks();
    this.cdr.detectChanges();
  }

  private updateTotalPages() {
    const limit = Math.max(1, Number(this.bookLimit) || 20);
    this.totalPages = Math.ceil(this.filteredBooks.length / limit);
  }

  private updatePagedBooks() {
    const limit = Math.max(1, Number(this.bookLimit) || 20);
    const start = (this.currentPage - 1) * limit;
    const end = start + limit;
    this.pagedBooks = this.filteredBooks.slice(start, end);
  }

  // ========================
  // STORE UPDATES
  // ========================
  onTotalFetchedChange() {
    this.bookStore.setTotalFetched(this.totalFetched);
  }

  onBookLimitChange() {
    this.bookStore.setBookLimit(this.bookLimit);
  }

  // ========================
  // PAGINATION
  // ========================
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedBooks();
      this.cdr.detectChanges();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedBooks();
      this.cdr.detectChanges();
    }
  }

  // ========================
  // NAVIGATION
  // ========================
  goToDetails(book: Book) {
    if (book?.id) {
      this.router.navigate(['/details', book.id]);
    }
  }
}
