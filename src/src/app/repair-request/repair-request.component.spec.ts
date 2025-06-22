import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RepairRequestComponent } from './repair-request.component';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RepairRequestComponent', () => {
  let component: RepairRequestComponent;
  let fixture: ComponentFixture<RepairRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepairRequestComponent, FormsModule, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(RepairRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
