import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TpChip } from 'ui';

@Component({
  selector: 'app-test-chip',
  imports: [TpChip],
  templateUrl: './test-chip.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestChip {
  protected readonly colors = [
    'gray',
    'red',
    'pink',
    'amber',
    'orange',
    'yellow',
    'green',
    'emerald',
    'teal',
    'blue',
    'cyan',
    'purple',
    'violet',
    'indigo',
  ] as const;
  protected readonly chipVariants = ['filled', 'outlined', 'tonal', 'text'] as const;
}
