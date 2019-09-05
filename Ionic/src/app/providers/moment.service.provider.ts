import * as moment from 'moment';
import { InjectionToken } from '@angular/core';

export const MomentService = new InjectionToken<string>('MomentService');

const momentServiceFactory = () => {
  return moment;
};

export const momentServiceProvider = {
  provide: MomentService,
  useFactory: momentServiceFactory
};
