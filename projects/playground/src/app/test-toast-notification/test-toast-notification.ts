import { ChangeDetectionStrategy, Component, output, signal, viewChild } from '@angular/core';
import type { TemplateRef } from '@angular/core';
import { TpButton, TpInputSingleselect } from 'ui';
import type {
  TpSelectOption,
  TpToastNotificationItem,
  TpToastNotificationMode,
  TpToastNotificationPosition,
  TpToastNotificationType,
} from 'ui';

@Component({
  selector: 'app-test-toast-notification',
  imports: [TpButton, TpInputSingleselect],
  templateUrl: './test-toast-notification.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestToastNotification {
  protected readonly toastTypes: readonly TpToastNotificationType[] = [
    'success',
    'info',
    'warning',
    'error',
  ];
  protected readonly pushModes = ['below', 'above'] as const;
  protected readonly positions: readonly TpToastNotificationPosition[] = [
    'top-left',
    'bottom-left',
    'top-right',
    'bottom-right',
    'top-center',
    'bottom-center',
  ];
  protected readonly toastDisplayModes: readonly TpToastNotificationMode[] = [
    'from-right',
    'from-top',
    'from-left',
    'from-bottom',
  ];
  protected readonly selectedType = signal<TpToastNotificationType | null>('success');
  protected readonly selectedPushMode = signal<TpSelectOption | null>('below');
  protected readonly selectedPosition = signal<TpToastNotificationPosition>('bottom-right');
  protected readonly selectedToastDisplayMode = signal<TpToastNotificationMode>('from-right');
  protected readonly toastRequested = output<TpToastNotificationItem>();
  protected readonly pushModeChanged = output<'below' | 'above'>();
  protected readonly positionChanged = output<TpToastNotificationPosition>();
  protected readonly toastDisplayModeChanged = output<TpToastNotificationMode>();
  private readonly richMessage = viewChild.required<TemplateRef<unknown>>('richMessage');
  private nextToastId = 0;

  protected readonly toastType = (): TpToastNotificationType => this.selectedType() ?? 'info';

  protected onPushModeChange(value: TpSelectOption | null): void {
    this.selectedPushMode.set(value);
    this.pushModeChanged.emit(value === 'above' ? 'above' : 'below');
  }

  protected onPositionChange(value: TpSelectOption | null): void {
    const position = this.positions.find((candidate) => candidate === value) ?? 'bottom-right';
    this.selectedPosition.set(position);
    this.positionChanged.emit(position);
  }

  protected onToastDisplayModeChange(value: TpSelectOption | null): void {
    const mode = this.toastDisplayModes.find((candidate) => candidate === value) ?? 'from-right';
    this.selectedToastDisplayMode.set(mode);
    this.toastDisplayModeChanged.emit(mode);
  }

  protected pushToast(content: TpToastNotificationItem['content']): void {
    const type = this.toastType();
    const id = ++this.nextToastId;

    this.toastRequested.emit({
      id,
      type,
      content,
      context: { toastNumber: id },
      duration: 5000,
    });
  }

  protected pushStringToast(): void {
    const type = this.toastType();
    this.pushToast(`This is a ${type} toast notification.`);
  }

  protected pushTemplateToast(): void {
    this.pushToast(this.richMessage());
  }
}
