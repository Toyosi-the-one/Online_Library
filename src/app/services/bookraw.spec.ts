import { TestBed } from '@angular/core/testing';

import { BookRawService } from './bookraw';

describe('BookRawService', () => {
  let service: BookRawService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookRawService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
