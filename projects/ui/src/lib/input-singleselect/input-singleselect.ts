import { ScrollDispatcher } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormValueControl } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { TpSpinner } from '../spinner/spinner';
import {
  getSelectOptionText,
  TpSelectOption,
  TpSelectOptionDisplayFn,
} from '../utils/select-option';
import {
  createValidationErrorId,
  TpValidationErrors,
  validationErrorMessage,
} from '../utils/form-validation';
import { TpComponentColor } from '../utils/component-color';

export type TpSingleselectOption = TpSelectOption;

export type TpInputSingleselectContentSize = 'sm' | 'md' | 'lg';
export type TpInputSingleselectColor = TpComponentColor;

const CONTENT_SIZE_MAP: Record<TpInputSingleselectContentSize, string> = {
  sm: 'var(--tp-font-size-default)',
  md: 'var(--tp-text-md)',
  lg: 'var(--tp-text-lg)',
};

@Component({
  selector: 'tp-input-singleselect',
  host: {
    '[style.--tp-input-singleselect-height]': 'height()',
    '[style.--tp-input-singleselect-max-height]': 'maxHeight()',
  },
  imports: [MatButtonModule, MatFormFieldModule, MatSelectModule, TpSpinner],
  templateUrl: './input-singleselect.html',
  styleUrl: './input-singleselect.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpInputSingleselect implements FormValueControl<TpSelectOption | null> {
  value = model<TpSelectOption | null>(null);
  touched = model(false);
  errors = input<TpValidationErrors>([]);
  invalid = input(false);

  color = input<TpInputSingleselectColor>('blue');
  options = input<readonly TpSingleselectOption[]>([]);
  displayWith = input<TpSelectOptionDisplayFn | null>(null);
  loading = input(false);
  loadingMessage = input('Loading');
  noResultsMessage = input('No matching results');
  title = input('');
  placeholder = input('');
  required = input(false);
  disabled = input(false);
  readonly = input(false);
  name = input('');
  ariaLabel = input<string | null>(null);
  hint = input<string | null>(null);
  error = input<string | null>(null);
  requiredMessage = input('This field is required');
  width = input('100%');
  maxWidth = input('none');
  height = input('var(--tp-control-height-sm)');
  maxHeight = input('var(--tp-control-height-md)');
  contentSize = input<TpInputSingleselectContentSize>('sm');

  private readonly select = viewChild(MatSelect);
  private readonly scrollDispatcher = inject(ScrollDispatcher);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.scrollDispatcher
      .scrolled()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.select()?.close());
  }

  protected readonly contentFontSize = computed(() => CONTENT_SIZE_MAP[this.contentSize()]);
  protected readonly focusColor = computed(() => `var(--tp-color-${this.color()}-600)`);
  protected readonly selectedOptionBackgroundColor = computed(
    () => `var(--tp-color-${this.color()}-100)`,
  );
  protected readonly selectedOptionTextColor = computed(
    () => `var(--tp-color-${this.color()}-900)`,
  );

  protected readonly isEmpty = computed(() => {
    const value = this.value();
    return value === null || this.optionText(value).trim() === '';
  });

  protected readonly hasRequiredError = computed(() => this.required() && this.isEmpty());
  protected readonly errorId = createValidationErrorId('tp-input-singleselect-error');

  protected readonly showError = computed(
    () =>
      !!this.error() ||
      (this.touched() && (this.invalid() || this.errors().length > 0 || this.hasRequiredError())),
  );

  protected readonly displayedError = computed(
    () => this.error() ?? validationErrorMessage(this.errors(), this.requiredMessage()),
  );

  protected optionText(option: TpSelectOption | null): string {
    return getSelectOptionText(option, this.displayWith());
  }

  protected selectOption(event: MatSelectChange): void {
    this.value.set(event.value as TpSingleselectOption);
    this.touched.set(true);
  }

  protected clearValue(event: MouseEvent): void {
    event.stopPropagation();
    this.value.set(null);
    this.touched.set(true);
  }

  protected markAsTouched(): void {
    this.touched.set(true);
  }
}
