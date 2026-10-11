import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { FormValueControl } from '@angular/forms/signals';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TpCheckbox } from '../checkbox/checkbox';
import { TpSpinner } from '../spinner/spinner';
import { truncateText } from '../utils/text-wrapping';
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

export type TpAutocompleteMultiselectOption = TpSelectOption;
export type TpInputAutocompleteMultiselectContentSize = 'sm' | 'md' | 'lg';
export type TpInputAutocompleteMultiselectColor = TpComponentColor;
export type TpInputAutocompleteMultiselectTypingMode = 'inline' | 'new-line';

const CONTENT_SIZE_MAP: Record<TpInputAutocompleteMultiselectContentSize, string> = {
  sm: 'var(--tp-text-sm)',
  md: 'var(--tp-text-md)',
  lg: 'var(--tp-text-lg)',
};

@Component({
  selector: 'tp-input-autocomplete-multiselect',
  imports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    TpCheckbox,
    TpSpinner,
  ],
  templateUrl: './input-autocomplete-multiselect.html',
  styleUrl: './input-autocomplete-multiselect.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpInputAutocompleteMultiselect implements FormValueControl<TpSelectOption[]> {
  value = model<TpSelectOption[]>([]);
  touched = model(false);
  errors = input<TpValidationErrors>([]);
  invalid = input(false);

  options = input<readonly TpAutocompleteMultiselectOption[]>([]);
  displayWith = input<TpSelectOptionDisplayFn | null>(null);
  useSelectAll = input(true);
  selectAllLabel = input('Select all');
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
  minHeight = input('var(--tp-control-height-md)');
  maxHeight = input('none');
  contentSize = input<TpInputAutocompleteMultiselectContentSize>('md');
  color = input<TpInputAutocompleteMultiselectColor>('blue');
  maxChipContentLength = input<number | undefined>(undefined);
  maxChips = input<number | undefined>(undefined);
  typingMode = input<TpInputAutocompleteMultiselectTypingMode>('inline');

  protected readonly selectAllOptionValue = '__tp-input-autocomplete-multiselect-select-all__';
  private readonly destroyRef = inject(DestroyRef);
  private readonly scrollDispatcher = inject(ScrollDispatcher);
  private readonly optionsTrigger = viewChild(MatAutocompleteTrigger);
  private readonly triggerInput = viewChild<ElementRef<HTMLInputElement>>('triggerInput');
  protected readonly optionsOpen = signal(false);
  private panelPositionUpdateQueued = false;
  private panelPositionTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.destroyRef.onDestroy(() => this.cancelPendingCallbacks());
    this.scrollDispatcher
      .scrolled()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.optionsTrigger()?.closePanel());
  }

  protected readonly selectedValues = computed(() => [...new Set(this.value())]);
  protected readonly visibleSelectedValues = computed(() => {
    const maxChips = this.maxChips();
    return maxChips === undefined
      ? this.selectedValues()
      : this.selectedValues().slice(0, Math.max(0, maxChips));
  });
  protected readonly hiddenSelectedCount = computed(
    () => this.selectedValues().length - this.visibleSelectedValues().length,
  );
  protected readonly allOptionsSelected = computed(() => {
    const options = this.uniqueOptions();
    return options.length > 0 && options.every((option) => this.isSelected(option));
  });
  protected readonly someOptionsSelected = computed(() =>
    this.uniqueOptions().some((option) => this.isSelected(option)),
  );
  protected readonly selectAllOptionLabel = computed(() =>
    this.allOptionsSelected() ? 'Unselect all' : this.selectAllLabel(),
  );
  protected readonly contentFontSize = computed(() => CONTENT_SIZE_MAP[this.contentSize()]);
  protected readonly focusColor = computed(() => `var(--tp-color-${this.color()}-600)`);
  protected readonly selectedChipTextColor = computed(() => `var(--tp-color-${this.color()}-900)`);
  protected readonly selectedChipBackgroundColor = computed(
    () => `var(--tp-color-${this.color()}-100)`,
  );
  protected readonly floatLabel = computed<'always' | 'auto'>(() =>
    this.title() || this.selectedValues().length ? 'always' : 'auto',
  );
  protected readonly isEmpty = computed(() => this.selectedValues().length === 0);
  protected readonly hasRequiredError = computed(() => this.required() && this.isEmpty());
  protected readonly errorId = createValidationErrorId('tp-input-autocomplete-multiselect-error');
  protected readonly showError = computed(
    () =>
      !!this.error() ||
      (this.touched() &&
        (this.invalid() || this.errors().length > 0 || this.hasRequiredError())),
  );
  protected readonly displayedError = computed(
    () => this.error() ?? validationErrorMessage(this.errors(), this.requiredMessage()),
  );

  protected optionText(option: TpSelectOption | null): string {
    return getSelectOptionText(option, this.displayWith());
  }

  protected updateQuery(event: Event): void {
    this.onSearch.emit((event.target as HTMLInputElement).value.trim());
  }

  protected selectOption(event: MatAutocompleteSelectedEvent): void {
    const option = event.option.value as TpAutocompleteMultiselectOption;
    if (option === this.selectAllOptionValue) {
      this.toggleAllOptions();
    } else {
      this.toggleOption(option);
    }
    event.option.deselect(false);
    this.clearSearch();
    this.reopenOptions();
  }

  protected toggleOptionFromPointer(
    option: TpAutocompleteMultiselectOption,
    event: MouseEvent,
  ): void {
    event.stopPropagation();

    if (option === this.selectAllOptionValue) {
      this.toggleAllOptions();
    } else {
      this.toggleOption(option);
    }

    this.clearSearch();
    this.updatePanelPosition();
  }

  protected removeOption(option: TpAutocompleteMultiselectOption, event: MouseEvent): void {
    event.stopPropagation();
    this.value.update((values) => values.filter((value) => value !== option));
    this.touched.set(true);
    this.updatePanelPosition();
  }

  protected clearAll(event: MouseEvent): void {
    event.stopPropagation();
    this.value.set([]);
    this.clearSearch();
    this.touched.set(true);
    this.updatePanelPosition();
  }

  protected openOptions(event?: Event): void {
    event?.stopPropagation();
    if (!this.disabled() && !this.readonly()) this.optionsTrigger()?.openPanel();
  }

  protected toggleOptions(event?: Event): void {
    event?.stopPropagation();

    if (this.disabled() || this.readonly()) return;

    const trigger = this.optionsTrigger();
    if (!trigger) return;

    if (trigger.panelOpen) {
      trigger.closePanel();
    } else {
      trigger.openPanel();
    }
  }

  protected setOptionsOpen(open: boolean): void {
    this.optionsOpen.set(open);
  }

  protected markAsTouched(): void {
    this.touched.set(true);
  }

  protected isSelected(option: TpAutocompleteMultiselectOption): boolean {
    return this.selectedValues().includes(option);
  }

  protected chipText(value: TpSelectOption): string {
    return truncateText(this.optionText(value), this.maxChipContentLength());
  }

  private toggleOption(option: TpAutocompleteMultiselectOption): void {
    this.value.update((values) =>
      values.includes(option) ? values.filter((value) => value !== option) : [...values, option],
    );
    this.touched.set(true);
  }

  private toggleAllOptions(): void {
    const options = this.uniqueOptions();
    const optionSet = new Set(options);
    this.value.update((values) =>
      this.allOptionsSelected()
        ? values.filter((value) => !optionSet.has(value))
        : [...values, ...options.filter((option) => !values.includes(option))],
    );
    this.touched.set(true);
  }

  protected readonly uniqueOptions = computed(() => [...new Set(this.options())]);

  private clearSearch(): void {
    const triggerInput = this.triggerInput()?.nativeElement;
    if (triggerInput) triggerInput.value = '';
    this.onSearch.emit('');
  }

  private reopenOptions(): void {
    if (this.destroyRef.destroyed) return;
    queueMicrotask(() => {
      if (this.destroyRef.destroyed) return;
      this.optionsTrigger()?.openPanel();
    });
  }

  private updatePanelPosition(): void {
    if (this.destroyRef.destroyed) return;
    this.clearPanelPositionTimeout();
    if (this.panelPositionUpdateQueued) return;
    this.panelPositionUpdateQueued = true;
    queueMicrotask(() => {
      this.panelPositionUpdateQueued = false;
      if (this.destroyRef.destroyed) return;
      this.optionsTrigger()?.updatePosition();
      this.panelPositionTimeout = setTimeout(() => {
        this.panelPositionTimeout = undefined;
        if (!this.destroyRef.destroyed) this.optionsTrigger()?.updatePosition();
      });
    });
  }

  private cancelPendingCallbacks(): void {
    this.clearPanelPositionTimeout();
    this.panelPositionUpdateQueued = false;
  }

  private clearPanelPositionTimeout(): void {
    if (this.panelPositionTimeout !== undefined) {
      clearTimeout(this.panelPositionTimeout);
      this.panelPositionTimeout = undefined;
    }
  }
}
