import { Component, signal } from '@angular/core';
import type {
  TpToastNotificationItem,
  TpToastNotificationMode,
  TpToastNotificationPosition,
} from 'ui';
import { TpToastNotificationContainer } from 'ui';
import { TestAvatar } from './test-avatar/test-avatar';
import { TestBellNotification } from './test-bell-notification/test-bell-notification';
import { TestButton } from './test-button/test-button';
import { TestCard } from './test-card/test-card';
import { TestCheckbox } from './test-checkbox/test-checkbox';
import { TestChip } from './test-chip/test-chip';
import { TestDialog } from './test-dialog/test-dialog';
import { TestDivider } from './test-divider/test-divider';
import { TestInputAutocompleteMultiselect } from './test-input-autocomplete-multiselect/test-input-autocomplete-multiselect';
import { TestInputAutocompleteSingleselect } from './test-input-autocomplete-singleselect/test-input-autocomplete-singleselect';
import { TestInputDatePicker } from './test-input-date-picker/test-input-date-picker';
import { TestInputMultiselect } from './test-input-multiselect/test-input-multiselect';
import { TestInputSingleselect } from './test-input-singleselect/test-input-singleselect';
import { TestInput } from './test-input/test-input';
import { TestPopoverMenu } from './test-popover-menu/test-popover-menu';
import { TestProgressBar } from './test-progress-bar/test-progress-bar';
import { TestRadio } from './test-radio/test-radio';
import { TestSearchBar } from './test-search-bar/test-search-bar';
import { TestSkeleton } from './test-skeleton/test-skeleton';
import { TestSlideToggle } from './test-slide-toggle/test-slide-toggle';
import { TestSpinner } from './test-spinner/test-spinner';
import { TestTable } from './test-table/test-table';
import { TestTextArea } from './test-text-area/test-text-area';
import { TestTextButton } from './test-text-button/test-text-button';
import { TestToastNotification } from './test-toast-notification/test-toast-notification';

@Component({
  selector: 'app-root',
  imports: [
    TestAvatar,
    TestBellNotification,
    TestButton,
    TestCard,
    TestCheckbox,
    TestChip,
    TestDialog,
    TestDivider,
    TestInput,
    TestInputAutocompleteMultiselect,
    TestInputAutocompleteSingleselect,
    TestInputDatePicker,
    TestInputMultiselect,
    TestInputSingleselect,
    TestProgressBar,
    TestPopoverMenu,
    TestRadio,
    TestSearchBar,
    TestSkeleton,
    TestSlideToggle,
    TestSpinner,
    TestTextArea,
    TestTextButton,
    TestToastNotification,
    TpToastNotificationContainer,
    TestTable,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly toastItems = signal<TpToastNotificationItem[]>([]);
  protected readonly toastPushMode = signal<'below' | 'above'>('below');
  protected readonly toastPosition = signal<TpToastNotificationPosition>('bottom-right');
  protected readonly toastDisplayMode = signal<TpToastNotificationMode>('from-right');

  protected addToast(toast: TpToastNotificationItem): void {
    this.toastItems.update((toasts) => [...toasts, toast]);
  }

  protected setToastPushMode(mode: 'below' | 'above'): void {
    this.toastPushMode.set(mode);
  }

  protected setToastPosition(position: TpToastNotificationPosition): void {
    this.toastPosition.set(position);
  }

  protected setToastDisplayMode(mode: TpToastNotificationMode): void {
    this.toastDisplayMode.set(mode);
  }
}
