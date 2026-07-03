import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { LUCIDE_ICONS, LucideIconProvider, Trophy, Crown, History, X, Clock, ArrowLeft, Medal, Trash2, Play, Check, Sun, Moon } from 'lucide-angular';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

const lucideIcons = { Trophy, Crown, History, X, Clock, ArrowLeft, Medal, Trash2, Play, Check, Sun, Moon };

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LUCIDE_ICONS, useValue: new LucideIconProvider(lucideIcons) },
    provideCharts(withDefaultRegisterables()),
  ]
};
