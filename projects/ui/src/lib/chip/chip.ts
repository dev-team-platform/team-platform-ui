import { NgClass, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TP_COMPONENT_COLOR_MAP, TpComponentColor } from '../utils/component-color';

export type TpChipColor = TpComponentColor;
export type TpChipVariant = 'filled' | 'outlined' | 'tonal' | 'text';

@Component({
  selector: 'tp-chip',
  imports: [MatChipsModule, MatTooltipModule, NgClass, NgStyle],
  templateUrl: './chip.html',
  styleUrl: './chip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpChip {
  color = input<TpChipColor>('blue');
  variant = input<TpChipVariant>('filled');
  tooltipTitle = input<string | null>(null);
  width = input('auto');
  maxWidth = input('none');
  height = input('var(--tp-control-height-sm)');
  maxHeight = input('none');
  fontSize = input<string | null>(null);
  fontWeight = input<string | null>(null);

  protected readonly chipStyle = computed(() => {
    const color = TP_COMPONENT_COLOR_MAP[this.color()];

    return {
      '--tp-chip-color': color.color,
      '--tp-chip-label-color': color.contrast,
      '--tp-chip-tonal-bg': color.container,
      width: this.width(),
      maxWidth: this.maxWidth(),
      height: this.height(),
      maxHeight: this.maxHeight(),
      '--mat-chip-label-text-size': this.fontSize() ?? 'var(--tp-font-size-default)',
      fontSize: this.fontSize(),
      fontWeight: this.fontWeight(),
    };
  });

  protected readonly chipClass = computed(() => ({
    [`tp-chip--${this.variant()}`]: true,
  }));
}
