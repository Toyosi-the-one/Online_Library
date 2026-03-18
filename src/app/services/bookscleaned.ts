import { Injectable } from '@angular/core';
import { BookRawService } from './bookraw';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface Book {
  title: string;
  author: string;
  coverImage: string;
  isbn: string;
  publishYear: number;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class Bookscleaned {
  constructor(private book: BookRawService) { }

  // Returns cleaned array ready for UI
  getCleanedBooks(): Observable<Book[]> {
    return this.book.getRawBooks().pipe(
      map(res =>
        res.docs.map((item: any) => ({
          title: item.title,
          author: item.author_name?.[0] || 'Unknown',
          coverImage: item.cover_i
            ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`
            : 'https://via.placeholder.com/150',
          isbn: item.isbn?.[0] || 'N/A',
          publishYear: item.first_publish_year || 0,
          description: item.subject?.slice(0, 3)?.join(', ') || 'No description',
        }))
      )
    );
  }
}