/**
 * @license
 * Copyright Norwegian Air Shuttle. All Rights Reserved.
 */

import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { TripType } from './enums/trip-type.enum';
import { NasComponentBase, DropdownComponent, PassengerSelectComponent, AirportSelectComponent,
  DatepickerComboComponent, SubsidyDiscountComponent, AirportModel, UtcDate,
  PassengersModel, SubsidyDiscountModel, DeviceHelper, SortService,
  AbandonedBasketService, DateHelper, ClassModel, AbandonedBasketItemModel } from '@norwegian/core-components';

/**
 * @description
 * Sample Filter Component | Functional
 */
@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent extends NasComponentBase implements OnInit, AfterViewChecked {
  @ViewChild('passengerSelectDropdown') passengerSelectDropdown: DropdownComponent;
  @ViewChild('passengerSelect') passengerSelect: PassengerSelectComponent;
  @ViewChild('tripSwitch') tripSwitch: DropdownComponent;
  @ViewChild('transitSwitch') transitSwitch: DropdownComponent;
  @ViewChild('airportSelect') airportSelect: AirportSelectComponent;
  @ViewChild('datepickerCombo') datepickerCombo: DatepickerComboComponent;
  @ViewChild('container') container: ElementRef;
  @ViewChild('tripTypeOneway') tripTypeOneway: ElementRef;
  @ViewChild('tripTypeRoundTrip') tripTypeRoundTrip: ElementRef;
  @ViewChild('transitTypeDirectOnly') transitTypeDirectOnly: ElementRef;
  @ViewChild('transitTypeTransit') transitTypeTransit: ElementRef;
  @ViewChild('subsidyDiscount') subsidyDiscount: SubsidyDiscountComponent;

  latestSearchesOrigin: Array<AirportModel>;
  latestSearchesDestination: Array<AirportModel>;
  displaySummary = true;
  nativeElement: HTMLElement;
  inboundLowerLimitDate: UtcDate;
  containerWidth = new BehaviorSubject<number>(0);
  maximize = false;
  isNasGroupValid = false;

  get outboundOpen(): boolean {
    return this.outboundOpenValue;
  }
  set outboundOpen(value: boolean) {
    if (this.outboundOpenValue === value) {
      return;
    }

    if (value) {
      this.closeDropdowns();

      this.airportSelect.originOpen = false;
      this.airportSelect.destinationOpen = false;
    }

    this.outboundOpenValue = value;
    this.outboundOpenChange.emit(value);
  }

  get inboundOpen(): boolean {
    return this.inboundOpenValue;
  }
  set inboundOpen(value: boolean) {
    if (this.inboundOpenValue === value) {
      return;
    }

    if (value) {
      this.closeDropdowns();
      this.airportSelect.originOpen = false;
      this.airportSelect.destinationOpen = false;
    }

    clearTimeout(this.inboundOpenTimeout);

    this.inboundOpenTimeout = setTimeout(() => {
      this.inboundOpenValue = value;
    });

    this.inboundOpenChange.emit(value);
  }

  private inboundOpenTimeout: any;

  /**
   * @required
   * @description
   * A record containing keys with all airport codes with corresponding array of airport codes connected to the key.
   */
  @Input() airportRelations: Record<string, Array<string>>;

  /**
   * @description
   * Adds 'aria-label' on the clear button inside the airport select inputs.
   */
  @Input() ariaLabelClear: string;

  /**
   * @description
   * ARIA label for the subtract buttons.
   */
  @Input() ariaLabelSubtract: string;

  /**
   * @description
   * Adds 'aria-label' to the backdrops.
   */
  @Input() ariaLabelBackdrop: string;

  /**
   * @description
   * ARIA label for the add buttons.
   */
  @Input() ariaLabelAdd: string;

  /**
   * @description
   * A list of airports that should be displayed in the origin dropdown.
   * If not included, all airports will be displayed.
   */
  @Input() allowedOriginAirports: Array<AirportModel>;

  /**
   * @description
   * An array of airports that are restricted for destination airports. It will default to airports if not set.
   */
  @Input() allowedDestinationAirports: Array<AirportModel>;

  /**
   * @description
   * A boolean indicating if airports that the user allready has searh for should be displayed.
   */
  @Input() displayLatestSearches: boolean;

  /**
   * @description
   * Display switch UI to interchange origin and destination airport.
   */
  @Input() useSwitch?: boolean;

  /**
   * @description
   * A boolean indicating if airports that are close to the user should be displayed.
   */
  @Input() displayClosestAirports: boolean;

  /**
   * @description
   * The airport code of the origin airport. It will set the selected origin airport based on this value.
   */
  @Input() originAirportCode: string;

  /**
   * @description
   * The airport code of the destination airport. It will set the selected destination airport based on this value.
   */
  @Input() destinationAirportCode: string;

  /**
   * @description
   * A label that will be added to the passenger select dropdown.
   */
  @Input() passengerSelectLabel: string;

  /**
   * @description
   * The total maximum amount of passengers in the passenger select dropdown.
   */
  @Input() maxPaxCount: number;

  /**
   * @description
   * An array of different passenger types that will be displayed.
   */
  @Input()
  get passengers(): Array<PassengersModel> {
    return this.passengersValue;
  }
  set passengers(value: Array<PassengersModel>) {
    if (!value) {
      return;
    }

    this.passengersValue = value;
    this.passengersChange.emit(value);
  }

  /**
   * @description
   * The minimum amount of adults that can be selected in the passenger select dropdown.
   */
  @Input() minAdultCount: number;

  /**
   * @description
   * A label for round trip selection in the trip switch dropdown.
   */
  @Input() tripSwitchRoundTripLabel: string;

  /**
   * @description
   * A label for one way selection in the trip switch dropdown.
   */
  @Input() tripSwitchOneWayLabel: string;

  /**
   * @description
   * A label for direct only selection in the transit switch dropdown.
   */
  @Input() directOnlyLabel: string;

  /**
   * @description
   * A label for both direct and transit selection in the transit switch dropdown.
   */
  @Input() directTransitLabel: string;

  /**
   * @description
   * Indicates if the filter should be minimized on mobile screen sizes.
   */
  @Input() minimizeOnMobile?: boolean;

  /**
   * @description
   * A separator for the filter summary that is dispayed if minimizeOnMobile is true.
   *
   * ### Example
   * 1 traveller, round trip and direct/transit
   */
  @Input() defaultSummarySeparator = '';

  /**
   * A separator for the filter summary is are dispayed if minimizeOnMobile is true.
   *
   * ### Example
   * 1 traveller, round trip and direct/transit
   */
  @Input() lastSummarySeparator = '';

  /**
   * @description
   * A title that will be added to the passenger select dropdown.
   */
  @Input() passengerSelectTitle: string;

  /**
   * @description
   * A label for the adults passenger type in the passenger select dropdown.
   */
  @Input() passengerSelectAdultsLabel: string;

  /**
   * @description
   * A label for the children passenger type in the passenger select dropdown.
   */
  @Input() passengerSelectChildrenLabel: string;

  /**
   * @description
   * A label for the infants passenger type in the passenger select dropdown.
   */
  @Input() passengerSelectInfantsLabel: string;

  /**
   * @description
   * A label that will appear when total number of selected passengers exceeds the group booking limit
   */
  @Input() groupBookingLabel: string;

  /**
   * @description
   * A label that will appear on top of all airports in the airport select drop down lists.
   */
  @Input() allAirportsLabel: string;

  /**
   * @description
   * A label that will appear on top of the latest searches in the airport select drop down lists.
   */
  @Input() latestSearchesLabel: string;

  /**
   * @description
   * A label that will appear on top of the closest airports in the airport select drop down lists.
   */
  @Input() closestAirportsLabel: string;

  /**
   * @description
   * A label that will appear in the destination input field in the airport select, if the
   * user tries to select a destination airport without selecting an origin airport.
   */
  @Input() selectOriginFirstLabel: string;

  /**
   * @required
   * @description
   * A label that will appear on top of the origin airport input field.
   */
  @Input() labelOrigin: string;

  /**
   * @description
   * A placeholder that will appear on the origin airport input field.
   */
  @Input() placeholderOrigin = '';

  /**
   * @required
   * @description
   * A label that will appear on top of the destination airport input field.
   */
  @Input() labelDestination: string;

  /**
   * @description
   * A label that will appear in my location in the drop down list in airport select.
   */
  @Input() geolocationLabel: string;

  /**
   * @description
   * A label that will appear in my location, in the drop down list in airport select if user has denied geolocation.
   */
  @Input() geolocationBlockedLabel: string;

  /**
   * @description
   * A placeholder that will appear on the destination airport input field.
   */
  @Input() placeholderDestination = '';

  /**
   * @description
   * A modifier that will allow always keeping the selected airport.
   * The last selected airport will be shown once user clears the selection and blur.
   */
  @Input() keepSelection: boolean;

  /**
   * @description
   * A title that will be assigned to edit search accordion.
   */
  @Input() editSearchTitle: string;

  /**
   * @description
   * Adds the parent's form group.
   * It requires that the consumer included ReactiveFormsModule in it's module.
   * It is requiered to be filled if nasFormControlName added.
   */
  @Input() nasFormGroup: FormGroup;

  /**
   * @description
   * Sets a formControlName directive to the input.
   * It requires that the consumer included ReactiveFormsModule in it's module.
   * It requiers that the nasFormGroup input is filled.
   */
  @Input() nasFormControlNameOrigin: string;

  /**
   * @description
   * Sets a formControlName directive to the input.
   * It requires that the consumer included ReactiveFormsModule in it's module.
   * It requiers that the nasFormGroup input is filled.
   */
  @Input() nasFormControlNameDestination: string;

  /**
   * @description
   * Sets a formControlName directive to the input.
   * It requires that the consumer included ReactiveFormsModule in it's module.
   * It requiers that the nasFormGroup input is filled.
   */
  @Input() nasFormControlNameTripType: string;

  /**
   * @description
   * Sets a formControlName directive to the input.
   * It requires that the consumer included ReactiveFormsModule in it's module.
   * It requiers that the nasFormGroup input is filled.
   */
  @Input() nasFormControlNameDirectOnly: string;

  /**
   * @description
   * Sets a formControlName directive to the input.
   * It requires that the consumer included ReactiveFormsModule in it's module.
   * It requiers that the nasFormGroup input is filled.
   */
  @Input() nasFormControlNameOutbound: string;

  /**
   * @description
   * Sets a formControlName directive to the input.
   * It requires that the consumer included ReactiveFormsModule in it's module.
   * It requiers that the nasFormGroup input is filled.
   */
  @Input() nasFormControlNameInbound: string;

  /**
   * @description
   * Sets a formControlName directive to the input.
   * It requires that the consumer included ReactiveFormsModule in it's module.
   * It requiers that the nasFormGroup input is filled.
   */
  @Input() nasFormControlGroupBooking: string;

  /**
   * @description
   * Sets a formControlName directive to the input.
   * It requires that the consumer included ReactiveFormsModule in it's module.
   * It requiers that the nasFormGroup input is filled.
   */
  @Input() nasFormControlNameSubsidyDiscount: string;

  /**
   * @description
   * Make latest searches and geolocation override default value in the origin airport selector.
   */
  @Input() overrideOrigin?: boolean;

  /**
   * @description
   * This will make the filter display suggested airports based on geolocation and latest searches.
   */
  @Input() enableSuggestions?: boolean;

  @Input()
  get closestAirports() {
    return this.closestAirportsValue;
  }
  set closestAirports(airports: Array<AirportModel>) {
    if (!airports || airports.length < 1) {
      return;
    }

    this.closestAirportsValue = airports;

    if (this.exists(this.overrideOrigin)) {
      this.originAirportCode = airports[0].code;
    }
  }

  /**
   * This will only display airport selection. When a city pair is selected, the rest of the filter will be visible.
   */
  @Input() minimize?: boolean;

  /**
   * @required
   * @description
   * All airports that will be populated into the dropdown lists.
   * If displayLatestSearches is true, it will try to get the latest searches from the abandoned basket.
   */
  @Input()
  get airports() {
    return this.airportsValue;
  }
  set airports(airports: Array<AirportModel>) {
    this.airportsValue = airports;

    if (this.exists(this.displayLatestSearches)) {
      const abandonedBasket = this.abandonedBasketService.getAll();
      this.setLatestSearches(abandonedBasket, this.airports);
    }
  }

  /**
   * @description
   * Sets and gets the selected trip type.
   */
  @Input()
  get tripType() {
    return this.tripTypeValue;
  }
  set tripType(tripType: TripType) {
    if (tripType === this.tripTypeValue) {
      return;
    }

    this.tripTypeValue = tripType;
    this.tripTypeChange.emit(this.tripType);
  }

  /**
   * @description
   * Sets and gets whether the selected transit type is direct only or not.
   */
  @Input()
  get directOnly() {
    return this.directOnlyValue;
  }
  set directOnly(directOnly: boolean) {
    if (directOnly === this.directOnlyValue) {
      return;
    }

    this.directOnlyValue = directOnly;
    this.directOnlyChange.emit(this.directOnly);
  }

  /**
   * @description
   * The limit for when the total amount of passengers exceeds to be a group booking.
   */
  @Input() groupBookingLimit: number;

  /**
   * @description
   * Subsidy discounts
   */
  @Input() subsidyDiscounts: Array<SubsidyDiscountModel>;

  /**
   * @description
   * Selected subsidy discount
   */
  @Input() selectedSubsidyDiscount: SubsidyDiscountModel;

  /**
   * @description
   * Subsidy discount label
   */
  @Input() subsidyDiscountLabel: string;

  /**
   * @description
   * ARIA label for the previous month button in the calendar.
   */
  @Input() ariaLabelPreviousMonth: string;

  /**
   * @description
   * ARIA label for the next month button in the calendar.
   */
  @Input() ariaLabelNextMonth: string;

  /**
   * @description
   * An event that is fired every time the origin dropdown selector opens or closes.
   */
  @Output() originOpenChange = new EventEmitter<boolean>();

 /**
  * @description
  * An event that is fired every time the origin dropdown selector opens or closes.
  */
  @Output() destinationOpenChange = new EventEmitter<boolean>();

  /**
   * @description
   * An event that is fired every time the passenger select dropdown opens or closes.
   */
  @Output() passengerSelectOpenChange = new EventEmitter<boolean>();

  /**
   * @description
   * An event that is fired every time the selected origin airport changes.
   */
  @Output() originChange = new EventEmitter<AirportModel>();

 /**
  * @description
  * An event that is fired every time the selected destination airport changes.
  */
  @Output() destinationChange = new EventEmitter<AirportModel>();

  /**
   * @description
   * An event that is fired every time a passenger selection change is performed.
   */
  @Output() passengersChange = new EventEmitter<Array<PassengersModel>>();

  /**
   * @description
   * Sets and gets the selected trip type.
   */
  @Output() tripTypeChange = new EventEmitter<TripType>();

  /**
   * @description
   * Sets and gets whether the selected transit type is direct only or not.
   */
  @Output() directOnlyChange = new EventEmitter<boolean>();

  /**
   * @description
   * Label for no available flights.
   */
  @Input() noAvailableFlightsLabel: string;

  /**
   * @description
   * Label for available flights.
   */
  @Input() availableFlightsLabel: string;

  /**
   * @description
   * Disable possibility to select dates in the past.
   */
  @Input() disablePastSelection: boolean;

  /**
   * @description
   * Label for outbound datepicker.
   */
  @Input() outboundLabel: string;

  /**
   * @description
   * Label for inbound datepicker.
   */
  @Input() inboundLabel: string;

  /**
   * @description
   * Sets the datepickers in availability mode where available dates can be added.
   */
  @Input() availability: boolean;

  /**
   * @description
   * Available dates for outbound calendar.
   */
  @Input() outboundAvailableDates: Array<UtcDate>;

  /**
   * @description
   * Available dates for inbound calendar.
   */
  @Input() inboundAvailableDates: Array<UtcDate>;

  /**
   * @description
   * If set, Enables the time dropdown selector alongside datepicker.
   */
  @Input() times: Array<UtcDate>;

  /**
   * @description
   * The display format of the date when user has selected the date and it is being shown in the input box for the date picker.
   * Please look at the angular Date pipe for valid formats and variations.
   */
  @Input() dateDisplayFormat = 'EEEE d, MMMM yyyy';

  /**
   * @description
   * The time display format.
   */
  @Input() timeDisplayFormat = 'HH:mm';

  /**
   * @description
   * A locale code for the locale format rules to use. When not supplied, uses the value of LOCALE_ID, which is en-US by default.
   * This requires that registerLocaleData is called with the respective locale.
   */
  @Input() locale = 'en-GB';

  /**
   * @description
   * A modifier to remove the padding and margins around the element.
   */
  @Input() compact: boolean;

  /**
   * @description
   * Disable possibility to select outbound dates.
   */
  @Input() outboundDisabled: boolean;

  /**
   * @description
   * Disable possibility to select inbound dates.
   */
  @Input() inboundDisabled: boolean;

  /**
   * @description
   * Show/Add date picker combo into the filter if set to true.
   */
  @Input() enableDatepickers: boolean;

  /**
   * @required
   * @description
   * Label for the toggle icon for minimizing filter.
   */
  @Input() minimizingLabel: string;

  /**
   * @required
   * @description
   * Label for the toggle icon for maximizing filter.
   */
  @Input() maximizingLabel: string;

  /**
   * @required
   * @description
   * Label for the toggling transit type when filter is minimized.
   */
  @Input() directOnlyMobileLabel: string;

  /**
   * @description
   * Label for 'or' in the suggestioned airports.
   */
  @Input() orLabel: string;

  /**
   * @description
   * A text that appears in the destinations dropdown list when origin airport is not set.
   */
  @Input() invalidDestinationText: string;

  /**
   * @description
   * Selected datefor outbound calendar.
   */
  @Input()
  get outboundSelectedDate() {
    return this.outboundSelectedDateValue;
  }
  set outboundSelectedDate(date: UtcDate) {
    if (!date) {
      return;
    }

    setTimeout(() => {
      this.outboundSelectedDateValue = date;
      this.outboundSelectedDateChange.emit(date);
    });
  }

  /**
   * @description
   * Selected datefor inbound calendar.
   */
  @Input()
  get inboundSelectedDate() {
    return this.inboundSelectedDateValue;
  }
  set inboundSelectedDate(date: UtcDate) {
    if (!date) {
      return;
    }

    setTimeout(() => {
      this.inboundSelectedDateValue = date;
      this.inboundSelectedDateChange.emit(date);
    });
  }

  /**
   * @description
   * Will display passenger select, set this to false to remove it. It's true by default.
   */
  @Input() enablePassengersSelect = true;

  /**
   * @description
   * Will display the trip switch, set this to false to remove it. It's true by default.
   */
  @Input() enableTripSwitch = true;

  /**
   * @description
   * Will display the transit switch, set this to false to remove it. It's true by default.
   */
  @Input() enableTransitSwitch = true;

  /**
   * @description
   * When selected datehas been changed on the outbound calendar.
   */
  @Output() outboundSelectedDateChange = new EventEmitter<UtcDate>();

  /**
   * @description
   * When selected datehas been changed on the inbound calendar.
   */
  @Output() inboundSelectedDateChange = new EventEmitter<UtcDate>();


  /**
   * @description
   * Outbound datepicker is open or closed.
   */
  @Output() outboundOpenChange = new EventEmitter<boolean>();

  /**
   * @description
   * Inbound datepicker is open or closed.
   */
  @Output() inboundOpenChange = new EventEmitter<boolean>();

  /**
   * @description
   * Outbound calendar changes month.
   */
  @Output() outboundMonthChange = new EventEmitter<UtcDate>();

  /**
   * @description
   * Inbound calendar changes month.
   */
  @Output() inboundMonthChange = new EventEmitter<UtcDate>();

  /**
   * @description
   * When a user has actively changed the date.
   */
  @Output() focusOnNextChange = new EventEmitter();

  /**
   * @description
   * The geolocation of the user. Will be emitted if 'enableSuggestions' is true.
   */
  @Output() positionChange = new EventEmitter<Position>();

  /**
   * @description
   * An even that is fired every time the info button on the subsidy discount is clicked.
   */
  @Output() subsidyDiscountInfoClick = new EventEmitter();

  get inboundSelectedMonth(): UtcDate {
    return this.inboundSelectedMonthValue;
  }
  set inboundSelectedMonth(month: UtcDate) {
    if (this.dateService.isEqual(month, this.inboundSelectedMonthValue, true)) {
      return;
    }

    this.inboundMonthChange.emit(month);
    this.inboundSelectedMonthValue = month;
  }

  private outboundSelectedDateValue: UtcDate;
  private inboundSelectedDateValue: UtcDate;
  private inboundSelectedMonthValue: UtcDate;
  private airportsValue: Array<AirportModel>;
  private tripTypeValue: TripType;
  private directOnlyValue: boolean;
  private closestAirportsValue: Array<AirportModel>;
  private outboundOpenValue = false;
  private inboundOpenValue = false;
  private passengersValue = new Array<PassengersModel>();
  private focusAsyncTimout: any;
  private transitSwitchFocusTimeout: any;
  private tripSwitchFocusTimeout: any;

  constructor(
    public deviceHelper: DeviceHelper,
    private sortService: SortService,
    private abandonedBasketService: AbandonedBasketService,
    private dateService: DateHelper,
    public elementRef: ElementRef,
    private changeDetector: ChangeDetectorRef) {
    super('nas-filter');
    this.nativeElement = elementRef.nativeElement as HTMLElement;
  }

  ngOnInit(): void {
    if (!this.airports) {
      throw new Error('Missing input: [airports]');
    }
    if (!this.airportRelations) {
      throw new Error('Missing input: [airportRelations]');
    }

    if (!this.nasFormGroup) {
      return;
    }

    this.nasFormGroup.statusChanges.subscribe(x => {
      setTimeout(() => {
        this.isNasGroupValid = x;
      });
    });

    if (this.nasFormControlNameDirectOnly) {
      const directOnlyControl = this.nasFormGroup.get(this.nasFormControlNameDirectOnly);

      if (directOnlyControl) {
        this.directOnly = directOnlyControl.value;
      }
    }

    if (this.nasFormControlNameTripType) {
      const tripTypeControl = this.nasFormGroup.get(this.nasFormControlNameTripType);

      if (tripTypeControl) {
        this.tripType = tripTypeControl.value;
        this.inboundDisabled = tripTypeControl.value === TripType.oneWay;

        if (this.nasFormControlNameInbound) {
          const inboundControl = this.nasFormGroup.get(this.nasFormControlNameInbound);

          if (inboundControl && this.inboundDisabled) {
            inboundControl.disable();
          }
        }

        tripTypeControl.valueChanges.subscribe((value: TripType) => {
          this.inboundDisabled = value === TripType.oneWay;
        });
      }
    }
  }

  ngAfterViewChecked(): void {
    this.containerWidth.next((this.container.nativeElement as HTMLElement).offsetWidth);

    window.onresize = () => {
      this.containerWidth.next((this.container.nativeElement as HTMLElement).offsetWidth);
    };
  }

  onSubsidyDiscountInfoClick(): void {
    this.subsidyDiscountInfoClick.emit();
  }

  onSubsidyDiscountSelectChange(model: SubsidyDiscountModel): void {
    if (!this.nasFormGroup || !this.nasFormControlNameSubsidyDiscount) {
      return;
    }

    const subsidyDiscountControl = this.nasFormGroup.get(this.nasFormControlNameSubsidyDiscount);
    subsidyDiscountControl.patchValue(model);
  }

  getClosestAirports(position: Position): void {
    this.positionChange.emit(position);
  }

  getFilterClass(element?: string, modifiersInput?: any): ClassModel {
    let modifiers = modifiersInput || new Array<string>();

    if (typeof modifiersInput === 'string' || modifiersInput instanceof String) {
      modifiers = [modifiersInput];
    }

    const widths = [
      this.deviceHelper.isWidthTablet(this.containerWidth.getValue()) && 'md',
      this.deviceHelper.isWidthDesktop(this.containerWidth.getValue()) && 'lg'
    ];

    modifiers = [...modifiers, ...widths];

    return this.getClass(element, modifiers);
  }

  getAirportSelectClass(): ClassModel {
    return this.getClass(
      'airport-select',
      [
        this.deviceHelper.isWidthDesktop(this.containerWidth.getValue()) && 'lg',
        this.deviceHelper.isWidthTablet(this.containerWidth.getValue()) && 'md',
        this.exists(this.enableDatepickers) && 'no-border'
      ]);
  }

  getSuggestions(): Array<AirportModel> {
    const suggestions = Array.from(new Set([
      ...this.latestSearchesOrigin ? this.latestSearchesOrigin.filter(x => x.code !== this.originAirportCode) : [],
      ...this.closestAirports ? this.closestAirports.filter(x => x.code !== this.originAirportCode) : []
    ]));

    return suggestions.slice(0, 3);
  }

  getDatePickersClass(): ClassModel {
    return this.getFilterClass('date-combo', [
      this.exists(this.minimize) && 'minimized',
      this.containerWidth.getValue() > 500 && 'side-by-side'
    ]);
  }

  getTravelDetailsClass(element?: string, modifiersInput?: any): ClassModel {
    let modifiers = modifiersInput || new Array<string>();

    if (typeof modifiersInput === 'string' || modifiersInput instanceof String) {
      modifiers = [modifiersInput];
    }

    const widths = [
      this.deviceHelper.isWidthTablet(this.containerWidth.getValue()) && 'md',
      this.deviceHelper.isWidthDesktop(this.containerWidth.getValue()) && 'lg'
    ];

    modifiers = [...modifiers, ...widths];

    const travelDetailsBase = new NasComponentBase('travel-details');
    return travelDetailsBase.getClass(element, modifiers);
  }

  onInboundMonthChange(month: UtcDate): void { this.inboundMonthChange.emit(month); }
  onOutboundMonthChange(month: UtcDate): void { this.outboundMonthChange.emit(month); }

  onPassengersSelectFocusOnPrevious(): void {
    if (this.isMobileDisplay()) {
      this.onTransitSwitchOpen(true);
      this.focusAsync(this.transitSwitch.toggleElement);
    } else if (this.isTabletDisplay()) {
      this.selectPreviousControl();
    }
  }

  passengerKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Tab':
        if (event.shiftKey) {
          if (this.isMobileDisplay() || this.isTabletDisplay()) {
            break;
          }

          this.focusOnAirportSelectBackwards();
          break;
        }

        if (this.isMobileDisplay()) {
          if (this.subsidyDiscounts && this.subsidyDiscounts.length > 0) {
            this.subsidyDiscount.infoButton.button.nativeElement.focus();
          } else {
            this.focusOnNextChange.emit();
          }
        }
        break;
      case 'Enter':
        if (event.shiftKey || this.isMobileDisplay()) {
          break;
        }
        if (document.activeElement === this.passengerSelectDropdown.toggleElement.nativeElement) {
          if (this.passengerSelectDropdown.open) {
            this.onTripSwitchOpen(true);
            this.focusAsync(this.tripSwitch.toggleElement);
          } else {
            this.onPassengerSelectOpen(true);
          }
        }
        break;
      case 'Escape':
        this.onPassengerSelectOpen(false);
        event.preventDefault();
        this.setFocusOnNativeElement(this.passengerSelectDropdown.toggleElement);
        break;
    }
  }

  onTripSwitchKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowRight':
        if (document.activeElement === this.tripTypeRoundTrip.nativeElement) {
          this.tripTypeOneway.nativeElement.focus();
        }
        break;
      case 'ArrowLeft':
        if (document.activeElement === this.tripTypeOneway.nativeElement) {
          this.tripTypeRoundTrip.nativeElement.focus();
        }
        break;
      case 'Tab':
      case 'Enter':
        if (event.shiftKey) {
          event.preventDefault();

          if (this.isMobileDisplay() || !this.passengerSelectDropdown) {
            this.selectPreviousControl();
          } else {
            this.onPassengerSelectOpen(true);
            this.focusAsync(this.passengerSelectDropdown.toggleElement);
          }
        } else {
          if (event.key === 'Tab') {
            this.onTransitSwitchOpen(true);
          } else {
            if (this.tripSwitch.open) {
              this.onTransitSwitchOpen(true);
              this.focusAsync(this.transitSwitch.toggleElement);
            } else {
              this.onTripSwitchOpen(true);
            }
          }
        }
        break;

      case 'Escape':
        this.onTripSwitchOpen(false);
        this.setFocusOnNativeElement(this.tripSwitch.toggleElement);
        break;
    }
  }

  transitKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowRight':
        if (document.activeElement === this.transitTypeTransit.nativeElement) {
          this.transitTypeDirectOnly.nativeElement.focus();
        }
        break;
      case 'ArrowLeft':
        if (document.activeElement === this.transitTypeDirectOnly.nativeElement) {
          this.transitTypeTransit.nativeElement.focus();
        }
        break;
      case 'Tab':
      case 'Enter':
        if (event.shiftKey) {
          event.preventDefault();
          this.onTripSwitchOpen(true);
          this.focusAsync(this.tripSwitch.toggleElement as any);
        } else {
          if (this.isMobileDisplay()) {
            this.onPassengerSelectOpen(true);
            this.focusAsync(this.passengerSelectDropdown.toggleElement);
          } else {
            this.onTransitSwitchOpen(!this.transitSwitch.open);

            if (this.subsidyDiscounts && this.subsidyDiscounts.length > 0) {
              this.subsidyDiscount.infoButton.button.nativeElement.focus();
            } else {
              this.focusOnNextChange.emit();
            }
          }

          if (event.key === 'Tab') {
            event.preventDefault();
          }
        }

        break;
      case 'Escape':
        this.onTransitSwitchOpen(false);
        event.preventDefault();
        this.setFocusOnNativeElement(this.transitSwitch.toggleElement);
        break;
    }
  }

  onSubsidyDiscountInfoButtonKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Tab':
        if (event.shiftKey) {
          if (this.isMobileDisplay()) {
            this.focusAsync(this.passengerSelectDropdown.toggleElement);
          } else {
            this.focusAsync(this.transitSwitch.toggleElement);
          }

          event.preventDefault();
        }
        break;

      default:
        break;
    }
  }

  onPassengersSelectFocusOnNext(): void {
    if (this.isMobileDisplay()) {
      this.passengerSelectDropdown.toggle();
    } else {
      this.onTripSwitchOpen(true);
      this.focusAsync(this.tripSwitch.toggleElement as any);
    }
  }

  focusAsync(refElement: ElementRef): void {
    clearTimeout(this.focusAsyncTimout);

    this.focusAsyncTimout = setTimeout(() => this.setFocusOnNativeElement(refElement));
  }

  onDatepickerFocusOnPrevious(event: KeyboardEvent | MouseEvent): void {
    event.preventDefault();

    this.focusOnAirportSelectBackwards();
  }

  selectPreviousControl(): void {
    if (this.datepickerCombo) {
      if (this.datepickerCombo.outboundOnly) {
        this.outboundOpen = true;
      } else {
        this.inboundOpen = true;
      }
    } else {
      if (this.exists(this.airportSelect.combo)) {
        this.airportSelect.onDestinationOpen(true);
        if (this.airportSelect.airportSelectDropdownDestination) {
          this.focusAsync(this.airportSelect.airportSelectDropdownDestination.input);
        }
      } else {
        this.airportSelect.onOriginOpen(true);
        if (this.airportSelect.airportSelectDropdownOrigin) {
          this.focusAsync((this.airportSelect.airportSelectDropdownOrigin as any).input);
        }
      }
    }

  }

  onFocusOnNextChange(event: KeyboardEvent | MouseEvent): void {
    if (this.isMobileDisplay() && this.tripSwitch) {
      this.onTripSwitchOpen(true);
      this.focusAsync(this.tripSwitch.toggleElement);
    } else if (this.isTabletDisplay()) {
      if (this.passengerSelectDropdown) {
        event.preventDefault();
        setTimeout(() => {
          this.onPassengerSelectOpen(true);
          this.setFocusOnNativeElement(this.passengerSelectDropdown.toggleElement);
        });
      } else if (this.tripSwitch) {
        this.onTripSwitchOpen(true);
        this.focusAsync(this.tripSwitch.toggleElement);
      }
    }
  }

  isMobileDisplay(): boolean {
    return this.deviceHelper.isWidthMobile(this.containerWidth.getValue());
  }

  isTabletDisplay(): boolean {
    return this.deviceHelper.isWidthTablet(this.containerWidth.getValue());
  }

  onOriginOpen(open: boolean): void {
    if (this.passengerSelectDropdown) {
      this.passengerSelectDropdown.open = false;
    }

    if (this.tripSwitch) {
      this.tripSwitch.open = false;
    }

    if (this.transitSwitch) {
      this.transitSwitch.open = false;
    }

    if (this.datepickerCombo) {
      this.datepickerCombo.inboundOpen = false;
      this.datepickerCombo.outboundOpen = false;
    }
    if (this.airportSelect && !this.airportSelect.originOpen) {
      this.updateMaximize();
    }

    this.originOpenChange.emit(open);

    this.changeDetector.detectChanges();
  }

  validateAirportValues(): boolean {
    if (!this.airportSelect) {
      return false;
    }
    const originSnapshot = this.airportSelect.origin;
    const destinationSnapshot = this.airportSelect.destination;
    if ((originSnapshot && destinationSnapshot && originSnapshot.code && originSnapshot.code.length
      && destinationSnapshot.code && destinationSnapshot.code.length)) {
      return true;
    }
    return false;
  }

  updateMaximize(): void {
    setTimeout(() => {
      this.maximize = this.validateAirportValues();
    });
  }

  onDestinationOpen(open: boolean): void {
    if (this.passengerSelectDropdown) {
      this.passengerSelectDropdown.open = false;
    }

    if (this.tripSwitch) {
      this.tripSwitch.open = false;
    }

    if (this.transitSwitch) {
      this.transitSwitch.open = false;
    }

    if (this.datepickerCombo) {
      this.datepickerCombo.inboundOpen = false;
      this.datepickerCombo.outboundOpen = false;
    }
    if (this.airportSelect && !this.airportSelect.destinationOpen) {
      this.updateMaximize();
    }
    this.destinationOpenChange.emit(open);
  }

  onPassengerSelectOpen(open: boolean): void {
    if (this.airportSelect) {
      this.airportSelect.originOpen = false;
      this.airportSelect.destinationOpen = false;
    }

    if (this.tripSwitch) {
      this.tripSwitch.open = false;
    }

    if (this.transitSwitch) {
      this.transitSwitch.open = false;
    }


    if (this.datepickerCombo) {
      if (this.datepickerCombo.inboundOpen) {
        this.datepickerCombo.inboundOpen = false;
      }
      if (this.datepickerCombo.outboundOpen) {
        this.datepickerCombo.outboundOpen = false;
      }
    }

    this.passengerSelectDropdown.open = open;
    this.passengerSelectOpenChange.emit(open);

    if (open) {
      setTimeout(() => {
        if (this.passengerSelect.numberFields.first) {
          this.passengerSelect.numberFields.first.input.nativeElement.focus();
        }
      }, 300);
    }
  }

  onTripSwitchOpen(open: boolean): void {
    clearTimeout(this.tripSwitchFocusTimeout);

    if (this.passengerSelectDropdown) {
      setTimeout(() => {
        this.passengerSelectDropdown.open = false;
      });
    }

    if (this.transitSwitch) {
      this.transitSwitch.open = false;
    }

    if (this.airportSelect) {
      this.airportSelect.originOpen = false;
      this.airportSelect.destinationOpen = false;
    }


    if (this.datepickerCombo) {
      this.datepickerCombo.inboundOpen = false;
      this.datepickerCombo.outboundOpen = false;
    }

    this.tripSwitch.open = open;

    if (open) {
      this.tripSwitchFocusTimeout = setTimeout(() => {
        this.tripTypeRoundTrip.nativeElement.focus();
      }, 200);
    }
  }

  onTransitSwitchOpen(open: boolean): void {
    clearTimeout(this.transitSwitchFocusTimeout);

    if (this.passengerSelectDropdown) {
      this.passengerSelectDropdown.open = false;
    }

    if (this.tripSwitch) {
      this.tripSwitch.open = false;
    }

    if (this.airportSelect) {
      this.airportSelect.originOpen = false;
      this.airportSelect.destinationOpen = false;
    }


    if (this.datepickerCombo) {
      this.datepickerCombo.inboundOpen = false;
      this.datepickerCombo.outboundOpen = false;
    }

    if (this.transitSwitch) {
      this.transitSwitch.open = open;
    }

    if (open) {
      this.transitSwitchFocusTimeout = setTimeout(() => {
        this.transitTypeTransit.nativeElement.focus();
      }, 200);
    }
  }

  onOriginChange(airport: AirportModel): void {
    this.originChange.emit(airport);
  }

  setSelectedOriginAirport(airport: AirportModel): void {
    if (!airport) {
      return;
    }

    this.onOriginChange(airport);

    if (this.originAirportCode === airport.code) {
      return;
    }

    this.originAirportCode = airport.code;
    this.changeDetector.detectChanges();
  }

  onDestinationChange(airport: AirportModel): void {
    this.destinationChange.emit(airport);
  }

  setFocusOnPassengerSelect(event: KeyboardEvent): void {
    this.minimize = false;

    if (this.isMobileDisplay()) {
      if (this.datepickerCombo) {
        event.preventDefault();
        this.outboundOpen = true;
        this.focusAsync((this.datepickerCombo.datepickerOutbound as any).input);
      } else if (this.tripSwitch) {
        event.preventDefault();
        this.onTripSwitchOpen(true);
        this.focusAsync(this.tripSwitch.toggleElement);
      }

    } else if (this.isTabletDisplay() && this.datepickerCombo) {
      setTimeout(() => {
        this.outboundOpen = true;
      });
    } else {
      if (this.passengerSelectDropdown) {

        this.onPassengerSelectOpen(true);
        const currentElementRef = this.passengerSelectDropdown.toggleElement;
        setTimeout(() => this.setFocusOnNativeElement(currentElementRef));

      } else if (this.tripSwitch) {

        this.onTripSwitchOpen(true);
        this.tripSwitch.toggleElement.nativeElement.focus();
      }

    }
  }

  setFocusOnNativeElement(element: ElementRef): void {
    element.nativeElement.focus();
  }

  onTripTypeChange(tripType: TripType): void {
    setTimeout(() => {
      this.tripSwitch.open = false;
    });

    this.tripType = tripType;

    if (this.nasFormGroup && this.nasFormControlNameTripType) {
      const tripSwitchControl = this.nasFormGroup.get(this.nasFormControlNameTripType);
      tripSwitchControl.patchValue(tripType);
    }
  }

  onTransitChange(directOnly: boolean): void {
    setTimeout(() => {
      this.transitSwitch.open = false;
    });

    this.directOnly = directOnly;

    if (this.nasFormGroup && this.nasFormControlNameDirectOnly) {
      const tripTypeControl = this.nasFormGroup.get(this.nasFormControlNameDirectOnly);
      tripTypeControl.patchValue(directOnly);
    }
  }

  getTravelDetailsTripSwitchIconClass(modifiers?: any): Array<ClassModel> {
    const iconMediumBase = new NasComponentBase('icon-medium');

    return [
      iconMediumBase.getClass('', modifiers),
      this.getTravelDetailsClass('icon')
    ];
  }

  getTripSwitchLabel(): string {
    return this.tripType === TripType.twoWayReturn ? this.tripSwitchRoundTripLabel : this.tripSwitchOneWayLabel;
  }

  getTransitLabel(): string {
    return this.directOnly ? this.directOnlyLabel : this.directTransitLabel;
  }

  onAccordionToggleChange(expanded: boolean): void {
    this.displaySummary = !expanded;
  }

  getSummary(): string {
    return `${this.passengerSelectLabel}${this.defaultSummarySeparator}` +
      `${this.getTripSwitchLabel().toLowerCase()}${this.lastSummarySeparator}${this.getTransitLabel().toLowerCase()}`;
  }

  shouldMaximize(): boolean {
    if (!this.exists(this.minimize)) {
      return true;
    } else if (this.airportSelect
      && this.airportSelect.origin
      && this.airportSelect.origin.code
      && this.airportSelect.destination
      && this.airportSelect.destination.code) {
      return true;
    } else if (this.airportSelect && (this.airportSelect.originOpen || this.airportSelect.destinationOpen)) {
      return this.maximize;
    } else if (this.exists(this.minimize)) {
      if (this.maximize) {
        if (this.nasFormGroup) {
          return this.isNasGroupValid;
        }
        return true;
      } else {
        return false;
      }
    }
  }

  private focusOnAirportSelectBackwards(): void {
    if (this.exists(this.airportSelect.combo)) {
      this.airportSelect.onDestinationOpen(true);
      setTimeout(() => {
        this.airportSelect.airportSelectDropdownDestination.input.nativeElement.focus();
      }, 100);

    } else {
      this.airportSelect.onOriginOpen(true);
      this.focusAsync((this.airportSelect.airportSelectDropdownOrigin as any).input);
    }
  }

  private setLatestSearches(abandonedBasket: Array<AbandonedBasketItemModel>, airports: Array<AirportModel>): void {
    if (!abandonedBasket || !airports) {
      return;
    }

    const unique = new Array<AbandonedBasketItemModel>();

    for (const item of abandonedBasket) {
      if (!unique.some(x => x.destinationCode === item.destinationCode)) {
        unique.push(item);
      }
    }

    const originCodes = unique.map(x => x.originCode);
    const destinationCodes = unique.map(x => x.destinationCode);

    const latestSearchesOrigin = airports.filter(airport => {
      return unique.some(x => x.originCode.toLowerCase() === airport.code.toLowerCase());
    });

    const latestSearchesDestination = airports.filter(airport => {
      return unique.some(x => x.destinationCode.toLowerCase() === airport.code.toLowerCase());
    });

    const code = 'code';
    this.latestSearchesOrigin = this.sortService.sortByObject(latestSearchesOrigin, originCodes, code).slice(0, 3);

    if (this.latestSearchesOrigin && this.latestSearchesOrigin.length > 0 && this.exists(this.overrideOrigin)) {
      this.originAirportCode = this.latestSearchesOrigin[0].code;
    }

    this.latestSearchesDestination = this.sortService.sortByObject(latestSearchesDestination, destinationCodes, code).slice(0, 3);
  }

  private closeDropdowns(): void {
    if (this.passengerSelectDropdown) {
      this.passengerSelectDropdown.open = false;
    }

    if (this.tripSwitch) {
      this.tripSwitch.open = false;
    }

    if (this.transitSwitch) {
      this.transitSwitch.open = false;
    }
  }
}
