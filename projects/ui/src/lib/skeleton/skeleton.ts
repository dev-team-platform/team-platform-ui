import { NgClass, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type TpSkeletonVariant = 'text' | 'circle' | 'rectangle';

@Component({
  selector: 'tp-skeleton',
  imports: [NgClass, NgStyle],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpSkeleton {
  variant = input<TpSkeletonVariant>('text');
  width = input<string | null>(null);
  height = input<string | null>(null);

  protected readonly skeletonClass = computed(() => ({
    [`tp-skeleton--${this.variant()}`]: true,
  }));

  protected readonly skeletonStyle = computed(() => {
    const variant = this.variant();
    const defaultSize = variant === 'circle' ? 'var(--tp-space-6)' : '100%';

    return {
      width: this.width() ?? defaultSize,
      height:
        this.height() ??
        (variant === 'text'
          ? 'var(--tp-space-3)'
          : variant === 'circle'
            ? 'var(--tp-space-6)'
            : '96px'),
    };
  });
}
