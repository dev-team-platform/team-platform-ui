import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { TpButton, TpPopoverMenu, TpPopoverMenuPosition, TpTextButton } from 'ui';

@Component({
  selector: 'app-test-popover-menu',
  imports: [CdkOverlayOrigin, TpButton, TpPopoverMenu, TpTextButton],
  templateUrl: './test-popover-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestPopoverMenu {
  protected readonly lastAction = signal('Open the popover to see projected custom content.');
  protected readonly position = signal<TpPopoverMenuPosition>('bottom-start');
  protected readonly positions: TpPopoverMenuPosition[] = [
    'top-start',
    'top',
    'top-end',
    'bottom-start',
    'bottom',
    'bottom-end',
    'left-start',
    'left',
    'left-end',
    'right-start',
    'right',
    'right-end',
  ];

  protected updatePosition(event: Event): void {
    this.position.set((event.target as HTMLSelectElement).value as TpPopoverMenuPosition);
  }

  protected handleSelection(action: string): void {
    this.lastAction.set(`Selected: ${action}`);
  }
}
