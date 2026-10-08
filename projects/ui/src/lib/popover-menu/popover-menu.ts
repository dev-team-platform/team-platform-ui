import {
  CdkOverlayOrigin,
  ConnectedPosition,
  FlexibleConnectedPositionStrategyOrigin,
  OverlayModule,
} from '@angular/cdk/overlay';
import { NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';

export type TpPopoverMenuPosition =
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'left-start'
  | 'left'
  | 'left-end'
  | 'right-start'
  | 'right'
  | 'right-end';

const POSITION_PAIRS: Record<TpPopoverMenuPosition, [ConnectedPosition, ConnectedPosition]> = {
  'top-start': [
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
  ],
  top: [
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' },
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' },
  ],
  'top-end': [
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
  ],
  'bottom-start': [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
  ],
  bottom: [
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' },
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' },
  ],
  'bottom-end': [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
  ],
  'left-start': [
    { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' },
  ],
  left: [
    { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center' },
    { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' },
  ],
  'left-end': [
    { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom' },
    { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' },
  ],
  'right-start': [
    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
  ],
  right: [
    { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' },
    { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center' },
  ],
  'right-end': [
    { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' },
    { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom' },
  ],
};

@Component({
  selector: 'tp-popover-menu',
  imports: [NgStyle, OverlayModule],
  templateUrl: './popover-menu.html',
  styleUrl: './popover-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpPopoverMenu {
  private static nextId = 0;
  protected readonly originElement = inject(ElementRef<HTMLElement>);
  private lastFocusedElement: HTMLElement | null = null;

  open = model(false);
  origin = input<CdkOverlayOrigin | FlexibleConnectedPositionStrategyOrigin | null>(null);
  ariaLabel = input('Popover content');
  position = input<TpPopoverMenuPosition>('bottom-end');
  width = input('auto');
  maxWidth = input('min(90vw, 400px)');
  height = input('auto');
  maxHeight = input('80vh');

  onOpen = output<void>();
  onClose = output<void>();

  protected readonly panelId = `tp-popover-menu-${TpPopoverMenu.nextId++}`;

  protected readonly positions = computed(() => {
    const position = this.position();
    const [preferred, fallback] = POSITION_PAIRS[position];
    const gap = 8;
    const isHorizontal = position.startsWith('left') || position.startsWith('right');
    const preferredOffsetX = isHorizontal ? (position.startsWith('right') ? gap : -gap) : 0;
    const preferredOffsetY = isHorizontal ? 0 : position.startsWith('bottom') ? gap : -gap;

    return [
      { ...preferred, offsetX: preferredOffsetX, offsetY: preferredOffsetY },
      { ...fallback, offsetX: -preferredOffsetX, offsetY: -preferredOffsetY },
    ] satisfies ConnectedPosition[];
  });

  protected readonly panelStyle = computed(() => ({
    width: this.width(),
    maxWidth: this.maxWidth(),
    height: this.height(),
    maxHeight: this.maxHeight(),
  }));

  togglePopover(): void {
    if (this.open()) {
      this.closePopover();
    } else {
      this.openPopover();
    }
  }

  openPopover(): void {
    if (this.open()) return;

    this.lastFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.open.set(true);
    this.onOpen.emit();
  }

  closePopover(restoreFocus = true): void {
    if (!this.open()) return;

    this.open.set(false);
    this.onClose.emit();

    if (restoreFocus) {
      queueMicrotask(() => this.lastFocusedElement?.focus());
    }
  }

  protected handlePopoverAttach(): void {
    queueMicrotask(() => document.getElementById(this.panelId)?.focus());
  }

  protected handlePopoverKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;

    event.preventDefault();
    event.stopPropagation();
    this.closePopover(true);
  }
}
