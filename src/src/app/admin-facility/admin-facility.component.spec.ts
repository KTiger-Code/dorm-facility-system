import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFacilityComponent } from './admin-facility.component';

describe('AdminFacilityComponent', () => {
  let component: AdminFacilityComponent;
  let fixture: ComponentFixture<AdminFacilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFacilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminFacilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
