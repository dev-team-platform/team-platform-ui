import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { nonNegativeIntegerAttribute } from '../utils/number-input';
import type {
  TpToastNotificationDisplayMode,
  TpToastNotificationPosition,
} from './toast-notification';
import { TpToastNotification } from './toast-notification';
import type { TpToastNotificationItem } from './toast-notification-item';

type TpToastNotificationPushMode = 'below' | 'above';

function cssSizeAttribute(value: unknown, fallback: string): string {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? `${value}px` : fallback;
  }

  const size = String(value ?? '').trim();
  if (!size) return fallback;

  return /^-?\d+(?:\.\d+)?$/.test(size) ? `${size}px` : size;
}

@Component({
  selector: 'tp-toast-notification-container',
  host: {
    '[style.top]': 'positionStyles().top',
    '[style.right]': 'positionStyles().right',
    '[style.bottom]': 'positionStyles().bottom',
    '[style.left]': 'positionStyles().left',
    '[style.transform]': 'positionStyles().transform',
    '[style.width]': 'toastWidth()',
    '[style.max-width]': 'toastMaxWidth()',
    '[style.max-height]': 'toastMaxHeight()',
  },
  imports: [TpToastNotification],
  templateUrl: './toast-notification-container.html',
  styleUrl: './toast-notification-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpToastNotificationContainer {
  toasts = model<TpToastNotificationItem[]>([]);
  toastPosition = input<TpToastNotificationPosition>('top-right');
  toastPushMode = input<TpToastNotificationPushMode>('below');
  stackMaxLength = input(5, {
    transform: (value: unknown) => Math.max(1, nonNegativeIntegerAttribute(value)),
  });
  toastDuration = input(3000, { transform: nonNegativeIntegerAttribute });
  toastDisplayMode = input<TpToastNotificationDisplayMode>('from-right');
  toastWidth = input('360px', {
    transform: (value: unknown) => cssSizeAttribute(value, '360px'),
  });
  toastHeight = input('auto', {
    transform: (value: unknown) => cssSizeAttribute(value, 'auto'),
  });
  toastMaxWidth = input('calc(100vw - 32px)', {
    transform: (value: unknown) => cssSizeAttribute(value, 'calc(100vw - 32px)'),
  });
  toastMaxHeight = input('calc(100vh - 32px)', {
    transform: (value: unknown) => cssSizeAttribute(value, 'calc(100vh - 32px)'),
  });

  protected readonly visibleToasts = computed(() =>
    this.toasts().slice(0, this.stackMaxLength()),
  );

  protected readonly positionStyles = computed(() => {
    const edge = '16px';

    switch (this.toastPosition()) {
      case 'top-left':
        return { top: edge, right: null, bottom: null, left: edge, transform: null };
      case 'bottom-left':
        return { top: null, right: null, bottom: edge, left: edge, transform: null };
      case 'bottom-right':
        return { top: null, right: edge, bottom: edge, left: null, transform: null };
      case 'top-center':
        return { top: edge, right: null, bottom: null, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-center':
        return { top: null, right: null, bottom: edge, left: '50%', transform: 'translateX(-50%)' };
      case 'top-right':
      default:
        return { top: edge, right: edge, bottom: null, left: null, transform: null };
    }
  });

  protected removeToast(id: TpToastNotificationItem['id']): void {
    this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  protected contentContext(toast: TpToastNotificationItem): Record<string, unknown> {
    return {
      $implicit: toast,
      toast,
      type: toast.type,
      ...(toast.context ?? {}),
    };
  }
}
