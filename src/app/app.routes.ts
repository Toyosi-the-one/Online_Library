import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/pages/homepage/collection/collection')
        .then(m => m.Collection)
  },
  {
    path: 'details/:id',
    loadComponent: () =>
      import('./components/pages/detailspage/detailspage')
        .then(m => m.Detailspage)
  }
];