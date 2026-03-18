import { Component } from '@angular/core';
import { Collection } from '../collection/collection';
@Component({
  selector: 'app-main',
  imports: [ Collection],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {}
