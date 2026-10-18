import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  numberAttribute,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  createValidationErrorId,
  TpValidationErrors,
  validationErrorMessage,
} from '../utils/form-validation';
import { TpComponentColor } from '../utils/component-color';

export type TpTextAreaColor = TpComponentColor;

@Component({
  selector: 'tp-text-area',
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './text-area.html',
  styleUrl: './text-area.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpTextArea implements FormValueControl<string> {
  value = model('');
  touched = model(false);
  errors = input<TpValidationErrors>([]);
  invalid = input(false);

  color = input<TpTextAreaColor>('blue');
  title = input('');
  placeholder = input('');
  required = input(false);
  disabled = input(false);
  readonly = input(false);
  name = input('');
  rows = input(3, { transform: (value: unknown) => Math.max(3, numberAttribute(value, 3)) });
  maxLength = input<number | undefined>(undefined);
  hint = input<string | null>(null);
  error = input<string | null>(null);
  requiredMessage = input('This field is required');
  width = input('100%');
  maxWidth = input('none');

  protected readonly hasCharacterLimit = computed(() => this.maxLength() !== undefined);

  protected readonly characterCount = computed(() => this.value().length);
  protected readonly focusColor = computed(() => `var(--tp-color-${this.color()}-600)`);

  protected readonly isEmpty = computed(() => this.value().trim() === '');

  protected readonly hasRequiredError = computed(() => this.required() && this.isEmpty());
  protected readonly errorId = createValidationErrorId('tp-text-area-error');

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
    this.value.set((event.target as HTMLTextAreaElement).value);
  }

  protected markAsTouched(): void {
    this.touched.set(true);
  }
}
