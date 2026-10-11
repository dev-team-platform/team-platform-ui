import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'tp-divider',
  imports: [MatDividerModule],
  templateUrl: './divider.html',
  styleUrl: './divider.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.width]': 'width()',
    '[style.max-width]': 'maxWidth()',
  },
})
export class TpDivider {
  vertical = input(false, { transform: booleanAttribute });
  inset = input(false, { transform: booleanAttribute });
  width = input('auto');
  maxWidth = input('none');
}
