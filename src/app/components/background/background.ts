import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { Main } from '../pages/homepage/main/main';
@Component({
  selector: 'app-background',
  imports: [Header, Footer, Main],
  templateUrl: './background.html',
  styleUrl: './background.scss',
})
export class Background {}
