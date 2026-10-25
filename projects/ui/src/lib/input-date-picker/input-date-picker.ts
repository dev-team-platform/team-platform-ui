import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  OnChanges,
  viewChild,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MatDateFormats,
  NativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerInput, MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import type { TpComponentColor } from '../utils/component-color';
import {
  createValidationErrorId,
  TpValidationErrors,
  validationErrorMessage,
} from '../utils/form-validation';

export type TpDateFormat =
  | 'dd-MM-yyyy'
  | 'MM-dd-yyyy'
  | 'yyyy-MM-dd'
  | 'dd-MMM-yyyy'
  | 'dd-MM-yy'
  | 'MM-dd-yy'
  | 'dd-MMM-yy';
export type TpInputDatePickerColor = TpComponentColor;

const TP_DEFAULT_MIN_DATE = new Date(1900, 0, 1);
const TP_DEFAULT_MAX_DATE = new Date(2100, 0, 1);
const TP_INPUT_DATE_DISPLAY_FORMAT = 'tpInputDatePicker';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const TP_INPUT_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: null,
  },
  display: {
    dateInput: TP_INPUT_DATE_DISPLAY_FORMAT,
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

function formatInputDate(date: Date, format: TpDateFormat, useSlashSeparator: boolean): string {
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();
  const separator = useSlashSeparator ? '/' : '-';

  switch (format) {
    case 'dd-MMM-yyyy':
      return `${day}${separator}${MONTH_NAMES[date.getMonth()]}${separator}${year}`;
    case 'MM-dd-yyyy':
      return `${month}${separator}${day}${separator}${year}`;
    case 'yyyy-MM-dd':
      return `${year}${separator}${month}${separator}${day}`;
    case 'dd-MM-yyyy':
      return `${day}${separator}${month}${separator}${year}`;
    case 'MM-dd-yy':
      return `${month}${separator}${day}${separator}${year.toString().slice(-2)}`;
    case 'dd-MMM-yy':
      return `${day}${separator}${MONTH_NAMES[date.getMonth()]}${separator}${year
        .toString()
        .slice(-2)}`;
    case 'dd-MM-yy':
      return `${day}${separator}${month}${separator}${year.toString().slice(-2)}`;
  }
}

class TpInputDateAdapter extends NativeDateAdapter {
  private inputFormat: TpDateFormat = 'dd-MM-yyyy';
  private useSlashSeparator = false;

  setInputFormat(format: TpDateFormat, useSlashSeparator: boolean): void {
    this.inputFormat = format;
    this.useSlashSeparator = useSlashSeparator;
  }

  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === TP_INPUT_DATE_DISPLAY_FORMAT) {
      return formatInputDate(date, this.inputFormat, this.useSlashSeparator);
    }

    return super.format(date, displayFormat);
  }
}

function createTpDefaultMinDate(): Date {
  return new Date(TP_DEFAULT_MIN_DATE.getTime());
}

function createTpDefaultMaxDate(): Date {
  return new Date(TP_DEFAULT_MAX_DATE.getTime());
}

@Component({
  selector: 'tp-input-date-picker',
  imports: [FormsModule, MatDatepickerModule, MatFormFieldModule, MatInputModule],
  providers: [
    { provide: DateAdapter, useClass: TpInputDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: TP_INPUT_DATE_FORMATS },
  ],
  templateUrl: './input-date-picker.html',
  styleUrl: './input-date-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpInputDatePicker implements FormValueControl<Date | null>, OnChanges {
  private readonly dateAdapter = inject(DateAdapter) as TpInputDateAdapter;
  protected readonly datePickerInput = viewChild<MatDatepickerInput<Date>>('dateInput');

  value = model<Date | null>(null);
  touched = model(false);
  errors = input<TpValidationErrors>([]);
  invalid = input(false);

  color = input<TpInputDatePickerColor>('blue');
  title = input('');
  placeholder = input('Select date');
  dateFormat = input<TpDateFormat>('dd-MM-yyyy');
  useSlashSeparator = input(false);
  minDate = input<Date>(createTpDefaultMinDate());
  maxDate = input<Date>(createTpDefaultMaxDate());
  disabled = input(false);
  readonly = input(false);
  required = input(false);
  error = input<string | null>(null);
  requiredMessage = input('This field is required');
  name = input('');
  width = input('100%');
  maxWidth = input('none');
  height = input('var(--tp-control-height-sm)');
  maxHeight = input('var(--tp-control-height-md)');

  protected readonly errorId = createValidationErrorId('tp-input-date-picker-error');
  protected readonly focusColor = computed(() => `var(--tp-color-${this.color()}-600)`);
  protected readonly calendarPanelClass = computed(() => [
    'tp-input-date-picker-calendar',
    `tp-input-date-picker-calendar--${this.color()}`,
  ]);
  protected readonly startAt = computed(() => this.value() ?? new Date());
  protected readonly hasRequiredError = computed(() => this.required() && !this.value());
  protected readonly showError = computed(
    () =>
      !!this.error() ||
      (this.touched() && (this.invalid() || this.errors().length > 0 || this.hasRequiredError())),
  );
  protected readonly displayedError = computed(
    () => this.error() ?? validationErrorMessage(this.errors(), this.requiredMessage()),
  );

  ngOnChanges(): void {
    this.dateAdapter.setInputFormat(this.dateFormat(), this.useSlashSeparator());

    const input = this.datePickerInput();
    if (input) {
      input.value = this.value();
    }
  }

  protected selectDate(date: Date | null): void {
    this.value.set(date);
    this.touched.set(true);
  }

  protected clearOnKeydown(event: KeyboardEvent): void {
    if ((event.key !== 'Backspace' && event.key !== 'Delete') || !this.value()) return;

    event.preventDefault();
    this.value.set(null);
    this.touched.set(true);
  }

  protected markAsTouched(): void {
    this.touched.set(true);
  }
}
