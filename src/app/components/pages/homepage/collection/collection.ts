import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from '../../../../services/bookscleaned';
import { Bookcard } from '../../../../components/pages/homepage/collection/bookcard/bookcard';
import { Search } from '../../../../services/search';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BookStore } from '../../../../store/book.store';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, Bookcard, FormsModule],
  templateUrl: './collection.html',
  styleUrls: ['./collection.scss'],
})
export class Collection implements OnInit, OnDestroy {

  // ✅ FIXED: declare first (no initialization here)
  books$!: Observable<Book[]>;
  totalFetched$!: Observable<number>;
  bookLimit$!: Observable<number>;

  private readonly destroy$ = new Subject<void>();

  private allBooks: Book[] = [];
  private lastSearchTerm = '';

  totalFetched = 40;
  bookLimit = 20;

  filteredBooks: Book[] = [];
  pagedBooks: Book[] = [];

  currentPage = 1;
  totalPages = 1;

  constructor(
    private bookStore: BookStore,
    private search: Search,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    // ✅ FIX: initialize here (after constructor runs)
    this.books$ = this.bookStore.books$;
    this.totalFetched$ = this.bookStore.totalFetched$;
    this.bookLimit$ = this.bookStore.bookLimit$;

    // ✅ load books
    this.bookStore.loadBooks();

    // dropdown values
    this.totalFetched$
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.totalFetched = value;
        this.applyFiltersAndPaginate({ resetToFirstPage: true });
        this.cdr.detectChanges();
      });

    this.bookLimit$
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.bookLimit = value;
        this.applyFiltersAndPaginate({ resetToFirstPage: true });
        this.cdr.detectChanges();
      });

    // books stream
    this.books$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.allBooks = Array.isArray(data) ? data : [];
        this.applyFiltersAndPaginate({ resetToFirstPage: true });
        this.cdr.detectChanges();
      });

    // search stream
    this.search.searchTerm$
      .pipe(takeUntil(this.destroy$))
      .subscribe(term => {
        this.lastSearchTerm = term || '';
        this.applyFiltersAndPaginate({ resetToFirstPage: true });
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyFiltersAndPaginate(opts?: { resetToFirstPage?: boolean }) {
    const resetToFirstPage = opts?.resetToFirstPage ?? false;

    const books = this.allBooks.slice(0, this.totalFetched);
    const term = (this.lastSearchTerm || '').trim().toLowerCase();

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

    this.updateTotalPages();

    if (this.totalPages > 0 && this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    this.updatePagedBooks();
  }

  updateTotalPages() {
    const limit = Math.max(1, Number(this.bookLimit) || 1);
    this.totalPages = Math.ceil(this.filteredBooks.length / limit);
  }

  updatePagedBooks() {
    const limit = Math.max(1, Number(this.bookLimit) || 1);
    const start = (this.currentPage - 1) * limit;
    const end = start + limit;
    this.pagedBooks = this.filteredBooks.slice(start, end);
  }

  // ✅ Component Store updater usage
  onTotalFetchedChange() {
    this.bookStore.setTotalFetched(this.totalFetched);
  }

  onBookLimitChange() {
    this.bookStore.setBookLimit(this.bookLimit);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedBooks();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedBooks();
    }
  }

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