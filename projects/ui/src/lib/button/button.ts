import { NgClass, NgStyle, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TP_COMPONENT_COLOR_MAP, TpComponentColor } from '../utils/component-color';

export type TpButtonColor = TpComponentColor;
type TpButtonVariant = 'filled' | 'outlined' | 'tonal';

@Component({
  selector: 'tp-button',
  imports: [MatButtonModule, MatTooltipModule, NgClass, NgStyle, NgTemplateOutlet],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpButton {
  color = input<TpButtonColor>('blue');
  variant = input<TpButtonVariant>('filled');
  disabled = input(false);
  fullWidth = input(false);
  tooltipTitle = input<string | null>(null);
  width = input('auto');
  maxWidth = input('none');
  height = input('var(--tp-control-height-sm)');
  maxHeight = input('var(--tp-control-height-md)');
  fontSize = input('var(--tp-font-size-default)');
  fontWeight = input('500');
  onClick = output<MouseEvent>();

  protected readonly buttonStyle = computed(() => {
    const color = TP_COMPONENT_COLOR_MAP[this.color()];

    return {
      '--tp-button-color': color.color,
      '--tp-button-contrast-color': color.contrast,
      '--tp-button-tonal-bg': color.container,
      width: this.fullWidth() ? '100%' : this.width(),
      maxWidth: this.maxWidth(),
      height: this.height(),
      maxHeight: this.maxHeight(),
      fontSize: this.fontSize(),
      fontWeight: this.fontWeight(),
    };
  });

  protected readonly buttonClass = computed(() => ({
    'tp-button--filled': this.variant() === 'filled',
    'tp-button--outlined': this.variant() === 'outlined',
    'tp-button--tonal': this.variant() === 'tonal',
  }));
}
