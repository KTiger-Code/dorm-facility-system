import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFacility } from './admin-facility.component';

describe('AdminFacility', () => {
  let component: AdminFacility;
  let fixture: ComponentFixture<AdminFacility>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFacility]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminFacility);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
