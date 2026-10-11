import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { TpButton, TpDialog, TpTextButton } from 'ui';

@Component({
  selector: 'app-test-dialog',
  imports: [TpButton, TpDialog, TpTextButton],
  templateUrl: './test-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestDialog {
  readonly open = model(false);

  openDialog() {
    this.open.set(true);
  }

  closeDialog() {
    this.open.set(false);
  }
}
