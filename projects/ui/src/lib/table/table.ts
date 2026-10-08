import { CdkScrollable } from '@angular/cdk/scrolling';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  Directive,
  effect,
  input,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TpProgressBar } from '../progress-bar/progress-bar';
import type { TpProgressBarColor } from '../progress-bar/progress-bar';
import { truncateText } from '../utils/text-wrapping';

export type TpTableCellValue = string | number | boolean | Date | null | undefined;
export type TpTableSortDirection = 'asc' | 'desc';
export type TpTableDataMode = 'client' | 'server';

const MAX_PAGE_OPTIONS = 9;

export interface TpTableColumn<T extends object> {
  /** A unique identifier and, by default, the property read from each row. */
  key: string;
  /** Text displayed in the header. */
  title: string;
  /** Returns the value displayed for the cell when the value is not a direct row property. */
  value?: (row: T) => TpTableCellValue;
  /** Enables the sort control in this column header. */
  sortable?: boolean;
  /** Returns the value used by the built-in client-side sorter. */
  sortValue?: (row: T) => TpTableCellValue;
  /** Replaces the built-in client-side sort comparison for this column. */
  sortFn?: (left: T, right: T) => number;
  /** Optional CSS width for the column, for example `12rem`. */
  width?: string;
  /** Optional CSS minimum width for the column, for example `10rem`. */
  minWidth?: string;
  /** Overrides maxCellContentLength for this column. */
  maxCellContentLength?: number;
}

export interface TpTableSort {
  key: string;
  direction: TpTableSortDirection;
}

export interface TpTablePageChange {
  page: number;
  pageSize: number;
}

export interface TpTableData<T extends object = Record<string, unknown>> {
  /** The rows to display. */
  rows: readonly T[];
  /** Use `server` when sorting and pagination are performed outside the component. */
  dataMode?: TpTableDataMode;
  /** Total number of rows in server mode. */
  totalRows?: number | null;
}

export interface TpTableFilterConfig {
  /** Adds a filter row below the column headers. */
  enabled?: boolean;
}

export interface TpTableSortConfig {
  /** Enables sort controls for sortable columns. */
  enabled?: boolean;
  /** Initial or externally controlled sort. */
  value?: TpTableSort | null;
}

export interface TpTablePaginationConfig {
  enabled?: boolean;
  /** The active page, starting at 1. */
  page?: number;
  /** The number of rows per page. */
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  pageSizeTitle?: string;
  goToPageTitle?: string;
  totalRowsTitle?: string;
  /** Disables the previous-page button while data is pending. */
  prevPageButtonDisabled?: boolean;
  /** Disables the next-page button while data is pending. */
  nextPageButtonDisabled?: boolean;
}

export interface TpTableReloadConfig {
  enabled?: boolean;
  title?: string;
  /** Disables the reload icon while data is pending. */
  buttonDisabled?: boolean;
}

export interface TpTableConfig<T extends object = Record<string, unknown>> {
  columns: readonly TpTableColumn<T>[];
  /** Color of the indeterminate progress bar shown while the table is loading. */
  loadingColor?: TpProgressBarColor;
  rowHeight?: string | number;
  maxWidth?: string;
  maxHeight?: string | number;
  maxCellContentLength?: number;
  rowsClickable?: boolean;
  rowTrackBy?: (row: T, index: number) => unknown;
  filter?: TpTableFilterConfig;
  sort?: TpTableSortConfig;
  pagination?: TpTablePaginationConfig;
  reload?: TpTableReloadConfig;
}

export interface TpTableLoadingState {
  enabled?: boolean;
}

export interface TpTableState {
  loading?: TpTableLoadingState;
}

export interface TpTableActionColumnConfig {
  enabled?: boolean;
  title?: string;
  menuWidth?: string | number;
  menuHeight?: string | number;
}

export interface TpTableActionContentContext<T extends object> {
  $implicit: T;
  row: T;
}

export interface TpTableFilterContentContext<T extends object> {
  /** The column whose filter cell is being rendered. */
  $implicit: TpTableColumn<T>;
  column: TpTableColumn<T>;
  key: string;
}

export interface TpTableCellContentContext<T extends object> {
  /** The row whose cell is being rendered. */
  $implicit: T;
  row: T;
  /** The column whose cell is being rendered. */
  column: TpTableColumn<T>;
  key: string;
  value: TpTableCellValue;
}

export interface TpTableEmptyContentContext<T extends object> {
  /** The rows currently supplied to the table (usually an empty collection). */
  $implicit: readonly T[];
  rows: readonly T[];
  columns: readonly TpTableColumn<T>[];
  colSpan: number;
}

/**
 * Marks a projected action-menu template. Its implicit value and `row` local
 * are the row whose Actions button opened the menu.
 */
@Directive({ selector: 'ng-template[tpTableActionContent]' })
export class TpTableActionContent<T extends object = Record<string, unknown>> {
  constructor(readonly template: TemplateRef<TpTableActionContentContext<T>>) {}
}

/**
 * Marks a projected filter template. When `tpTableFilter` has a value, the
 * template is used for the matching column key. A template without a value is
 * used as the fallback for every column that has no keyed template.
 */
@Directive({ selector: 'ng-template[tpTableFilter]' })
export class TpTableFilterContent<T extends object = Record<string, unknown>> {
  readonly key = input<string | null>(null, { alias: 'tpTableFilter' });

  constructor(readonly template: TemplateRef<TpTableFilterContentContext<T>>) {}
}

/**
 * Marks a projected cell template. When `tpTableCell` has a value, the
 * template is used for cells in the matching column key. A template without
 * a value is used as the fallback for every cell.
 */
@Directive({ selector: 'ng-template[tpTableCell]' })
export class TpTableCellContent<T extends object = Record<string, unknown>> {
  readonly key = input<string | null>(null, { alias: 'tpTableCell' });

  constructor(readonly template: TemplateRef<TpTableCellContentContext<T>>) {}
}

/** Marks a projected template used instead of the default empty message. */
@Directive({ selector: 'ng-template[tpTableEmpty]' })
export class TpTableEmptyContent<T extends object = Record<string, unknown>> {
  constructor(readonly template: TemplateRef<TpTableEmptyContentContext<T>>) {}
}

/** A configurable table with client- or server-driven pagination and sorting. */
@Component({
  selector: 'tp-table',
  host: {
    '[style.--tp-table-row-height]': 'rowHeightCss()',
  },
  imports: [
    CdkScrollable,
    NgTemplateOutlet,
    MatButtonModule,
    MatMenuModule,
    MatSelectModule,
    MatTooltipModule,
    TpProgressBar,
  ],
  templateUrl: './table.html',
  styleUrl: './table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TpTable<T extends object = Record<string, unknown>> {
  /** The table rows and data-mode metadata. */
  data = input<TpTableData<T>>({ rows: [] });
  /** Visual and interaction configuration, including columns and feature settings. */
  config = input<TpTableConfig<T>>({ columns: [] });
  /** Runtime state such as loading. */
  state = input<TpTableState>({});
  /** Configuration for the optional action column. */
  actionColumn = input<TpTableActionColumnConfig>({});

  /** Emits both the selected page and page size after a user pagination action. */
  onPaginationChange = output<TpTablePageChange>();
  /** Emits when the reload icon is clicked. */
  onReload = output<void>();
  /** Emits when a sortable column is selected. */
  onSortChange = output<TpTableSort | null>();
  onRowClick = output<T>();

  private readonly page = signal(1);
  private readonly pageSize = signal(20);
  private readonly sort = signal<TpTableSort | null>(null);
  private configuredPage: number | undefined;
  private configuredPageSize: number | undefined;
  private configuredSort: TpTableSort | null | undefined;
  private readonly configuredStateEffect = effect(() => {
    const pagination = this.config().pagination;
    const configuredPage = pagination?.page;
    const configuredPageSize = pagination?.pageSize;
    const configuredSort = this.config().sort?.value;

    if (configuredPage !== this.configuredPage) {
      const page = Number(configuredPage ?? 1);
      this.page.set(Number.isFinite(page) ? Math.floor(page) : 1);
      this.configuredPage = configuredPage;
    }
    if (configuredPageSize !== this.configuredPageSize) {
      const pageSize = Number(configuredPageSize ?? 20);
      this.pageSize.set(Number.isFinite(pageSize) ? Math.floor(pageSize) : 20);
      this.configuredPageSize = configuredPageSize;
    }
    if (configuredSort !== this.configuredSort) {
      this.sort.set(configuredSort ?? null);
      this.configuredSort = configuredSort;
    }
  });

  protected readonly currentActionRow = signal<T | null>(null);
  protected readonly actionContent = contentChild<TpTableActionContent<T>>(TpTableActionContent);
  protected readonly filterContents =
    contentChildren<TpTableFilterContent<T>>(TpTableFilterContent);
  protected readonly cellContents = contentChildren<TpTableCellContent<T>>(TpTableCellContent);
  protected readonly emptyContent = contentChild<TpTableEmptyContent<T>>(TpTableEmptyContent);
  protected readonly columns = computed(() => this.config().columns);
  protected readonly rows = computed(() => this.data().rows);
  protected readonly dataMode = computed(() => this.data().dataMode ?? 'client');
  protected readonly filterEnabled = computed(() => this.config().filter?.enabled ?? false);
  protected readonly sortEnabled = computed(() => this.config().sort?.enabled ?? true);
  protected readonly paginationEnabled = computed(() => this.config().pagination?.enabled ?? true);
  protected readonly pageSizeOptions = computed(
    () => this.config().pagination?.pageSizeOptions ?? [10, 20, 50, 100],
  );
  protected readonly pageSizeTitle = computed(
    () => this.config().pagination?.pageSizeTitle ?? 'Rows per page:',
  );
  protected readonly goToPageTitle = computed(
    () => this.config().pagination?.goToPageTitle ?? 'Go to:',
  );
  protected readonly totalRowsTitle = computed(
    () => this.config().pagination?.totalRowsTitle ?? 'of',
  );
  protected readonly reloadEnabled = computed(() => this.config().reload?.enabled ?? false);
  protected readonly reloadTitle = computed(() => this.config().reload?.title ?? 'Reload');
  protected readonly reloadButtonDisabled = computed(
    () => this.config().reload?.buttonDisabled ?? false,
  );
  protected readonly prevPageButtonDisabled = computed(
    () => this.config().pagination?.prevPageButtonDisabled ?? false,
  );
  protected readonly nextPageButtonDisabled = computed(
    () => this.config().pagination?.nextPageButtonDisabled ?? false,
  );
  protected readonly maxWidth = computed(() => this.config().maxWidth ?? '100%');
  protected readonly maxCellContentLength = computed(
    () => this.config().maxCellContentLength ?? 50,
  );
  protected readonly rowsClickable = computed(() => this.config().rowsClickable ?? false);
  protected readonly rowTrackBy = computed(
    () => this.config().rowTrackBy ?? ((_row: T, index: number) => index),
  );
  protected readonly loading = computed(() => this.state().loading?.enabled ?? false);
  protected readonly loadingColor = computed(() => this.config().loadingColor ?? 'blue');
  protected columnWidth(column: TpTableColumn<T>): string {
    const width = column.width || '160px';
    const minimum = column.minWidth || '0px';
    const filterMinimum = this.filterEnabled() && this.filterContentFor(column) ? '240px' : '0px';
    return `max(${width}, ${minimum}, ${filterMinimum})`;
  }

  protected readonly tableWidthCss = computed(() => {
    const widths = this.columns().map((column) => this.columnWidth(column));
    if (this.actionsEnabled()) widths.push('72px');
    return widths.length ? `max(100%, calc(${widths.join(' + ')}))` : '100%';
  });
  protected readonly actionsEnabled = computed(() => this.actionColumn().enabled ?? false);
  protected readonly actionTitle = computed(() => this.actionColumn().title ?? 'Action');
  protected readonly rowHeightCss = computed(() =>
    this.toCssSize(this.config().rowHeight ?? '48px'),
  );
  protected readonly maxHeightCss = computed(() =>
    this.toCssSize(this.config().maxHeight ?? 'none'),
  );
  protected readonly actionMenuWidthCss = computed(() =>
    this.toCssSize(this.actionColumn().menuWidth ?? 'auto'),
  );
  protected readonly actionMenuHeightCss = computed(() =>
    this.toCssSize(this.actionColumn().menuHeight ?? 'auto'),
  );
  protected readonly columnSpan = computed(
    () => this.columns().length + (this.actionsEnabled() ? 1 : 0),
  );
  protected readonly totalRowCount = computed(() => {
    if (this.dataMode() === 'client') return this.rows().length;

    const configuredTotal = Number(this.data().totalRows ?? this.rows().length);
    return Number.isFinite(configuredTotal)
      ? Math.max(0, Math.floor(configuredTotal))
      : this.rows().length;
  });
  protected readonly validPageSize = computed(() => {
    const pageSize = Math.floor(this.pageSize());
    return Number.isFinite(pageSize) ? Math.max(1, pageSize) : 20;
  });
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.totalRowCount() / this.validPageSize())),
  );
  protected readonly currentPage = computed(() => this.clampPage(this.page(), this.pageCount()));

  protected readonly sortedRows = computed(() => {
    const sort = this.sort();
    const rows = this.rows();
    if (!sort || !this.sortEnabled() || this.dataMode() === 'server') return rows;

    const column = this.columns().find((candidate) => candidate.key === sort.key);
    if (!column?.sortable) return rows;

    const direction = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => direction * this.compareRows(left, right, column));
  });

  protected readonly displayedRows = computed(() => {
    const rows = this.sortedRows();
    if (this.dataMode() === 'server' || !this.paginationEnabled()) return rows;

    const start = (this.currentPage() - 1) * this.validPageSize();
    return rows.slice(start, start + this.validPageSize());
  });

  protected readonly rowRange = computed(() => {
    const totalRows = this.totalRowCount();
    if (!totalRows) return { from: 0, to: 0 };

    return {
      from: (this.currentPage() - 1) * this.validPageSize() + 1,
      to: Math.min(this.currentPage() * this.validPageSize(), totalRows),
    };
  });

  protected readonly goToPageOptions = computed(() => {
    const pageCount = this.pageCount();
    if (pageCount <= MAX_PAGE_OPTIONS) {
      return Array.from({ length: pageCount }, (_item, index) => index + 1);
    }

    const currentPage = this.currentPage();
    const pages = new Set([1, pageCount]);
    for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
      if (page > 1 && page < pageCount) pages.add(page);
    }
    return [...pages].sort((left, right) => left - right);
  });
  protected readonly resolvedPageSizeOptions = computed(() =>
    [...new Set([...this.pageSizeOptions(), this.validPageSize()])]
      .filter((size) => Number.isFinite(size) && size > 0)
      .map((size) => Math.floor(size))
      .sort((left, right) => left - right),
  );

  protected toggleSort(column: TpTableColumn<T>): void {
    if (!this.sortEnabled() || !column.sortable) return;
    const activeSort = this.sort();
    const sort: TpTableSort = {
      key: column.key,
      direction: activeSort?.key === column.key && activeSort.direction === 'asc' ? 'desc' : 'asc',
    };
    this.sort.set(sort);
    this.onSortChange.emit(sort);
    this.setPage(1);
  }

  protected sortIcon(column: TpTableColumn<T>): string {
    return this.sort()?.key === column.key && this.sort()?.direction === 'desc'
      ? 'arrow_downward'
      : 'arrow_upward';
  }

  protected isSorted(column: TpTableColumn<T>): boolean {
    return this.sort()?.key === column.key;
  }

  protected columnAriaSort(column: TpTableColumn<T>): 'ascending' | 'descending' | 'none' | null {
    if (!column.sortable || !this.sortEnabled()) return null;
    if (!this.isSorted(column)) return 'none';
    return this.sort()?.direction === 'desc' ? 'descending' : 'ascending';
  }

  protected previousPage(): void {
    this.setPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.setPage(this.currentPage() + 1);
  }

  protected selectPage(event: MatSelectChange): void {
    this.setPage(Number(event.value));
  }

  protected selectPageSize(event: MatSelectChange): void {
    const selectedPageSize = Math.floor(Number(event.value));
    if (!Number.isFinite(selectedPageSize) || selectedPageSize < 1) return;
    this.pageSize.set(selectedPageSize);
    this.page.set(1);
    this.onPaginationChange.emit({ page: 1, pageSize: selectedPageSize });
  }

  protected rowText(row: T, column: TpTableColumn<T>): string {
    const value = this.cellValue(row, column);
    return value === null || value === undefined ? '' : String(value);
  }

  protected cellPresentation(
    row: T,
    column: TpTableColumn<T>,
  ): {
    fullText: string;
    displayText: string;
  } {
    const fullText = this.rowText(row, column);
    return {
      fullText,
      displayText: truncateText(
        fullText,
        column.maxCellContentLength ?? this.maxCellContentLength(),
      ),
    };
  }

  protected filterContentFor(column: TpTableColumn<T>): TpTableFilterContent<T> | undefined {
    const templates = this.filterContents();
    return (
      templates.find((template) => template.key() === column.key) ??
      templates.find((template) => !template.key())
    );
  }

  protected cellContentFor(column: TpTableColumn<T>): TpTableCellContent<T> | undefined {
    const templates = this.cellContents();
    return (
      templates.find((template) => template.key() === column.key) ??
      templates.find((template) => !template.key())
    );
  }

  protected cellContext(row: T, column: TpTableColumn<T>): TpTableCellContentContext<T> {
    return {
      $implicit: row,
      row,
      column,
      key: column.key,
      value: this.cellValue(row, column),
    };
  }

  protected emptyContentContext(): TpTableEmptyContentContext<T> {
    const rows = this.rows();
    const columns = this.columns();
    return {
      $implicit: rows,
      rows,
      columns,
      colSpan: columns.length + (this.actionsEnabled() ? 1 : 0),
    };
  }

  protected openActions(row: T, event: MouseEvent): void {
    event.stopPropagation();
    this.currentActionRow.set(row);
  }

  protected activateRow(row: T): void {
    if (this.rowsClickable()) this.onRowClick.emit(row);
  }

  protected activateRowFromKeyboard(row: T, event: KeyboardEvent): void {
    if (
      !this.rowsClickable() ||
      event.target !== event.currentTarget ||
      (event.key !== 'Enter' && event.key !== ' ')
    )
      return;
    event.preventDefault();
    this.onRowClick.emit(row);
  }

  protected trackRow(row: T, index: number): unknown {
    return this.rowTrackBy()(row, index);
  }

  protected setPage(page: number): void {
    const nextPage = this.clampPage(page, this.pageCount());
    if (nextPage === this.currentPage()) return;
    this.page.set(nextPage);
    this.onPaginationChange.emit({ page: nextPage, pageSize: this.validPageSize() });
  }

  private compareRows(left: T, right: T, column: TpTableColumn<T>): number {
    if (column.sortFn) return column.sortFn(left, right);
    const leftValue = column.sortValue?.(left) ?? this.cellValue(left, column);
    const rightValue = column.sortValue?.(right) ?? this.cellValue(right, column);
    return this.compareValues(leftValue, rightValue);
  }

  private cellValue(row: T, column: TpTableColumn<T>): TpTableCellValue {
    return column.value ? column.value(row) : (row as Record<string, TpTableCellValue>)[column.key];
  }

  private compareValues(left: TpTableCellValue, right: TpTableCellValue): number {
    if (left === right) return 0;
    if (left === null || left === undefined) return -1;
    if (right === null || right === undefined) return 1;
    if (left instanceof Date && right instanceof Date) return left.getTime() - right.getTime();
    if (typeof left === 'number' && typeof right === 'number') return left - right;
    return String(left).localeCompare(String(right), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  }

  private clampPage(page: number, pageCount: number): number {
    const value = Math.floor(Number.isFinite(page) ? page : 1);
    return Math.min(Math.max(1, value), pageCount);
  }

  private toCssSize(value: string | number): string {
    return typeof value === 'number' ? `${value}px` : value;
  }
}
