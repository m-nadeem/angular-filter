import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { FilterModule } from './components/filter/filter.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BoxModule, GridModule } from '@norwegian/core-components';
import { FilterExampleComponent } from './components/filter-example/filter-example.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FilterExampleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FilterModule,
    HttpClientModule,
    BoxModule,
    GridModule
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent]
})
export class AppModule { }
