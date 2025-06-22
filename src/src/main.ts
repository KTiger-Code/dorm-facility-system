import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app.component';

import { registerLocaleData } from '@angular/common';
import localeTh from '@angular/common/locales/th';

// ✅ ตั้งค่าภาษาไทย
registerLocaleData(localeTh, 'th');

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
