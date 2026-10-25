import { NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TP_COMPONENT_COLOR_MAP, TpComponentColor } from '../utils/component-color';
import { positiveNumberAttribute } from '../utils/number-input';

export type TpSpinnerColor = TpComponentColor;

@Component({
  selector: 'tp-spinner',
  imports: [MatProgressSpinnerModule, NgStyle],
  templateUrl: './spinner.html',
  styleUrl: './spinner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpSpinner {
  color = input<TpSpinnerColor>('blue');
  diameter = input(32, { transform: positiveNumberAttribute });
  strokeWidth = input(3, { transform: positiveNumberAttribute });
  ariaLabel = input('Loading');

  protected readonly spinnerStyle = computed(() => ({
    '--tp-spinner-color': TP_COMPONENT_COLOR_MAP[this.color()].color,
  }));
}
