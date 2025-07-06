import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRepairComponent } from './admin-repair.component';

describe('AdminRepairComponent', () => {
  let component: AdminRepairComponent;
  let fixture: ComponentFixture<AdminRepairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRepairComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRepairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
