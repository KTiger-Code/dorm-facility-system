import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityBookingComponent } from './facility-booking.component';

describe('FacilityBookingComponent', () => {
  let component: FacilityBookingComponent;
  let fixture: ComponentFixture<FacilityBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilityBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacilityBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
