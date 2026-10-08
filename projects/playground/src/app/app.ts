import { Component } from '@angular/core';
import { TestAvatar } from './test-avatar/test-avatar';
import { TestBellNotification } from './test-bell-notification/test-bell-notification';
import { TestButton } from './test-button/test-button';
import { TestCard } from './test-card/test-card';
import { TestCheckbox } from './test-checkbox/test-checkbox';
import { TestChip } from './test-chip/test-chip';
import { TestDatePicker } from './test-date-picker/test-date-picker';
import { TestDialog } from './test-dialog/test-dialog';
import { TestDivider } from './test-divider/test-divider';
import { TestInput } from './test-input/test-input';
import { TestInputAutocompleteMultiselect } from './test-input-autocomplete-multiselect/test-input-autocomplete-multiselect';
import { TestInputAutocompleteSingleselect } from './test-input-autocomplete-singleselect/test-input-autocomplete-singleselect';
import { TestInputDatePicker } from './test-input-date-picker/test-input-date-picker';
import { TestInputMultiselect } from './test-input-multiselect/test-input-multiselect';
import { TestInputSingleselect } from './test-input-singleselect/test-input-singleselect';
import { TestProgressBar } from './test-progress-bar/test-progress-bar';
import { TestPopoverMenu } from './test-popover-menu/test-popover-menu';
import { TestRadio } from './test-radio/test-radio';
import { TestSearchBar } from './test-search-bar/test-search-bar';
import { TestSkeleton } from './test-skeleton/test-skeleton';
import { TestSlideToggle } from './test-slide-toggle/test-slide-toggle';
import { TestSpinner } from './test-spinner/test-spinner';
import { TestTextArea } from './test-text-area/test-text-area';
import { TestTextButton } from './test-text-button/test-text-button';
import { TestTable } from './test-table/test-table';

@Component({
  selector: 'app-root',
  imports: [
    TestAvatar,
    TestBellNotification,
    TestButton,
    TestCard,
    TestCheckbox,
    TestChip,
    TestDatePicker,
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
    TestTable,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
