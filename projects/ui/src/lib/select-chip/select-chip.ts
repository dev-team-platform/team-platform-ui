import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TpComponentColor } from '../utils/component-color';

export type TpSelectChipVariant = 'selected' | 'remaining';

@Component({
  selector: 'tp-select-chip',
  imports: [MatTooltipModule],
  templateUrl: './select-chip.html',
  styleUrl: './select-chip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tp-select-chip',
    '[class.tp-select-chip--remaining]': "variant() === 'remaining'",
    '[style.--tp-select-chip-text-color]': 'textColor()',
    '[style.--tp-select-chip-background-color]': 'backgroundColor()',
  },
})
export class TpSelectChip {
  label = input.required<string>();
  tooltipTitle = input<string | null>(null);
  removeLabel = input<string | null>(null);
  removable = input(false);
  variant = input<TpSelectChipVariant>('selected');
  color = input<TpComponentColor>('blue');
  remove = output<void>();

  protected readonly textColor = computed(() => `var(--tp-color-${this.color()}-900)`);
  protected readonly backgroundColor = computed(() => `var(--tp-color-${this.color()}-100)`);

  protected removeChip(event: MouseEvent): void {
    event.stopPropagation();
    this.remove.emit();
  }
}
