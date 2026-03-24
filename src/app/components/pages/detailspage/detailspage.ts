import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-details',
  templateUrl: './detailspage.html',
  styleUrls: ['./detailspage.scss'],
  imports: [CommonModule],
  standalone: true
})
export class Detailspage implements OnInit {
  book: any = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) return;

      this.book = null;   // Show loading state

      this.http.get(`https://openlibrary.org/works/${id}.json`)
        .subscribe({
          next: (data: any) => {
            this.book = data;
            this.cdr.detectChanges();   // Ensure UI updates

            console.log('✅ Book loaded:', data.title);
            console.log('Covers count:', data.covers?.length);
          },
          error: (err) => {
            console.error('Failed to load book', err);
            this.cdr.detectChanges();
          }
        });
    });
  }

  // Smart method: returns the first valid cover ID (skips -1, 0, etc.)
  getBestCover(covers: number[] | undefined): number | null {
    if (!covers || covers.length === 0) return null;

    // Find the first cover ID that looks valid (greater than 10)
    return covers.find(id => id && id > 10) || null;
  }

  // Fallback if image fails to load
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    console.warn('Cover image failed to load and was hidden');
  }
}