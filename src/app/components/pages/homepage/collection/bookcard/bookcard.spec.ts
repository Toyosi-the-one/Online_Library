import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bookcard } from './bookcard';

describe('Bookcard', () => {
  let component: Bookcard;
  let fixture: ComponentFixture<Bookcard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bookcard],
    }).compileComponents();

    fixture = TestBed.createComponent(Bookcard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
