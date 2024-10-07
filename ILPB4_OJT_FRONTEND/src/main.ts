import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations'; // Import provideAnimations
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Merge provideAnimations into appConfig
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers, // Include existing providers
    provideAnimations(), // Provide animations
  ],
})
  .catch((err) => console.error(err));
