import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { BookStore } from '../store/book.store';
import { firstValueFrom } from 'rxjs';
import { filter, take } from 'rxjs/operators';

/**
 * Book Detail Resolver
 *
 * This resolver:
 * - Checks if the book is already cached in the store
 * - If cached → returns it immediately (no extra request)
 * - If not cached → triggers the load and waits for the result
 * - Returns the book to the component
 */
export const bookDetailResolver: ResolveFn<any> = async (route: ActivatedRouteSnapshot) => {
  const bookStore = inject(BookStore);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) {
    console.error('❌ Resolver: No book ID found in route');
    router.navigate(['/']);
    return null;
  }

  console.log(`🔄 Resolver started for book ID: ${id}`);

  // Trigger the load (this is safe to call from outside)
  bookStore.loadBookDetails(id);

  // Wait for the book to be available in the store
  try {
    const book = await firstValueFrom(
      bookStore
        .select((state) => state.detailsById[id])
        .pipe(
          // Wait until the book is loaded (value is no longer undefined)
          filter((book) => book !== undefined),
          // Take only the first result
          take(1),
        ),
    );

    if (book) {
      console.log(`✅ Resolver: Book loaded successfully - "${book.title}"`);
    } else {
      console.warn(`⚠️ Resolver: Book with ID "${id}" not found`);
    }

    return book || null;
  } catch (error) {
    console.error('❌ Resolver failed to load book:', error);
    return null;
  }
};
