import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // ← ADD THIS
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Book } from '../../../services/bookscleaned';
import { Bookcard } from '../../../components/pages/homepage/collection/bookcard/bookcard';
import { Search } from '../../../services/search';
import { BookStore } from '../../../store/book.store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-delete-books',
  standalone: true,
  imports: [
    CommonModule,
    Bookcard,
    RouterLink,
    FormsModule, // ← ADD THIS LINE
  ],
  templateUrl: './deletebook.html',
  styleUrls: ['./deletebook.scss'],
})
export class DeleteBook implements OnInit, OnDestroy {
  books$!: Observable<Book[]>;
  totalFetched$!: Observable<number>;
  bookLimit$!: Observable<number>;

  allBooks: Book[] = [];
  filteredBooks: Book[] = [];
  pagedBooks: Book[] = [];
  lastSearchTerm = '';

  totalFetched = 40;
  bookLimit = 20;
  currentPage = 1;
  totalPages = 1;

  selectedBook: Book | null = null;
  deleting = false;

  private readonly destroy$ = new Subject<void>();

  private readonly bookStore = inject(BookStore);
  private readonly search = inject(Search);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.books$ = this.bookStore.books$;
    this.totalFetched$ = this.bookStore.totalFetched$;
    this.bookLimit$ = this.bookStore.bookLimit$;

    this.loadBooks();

    // Subscribe to books
    this.books$.pipe(takeUntil(this.destroy$)).subscribe((data: Book[]) => {
      this.allBooks = Array.isArray(data) ? data : [];
      this.applyFiltersAndPaginate({ resetToFirstPage: true });
      this.cdr.markForCheck();
    });

    this.totalFetched$.pipe(takeUntil(this.destroy$)).subscribe((value: number) => {
      this.totalFetched = value ?? 40;
      this.applyFiltersAndPaginate({ resetToFirstPage: true });
      this.cdr.markForCheck();
    });

    this.bookLimit$.pipe(takeUntil(this.destroy$)).subscribe((value: number) => {
      this.bookLimit = value ?? 20;
      this.applyFiltersAndPaginate({ resetToFirstPage: true });
      this.cdr.markForCheck();
    });

    this.search.searchTerm$
      .pipe(takeUntil(this.destroy$))
      .subscribe((term: string | null | undefined) => {
        this.lastSearchTerm = (term || '').trim();
        this.applyFiltersAndPaginate({ resetToFirstPage: true });
        this.cdr.markForCheck();
      });
  }

  private loadBooks(): void {
    this.bookStore.loadBooks({ force: true });
  }

  private applyFiltersAndPaginate(opts?: { resetToFirstPage?: boolean }) {
    const reset = opts?.resetToFirstPage ?? false;
    const term = this.lastSearchTerm.toLowerCase();

    let books = this.allBooks.slice(0, this.totalFetched);

    this.filteredBooks = term
      ? books.filter(
          (book) =>
            (book.title || '').toLowerCase().includes(term) ||
            (book.author || '').toLowerCase().includes(term),
        )
      : [...books];

    if (reset) this.currentPage = 1;
    this.updateTotalPages();
    this.updatePagedBooks();
  }

  private updateTotalPages() {
    const limit = Math.max(1, Number(this.bookLimit) || 20);
    this.totalPages = Math.ceil(this.filteredBooks.length / limit);
  }

  private updatePagedBooks() {
    const limit = Math.max(1, Number(this.bookLimit) || 20);
    const start = (this.currentPage - 1) * limit;
    this.pagedBooks = this.filteredBooks.slice(start, start + limit);
  }

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

  // ==================== DELETE FUNCTIONALITY ====================

  selectBookForDelete(book: Book) {
    this.selectedBook = book;
  }

  confirmDelete() {
    const book = this.selectedBook;
    if (!book?.id) return;

    const bookTitle = book.title || 'this book';

    if (
      !confirm(`Are you sure you want to delete "${bookTitle}"?\n\nThis action cannot be undone.`)
    ) {
      this.cancelDelete();
      return;
    }

    this.deleting = true;

    this.bookStore.deleteBook(book.id);

    this.selectedBook = null;
    this.deleting = false;

    setTimeout(() => {
      alert(`✅ "${bookTitle}" has been deleted successfully.`);
    }, 400);
  }

  cancelDelete() {
    this.selectedBook = null;
  }

  // Handle broken book cover images
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/images/no-cover.png';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
