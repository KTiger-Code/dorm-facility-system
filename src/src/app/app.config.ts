import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { LOCALE_ID } from '@angular/core'; // ✅ เพิ่ม

import { routes } from './app.routes';

export const appConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'th' } // ✅ เพิ่มตรงนี้
  ]
};
