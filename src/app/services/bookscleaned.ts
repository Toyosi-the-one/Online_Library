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
  key?: string;
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
          isbn: item.isbn?.find((i: string) => i.length === 10 || i.length === 13) || null, // only valid ISBNs
          publishYear: item.first_publish_year || 0,
          description: item.subject?.slice(0, 3)?.join(', ') || 'No description',
          key: item.key // Open Library key e.g., "/works/OL12345W"
        }))
      )
    );
  }
  // Get cleaned book details by key
  getCleanedBookDetails(key: string): Observable<Book> {
    return this.book.getBookByKey(key).pipe(
      map((item: any) => ({
        title: item.title,
        author: item.authors?.[0]?.name || item.author_name?.[0] || 'Unknown',
        coverImage: item.covers?.[0]
          ? `https://covers.openlibrary.org/b/id/${item.covers[0]}-M.jpg`
          : 'https://via.placeholder.com/300',
        isbn: item.isbn?.find((i: string) => i.length === 10 || i.length === 13) || null,
        publishYear: item.first_publish_year || item.publish_date?.[0]?.split('-')[0] || 0,
        description: item.description?.value || item.description || item.subject?.slice(0, 5)?.join(', ') || 'No description available',
        key: item.key,
        // Include raw data for the details page template
        covers: item.covers || [],
      } as any))
    );
  }}