import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  createValidationErrorId,
  TpValidationErrors,
  validationErrorMessage,
} from '../utils/form-validation';
import { TpComponentColor } from '../utils/component-color';

export type TpInputVariant = 'text' | 'number';
export type TpInputValue = string | number | null;
export type TpInputContentSize = 'sm' | 'md' | 'lg';
export type TpInputColor = TpComponentColor;

const CONTENT_SIZE_MAP: Record<TpInputContentSize, string> = {
  sm: 'var(--tp-text-sm)',
  md: 'var(--tp-text-md)',
  lg: 'var(--tp-text-lg)',
};

@Component({
  selector: 'tp-input',
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './input.html',
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpInput implements FormValueControl<TpInputValue> {
  value = model<TpInputValue>('');
  touched = model(false);
  errors = input<TpValidationErrors>([]);
  invalid = input(false);

  color = input<TpInputColor>('blue');
  variant = input<TpInputVariant>('text');
  title = input('');
  placeholder = input('');
  required = input(false);
  disabled = input(false);
  readonly = input(false);
  name = input('');
  autocomplete = input<string | null>(null);
  min = input<number | undefined>(undefined);
  max = input<number | undefined>(undefined);
  step = input<number | undefined>(undefined);
  hint = input<string | null>(null);
  error = input<string | null>(null);
  requiredMessage = input('This field is required');
  width = input('100%');
  maxWidth = input('none');
  height = input('var(--tp-control-height-sm)');
  maxHeight = input('var(--tp-control-height-md)');
  contentSize = input<TpInputContentSize>('sm');

  protected readonly inputType = computed(() => (this.variant() === 'number' ? 'number' : 'text'));

  protected readonly inputValue = computed(() => this.value() ?? '');

  protected readonly contentFontSize = computed(() => CONTENT_SIZE_MAP[this.contentSize()]);
  protected readonly focusColor = computed(() => `var(--tp-color-${this.color()}-600)`);

  protected readonly isEmpty = computed(() => {
    const value = this.value();
    return value === null || value === '' || (typeof value === 'string' && value.trim() === '');
  });

  protected readonly hasRequiredError = computed(() => this.required() && this.isEmpty());
  protected readonly errorId = createValidationErrorId('tp-input-error');

  protected readonly showError = computed(
    () =>
      !!this.error() ||
      (this.touched() &&
        (this.invalid() || this.errors().length > 0 || this.hasRequiredError())),
  );

  protected readonly displayedError = computed(
    () => this.error() ?? validationErrorMessage(this.errors(), this.requiredMessage()),
  );

  protected updateValue(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    if (this.variant() === 'number') {
      this.value.set(inputElement.value === '' ? null : inputElement.valueAsNumber);
      return;
    }

    this.value.set(inputElement.value);
  }

  protected markAsTouched(): void {
    this.touched.set(true);
  }
}
