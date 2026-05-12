import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Book } from '../../../../../services/bookscleaned';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bookcard',
  standalone: true,
  templateUrl: './bookcard.html',
  styleUrls: ['./bookcard.scss'],
  imports: [CommonModule],
})
export class Bookcard {
  @Input() book!: Book;

  // emit an event when the card is clicked
  @Output() select = new EventEmitter<Book>();

  onClick() {
    this.select.emit(this.book);
  }
}