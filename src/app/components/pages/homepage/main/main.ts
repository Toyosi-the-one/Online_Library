import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet], // ✅ REQUIRED
  templateUrl: './main.html',
  styleUrls: ['./main.scss'],
})
export class Main {}
