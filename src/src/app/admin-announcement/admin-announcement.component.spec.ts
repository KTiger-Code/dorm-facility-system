import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAnnouncement } from './admin-announcement.component';

describe('AdminAnnouncement', () => {
  let component: AdminAnnouncement;
  let fixture: ComponentFixture<AdminAnnouncement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAnnouncement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAnnouncement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
