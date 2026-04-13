import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { map, filter, tap, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { loadBookDetails } from '../../../store/book.actions';

@Component({
  selector: 'app-details',
  templateUrl: './detailspage.html',
  styleUrls: ['./detailspage.scss'],
  imports: [CommonModule],
  standalone: true
})
export class Detailspage implements OnInit, OnDestroy {
  // The current book detail object loaded from the store
  book: any = null;

  // Loading and error flags used by the template
  loading = false;
  error: any = null;

  // Subject used to unsubscribe from observables when this component is destroyed
  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<{ books: any }>,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Listen for route parameter changes and load the correct book details
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter((id): id is string => !!id),
      distinctUntilChanged(),
      tap(id => {
        // Reset existing state while new details are fetched
        this.book = null;
        this.loading = true;
        this.error = null;

        // Dispatch the action to load book details from the store/effects
        this.store.dispatch(loadBookDetails({ id }));
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    ).subscribe(id => {
      // Subscribe to the selected book detail from the store
      this.store.select(state => state.books.detailsById?.[id])
        .pipe(takeUntil(this.destroy$))
        .subscribe(book => {
          if (book) {
            this.book = book;
            this.loading = false;
            this.cdr.detectChanges();
          }
        });

      // Subscribe to loading state for this book id
      this.store.select(state => state.books.detailsLoadingById?.[id])
        .pipe(takeUntil(this.destroy$))
        .subscribe(isLoading => {
          this.loading = !!isLoading;
          this.cdr.detectChanges();
        });

      // Subscribe to error state for this book id
      this.store.select(state => state.books.detailsErrorById?.[id])
        .pipe(takeUntil(this.destroy$))
        .subscribe(err => {
          this.error = err;
          this.cdr.detectChanges();
        });
    });
  }

  ngOnDestroy() {
    // Clean up subscriptions when the component is destroyed
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Smart method: returns the first valid cover ID (skips -1, 0, etc.)
  getBestCover(covers: number[] | undefined): number | null {
    if (!covers || covers.length === 0) return null;

    // Find the first cover ID that looks valid (greater than 10)
    return covers.find(id => id && id > 10) || null;
  }

  // Hide the image element if the cover fails to load
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    console.warn('Cover image failed to load and was hidden');
  }

  // Remove HTML tags from description strings for safe display
  cleanHtml(text: string): string {
    return text.replace(/<[^>]*>/g, '');
  }

  // Navigate back to the collection page
  goBack() {
    this.router.navigate(['/']);
  }

}
