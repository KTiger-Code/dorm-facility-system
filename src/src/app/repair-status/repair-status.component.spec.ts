import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RepairStatusComponent } from './repair-status.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RepairStatusComponent', () => {
  let component: RepairStatusComponent;
  let fixture: ComponentFixture<RepairStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepairStatusComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(RepairStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
