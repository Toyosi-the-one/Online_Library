import { Component, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, filter, distinctUntilChanged, switchMap, shareReplay } from 'rxjs';

import { BookStore } from '../../../store/book.store';
import { Book } from '../../../services/bookscleaned';

@Component({
  selector: 'app-details',
  templateUrl: './detailspage.html',
  styleUrls: ['./detailspage.scss'],
  imports: [CommonModule],
  standalone: true,
})
export class Detailspage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookStore = inject(BookStore);

  // This is the ViewModel observable
  readonly vm$ = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    filter((id): id is string => !!id),
    distinctUntilChanged(),
    switchMap((id) => {
      console.log(`🆔 Loading book ID: ${id}`);
      this.bookStore.loadBookDetails(id);

      return this.bookStore
        .select((state) => ({
          book: state.detailsById[id] || null,
          loading: !!state.detailsLoadingById[id],
          error: state.detailsErrorById[id] || null,
        }))
        .pipe(
          map(({ book, loading, error }) => ({
            book,
            loading: loading && !book,
            error: !book && !loading ? `Book with ID "${id}" not found` : error,
          })),
        );
    }),
    shareReplay(1),
    takeUntilDestroyed(this.destroyRef),
  );

  goBack(): void {
    this.router.navigate(['/']);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) img.style.display = 'none';
  }
}
