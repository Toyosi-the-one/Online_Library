import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Background } from './components/background/background';
//import { Header } from './components/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Background /*, Header*/],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('OnlineLibrary');
}
