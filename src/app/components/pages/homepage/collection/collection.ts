import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bookscleaned, Book } from '../../../../services/bookscleaned';
import { Bookcard } from '../../../../components/pages/homepage/collection/bookcard/bookcard';
import { SearchService } from '../../../../services/search';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, Bookcard],
  templateUrl: './collection.html',
  styleUrls: ['./collection.scss'],
})
export class Collection implements OnInit {
  books: Book[] = [];
  filteredBooks: Book[] = [];

  constructor(
    private cleanedService: Bookscleaned,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cleanedService.getCleanedBooks().subscribe(data => {
      this.books = data;
      this.filteredBooks = data; // initialize

      // subscribe to service AFTER books are loaded
      this.searchService.searchTerm$.subscribe(term => {
        this.filterBooks(term);
      });
    });
  }

  filterBooks(term: string) {
    if (!term) {
      this.filteredBooks = this.books; // reset if empty
    } else {
      this.filteredBooks = this.books.filter(book =>
        book.title.toLowerCase().includes(term.toLowerCase())
      );
    }
    this.cdr.detectChanges(); // ensures UI updates
  }
}