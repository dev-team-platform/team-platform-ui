import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { TpButton, TpButtonColor } from '../button/button';
import { TpDialog } from '../dialog/dialog';

export type TpConfirmationDialogType = 'info' | 'warning' | 'question' | 'delete-forever';

const TYPE_CONFIG = {
  info: { icon: 'info', color: 'blue' },
  warning: { icon: 'warning', color: 'amber' },
  question: { icon: 'help', color: 'yellow' },
  'delete-forever': { icon: 'delete_forever', color: 'red' },
} as const;

@Component({
  selector: 'tp-confirmation-dialog',
  imports: [TpDialog, TpButton],
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpConfirmationDialog {
  open = model(false);
  type = input<TpConfirmationDialogType>('info');
  ariaLabel = input('Confirmation');
  cancelTitle = input('Cancel');
  confirmTitle = input('OK');
  cancelColor = input<TpButtonColor>('gray');
  confirmColor = input<TpButtonColor | undefined>(undefined);
  width = input('min(90vw, 420px)');

  onConfirm = output<void>();
  onCancel = output<void>();

  protected readonly icon = computed(() => TYPE_CONFIG[this.type()].icon);
  protected readonly iconColor = computed(
    () => `var(--tp-color-${TYPE_CONFIG[this.type()].color}-500)`,
  );
  protected readonly resolvedConfirmColor = computed(
    () => this.confirmColor() ?? (this.type() === 'delete-forever' ? 'red' : 'blue'),
  );

  protected confirm(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.onConfirm.emit();
  }

  protected cancel(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.onCancel.emit();
  }
}
