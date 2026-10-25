import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import {
  TpChip,
  TpInput,
  TpInputAutocompleteMultiselect,
  TpInputAutocompleteSingleselect,
  TpInputDatePicker,
  TpTable,
  TpTableActionContent,
  TpTableCellContent,
  TpTableFilterContent,
  TpTextButton,
  type TpTableActionColumnConfig,
  type TpTableColumn,
  type TpTableConfig,
  type TpTableData,
  type TpTablePageChange,
  type TpTableSort,
  type TpTableState,
} from 'ui';

interface ProjectRow {
  id: number;
  name: string;
  owner: string;
  team: string;
  status: 'Active' | 'At risk' | 'Planning' | 'Archived';
  updated: string;
  description: string;
}

interface ProjectFilters {
  id: number | null;
  project: string;
  owner: string;
  team: string[];
  status: string[];
  updated: Date | null;
  description: string;
}

const OWNERS = ['Ava Nguyen', 'Leo Tran', 'Mia Pham', 'Noah Vo', 'Linh Do'];
const TEAMS = ['Platform', 'Identity', 'Payments', 'Operations'];
const STATUSES: ProjectRow['status'][] = ['Active', 'At risk', 'Planning', 'Archived'];

function createProjectRows(): ProjectRow[] {
  return Array.from({ length: 100 }, (_value, index) => {
    const id = index + 1;
    const status = STATUSES[index % STATUSES.length];

    return {
      id,
      name: `Project ${String(id).padStart(3, '0')}`,
      owner: OWNERS[index % OWNERS.length],
      team: TEAMS[index % TEAMS.length],
      status,
      updated: `2026-09-${String((index % 28) + 1).padStart(2, '0')}`,
      description: `Project ${id} demonstrates long table content. Hover this cell to see its full description in the tooltip.`,
    };
  });
}

@Component({
  selector: 'app-test-table',
  imports: [
    TpInput,
    TpInputAutocompleteSingleselect,
    TpInputAutocompleteMultiselect,
    TpTable,
    TpTableActionContent,
    TpTableCellContent,
    TpTableFilterContent,
    TpTextButton,
    TpInputDatePicker,
    TpChip,
  ],
  templateUrl: './test-table.html',
  styleUrl: './test-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestTable {
  protected readonly columns: TpTableColumn<ProjectRow>[] = [
    { key: 'id', title: 'ID', sortable: true, width: '76px' },
    { key: 'name', title: 'Project', sortable: true, width: '160px' },
    { key: 'owner', title: 'Owner', sortable: true, width: '140px' },
    { key: 'team', title: 'Team', sortable: true, width: '200px' },
    { key: 'status', title: 'Status', sortable: true, width: '110px' },
    { key: 'updated', title: 'Last updated', sortable: true, width: '130px' },
    { key: 'description', title: 'Description', width: '320px', maxCellContentLength: 48 },
  ];

  protected readonly rows = createProjectRows();
  protected readonly projectOptions = [...new Set(this.rows.map((row) => row.name))];
  protected readonly ownerOptions = [...new Set(this.rows.map((row) => row.owner))];
  protected readonly teamOptions = [...new Set(this.rows.map((row) => row.team))];
  protected readonly statusOptions = [...new Set(this.rows.map((row) => row.status))];
  protected readonly idFilter = signal<number | null>(null);
  protected readonly projectFilter = signal('');
  protected readonly ownerFilter = signal('');
  protected readonly teamFilter = signal<string[]>([]);
  protected readonly statusFilter = signal<string[]>([]);
  protected readonly updatedFilter = signal<Date | null>(null);
  protected readonly descriptionFilter = signal('');
  protected readonly manuallyLoading = signal(false);
  protected readonly reloading = signal(false);
  private reloadTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly filteringLoading = signal(false);
  protected readonly emptyState = signal(false);
  protected readonly textButtonFontSize = signal('12px');
  protected readonly textButtonFontWeight = signal('200');
  protected readonly loading = computed(
    () => this.manuallyLoading() || this.filteringLoading() || this.reloading(),
  );
  private readonly filterSnapshot = computed<ProjectFilters>(() => ({
    id: this.idFilter(),
    project: this.projectFilter(),
    owner: this.ownerFilter(),
    team: this.teamFilter(),
    status: this.statusFilter(),
    updated: this.updatedFilter(),
    description: this.descriptionFilter(),
  }));
  private readonly appliedFilters = signal<ProjectFilters>({
    id: null,
    project: '',
    owner: '',
    team: [],
    status: [],
    updated: null,
    description: '',
  });
  private isFirstFilterRun = true;
  private readonly filterDebounceEffect = effect((onCleanup) => {
    const filters = this.filterSnapshot();

    if (this.isFirstFilterRun) {
      this.isFirstFilterRun = false;
      this.appliedFilters.set(filters);
      return;
    }

    this.filteringLoading.set(true);
    const timeout = setTimeout(() => {
      this.appliedFilters.set(filters);
      this.filteringLoading.set(false);
    }, 500);
    onCleanup(() => clearTimeout(timeout));
  });
  protected readonly filteredRows = computed(() => {
    const filters = this.appliedFilters();
    const projectFilter = filters.project.trim().toLocaleLowerCase();
    const ownerFilter = filters.owner.trim().toLocaleLowerCase();
    const teamFilter = filters.team;
    const statusFilter = filters.status;
    const updatedFilter = filters.updated ? filters.updated.toLocaleDateString() : null;
    const descriptionFilter = filters.description.trim().toLocaleLowerCase();

    return this.rows.filter((row) => {
      const idMatches = filters.id === null || String(row.id).includes(String(filters.id));
      const projectMatches = !projectFilter || row.name.toLocaleLowerCase().includes(projectFilter);
      const ownerMatches = !ownerFilter || row.owner.toLocaleLowerCase().includes(ownerFilter);
      const teamMatches = !teamFilter.length || teamFilter.includes(row.team);
      const statusMatches = !statusFilter.length || statusFilter.includes(row.status);
      const updatedMatches =
        !updatedFilter || row.updated.toLocaleLowerCase().includes(updatedFilter);
      const descriptionMatches =
        !descriptionFilter || row.description.toLocaleLowerCase().includes(descriptionFilter);

      return (
        idMatches &&
        projectMatches &&
        ownerMatches &&
        teamMatches &&
        statusMatches &&
        updatedMatches &&
        descriptionMatches
      );
    });
  });
  protected readonly tableRows = computed(() =>
    this.emptyState() || this.reloading() ? [] : this.filteredRows(),
  );
  protected readonly tableData = computed<TpTableData<ProjectRow>>(() => ({
    rows: this.tableRows(),
  }));
  protected readonly tableConfig = computed<TpTableConfig<ProjectRow>>(() => ({
    columns: this.columns,
    maxWidth: '1000px',
    maxHeight: '480px',
    rowHeight: '42px',
    maxCellContentLength: 36,
    rowsClickable: true,
    filter: { enabled: true },
    sort: { enabled: true },
    pagination: {
      enabled: true,
      pageSizeOptions: [10, 20, 25, 50],
      prevPageButtonDisabled: this.loading(),
      nextPageButtonDisabled: this.loading(),
    },
    reload: {
      enabled: true,
      buttonDisabled: this.loading(),
    },
  }));
  protected readonly tableState = computed<TpTableState>(() => ({
    loading: { enabled: this.loading() },
  }));
  protected readonly actionColumn: TpTableActionColumnConfig = {
    enabled: true,
    title: 'Actions',
    menuWidth: 'auto',
    menuHeight: 'auto',
  };
  protected readonly selectedRow = signal<ProjectRow | null>(null);
  protected readonly lastAction = signal('Select a row or an action to see the emitted event.');

  protected showRow(row: ProjectRow): void {
    this.selectedRow.set(row);
    this.lastAction.set(`Row click: ${row.name}`);
  }

  protected showAction(action: string, row: ProjectRow): void {
    this.selectedRow.set(row);
    this.lastAction.set(`${action}: ${row.name}`);
  }

  protected showPage(event: TpTablePageChange): void {
    this.lastAction.set(`Pagination: page ${event.page}, ${event.pageSize} rows per page`);
  }

  protected showSort(sort: TpTableSort | null): void {
    if (sort) this.lastAction.set(`Sort: ${sort.key} (${sort.direction})`);
  }

  protected toggleLoading(): void {
    this.manuallyLoading.update((value) => !value);
  }

  protected toggleEmptyState(): void {
    this.emptyState.update((value) => !value);
  }

  protected reload(): void {
    this.reloading.set(true);
    if (this.reloadTimeout !== null) clearTimeout(this.reloadTimeout);

    this.reloadTimeout = setTimeout(() => {
      this.reloading.set(false);
      this.reloadTimeout = null;
    }, 1000);
  }
}
