import { NgStyle } from '@angular/common';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';

@Component({
  selector: 'tp-dialog',
  imports: [CdkTrapFocus, NgStyle],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpDialog {
  open = model(false);
  ariaLabel = input('Dialog');
  width = input('min(90vw, 560px)');
  maxWidth = input('calc(100vw - var(--tp-space-6) - var(--tp-space-6))');
  height = input('auto');
  maxHeight = input('calc(100vh - var(--tp-space-6) - var(--tp-space-6))');
  closeOnBackdrop = input(true);
  closeOnEscape = input(true);

  onOpen = output<void>();
  onClose = output<void>();

  protected readonly isOpen = this.open;

  protected readonly dialogStyle = computed(() => ({
    width: this.width(),
    maxWidth: this.maxWidth(),
    height: this.height(),
    maxHeight: this.maxHeight(),
  }));

  openDialog(): void {
    if (this.isOpen()) return;

    this.isOpen.set(true);
    this.onOpen.emit();
  }

  closeDialog(): void {
    if (!this.isOpen()) return;

    this.isOpen.set(false);
    this.onClose.emit();
  }

  protected handleBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop() && event.target === event.currentTarget) {
      this.closeDialog();
    }
  }

  protected handleEscape(event: Event): void {
    event.stopPropagation();
    if (this.isOpen() && this.closeOnEscape()) {
      this.closeDialog();
    }
  }
}
