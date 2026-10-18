import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { FormValueControl } from '@angular/forms/signals';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  MatAutocompleteTrigger,
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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

export type TpAutocompleteSingleselectOption = TpSelectOption;

export type TpInputAutocompleteSingleselectContentSize = 'sm' | 'md' | 'lg';
export type TpInputAutocompleteSingleselectColor = TpComponentColor;

const CONTENT_SIZE_MAP: Record<TpInputAutocompleteSingleselectContentSize, string> = {
  sm: 'var(--tp-text-sm)',
  md: 'var(--tp-text-md)',
  lg: 'var(--tp-text-lg)',
};

@Component({
  selector: 'tp-input-autocomplete-singleselect',
  imports: [MatAutocompleteModule, MatButtonModule, MatFormFieldModule, MatInputModule, TpSpinner],
  templateUrl: './input-autocomplete-singleselect.html',
  styleUrl: './input-autocomplete-singleselect.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpInputAutocompleteSingleselect implements FormValueControl<TpSelectOption | null> {
  value = model<TpSelectOption | null>('');
  touched = model(false);
  errors = input<TpValidationErrors>([]);
  invalid = input(false);

  color = input<TpInputAutocompleteSingleselectColor>('blue');
  options = input<readonly TpAutocompleteSingleselectOption[]>([]);
  displayWith = input<TpSelectOptionDisplayFn | null>(null);
  onSearch = output<string>();
  loading = input(false);
  loadingMessage = input('Loading');
  noResultsMessage = input('No matching results');
  title = input('');
  placeholder = input('');
  required = input(false);
  disabled = input(false);
  readonly = input(false);
  name = input('');
  autocomplete = input<string | null>(null);
  ariaLabel = input<string | null>(null);
  hint = input<string | null>(null);
  error = input<string | null>(null);
  requiredMessage = input('This field is required');
  width = input('100%');
  maxWidth = input('none');
  height = input('var(--tp-control-height-md)');
  maxHeight = input('var(--tp-control-height-lg)');
  contentSize = input<TpInputAutocompleteSingleselectContentSize>('md');

  private readonly suggestionsTrigger = viewChild(MatAutocompleteTrigger);
  private readonly scrollDispatcher = inject(ScrollDispatcher);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.scrollDispatcher
      .scrolled()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.suggestionsTrigger()?.closePanel());
  }

  protected readonly contentFontSize = computed(() => CONTENT_SIZE_MAP[this.contentSize()]);
  protected readonly focusColor = computed(() => `var(--tp-color-${this.color()}-600)`);
  protected readonly selectedOptionBackgroundColor = computed(
    () => `var(--tp-color-${this.color()}-100)`,
  );
  protected readonly selectedOptionTextColor = computed(
    () => `var(--tp-color-${this.color()}-900)`,
  );

  protected readonly isEmpty = computed(() => this.optionText(this.value()).trim() === '');

  protected readonly hasRequiredError = computed(() => this.required() && this.isEmpty());
  protected readonly errorId = createValidationErrorId('tp-input-autocomplete-singleselect-error');

  protected readonly showError = computed(
    () =>
      !!this.error() ||
      (this.touched() && (this.invalid() || this.errors().length > 0 || this.hasRequiredError())),
  );

  protected readonly displayedError = computed(
    () => this.error() ?? validationErrorMessage(this.errors(), this.requiredMessage()),
  );

  protected readonly inputText = computed(() => this.optionText(this.value()));

  protected readonly optionText = (option: TpSelectOption | null): string =>
    getSelectOptionText(option, this.displayWith());

  protected updateValue(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onSearch.emit(value.trim());
  }

  protected selectOption(event: MatAutocompleteSelectedEvent): void {
    this.value.set(event.option.value as TpAutocompleteSingleselectOption);
  }

  protected clearValue(event: MouseEvent): void {
    event.stopPropagation();
    this.value.set(null);
    this.suggestionsTrigger()?.autocomplete.options.forEach((option) => option.deselect(false));
    this.onSearch.emit('');
    this.touched.set(true);
  }

  protected markAsTouched(): void {
    this.touched.set(true);
  }
}
