import { Component } from '@angular/core';
import { Searchbar } from '../searchbar/searchbar';

@Component({
  selector: 'app-header',
  imports: [Searchbar],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {}
