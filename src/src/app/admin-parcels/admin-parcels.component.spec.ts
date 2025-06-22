import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminParcels } from './admin-parcels';

describe('AdminParcels', () => {
  let component: AdminParcels;
  let fixture: ComponentFixture<AdminParcels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminParcels]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminParcels);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
