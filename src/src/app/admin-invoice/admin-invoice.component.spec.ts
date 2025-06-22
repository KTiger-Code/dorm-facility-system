import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminInvoice } from './admin-invoice.component';

describe('AdminInvoice', () => {
  let component: AdminInvoice;
  let fixture: ComponentFixture<AdminInvoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminInvoice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminInvoice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
