import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrCheckin } from './qr-checkin.component';

describe('QrCheckin', () => {
  let component: QrCheckin;
  let fixture: ComponentFixture<QrCheckin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrCheckin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrCheckin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
