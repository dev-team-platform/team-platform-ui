import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';

import { TpInputDatePicker } from './input-date-picker';

describe('InputDatePicker', () => {
  let component: TpInputDatePicker;
  let fixture: ComponentFixture<TpInputDatePicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TpInputDatePicker],
    }).compileComponents();

    fixture = TestBed.createComponent(TpInputDatePicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use its color for the focus ring and Material calendar', async () => {
    fixture.componentRef.setInput('color', 'red');
    fixture.detectChanges();
    await fixture.whenStable();

    const formField = fixture.nativeElement.querySelector('mat-form-field') as HTMLElement;
    const datePicker = fixture.debugElement.query(By.directive(MatDatepicker))
      .componentInstance as MatDatepicker<Date>;

    expect(formField.style.getPropertyValue('--tp-input-date-picker-focus-color')).toBe(
      'var(--tp-color-red-600)',
    );
    expect(datePicker.panelClass).toEqual([
      'tp-input-date-picker-calendar',
      'tp-input-date-picker-calendar--red',
    ]);
  });

  it('should not show a required marker without a title', async () => {
    fixture.componentRef.setInput('title', '');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const marker = fixture.nativeElement.querySelector(
      '.tp-input-date-picker__required-marker',
    ) as HTMLElement;

    expect(marker).toBeNull();
  });

  it('should default its allowed range to 1 January 1900 through 1 January 2100', () => {
    const datePickerInput = fixture.debugElement.query(By.directive(MatDatepickerInput))
      .componentInstance as MatDatepickerInput<Date>;

    expect(datePickerInput.min).toEqual(new Date(1900, 0, 1));
    expect(datePickerInput.max).toEqual(new Date(2100, 0, 1));
  });

  it('should update its signal value when Material selects a date', async () => {
    const selectedDate = new Date(2030, 3, 12);
    const datePicker = fixture.debugElement.query(By.directive(MatDatepicker))
      .componentInstance as MatDatepicker<Date>;

    datePicker.select(selectedDate);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.value()).toEqual(selectedDate);
  });

  it.each(['Backspace', 'Delete'])('should clear the selected date with the %s key', (key) => {
    component.value.set(new Date(2030, 3, 12));
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      '.tp-input-date-picker__control',
    ) as HTMLInputElement;
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    input.dispatchEvent(event);
    fixture.detectChanges();

    expect(event.defaultPrevented).toBe(true);
    expect(component.value()).toBeNull();
    expect(input.value).toBe('');
  });

  it('should not open the calendar when the date input is clicked', () => {
    const datePicker = fixture.debugElement.query(By.directive(MatDatepicker))
      .componentInstance as MatDatepicker<Date>;
    const input = fixture.nativeElement.querySelector(
      '.tp-input-date-picker__control',
    ) as HTMLInputElement;

    input.click();

    expect(document.activeElement).toBe(input);
    expect(datePicker.opened).toBe(false);
  });

  it('should open the calendar when the Material calendar toggle is clicked', () => {
    const datePicker = fixture.debugElement.query(By.directive(MatDatepicker))
      .componentInstance as MatDatepicker<Date>;
    const trigger = fixture.nativeElement.querySelector(
      'mat-datepicker-toggle button',
    ) as HTMLButtonElement;

    trigger.click();

    expect(datePicker.opened).toBe(true);
  });

  it.each([
    ['dd-MM-yyyy', false, '09-07-2032'],
    ['dd-MM-yyyy', true, '09/07/2032'],
    ['MM-dd-yyyy', false, '07-09-2032'],
    ['MM-dd-yyyy', true, '07/09/2032'],
    ['yyyy-MM-dd', false, '2032-07-09'],
    ['yyyy-MM-dd', true, '2032/07/09'],
    ['dd-MMM-yyyy', false, '09-Jul-2032'],
    ['dd-MMM-yyyy', true, '09/Jul/2032'],
    ['dd-MM-yy', false, '09-07-32'],
    ['dd-MM-yy', true, '09/07/32'],
    ['MM-dd-yy', false, '07-09-32'],
    ['MM-dd-yy', true, '07/09/32'],
    ['dd-MMM-yy', false, '09-Jul-32'],
    ['dd-MMM-yy', true, '09/Jul/32'],
  ] as const)(
    'should display %s with useSlashSeparator set to %s without changing the Date value',
    async (format, useSlashSeparator, expected) => {
      const date = new Date(2032, 6, 9);
      component.value.set(date);
      fixture.componentRef.setInput('dateFormat', format);
      fixture.componentRef.setInput('useSlashSeparator', useSlashSeparator);
      fixture.detectChanges();
      await fixture.whenStable();

      const input = fixture.nativeElement.querySelector(
        '.tp-input-date-picker__control',
      ) as HTMLInputElement;

      expect(input.value).toBe(expected);
      expect(component.value()).toBe(date);
    },
  );

  it('should apply height and max-height control tokens', async () => {
    fixture.componentRef.setInput('height', '36px');
    fixture.componentRef.setInput('maxHeight', '44px');
    fixture.detectChanges();
    await fixture.whenStable();

    const formField = fixture.nativeElement.querySelector('mat-form-field') as HTMLElement;

    expect(formField.style.getPropertyValue('--tp-input-date-picker-height')).toBe('36px');
    expect(formField.style.getPropertyValue('--tp-input-date-picker-max-height')).toBe('44px');
  });
});
