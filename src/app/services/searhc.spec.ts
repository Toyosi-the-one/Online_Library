import { TestBed } from '@angular/core/testing';

import { Searhc } from './searhc';

describe('Searhc', () => {
  let service: Searhc;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Searhc);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
