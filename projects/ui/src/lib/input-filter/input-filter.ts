import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  TpInput,
  TpInputColor,
  TpInputContentSize,
  TpInputValue,
  TpInputVariant,
} from '../input/input';
import { TpPopoverMenu } from '../popover-menu/popover-menu';
import { TpValidationErrors } from '../utils/form-validation';

@Component({
  selector: 'tp-input-filter',
  imports: [CdkOverlayOrigin, TpInput, TpPopoverMenu],
  templateUrl: './input-filter.html',
  styleUrl: './input-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpInputFilter {
  value = input<TpInputValue>('');
  open = model(false);
  errors = input<TpValidationErrors>([]);
  invalid = input(false);

  color = input<TpInputColor>('blue');
  variant = input<TpInputVariant>('text');
  title = input('');
  placeholder = input('');
  required = input(false);
  disabled = input(false);
  name = input('');
  hint = input<string | null>(null);
  error = input<string | null>(null);
  requiredMessage = input('This field is required');
  width = input('100%');
  maxWidth = input('none');
  menuWidth = input<string | null>(null);
  height = input('var(--tp-control-height-sm)');
  maxHeight = input('var(--tp-control-height-md)');
  contentSize = input<TpInputContentSize>('sm');

  onOpen = output<void>();
  onClose = output<void>();

  private readonly origin = viewChild(CdkOverlayOrigin);
  protected readonly measuredPopoverWidth = signal(0);
  protected readonly effectivePopoverWidth = computed(
    () => this.menuWidth() ?? `${this.measuredPopoverWidth()}px`,
  );
  private previousOpen = false;

  constructor() {
    effect(() => {
      const isOpen = this.open();
      if (isOpen === this.previousOpen) return;
      this.previousOpen = isOpen;
      if (isOpen) {
        const element = this.origin()?.elementRef.nativeElement;
        if (element) this.measuredPopoverWidth.set(element.getBoundingClientRect().width);
        this.onOpen.emit();
      } else {
        this.onClose.emit();
      }
    });
  }

  protected openFilter(): void {
    if (this.disabled()) return;
    const element = this.origin()?.elementRef.nativeElement;
    if (element) this.measuredPopoverWidth.set(element.getBoundingClientRect().width);
    this.open.set(true);
  }
}
