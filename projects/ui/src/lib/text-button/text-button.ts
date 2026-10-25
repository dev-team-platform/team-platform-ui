import { NgClass, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

export type TpTextButtonColor = 'gray' | 'white' | 'black';
export type TpTextButtonAfterPressEffect = 'underline' | 'none';
export type TpTextButtonPressEffectShape = 'circle' | 'elip' | 'rect';
export type TpTextButtonContentAlignment = 'start' | 'center' | 'end';

const TEXT_BUTTON_COLOR_MAP: Record<TpTextButtonColor, string> = {
  gray: 'var(--tp-color-gray-500)',
  white: 'var(--tp-color-white)',
  black: 'var(--tp-color-black)',
};

@Component({
  selector: 'tp-text-button',
  imports: [MatButtonModule, MatTooltipModule, NgClass, NgStyle],
  templateUrl: './text-button.html',
  styleUrl: './text-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpTextButton {
  color = input<TpTextButtonColor>('gray');
  afterPressEffect = input<TpTextButtonAfterPressEffect>('none');
  pressEffectShape = input<TpTextButtonPressEffectShape>('elip');
  hoverShape = input<TpTextButtonPressEffectShape>();
  contentAlignment = input<TpTextButtonContentAlignment>('center');
  disabled = input(false);
  fullWidth = input(false);
  tooltipTitle = input<string | null>(null);
  width = input('auto');
  maxWidth = input('none');
  height = input('var(--tp-control-height-sm)');
  maxHeight = input('var(--tp-control-height-md)');
  fontSize = input('var(--tp-text-sm)');
  fontWeight = input('500');
  onClick = output<MouseEvent>();

  protected readonly textButtonStyle = computed(() => ({
    '--tp-text-button-color': TEXT_BUTTON_COLOR_MAP[this.color()],
    width: this.fullWidth() ? '100%' : this.width(),
    maxWidth: this.maxWidth(),
    height: this.height(),
    maxHeight: this.maxHeight(),
    fontSize: this.fontSize(),
    fontWeight: this.fontWeight(),
  }));

  protected readonly textButtonClass = computed(() => {
    const pressEffectShape = this.pressEffectShape();
    const hoverShape = this.hoverShape() ?? pressEffectShape;

    return {
      'tp-text-button--underline': this.afterPressEffect() === 'underline',
      [`tp-text-button--shape-${pressEffectShape}`]: true,
      [`tp-text-button--hover-shape-${hoverShape}`]: true,
    };
  });
}
