import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bookscleaned, Book } from '../../../../services/bookscleaned';
import { Bookcard } from '../../../../components/pages/homepage/collection/bookcard/bookcard';
import { Search } from '../../../../services/search';
import { Router } from '@angular/router';

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
    private search: Search,
    private cdr: ChangeDetectorRef,
    private router: Router // <- make sure Router is injected
  ) { }

  ngOnInit(): void {
    this.cleanedService.getCleanedBooks().subscribe(data => {
      this.books = data;
      this.filteredBooks = data;

      this.search.searchTerm$.subscribe(term => {
        this.filterBooks(term);
      });
    });
  }

  filterBooks(term: string) {
    if (!term) {
      this.filteredBooks = this.books;
    } else {
      this.filteredBooks = this.books.filter(book =>
        book.title.toLowerCase().includes(term.toLowerCase())
      );
    }
    this.cdr.detectChanges();
  }

  // <- Paste your goToDetails here, inside the Collection class
  goToDetails(book: any) {
    console.log('BOOK CLICKED:', book);
    console.log('BOOK KEY:', book.key);

    const id = book.key?.replace('/works/', '');
    console.log('FINAL ID:', id);

    this.router.navigate(['/details', id]);
  }
}