import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { logError } from './app/utils/log';

bootstrapApplication(App, appConfig).catch((err) => logError(err));
