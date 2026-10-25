import { NgClass, NgTemplateOutlet } from '@angular/common';
import type { TemplateRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import type { TpProgressBarColor } from '../progress-bar/progress-bar';
import { TpProgressBar } from '../progress-bar/progress-bar';
import { nonNegativeIntegerAttribute } from '../utils/number-input';

export type TpToastNotificationType = 'success' | 'info' | 'warning' | 'error';
export type TpToastNotificationPosition =
  'top-left' | 'bottom-left' | 'top-right' | 'bottom-right' | 'top-center' | 'bottom-center';
export type TpToastNotificationDisplayMode =
  'from-right' | 'from-top' | 'from-left' | 'from-bottom';

const TOAST_ICON_MAP: Record<TpToastNotificationType, string> = {
  success: 'check_circle',
  info: 'info',
  warning: 'warning',
  error: 'cancel',
};

const TOAST_PROGRESS_COLOR_MAP: Record<TpToastNotificationType, TpProgressBarColor> = {
  success: 'emerald',
  info: 'blue',
  warning: 'amber',
  error: 'red',
};

const TOAST_EXIT_DURATION_MS = 180;
const TOAST_TIMER_UPDATE_INTERVAL_MS = 50;

function cssSizeAttribute(value: unknown, fallback: string): string {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? `${value}px` : fallback;
  }

  const size = String(value ?? '').trim();
  if (!size) return fallback;

  return /^-?\d+(?:\.\d+)?$/.test(size) ? `${size}px` : size;
}

@Component({
  selector: 'tp-toast-notification',
  host: {
    '[class.tp-toast-notification--stacked]': 'stacked()',
    '[style.top]': 'stacked() ? null : positionStyles().top',
    '[style.right]': 'stacked() ? null : positionStyles().right',
    '[style.bottom]': 'stacked() ? null : positionStyles().bottom',
    '[style.left]': 'stacked() ? null : positionStyles().left',
    '[style.transform]': 'stacked() ? null : positionStyles().transform',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
    '[style.max-width]': 'maxWidth()',
    '[style.max-height]': 'maxHeight()',
  },
  imports: [MatButtonModule, NgClass, NgTemplateOutlet, TpProgressBar],
  templateUrl: './toast-notification.html',
  styleUrl: './toast-notification.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpToastNotification {
  type = input<TpToastNotificationType>('info');
  content = input<string | TemplateRef<unknown>>('');
  contentContext = input<Record<string, unknown>>({});
  position = input<TpToastNotificationPosition>('top-right');
  mode = input<TpToastNotificationDisplayMode>('from-right');
  stacked = input(false);
  duration = input(3000, { transform: nonNegativeIntegerAttribute });

  width = input('360px', {
    transform: (value: unknown) => cssSizeAttribute(value, '360px'),
  });
  height = input('auto', {
    transform: (value: unknown) => cssSizeAttribute(value, 'auto'),
  });
  maxWidth = input('calc(100vw - 32px)', {
    transform: (value: unknown) => cssSizeAttribute(value, 'calc(100vw - 32px)'),
  });
  maxHeight = input('calc(100vh - 32px)', {
    transform: (value: unknown) => cssSizeAttribute(value, 'calc(100vh - 32px)'),
  });

  closed = output<void>();

  protected readonly progressValue = signal(100);
  protected readonly isLeaving = signal(false);
  protected readonly isVisible = signal(true);

  protected readonly iconName = computed(() => TOAST_ICON_MAP[this.type()]);
  protected readonly contentTemplate = computed(() => {
    const content = this.content();
    return typeof content === 'string' ? null : content;
  });
  protected readonly contentText = computed(() => {
    const content = this.content();
    return typeof content === 'string' ? content : '';
  });
  protected readonly progressColor = computed(() => TOAST_PROGRESS_COLOR_MAP[this.type()]);
  protected readonly classes = computed(() => [
    `tp-toast--${this.type()}`,
    `tp-toast--${this.position()}`,
    `tp-toast--${this.mode()}`,
    ...(this.isLeaving() ? ['tp-toast--leaving'] : []),
  ]);
  protected readonly positionStyles = computed(() => {
    const edge = '16px';

    switch (this.position()) {
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

  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setInterval> | undefined;
  private dismissTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    effect(() => {
      const duration = this.duration();
      untracked(() => this.startTimer(duration));
    });
    this.destroyRef.onDestroy(() => this.clearTimers());
  }

  protected dismiss(): void {
    if (this.isLeaving() || !this.isVisible()) return;

    this.isLeaving.set(true);
    this.clearTimer();
    this.dismissTimeout = setTimeout(() => {
      this.isVisible.set(false);
      this.closed.emit();
    }, TOAST_EXIT_DURATION_MS);
  }

  private startTimer(duration: number): void {
    if (this.isLeaving()) return;

    this.clearTimer();
    this.progressValue.set(100);

    if (duration === 0) return;

    const startedAt = Date.now();
    this.timer = setInterval(() => {
      const remaining = Math.max(0, duration - (Date.now() - startedAt));
      this.progressValue.set((remaining / duration) * 100);

      if (remaining === 0) this.dismiss();
    }, TOAST_TIMER_UPDATE_INTERVAL_MS);
  }

  private clearTimer(): void {
    if (this.timer !== undefined) clearInterval(this.timer);
    this.timer = undefined;
  }

  private clearTimers(): void {
    this.clearTimer();
    if (this.dismissTimeout !== undefined) clearTimeout(this.dismissTimeout);
    this.dismissTimeout = undefined;
  }
}
