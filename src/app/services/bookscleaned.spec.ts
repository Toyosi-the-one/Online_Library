import { TestBed } from '@angular/core/testing';

import { Bookscleaned } from './bookscleaned';

describe('Bookscleaned', () => {
  let service: Bookscleaned;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Bookscleaned);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
