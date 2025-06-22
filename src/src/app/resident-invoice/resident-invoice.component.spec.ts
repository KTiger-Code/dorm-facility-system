import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidentInvoice } from './resident-invoice.component';

describe('ResidentInvoice', () => {
  let component: ResidentInvoice;
  let fixture: ComponentFixture<ResidentInvoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentInvoice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResidentInvoice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
