import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrScan } from './qr-scan.component';

describe('QrScan', () => {
  let component: QrScan;
  let fixture: ComponentFixture<QrScan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrScan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrScan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
