import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterModule } from '../filter/filter.module';
import { HttpClientModule, HttpClient } from '@angular/common/http';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FilterModule,
    HttpClientModule
  ],
  providers: [HttpClient]
})
export class FilterExampleModule { }
