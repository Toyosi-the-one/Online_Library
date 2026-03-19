import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookRawService {
  private apiUrl = 'https://openlibrary.org/search.json?q=fiction&limit=250';

  constructor(private http: HttpClient) { }

  // Returns raw API data
  getRawBooks(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}