import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { Main } from '../pages/homepage/main/main';

@Component({
  selector: 'app-background',
  standalone: true,
  imports: [Header, Footer, Main],
  templateUrl: './background.html',
  styleUrls: ['./background.scss'],
})
export class Background { }