import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { ProgressBarMode } from '@angular/material/progress-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import type { TpComponentColor } from '../utils/component-color';
import { finiteNumberAttribute } from '../utils/number-input';

export type TpProgressBarColor = TpComponentColor;
export type TpProgressBarMode = ProgressBarMode;
export type TpProgressBarShade = 300 | 400 | 500 | 600;

@Component({
  selector: 'tp-progress-bar',
  imports: [MatProgressBarModule, NgStyle],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpProgressBar {
  color = input<TpProgressBarColor>('blue');
  shade = input<TpProgressBarShade>(500);
  mode = input<TpProgressBarMode>('determinate');
  value = input(0, { transform: finiteNumberAttribute });
  bufferValue = input(0, { transform: finiteNumberAttribute });
  ariaLabel = input('Progress');

  protected readonly progressBarStyle = computed(() => ({
    '--tp-progress-bar-color': `var(--tp-color-${this.color()}-${this.shade()})`,
  }));
}
