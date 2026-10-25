import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TpButton, TpConfirmationDialog, TpConfirmationDialogType } from 'ui';

@Component({
  selector: 'app-test-confirmation-dialog',
  imports: [TpButton, TpConfirmationDialog],
  templateUrl: './test-confirmation-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestConfirmationDialog {
  protected readonly types: TpConfirmationDialogType[] = [
    'info',
    'warning',
    'question',
    'delete-forever',
  ];
  protected readonly open = signal(false);
  protected readonly customOpen = signal(false);
  protected readonly type = signal<TpConfirmationDialogType>('info');
  protected readonly result = signal('No action yet');

  protected show(type: TpConfirmationDialogType): void {
    this.type.set(type);
    this.open.set(true);
  }
}
