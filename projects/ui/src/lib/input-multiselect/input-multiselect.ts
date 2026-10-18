import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
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
import { TpSelectChip } from '../select-chip/select-chip';
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

export type TpMultiselectOption = TpSelectOption;
export type TpInputMultiselectContentSize = 'sm' | 'md' | 'lg';
export type TpInputMultiselectColor = TpComponentColor;

const CONTENT_SIZE_MAP: Record<TpInputMultiselectContentSize, string> = {
  sm: 'var(--tp-text-sm)',
  md: 'var(--tp-text-md)',
  lg: 'var(--tp-text-lg)',
};

@Component({
  selector: 'tp-input-multiselect',
  imports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    TpCheckbox,
    TpSelectChip,
    TpSpinner,
  ],
  templateUrl: './input-multiselect.html',
  styleUrl: './input-multiselect.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpInputMultiselect implements FormValueControl<TpSelectOption[]> {
  value = model<TpSelectOption[]>([]);
  touched = model(false);
  errors = input<TpValidationErrors>([]);
  invalid = input(false);

  options = input<readonly TpMultiselectOption[]>([]);
  displayWith = input<TpSelectOptionDisplayFn | null>(null);
  useSelectAll = input(true);
  selectAllLabel = input('Select all');
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
  minHeight = input('var(--tp-control-height-md)');
  maxHeight = input('none');
  contentSize = input<TpInputMultiselectContentSize>('md');
  color = input<TpInputMultiselectColor>('blue');
  maxChipContentLength = input<number | undefined>(undefined);
  maxChips = input<number | undefined>(undefined);

  protected readonly selectAllOptionValue = '__tp-input-multiselect-select-all__';
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

    if (maxChips === undefined) {
      return this.selectedValues();
    }

    return this.selectedValues().slice(0, Math.max(0, maxChips));
  });

  protected readonly hiddenSelectedCount = computed(
    () => this.selectedValues().length - this.visibleSelectedValues().length,
  );

  protected readonly allSelected = computed(() => {
    const options = this.uniqueOptions();
    return options.length > 0 && options.every((option) => this.isSelected(option));
  });

  protected readonly someSelected = computed(() =>
    this.uniqueOptions().some((option) => this.isSelected(option)),
  );

  protected readonly selectAllOptionLabel = computed(() =>
    this.allSelected() ? 'Unselect all' : this.selectAllLabel(),
  );

  protected readonly contentFontSize = computed(() => CONTENT_SIZE_MAP[this.contentSize()]);
  protected readonly focusColor = computed(() => `var(--tp-color-${this.color()}-600)`);
  protected readonly floatLabel = computed<'always' | 'auto'>(() =>
    this.title() || this.selectedValues().length ? 'always' : 'auto',
  );

  protected readonly isEmpty = computed(() => this.selectedValues().length === 0);

  protected readonly hasRequiredError = computed(() => this.required() && this.isEmpty());
  protected readonly errorId = createValidationErrorId('tp-input-multiselect-error');

  protected readonly showError = computed(
    () =>
      !!this.error() ||
      (this.touched() && (this.invalid() || this.errors().length > 0 || this.hasRequiredError())),
  );

  protected readonly displayedError = computed(
    () => this.error() ?? validationErrorMessage(this.errors(), this.requiredMessage()),
  );

  protected readonly selectedValuesText = computed(() =>
    this.selectedValues()
      .map((value) => this.optionText(value))
      .join(', '),
  );

  protected optionText(option: TpSelectOption | null): string {
    return getSelectOptionText(option, this.displayWith());
  }

  protected selectOption(event: MatAutocompleteSelectedEvent): void {
    const option = event.option.value as TpMultiselectOption;

    if (option === this.selectAllOptionValue) {
      this.toggleAll();
    } else {
      this.toggleOption(option);
    }

    event.option.deselect(false);
    this.clearTriggerValue();
    this.reopenOptions();
  }

  protected toggleOptionFromPointer(option: TpMultiselectOption, event: MouseEvent): void {
    event.stopPropagation();

    if (option === this.selectAllOptionValue) {
      this.toggleAll();
    } else {
      this.toggleOption(option);
    }

    this.updatePanelPosition();
  }

  protected removeOption(option: TpMultiselectOption): void {
    this.value.update((values) => values.filter((value) => value !== option));
    this.touched.set(true);
    this.updatePanelPosition();
  }

  protected clearAll(event: MouseEvent): void {
    event.stopPropagation();
    this.value.set([]);
    this.clearTriggerValue();
    this.touched.set(true);
    this.updatePanelPosition();
  }

  protected openOptions(event?: Event): void {
    event?.stopPropagation();

    if (!this.disabled() && !this.readonly()) {
      this.optionsTrigger()?.openPanel();
    }
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

  protected isSelected(option: TpMultiselectOption): boolean {
    return this.selectedValues().includes(option);
  }

  protected chipText(value: TpSelectOption): string {
    return truncateText(this.optionText(value), this.maxChipContentLength());
  }

  protected remainingChipLabel(): string {
    return `+ ${this.hiddenSelectedCount()} others`;
  }

  private toggleOption(option: TpMultiselectOption): void {
    this.value.update((values) =>
      values.includes(option) ? values.filter((value) => value !== option) : [...values, option],
    );
    this.touched.set(true);
  }

  private toggleAll(): void {
    this.value.set(this.allSelected() ? [] : this.uniqueOptions());
    this.touched.set(true);
  }

  protected readonly uniqueOptions = computed(() => [...new Set(this.options())]);

  private clearTriggerValue(): void {
    const triggerInput = this.triggerInput()?.nativeElement;

    if (triggerInput) {
      triggerInput.value = '';
    }
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

        if (!this.destroyRef.destroyed) {
          this.optionsTrigger()?.updatePosition();
        }
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
