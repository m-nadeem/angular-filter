import { Component, OnInit } from '@angular/core';
import { AirportModel, PassengersModel, PassengerType, SubsidyDiscountModel, UtcDate } from '@norwegian/core-components';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-filter-example',
  templateUrl: './filter-example.component.html',
  styleUrls: ['./filter-example.component.scss']
})
export class FilterExampleComponent implements OnInit {

  airports: Array<AirportModel>;
  closestAirports: Array<AirportModel>;
  allowedOriginAirports: Array<AirportModel>;
  airportRelations: Record<string, Array<string>>;

  passengers: Array<PassengersModel> = [
    {
      count: 1,
      label: 'Adults',
      type: PassengerType.Adult
    },
    {
      count: 0,
      label: 'Childs',
      type: PassengerType.Child
    },
    {
      count: 0,
      label: 'Infants',
      type: PassengerType.Infant
    }];

  exampleAirports: any;





  subsidyDiscounts: Array<SubsidyDiscountModel> = [
    {
      code: '',
      displayName: 'No discounts apply'
    },
    {
      code: 'LF1',
      displayName: 'General large family'
    },
    {
      code: 'LF2',
      displayName: 'Special large family'
    }
  ];

  inboundSelectedDateExampleVal: UtcDate;
  outboundSelectedDateExampleVal: UtcDate;

  get inboundSelectedDateExample(): UtcDate {
    if (!this.outboundSelectedDateExampleVal) {
      const now = new Date();
      return new UtcDate(now.getFullYear(), now.getMonth() + 2, 11);
    }
    return this.inboundSelectedDateExampleVal;
  }

  set inboundSelectedDateExample(val: UtcDate) {
    this.inboundSelectedDateExampleVal = val;
  }

  get outboundSelectedDateExample(): UtcDate {
    if (!this.outboundSelectedDateExampleVal) {
      const now = new Date();
      return new UtcDate(now.getFullYear(), now.getMonth() + 2, 11);
    }
    return this.outboundSelectedDateExampleVal;
  }

  set outboundSelectedDateExample(val: UtcDate) {
    this.outboundSelectedDateExampleVal = val;
  }


  constructor(private datePipe: DatePipe, private http: HttpClient) { }

  ngOnInit() {

    this.http.get('./assets/destinations.json').subscribe(response => {
      const destinations = (response as any).destinations;
      this.airportRelations = (response as any).relations;

      this.airports = destinations.map(x => {
        const airport: AirportModel = {
          name: `${x.displayName} (${x.code})`,
          code: x.code,
          countryName: x.countryName,
          displayName: x.displayName,
          airportName: x.airportName,
          normalizedAirportName: x.normalizedAirportName
        };
        return airport;
      });

      this.allowedOriginAirports = [this.airports[34], this.airports[23]];
      this.getClosestAirports();
    });
  }
  getClosestAirports(): void {
    this.closestAirports = this.airports.slice(0, 2);
  }

}
