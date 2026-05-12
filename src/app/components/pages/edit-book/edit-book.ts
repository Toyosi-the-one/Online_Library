import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { Book } from '../../../services/bookscleaned';
import { Bookcard } from '../../../components/pages/homepage/collection/bookcard/bookcard';
import { Search } from '../../../services/search';
import { BookStore } from '../../../store/book.store';

@Component({
  selector: 'app-edit-books',
  standalone: true,
  imports: [CommonModule, Bookcard, FormsModule, RouterLink],
  templateUrl: './edit-book.html',
  styleUrls: ['./edit-book.scss'],
})
export class EditBook implements OnInit, OnDestroy {
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
  isEditing = false;
  saving = false;

  private readonly destroy$ = new Subject<void>();

  private readonly bookStore = inject(BookStore);
  private readonly search = inject(Search);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.books$ = this.bookStore.books$;
    this.totalFetched$ = this.bookStore.totalFetched$;
    this.bookLimit$ = this.bookStore.bookLimit$;

    this.loadBooks();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.loadBooks());

    this.books$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.allBooks = Array.isArray(data) ? data : [];
      this.applyFiltersAndPaginate({ resetToFirstPage: true });
      this.cdr.markForCheck();
    });

    this.totalFetched$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.totalFetched = value ?? 40;
      this.applyFiltersAndPaginate({ resetToFirstPage: true });
      this.cdr.markForCheck();
    });

    this.bookLimit$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.bookLimit = value ?? 20;
      this.applyFiltersAndPaginate({ resetToFirstPage: true });
      this.cdr.markForCheck();
    });

    this.search.searchTerm$.pipe(takeUntil(this.destroy$)).subscribe((term) => {
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

  editBook(book: Book) {
    this.selectedBook = { ...book };
    this.isEditing = true;
  }

  saveBook() {
    if (!this.selectedBook) return;

    const title = (this.selectedBook.title || '').trim();
    const author = (this.selectedBook.author || '').trim();

    if (title.length < 2 || author.length < 2) {
      alert('❌ Title and Author are required!');
      return;
    }

    this.saving = true;

    this.bookStore.updateBook(this.selectedBook);

    alert('✅ Book updated successfully!');
    this.cancelEdit();
    this.saving = false;
  }

  cancelEdit() {
    this.isEditing = false;
    this.selectedBook = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
