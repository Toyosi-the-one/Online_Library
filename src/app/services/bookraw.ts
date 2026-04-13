import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookRawService {
  private apiUrl = '/openlibrary/search.json?q=fiction&limit=200';

  constructor(private http: HttpClient) { }

  // Returns raw API data
  getRawBooks(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Fetch detailed book info by key (e.g., "/works/OL12345W" or "OL12345W")
  getBookByKey(key: string): Observable<any> {
    // Ensure key has the proper format
    const formattedKey = key.startsWith('/') ? key : `/works/${key}`;
    const url = `/openlibrary${formattedKey}.json`;
    return this.http.get<any>(url);
  }
}