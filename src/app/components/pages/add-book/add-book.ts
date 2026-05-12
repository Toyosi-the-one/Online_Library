import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { BookStore } from '../../../store/book.store';
import { Book } from '../../../services/bookscleaned';
import { BookRawService } from '../../../services/bookraw';
import { RouterLink } from "@angular/router";
import { debugLog, logError } from '../../../utils/log';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-book.html',
  styleUrls: ['./add-book.scss'],
})
export class AddBook implements OnInit {
  bookForm!: FormGroup;
  submitting = false;
  errorMessage = '';

  private readonly fb = inject(FormBuilder);
  private readonly bookStore = inject(BookStore);
  private readonly bookRawService = inject(BookRawService);

  ngOnInit() {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      coverImage: ['', Validators.maxLength(1000)],
      isbn: ['', Validators.maxLength(20)],
      publishYear: ['', [Validators.min(1000), Validators.max(2100)]],
      pages: ['', [Validators.min(1), Validators.max(10000)]],
      genre: ['', Validators.maxLength(100)],
      description: ['', Validators.maxLength(2000)],
    });
  }

  onSubmit() {
    this.errorMessage = '';

    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      this.errorMessage = 'Please fix the highlighted errors.';
      return;
    }

    this.submitting = true;

    const formValue = this.bookForm.value;

    const newBook: Book = {
      id: 'temp_' + Date.now().toString(36), // temporary ID until Firebase returns real one
      title: (formValue.title || '').trim(),
      author: (formValue.author || '').trim(),
      coverImage: (formValue.coverImage || '').trim(),
      isbn: (formValue.isbn || '').trim(),
      publishYear: formValue.publishYear ? Number(formValue.publishYear) : 0,
      description: (formValue.description || '').trim(),
      pages: formValue.pages ? Number(formValue.pages) : undefined,
      genre: (formValue.genre || '').trim() || undefined,
    };

    // Optional: Prevent very large base64 images
    if (newBook.coverImage.startsWith('data:image') && newBook.coverImage.length > 500000) {
      this.errorMessage =
        'Image is too large. Please use a smaller image or upload to Firebase Storage.';
      this.submitting = false;
      return;
    }

    debugLog('📤 Sending book to Firebase:', newBook);

    // Save to Firebase
    this.bookRawService
      .addBook(newBook)
      .then((savedBook) => {
        debugLog('✅ Firebase save successful:', savedBook);

        // Update local store with the real Firebase ID
        const bookToStore: Book = {
          ...newBook,
          id: savedBook.id || newBook.id,
        };

        this.bookStore.addBook(bookToStore);

        alert('✅ Book added successfully!');
        this.bookForm.reset();
        this.errorMessage = '';
      })
      .catch((err: any) => {
        logError('❌ Failed to save book to Firebase:', err);

        if (err.code === 'permission-denied') {
          this.errorMessage = 'Permission denied. Check your Firestore Security Rules.';
        } else if (err.code === 'invalid-argument') {
          this.errorMessage = 'Invalid data. Please check your fields.';
        } else {
          this.errorMessage = `Failed to save book: ${err.message || 'Unknown error'}`;
        }
      })
      .finally(() => {
        this.submitting = false;
      });
  }

  resetForm() {
    this.bookForm.reset();
    this.errorMessage = '';
  }
}
