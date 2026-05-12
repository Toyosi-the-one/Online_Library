import { Routes } from '@angular/router';
import { bookDetailResolver } from './resolvers/bookdetails.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/pages/homepage/collection/collection').then((m) => m.Collection),
  },

  {
    path: 'details/:id',
    loadComponent: () =>
      import('./components/pages/detailspage/detailspage').then((m) => m.Detailspage),
    resolve: { book: bookDetailResolver },
  },

  {
    path: 'editbook/:id',
    loadComponent: () => import('./components/pages/edit-book/edit-book').then((m) => m.EditBook),
    resolve: { book: bookDetailResolver },
  },

  {
    path: 'editbooks',
    loadComponent: () => import('./components/pages/edit-book/edit-book').then((m) => m.EditBook),
  },

  {
    path: 'addbook',
    loadComponent: () => import('./components/pages/add-book/add-book').then((m) => m.AddBook),
  },

  {
    path: 'deletebooks',
    loadComponent: () =>
      import('./components/pages/deletebook/deletebook').then((m) => m.DeleteBook),
  },

  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
