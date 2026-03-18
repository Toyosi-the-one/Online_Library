import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../services/search';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './searchbar.html',
})
export class Searchbar {
  searchTerm: string = '';

  constructor(private searchService: SearchService) { }

  onSearch() {
    this.searchService.setSearchTerm(this.searchTerm); // broadcast
  }
}