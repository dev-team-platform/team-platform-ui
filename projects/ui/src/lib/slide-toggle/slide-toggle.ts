import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormCheckboxControl } from '@angular/forms/signals';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TP_COMPONENT_COLOR_MAP, TpComponentColor } from '../utils/component-color';

export type TpSlideToggleColor = TpComponentColor;
export type TpSlideToggleLabelPosition = 'before' | 'after';

function pixelSize(value: string): string {
  const normalized = value.trim();
  if (!/^[1-9]\d*px$/.test(normalized)) {
    throw new Error('Slide toggle width and height must be positive whole pixel values (for example, "52px").');
  }

  return normalized;
}

@Component({
  selector: 'tp-slide-toggle',
  imports: [MatSlideToggleModule, NgStyle],
  templateUrl: './slide-toggle.html',
  styleUrl: './slide-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.max-width]': 'maxWidth()',
    '[style.max-height]': 'maxHeight()',
  },
})
export class TpSlideToggle implements FormCheckboxControl {
  checked = model(false);
  touched = model(false);

  color = input<TpSlideToggleColor>('blue');
  disabled = input(false);
  required = input(false);
  labelPosition = input<TpSlideToggleLabelPosition>('after');
  name = input('');
  ariaLabel = input<string | null>(null);
  ariaLabelledby = input<string | null>(null);
  ariaDescribedby = input('');
  tabIndex = input(0);
  disableRipple = input(false);
  disabledInteractive = input(false);
  width = input('52px', { transform: pixelSize });
  height = input('32px', { transform: pixelSize });
  maxWidth = input('none');
  maxHeight = input('none');

  protected readonly slideToggleStyle = computed(() => {
    const color = TP_COMPONENT_COLOR_MAP[this.color()];
    const colors = {
      '--tp-slide-toggle-color': color.color,
      '--tp-slide-toggle-contrast-color': color.contrast,
    };

    const width = Number.parseFloat(this.width());
    const height = Number.parseFloat(this.height());

    // Use Material's own dimensions and positioning at its 52 × 32 px default.
    if (width === 52 && height === 32) {
      return colors;
    }

    // Keep thin thumb dimensions on whole CSS pixels; fractional sizes render unevenly across browsers.
    const scale = (originalPixels: number) => Math.round((originalPixels * height) / 32);
    const handleSize = scale(24);
    const iconSize = scale(16);
    const pressedHandleSize = scale(28);
    const handleInset = (height - handleSize) / 2;
    const pressedInset = (height - pressedHandleSize) / 2;

    return {
      ...colors,
      '--mat-slide-toggle-track-width': this.width(),
      '--mat-slide-toggle-track-height': this.height(),
      '--mat-slide-toggle-handle-width': this.height(),
      '--mat-slide-toggle-handle-height': `${handleSize}px`,
      '--mat-slide-toggle-selected-handle-size': `${handleSize}px`,
      '--mat-slide-toggle-unselected-handle-size': `${handleSize}px`,
      '--mat-slide-toggle-with-icon-handle-size': `${handleSize}px`,
      '--mat-slide-toggle-selected-handle-horizontal-margin': `0 ${handleInset}px`,
      '--mat-slide-toggle-unselected-handle-horizontal-margin': `0 ${handleInset}px`,
      '--mat-slide-toggle-selected-with-icon-handle-horizontal-margin': `0 ${handleInset}px`,
      '--mat-slide-toggle-unselected-with-icon-handle-horizontal-margin': `0 ${handleInset}px`,
      '--mat-slide-toggle-selected-pressed-handle-horizontal-margin': `0 ${pressedInset}px`,
      '--mat-slide-toggle-unselected-pressed-handle-horizontal-margin': `0 ${pressedInset}px`,
      '--mat-slide-toggle-pressed-handle-size': `${pressedHandleSize}px`,
      '--mat-slide-toggle-selected-icon-size': `${iconSize}px`,
      '--mat-slide-toggle-unselected-icon-size': `${iconSize}px`,
      '--mat-slide-toggle-track-outline-width': `${scale(2)}px`,
    };
  });

  protected updateChecked(event: MatSlideToggleChange): void {
    this.checked.set(event.checked);
    this.touched.set(true);
  }
}
