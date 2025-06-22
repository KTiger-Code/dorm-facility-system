import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnouncementComponent } from './announcement.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AnnouncementComponent', () => {
  let component: AnnouncementComponent;
  let fixture: ComponentFixture<AnnouncementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnouncementComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AnnouncementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
