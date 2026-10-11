import { formatDate } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  input,
  LOCALE_ID,
  model,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  createTpDefaultMaxDate,
  createTpDefaultMinDate,
  TpDatePicker,
  TpDatePickerColor,
} from '../date-picker/date-picker';
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
export type TpInputDatePickerColor = TpDatePickerColor;

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

@Component({
  selector: 'tp-input-date-picker',
  imports: [TpDatePicker, MatFormFieldModule, MatInputModule],
  templateUrl: './input-date-picker.html',
  styleUrl: './input-date-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpInputDatePicker implements FormValueControl<Date | null> {
  private readonly injector = inject(Injector);
  private readonly locale = inject(LOCALE_ID);

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
  height = input('var(--tp-control-height-md)');
  maxHeight = input('var(--tp-control-height-lg)');

  protected readonly errorId = createValidationErrorId('tp-input-date-picker-error');
  protected readonly focusColor = computed(() => `var(--tp-color-${this.color()}-600)`);
  protected readonly hasRequiredError = computed(() => this.required() && !this.value());
  protected readonly showError = computed(
    () =>
      !!this.error() ||
      (this.touched() &&
        (this.invalid() || this.errors().length > 0 || this.hasRequiredError())),
  );
  protected readonly displayedError = computed(
    () => this.error() ?? validationErrorMessage(this.errors(), this.requiredMessage()),
  );

  protected readonly formattedValue = computed(() => {
    const date = this.value();
    if (!date) return '';

    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = date.getFullYear();

    switch (this.dateFormat()) {
      case 'dd-MMM-yyyy':
        return this.useSlashSeparator()
          ? `${day}/${MONTH_NAMES[date.getMonth()]}/${year}`
          : `${day}-${MONTH_NAMES[date.getMonth()]}-${year}`;
      case 'MM-dd-yyyy':
        return this.useSlashSeparator() ? `${month}/${day}/${year}` : `${month}-${day}-${year}`;
      case 'yyyy-MM-dd':
        return this.useSlashSeparator() ? `${year}/${month}/${day}` : `${year}-${month}-${day}`;
      case 'dd-MM-yyyy':
        return this.useSlashSeparator() ? `${day}/${month}/${year}` : `${day}-${month}-${year}`;
      case 'MM-dd-yy':
        return this.useSlashSeparator()
          ? `${month}/${day}/${year.toString().slice(-2)}`
          : `${month}-${day}-${year.toString().slice(-2)}`;
      case 'dd-MMM-yy':
        return this.useSlashSeparator()
          ? `${day}/${MONTH_NAMES[date.getMonth()]}/${year.toString().slice(-2)}`
          : `${day}-${MONTH_NAMES[date.getMonth()]}-${year.toString().slice(-2)}`;
      case 'dd-MM-yy':
        return this.useSlashSeparator()
          ? `${day}/${month}/${year.toString().slice(-2)}`
          : `${day}-${month}-${year.toString().slice(-2)}`;
      default:
        return formatDate(date, this.dateFormat(), this.locale);
    }
  });

  protected selectDate(date: Date | null, input?: HTMLInputElement): void {
    const shouldFocusInput = this.value() === null && date !== null;

    this.value.set(date);
    this.touched.set(true);

    if (shouldFocusInput) {
      afterNextRender(() => input?.focus(), { injector: this.injector });
    }
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

  protected focusDateInput(event: PointerEvent, input: HTMLInputElement): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.value() !== null) {
      input.focus();
    }
  }

  protected stopCalendarTriggerClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  protected refocusDateInputAfterCalendarOpen(input: HTMLInputElement): void {
    if (this.value() === null) return;

    afterNextRender(
      () => {
        // Material focuses the active calendar cell in a later task.
        setTimeout(() => {
          setTimeout(() => {
            input.focus();
          });
        });
      },
      { injector: this.injector },
    );
  }
}
