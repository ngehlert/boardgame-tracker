import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { DataStorageService } from './data-storage.service';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
  ],
  providers: [
    DataStorageService,
  ],
  bootstrap: [
    AppComponent,
  ]
})
export class AppModule { }
