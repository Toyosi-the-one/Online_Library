import { Component, Input } from '@angular/core';
import { Book } from '../../../../../services/bookscleaned';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bookcard',
  templateUrl: './bookcard.html',
  styleUrls: ['./bookcard.scss'],
  imports:[CommonModule]
})
export class Bookcard {
  @Input() book!: Book; // receives one book object from CollectionComponent
}