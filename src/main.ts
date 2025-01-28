import {AppComponent} from "./app/app.component";
import {bootstrapApplication} from "@angular/platform-browser";
import {provideRouter} from "@angular/router";
import {ApplicationRoutes} from "./app/app-routing.module";
import {DataStorageService} from "./app/data-storage.service";
import {provideAnimations} from "@angular/platform-browser/animations";

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(ApplicationRoutes),
    DataStorageService,
    provideAnimations(),
  ]
})
  .catch(err => console.error(err));
