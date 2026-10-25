import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TpButton, TpInputFilter } from 'ui';

@Component({
  selector: 'app-test-input-filter',
  imports: [TpButton, TpInputFilter],
  templateUrl: './test-input-filter.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestInputFilter {
  protected readonly selectedFilter = signal('All projects');
  protected readonly status = signal('Choose a project filter to update the parent value.');

  protected selectFilter(value: string): void {
    this.selectedFilter.set(value);
    this.status.set(`Selected: ${value}`);
  }
}
