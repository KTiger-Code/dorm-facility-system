import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRepair } from './admin-repair.component';

describe('AdminRepair', () => {
  let component: AdminRepair;
  let fixture: ComponentFixture<AdminRepair>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRepair]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRepair);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
