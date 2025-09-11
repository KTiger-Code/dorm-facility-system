import { Routes } from '@angular/router';
import { AuthComponent }               from './auth/auth.component';
import { HomeComponent }               from './home/home.component';
import { ResidentInvoiceComponent }    from './resident-invoice/resident-invoice.component';
import { AdminInvoiceComponent }       from './admin-invoice/admin-invoice.component';
import { RepairRequestComponent }      from './repair-request/repair-request.component';

import { AnnouncementComponent }       from './announcements/announcement.component';
import { FacilityBookingComponent }    from './facility-booking/facility-booking.component';
import { ParcelNotificationComponent } from './parcel-notification/parcel-notification.component';
import { AdminParcelsComponent }       from './admin-parcels/admin-parcels.component';
import { AdminAnnouncementComponent }  from './admin-announcement/admin-announcement.component';
import { AdminUsersComponent }         from './admin-users/admin-users.component';
import { AdminGuard }                  from './admin.guard';
import { AdminFacilityComponent }      from './admin-facility/admin-facility.component';
import { AdminRepairComponent } from './admin-repair/admin-repair.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',      component: AuthComponent },
  { path: 'home',       component: HomeComponent },

  // Resident pages
  { path: 'invoice',    component: ResidentInvoiceComponent },
  { path: 'facility-booking', component: FacilityBookingComponent },
  { path: 'repair',     component: RepairRequestComponent },

  { path: 'announcements', component: AnnouncementComponent },
  { path: 'parcel',     component: ParcelNotificationComponent },

  // Admin pages
  {
    path: 'staff',
    component: AdminHomeComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/invoice',
    component: AdminInvoiceComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/facility-booking',
    component: AdminFacilityComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin-parcels',
    component: AdminParcelsComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/announcement',
    component: AdminAnnouncementComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin-users',
    component: AdminUsersComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/repairs',
    component: AdminRepairComponent,
    canActivate: [AdminGuard]
  },

  { path: '**', redirectTo: 'home' }
];
