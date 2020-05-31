
import {
  async,
  ComponentFixture,
  fakeAsync,
  flush,
  inject,
  TestBed,
  tick
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ButtonModule, DateHelper, DeviceHelper, NasClassModule,
  AbandonedBasketService, SortService, AccordionModule,
  AirportSelectModule, CheckboxModule, DatepickerComboModule, DropdownModule,
  IconModule, PassengerSelectModule, SubsidyDiscountModule, SuggestionsModule, FilterComponent,
  AirportSelectComponent, AirportModel, PassengersModel, PassengerType, SuggestionsComponent,
  DropdownComponent, DatepickerComboComponent, DatepickerComponent, UtcDate
} from '@norwegian/core-components';

import { TripType } from './enums/trip-type.enum';
import { ElementRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;

  const airportOslMock: AirportModel = {
    code: 'OSL',
    countryName: 'Norway',
    name: 'Oslo-Gardermoen (OSL)',
    airportName: 'Gardermoen',
    displayName: 'Oslo-Gardermoen',
    normalizedAirportName: ''
  };

  const airportBgoMock: AirportModel = {
    code: 'BGO',
    countryName: 'Norway',
    name: 'Bergen (BGO)',
    airportName: 'Flesland',
    displayName: 'Bergen',
    normalizedAirportName: ''
  };

  const airportsMock = [airportOslMock, airportBgoMock];

  const airportRelationsMock: Record<string, Array<string>> = {
    osl: ['BGO', 'TRD']
  };
  let passengers: PassengersModel[];
  passengers = [{ label: 'Adult', count: 1, type: PassengerType.Adult },
  { label: 'Children', count: 0, type: PassengerType.Child },
  { label: 'Infant', count: 0, type: PassengerType.Infant }];

  let tripElm: any;
  let transitElm: any;
  let passengersElm: any;
  let originalTimeout: number;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FilterComponent, SuggestionsComponent],
      imports: [
        NasClassModule,
        AirportSelectModule,
        DropdownModule,
        PassengerSelectModule,
        AccordionModule,
        IconModule,
        DatepickerComboModule,
        CheckboxModule,
        ButtonModule,
        SubsidyDiscountModule
      ],
      providers: [SortService, AbandonedBasketService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    jasmine.clock().uninstall();
    jasmine.clock().install();
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;

    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    component.airports = airportsMock;
    component.airportRelations = airportRelationsMock;
    component.labelOrigin = 'From';
    component.labelDestination = 'To';
    component.directOnlyLabel = 'direct';
    component.directTransitLabel = 'indirect';
    component.tripSwitchOneWayLabel = 'on way';
    component.tripSwitchRoundTripLabel = 'round';
    component.passengers = passengers;
    component.isNasGroupValid = true;

    fixture.detectChanges();

    component.passengerSelectDropdown = new DropdownComponent();
    const debugPassengers = fixture.debugElement.query(By.css('.travel-details__dropdown--passengers'));
    passengersElm = debugPassengers.query(By.css('.nas-dropdown__toggle'));
    component.passengerSelectDropdown.toggleElement = { nativeElement: passengersElm.nativeElement };

    component.tripSwitch = new DropdownComponent();
    const tripType = fixture.debugElement.query(By.css('.travel-details__dropdown--trip-type'));
    tripElm = tripType.query(By.css('.nas-dropdown__toggle'));
    component.tripSwitch.toggleElement = { nativeElement: tripElm.nativeElement };

    component.transitSwitch = new DropdownComponent();
    const transitType = fixture.debugElement.query(By.css('.travel-details__dropdown--transit-type'));
    transitElm = transitType.query(By.css('.nas-dropdown__toggle'));
    component.transitSwitch.toggleElement = { nativeElement: transitElm.nativeElement };

  });

  afterEach(() => {
    jasmine.clock().uninstall();
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set airports', () => {
    component.displayLatestSearches = true;
    component.airports = [airportOslMock, airportBgoMock];
    expect(component.airports).toEqual([airportOslMock, airportBgoMock]);
  });

  it('should set trip type', () => {
    component.tripType = TripType.twoWayReturn;
    expect(component.tripType).toBe(TripType.twoWayReturn);
    component.tripType = TripType.twoWayReturn;
    expect(component.tripType).toBe(TripType.twoWayReturn);
  });

  it('should set direct only', () => {
    component.directOnly = true;
    expect(component.directOnly).toBeTruthy();
    component.directOnly = true;
    expect(component.directOnly).toBeTruthy();
  });

  it('should toggle origin', () => {
    component.passengerSelectDropdown = new DropdownComponent();
    component.tripSwitch = new DropdownComponent();
    component.transitSwitch = new DropdownComponent();
    component.airportSelect = TestBed.createComponent(AirportSelectComponent).componentInstance;

    component.onOriginOpen(true);

    expect(component.passengerSelectDropdown.open).toBeFalsy();
    expect(component.tripSwitch.open).toBeFalsy();
    expect(component.transitSwitch.open).toBeFalsy();

    component.onOriginOpen(false);
    expect(component.passengerSelectDropdown.open).toBeFalsy();
    expect(component.tripSwitch.open).toBeFalsy();
    expect(component.transitSwitch.open).toBeFalsy();
    expect(component.airportSelect.originOpen).toBeFalsy();

  });

  it('should toggle destination', () => {
    component.passengerSelectDropdown = new DropdownComponent();
    component.tripSwitch = new DropdownComponent();
    component.transitSwitch = new DropdownComponent();
    component.airportSelect = TestBed.createComponent(AirportSelectComponent).componentInstance;

    component.onDestinationOpen(true);
    expect(component.passengerSelectDropdown.open).toBeFalsy();
    expect(component.tripSwitch.open).toBeFalsy();
    expect(component.transitSwitch.open).toBeFalsy();

    component.onDestinationOpen(false);
    expect(component.passengerSelectDropdown.open).toBeFalsy();
    expect(component.tripSwitch.open).toBeFalsy();
    expect(component.transitSwitch.open).toBeFalsy();
    expect(component.airportSelect.destinationOpen).toBeFalsy();
  });

  it('should toggle passenger select', fakeAsync(() => {
    component.passengerSelectDropdown = new DropdownComponent();
    component.tripSwitch = new DropdownComponent();
    component.transitSwitch = new DropdownComponent();
    component.airportSelect = TestBed.createComponent(AirportSelectComponent).componentInstance;

    component.onPassengerSelectOpen(true);

    flush();
    fixture.detectChanges();

    expect(component.passengerSelectDropdown.open).toBeTruthy();
    expect(component.tripSwitch.open).toBeFalsy();
    expect(component.transitSwitch.open).toBeFalsy();
    expect(component.airportSelect.originOpen).toBeFalsy();
    expect(component.airportSelect.destinationOpen).toBeFalsy();

    component.onPassengerSelectOpen(false);

    flush();
    fixture.detectChanges();

    expect(component.passengerSelectDropdown.open).toBeFalsy();
    expect(component.tripSwitch.open).toBeFalsy();
    expect(component.transitSwitch.open).toBeFalsy();
    expect(component.airportSelect.originOpen).toBeFalsy();
    expect(component.airportSelect.destinationOpen).toBeFalsy();
  }));

  it('should toggle trip switch', fakeAsync(() => {
    component.passengerSelectDropdown = new DropdownComponent();
    component.tripSwitch = new DropdownComponent();
    component.transitSwitch = new DropdownComponent();
    component.airportSelect = TestBed.createComponent(AirportSelectComponent).componentInstance;

    component.onTripSwitchOpen(true);

    flush();
    fixture.detectChanges();

    expect(component.passengerSelectDropdown.open).toBeFalsy();
    expect(component.tripSwitch.open).toBeTruthy();
    expect(component.transitSwitch.open).toBeFalsy();
    expect(component.airportSelect.originOpen).toBeFalsy();
    expect(component.airportSelect.destinationOpen).toBeFalsy();

    component.onTripSwitchOpen(false);

    flush();
    fixture.detectChanges();

    expect(component.passengerSelectDropdown.open).toBeFalsy();
    expect(component.tripSwitch.open).toBeFalsy();
    expect(component.transitSwitch.open).toBeFalsy();
    expect(component.airportSelect.originOpen).toBeFalsy();
    expect(component.airportSelect.destinationOpen).toBeFalsy();
  }));

  it('should toggle transit switch open', fakeAsync(() => {
    component.passengerSelectDropdown = new DropdownComponent();
    component.tripSwitch = new DropdownComponent();
    component.transitSwitch = new DropdownComponent();
    component.airportSelect = TestBed.createComponent(AirportSelectComponent).componentInstance;

    component.onTransitSwitchOpen(true);

    flush();
    fixture.detectChanges();

    expect(component.passengerSelectDropdown.open).toBeFalsy();
    expect(component.tripSwitch.open).toBeFalsy();
    expect(component.transitSwitch.open).toBeTruthy();
    expect(component.airportSelect.originOpen).toBeFalsy();
    expect(component.airportSelect.destinationOpen).toBeFalsy();

    component.onTransitSwitchOpen(false);

    flush();
    fixture.detectChanges();

    expect(component.passengerSelectDropdown.open).toBeFalsy();
    expect(component.tripSwitch.open).toBeFalsy();
    expect(component.transitSwitch.open).toBeFalsy();
    expect(component.airportSelect.originOpen).toBeFalsy();
    expect(component.airportSelect.destinationOpen).toBeFalsy();
  }));

  it('should handle origin change', () => {
    component.onOriginChange(airportOslMock);

    expect(component).toBeTruthy();
  });

  it('should handle destination change', () => {
    component.onDestinationChange(airportOslMock);

    expect(component).toBeTruthy();
  });

  it('should open triptype popup', fakeAsync(() => {
    const deviceService = TestBed.get(DeviceHelper);
    spyOn(deviceService, 'isWidthMobile').and.returnValue(true);
    component.setFocusOnPassengerSelect(new KeyboardEvent('Keydown'));

    flush();
    fixture.detectChanges();

    expect(component.tripSwitch.open).toBeTruthy();
  }));

  it('should open passengerSelect popup for desktop', fakeAsync(() => {
    const deviceService = TestBed.get(DeviceHelper);

    spyOn(deviceService, 'isWidthMobile').and.returnValue(false);
    spyOn(deviceService, 'isWidthTablet').and.returnValue(false);

    component.setFocusOnPassengerSelect(new KeyboardEvent('Keydown'));

    flush();
    fixture.detectChanges();

    expect(component.passengerSelectDropdown.open).toBeTruthy();
  }));

  it('should open passerngerSelect popup for desktop', fakeAsync(() => {
    const deviceService = TestBed.get(DeviceHelper);

    spyOn(deviceService, 'isWidthMobile').and.returnValue(false);
    spyOn(deviceService, 'isWidthTablet').and.returnValue(false);
    component.setFocusOnPassengerSelect(new KeyboardEvent('Keydown'));

    flush();
    fixture.detectChanges();

    expect(component.passengerSelectDropdown.open).toBeTruthy();
  }));

  it('should open tripSwitch popup from date combo focus next', fakeAsync(() => {
    const deviceService = TestBed.get(DeviceHelper);
    spyOn(deviceService, 'isWidthMobile').and.returnValue(true);
    const eventMock = { preventDefault: () => { } };
    component.onFocusOnNextChange(new KeyboardEvent('Keydown'));
    tripElm.triggerEventHandler('focus', eventMock);

    flush();
    fixture.detectChanges();

    expect(component.tripSwitch.open).toBeTruthy();
  }));

  it('should open tripSwitch popup from date combo focus next in tablet mode', fakeAsync(() => {
    const deviceService = TestBed.get(DeviceHelper);

    spyOn(deviceService, 'isWidthMobile').and.returnValue(false);
    spyOn(deviceService, 'isWidthTablet').and.returnValue(true);
    const eventMock = { preventDefault: () => { } };
    (<any>component).datepickerCombo = { outboundOnly: true };
    component.passengerSelectDropdown = null;
    component.onFocusOnNextChange(new KeyboardEvent('Keydown'));
    tripElm.triggerEventHandler('focus', eventMock);

    flush();
    fixture.detectChanges();

    expect(component.tripSwitch.open).toBeTruthy();
  }));


  it('should open passengerSelect popup from date combo focus next', fakeAsync(() => {
    const deviceService = TestBed.get(DeviceHelper);

    spyOn(deviceService, 'isWidthMobile').and.returnValue(false);
    spyOn(deviceService, 'isWidthTablet').and.returnValue(true);
    const eventMock = { preventDefault: () => { } };
    (<any>component).datepickerCombo = { outboundOnly: true };
    component.onFocusOnNextChange(new KeyboardEvent('Keydown'));
    passengersElm.triggerEventHandler('focus', eventMock);

    flush();
    fixture.detectChanges();

    expect(component.passengerSelectDropdown.open).toBeTruthy();
  }));

  it('should handle transit key down event',
    inject([DeviceHelper, DateHelper], (deviceService: DeviceHelper) => {
      const mobileSpy = spyOn(deviceService, 'isWidthMobile');
      const mockEvent: any = { key: 'Tab', shiftKey: false, preventDefault: () => { } };

      component.transitKeyDown(mockEvent);
      expect(component).toBeTruthy();

      mockEvent.shiftKey = true;
      mobileSpy.and.returnValue(true);
      component.transitKeyDown(mockEvent);
      expect(component).toBeTruthy();

      component.transitSwitch.toggleElement.nativeElement.focus();
      component.transitKeyDown(mockEvent);
      expect(component).toBeTruthy();

      mockEvent.key = 'Enter';
      component.transitKeyDown(mockEvent);
      expect(component).toBeTruthy();


      component.transitSwitch.open = true;
      component.transitKeyDown(mockEvent);
      expect(component).toBeTruthy();

      mobileSpy.and.returnValue(false);
      component.transitKeyDown(mockEvent);
      expect(component).toBeTruthy();

      mockEvent.key = 'Escape';
      component.transitKeyDown(mockEvent);
      expect(component).toBeTruthy();

    }));


  it('should select useSwitch in airport select dropdown on shif+tab on passengers when desktop',
    inject([DeviceHelper, DateHelper],
      (deviceService: DeviceHelper, dateService: DateHelper) => {
        const mobileSpy = spyOn(deviceService, 'isWidthMobile');
        mobileSpy.and.returnValue(true);
        const tabMockEvent: any = { key: 'Tab', shiftKey: true, preventDefault: () => { } };
        component.airportSelect.useSwitch = true;
        component.airportSelect.switchButton = new ElementRef(document.createElement('div'));
        component.passengerSelectDropdown.toggleElement.nativeElement.focus();
        component.onTripSwitchKeyDown(tabMockEvent);
        jasmine.clock().tick(101);
        expect(component.airportSelect.originOpen).toBeFalsy();

        tabMockEvent.shiftKey = false;
        component.tripTypeOneway.nativeElement.focus();
        component.onTripSwitchKeyDown(tabMockEvent);
        expect(component).toBeTruthy();

        tabMockEvent.shiftKey = true;
        component.transitSwitch.toggleElement.nativeElement.focus();
        component.datepickerCombo = new DatepickerComboComponent(dateService, deviceService);
        component.datepickerCombo.datepickerOutbound = TestBed.createComponent(DatepickerComponent).componentInstance;
        component.onTripSwitchKeyDown(tabMockEvent);
        expect(component).toBeTruthy();

        component.datepickerCombo.datepickerInbound = new ElementRef(document.createElement('div'));
        component.onTripSwitchKeyDown(tabMockEvent);
        expect(component).toBeTruthy();

        mobileSpy.and.returnValue(false);
        component.passengerSelectDropdown = null;
        component.onTripSwitchKeyDown(tabMockEvent);
        expect(component).toBeTruthy();

        tabMockEvent.shiftKey = true;
        tabMockEvent.key = 'Enter';
        component.onTripSwitchKeyDown(tabMockEvent);
        expect(component).toBeTruthy();

        tabMockEvent.key = 'Escape';
        component.onTripSwitchKeyDown(tabMockEvent);
        expect(component).toBeTruthy();

      }));

  it('should select destination in airport select on tab+shift on tripSwitch on mobile/tablet',
    inject([DeviceHelper, DateHelper], (deviceService: DeviceHelper) => {
      spyOn(deviceService, 'isWidthMobile').and.returnValue(true);
      const mockEvent: any = { key: 'Tab', shiftKey: true, preventDefault: () => { } };
      component.airportSelect.useSwitch = false;
      component.airportSelect.combo = true;
      component.tripSwitch.toggleElement.nativeElement.focus();
      component.onTripSwitchKeyDown(mockEvent);

      expect(component.airportSelect.destinationOpen).toBeTruthy();

    }));

  it('should select origin in airport select on tab+shift on tripSwitch on mobile/tablet',
    inject([DeviceHelper, DateHelper], (deviceService: DeviceHelper) => {
      spyOn(deviceService, 'isWidthMobile').and.returnValue(true);
      const mockEvent: any = { key: 'Tab', shiftKey: true, preventDefault: () => { } };
      component.airportSelect.useSwitch = false;
      component.airportSelect.combo = false;
      component.tripSwitch.toggleElement.nativeElement.focus();
      component.onTripSwitchKeyDown(mockEvent);

      jasmine.clock().tick(101);

      expect(component.airportSelect.originOpen).toBeTruthy();

    }));

  it('should select switch button in airport select on tab+shift on tripSwitch on desktop ',
    inject([DeviceHelper, DateHelper], (deviceService: DeviceHelper) => {
      spyOn(deviceService, 'isWidthMobile').and.returnValue(false);
      spyOn(deviceService, 'isWidthTablet').and.returnValue(false);
      const mockEvent: any = { key: 'Tab', shiftKey: true, preventDefault: () => { } };
      component.airportSelect.useSwitch = true;
      component.airportSelect.switchButton = { nativeElement: { focus: () => { } } };
      component.tripSwitch.toggleElement.nativeElement.focus();
      component.onTripSwitchKeyDown(mockEvent);
      jasmine.clock().tick(101);
      expect(component.airportSelect.originOpen).toBeFalsy();

    }));

  it('should select airport-select destination on shif+tab on passengers',
    inject([DeviceHelper, DateHelper], (deviceService: DeviceHelper) => {
      spyOn(deviceService, 'isWidthMobile').and.returnValue(false);
      spyOn(deviceService, 'isWidthTablet').and.returnValue(true);

      component.airportSelect.useSwitch = false;
      component.airportSelect.combo = true;
      const mockEvent: any = { key: 'Enter', shiftKey: true, preventDefault: () => { } };

      component.onDatepickerFocusOnPrevious(mockEvent);
      jasmine.clock().tick(101);

      expect(component.airportSelect.destinationOpen).toBeTruthy();
    }));

  it('should select airport-select origin on shif+tab on passengers',
    inject([DeviceHelper, DateHelper], (deviceService: DeviceHelper) => {
      spyOn(deviceService, 'isWidthMobile').and.returnValue(false);
      spyOn(deviceService, 'isWidthTablet').and.returnValue(true);

      component.airportSelect.useSwitch = false;
      component.airportSelect.combo = false;
      const mockEvent: any = { key: 'Enter', shiftKey: true, preventDefault: () => { } };

      component.onDatepickerFocusOnPrevious(mockEvent);
      jasmine.clock().tick(101);

      expect(component.airportSelect.originOpen).toBeTruthy();
    }));

  it('should change triptype to oneway', () => {
    component.onTripTypeChange(TripType.oneWay);
    expect(component.tripType).toEqual(TripType.oneWay);
    expect(component.tripSwitch.open).toBeFalsy();
  });

  it('should change transit type to direct only', () => {
    component.onTransitChange(true);
    expect(component.directOnly).toBeTruthy();
  });

  it('should toggle accordian to expanded', () => {
    component.onAccordionToggleChange(false);
    expect(component.displaySummary).toBeTruthy();
  });

  it('should toggle accordian to expanded', () => {
    component.passengerSelectLabel = 'passengers';
    const result = component.getSummary();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should emit inboundMonthChange', () => {
    const dateVal = new Date();
    const utcDate = new UtcDate(dateVal.getFullYear(), dateVal.getMonth(), 1);
    spyOn(component.inboundMonthChange, 'emit');
    component.onInboundMonthChange(utcDate);
    expect(component.inboundMonthChange.emit).toHaveBeenCalledWith(utcDate);
  });

  it('should emit outboundMonthChange', () => {
    const dateVal = new Date();
    const utcDate = new UtcDate(dateVal.getFullYear(), dateVal.getMonth(), 1);
    spyOn(component.outboundMonthChange, 'emit');
    component.onOutboundMonthChange(utcDate);
    expect(component.outboundMonthChange.emit).toHaveBeenCalledWith(utcDate);
  });

  it('should set and get closest airports', () => {
    component.closestAirports = [];
    component.closestAirports = airportsMock;

    expect(component.closestAirports).toEqual(airportsMock);
  });

  it('should set and get outbound selected date', () => {
    const dateMock = new UtcDate(2019, 5, 19);
    component.outboundSelectedDate = null;
    component.outboundSelectedDate = dateMock;

    jasmine.clock().tick(101);

    expect(component.outboundSelectedDate).toEqual(dateMock);
  });

  it('should set and get inbound selected date', () => {
    const dateMock = new UtcDate(2019, 5, 19);
    component.inboundSelectedDate = null;
    component.inboundSelectedDate = dateMock;

    jasmine.clock().tick(101);

    expect(component.inboundSelectedDate).toEqual(dateMock);
  });

  it('should get and set inbound selected month', () => {
    const dateMock = new UtcDate(2019, 5, 19);

    component.inboundSelectedMonth = dateMock;
    component.inboundSelectedMonth = dateMock;

    expect(component.inboundSelectedMonth).toEqual(dateMock);
  });

  it('should set selected airport', () => {
    component.setSelectedOriginAirport(null);
    expect(component).toBeDefined();

    component.setSelectedOriginAirport(airportOslMock);
    expect(component.originAirportCode).toBe(airportOslMock.code);
  });

  it('should handle onFocusOnNextPassengers', () => {
    spyOn(component, 'isMobileDisplay').and.returnValue(true);
    const passengerSpy = spyOn(component.passengerSelectDropdown, 'toggle');
    component.onPassengersSelectFocusOnNext();
    expect(passengerSpy).toHaveBeenCalled();
  });

  it('should get suggestions', () => {
    component.latestSearchesOrigin = [];
    const result = component.getSuggestions();
    expect(result.length).toEqual(0);
  });

  it('should get ClosestAirports', () => {
    spyOn(component.positionChange, 'emit');
    component.getClosestAirports(null);
    expect(component.positionChange.emit).toHaveBeenCalledWith(null);
  });

  it('should handle onSubsidyDiscountInfoClick', () => {
    spyOn(component.subsidyDiscountInfoClick, 'emit');
    component.onSubsidyDiscountInfoClick();
    expect(component.subsidyDiscountInfoClick.emit).toHaveBeenCalledWith();
  });

  it('should get travel details trip-switch-icon class', () => {
    const result = component.getTravelDetailsTripSwitchIconClass();
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('should throw error if no airports', () => {
    component.airports = null;

    expect(() => component.ngOnInit()).toThrowError('Missing input: [airports]');
  });

  it('should throw error if not airport relations', () => {
    component.airports = airportsMock;
    component.airportRelations = null;

    expect(() => component.ngOnInit()).toThrowError('Missing input: [airportRelations]');
  });

  it('should run ngonit for reactive form', () => {
    component.nasFormControlNameDirectOnly = 'directOnly';
    component.nasFormControlNameInbound = 'inbound';
    component.nasFormGroup = new FormGroup({
      from: new FormControl('from'),
      tripType: new FormControl('tripType'),
      nasFormControlNameInbound: new FormControl('inbound'),
      nasFormControlNameDirectOnly: new FormControl('directOnly')
    });
    component.airports = airportsMock;
    component.airportRelations = airportRelationsMock;
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

  it('should on previous element than passenger dropdwn', () => {
    const mobileSpy = spyOn(component, 'isMobileDisplay');
    mobileSpy.and.returnValue(true);
    component.transitSwitch = new DropdownComponent();
    component.transitSwitch.open = false;
    component.onPassengersSelectFocusOnPrevious();
    expect(component).toBeTruthy();

    mobileSpy.and.returnValue(false);
    const tabletSpy = spyOn(component, 'isTabletDisplay');
    tabletSpy.and.returnValue(true);
    component.onPassengersSelectFocusOnPrevious();
    expect(component).toBeTruthy();

    tabletSpy.and.returnValue(false);
    component.onPassengersSelectFocusOnPrevious();
    expect(component).toBeTruthy();
  });

  it('should open inbound', () => {
    component.inboundOpen = true;
    jasmine.clock().tick(101);

    expect(component.inboundOpen).toBeTruthy();

    component.inboundOpen = true;
    jasmine.clock().tick(101);

    expect(component.inboundOpen).toBeTruthy();

    component.inboundOpen = false;
    jasmine.clock().tick(101);

    expect(component.inboundOpen).toBeFalsy();
  });

  it('should open outbound', () => {
    component.outboundOpen = true;

    expect(component.outboundOpen).toBeTruthy();

    component.outboundOpen = true;

    expect(component.outboundOpen).toBeTruthy();

    component.outboundOpen = false;

    expect(component.outboundOpen).toBeFalsy();
  });
});
