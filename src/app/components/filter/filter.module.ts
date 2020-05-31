import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FilterComponent } from './filter.component';

import {
  ButtonModule, DateHelper, DeviceHelper, NasClassModule,
  AbandonedBasketService, SortService, AccordionModule,
  AirportSelectModule, CheckboxModule, DatepickerComboModule, DropdownModule,
  IconModule, PassengerSelectModule, SubsidyDiscountModule, SuggestionsModule
} from '@norwegian/core-components';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    NasClassModule,
    AirportSelectModule,
    DropdownModule,
    PassengerSelectModule,
    AccordionModule,
    IconModule,
    DatepickerComboModule,
    CheckboxModule,
    ReactiveFormsModule,
    ButtonModule,
    SubsidyDiscountModule,
    SuggestionsModule
  ],
  declarations: [FilterComponent],
  exports: [FilterComponent],
  providers: [SortService, AbandonedBasketService, DateHelper, DeviceHelper]
})
export class FilterModule { }
