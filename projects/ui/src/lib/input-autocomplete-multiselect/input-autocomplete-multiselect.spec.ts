import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { TpInputAutocompleteMultiselect } from './input-autocomplete-multiselect';

describe('TpInputAutocompleteMultiselect', () => {
  let component: TpInputAutocompleteMultiselect;
  let fixture: ComponentFixture<TpInputAutocompleteMultiselect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TpInputAutocompleteMultiselect],
    }).compileComponents();

    fixture = TestBed.createComponent(TpInputAutocompleteMultiselect);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should allow overriding loading and no-results messages', () => {
    fixture.componentRef.setInput('loadingMessage', 'Fetching projects');
    fixture.componentRef.setInput('noResultsMessage', 'No projects found');

    expect(component.loadingMessage()).toBe('Fetching projects');
    expect(component.noResultsMessage()).toBe('No projects found');
  });

  it('should allow overriding selected chip colors', async () => {
    fixture.componentRef.setInput('value', ['Platform API']);
    fixture.componentRef.setInput('color', 'red');
    fixture.detectChanges();
    await fixture.whenStable();

    const chip = fixture.nativeElement.querySelector('tp-select-chip') as HTMLElement;
    const formField = fixture.nativeElement.querySelector('mat-form-field') as HTMLElement;

    expect(chip.style.getPropertyValue('--tp-select-chip-text-color')).toBe(
      'var(--tp-color-red-900)',
    );
    expect(chip.style.getPropertyValue('--tp-select-chip-background-color')).toBe(
      'var(--tp-color-red-100)',
    );
    expect(
      formField.style.getPropertyValue('--tp-input-autocomplete-multiselect-focus-color'),
    ).toBe('var(--tp-color-red-600)');
  });

  it('should allow overriding the select-all label', async () => {
    fixture.componentRef.setInput('options', ['Platform API', 'Platform UI']);
    fixture.componentRef.setInput('selectAllLabel', 'Select all projects');
    fixture.detectChanges();
    await fixture.whenStable();

    const optionsTrigger = (
      component as unknown as { optionsTrigger: () => { openPanel: () => void } }
    ).optionsTrigger();
    optionsTrigger.openPanel();
    fixture.detectChanges();
    await fixture.whenStable();

    const label = document.querySelector(
      '.tp-input-autocomplete-multiselect__select-all .tp-input-autocomplete-multiselect__option-label',
    ) as HTMLElement;
    expect(label.textContent?.trim()).toBe('Select all projects');
  });

  it('should show the select-all option by default and allow hiding it', async () => {
    fixture.componentRef.setInput('options', ['Platform API', 'Platform UI']);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.useSelectAll()).toBe(true);
    const optionsTrigger = (
      component as unknown as { optionsTrigger: () => { openPanel: () => void } }
    ).optionsTrigger();
    optionsTrigger.openPanel();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelector('.tp-input-autocomplete-multiselect__select-all')).toBeTruthy();

    fixture.componentRef.setInput('useSelectAll', false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.useSelectAll()).toBe(false);
    expect(document.querySelector('.tp-input-autocomplete-multiselect__select-all')).toBeNull();
  });

  it('should show an up or down chevron based on the panel state', () => {
    const arrowButton = fixture.nativeElement.querySelector(
      '.tp-input-autocomplete-multiselect__trailing-action',
    ) as HTMLButtonElement;
    const arrow = arrowButton.querySelector('.tp-icon') as HTMLElement;

    expect(arrow.textContent?.trim()).toBe('keyboard_arrow_down');
    (component as unknown as { optionsOpen: { set: (open: boolean) => void } }).optionsOpen.set(
      true,
    );
    fixture.detectChanges();

    expect(arrow.textContent?.trim()).toBe('keyboard_arrow_up');
    expect(arrowButton.getAttribute('aria-expanded')).toBe('true');
  });

  it('should emit typed search text without filtering its options', async () => {
    const onSearch = vi.fn();
    component.onSearch.subscribe(onSearch);
    fixture.componentRef.setInput('options', ['Platform API', 'Platform UI', 'Project Atlas']);
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector(
      '.tp-input-autocomplete-multiselect__trigger',
    ) as HTMLInputElement;
    input.value = 'ui';
    input.dispatchEvent(new Event('input'));

    expect(onSearch).toHaveBeenCalledWith('ui');
    expect(component.options()).toEqual(['Platform API', 'Platform UI', 'Project Atlas']);
  });

  it('should display object options using displayWith', async () => {
    const options = [
      { id: 'api', name: 'Platform API' },
      { id: 'ui', name: 'Platform UI' },
    ];
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('displayWith', (option: unknown) =>
      typeof option === 'object' && option !== null
        ? (option as { name: string }).name
        : String(option),
    );
    fixture.detectChanges();
    await fixture.whenStable();

    const toggleOption = (component as unknown as { toggleOption: (option: unknown) => void })
      .toggleOption;
    toggleOption.call(component, options[1]);

    expect(component.value()).toEqual([options[1]]);
    expect(
      (component as unknown as { optionText: (option: unknown) => string }).optionText(options[1]),
    ).toBe('Platform UI');
  });

  it('should place the typing input immediately after selected chips', async () => {
    component.value.set(['Platform API', 'Platform UI']);
    fixture.detectChanges();
    await fixture.whenStable();

    const valueContainer = fixture.nativeElement.querySelector(
      '.tp-input-autocomplete-multiselect__value',
    ) as HTMLElement;
    const triggerInput = fixture.nativeElement.querySelector(
      '.tp-input-autocomplete-multiselect__trigger',
    ) as HTMLInputElement;

    expect(valueContainer.lastElementChild).toBe(triggerInput);
  });

  it('should keep the title floating above selected values', async () => {
    fixture.componentRef.setInput('title', 'Projects');
    component.value.set(['Platform API']);
    fixture.detectChanges();
    await fixture.whenStable();

    const title = fixture.nativeElement.querySelector('.mat-mdc-floating-label') as HTMLElement;
    const chips = fixture.nativeElement.querySelectorAll(
      '.tp-select-chip__label',
    ) as NodeListOf<HTMLElement>;

    expect(title.classList).toContain('mdc-floating-label--float-above');
    expect(chips[0].textContent?.trim()).toBe('Platform API');
  });

  it('should toggle one selected value', () => {
    const toggleOption = (component as unknown as { toggleOption: (option: string) => void })
      .toggleOption;

    toggleOption.call(component, 'Platform UI');
    expect(component.value()).toEqual(['Platform UI']);

    toggleOption.call(component, 'Platform UI');
    expect(component.value()).toEqual([]);
  });

  it('should update the panel position after a pointer selection', () => {
    const updatePanelPosition = vi.spyOn(
      component as unknown as { updatePanelPosition: () => void },
      'updatePanelPosition',
    );
    const toggleOptionFromPointer = (
      component as unknown as {
        toggleOptionFromPointer: (option: string, event: MouseEvent) => void;
      }
    ).toggleOptionFromPointer;

    toggleOptionFromPointer.call(component, 'Platform UI', new MouseEvent('click'));

    expect(updatePanelPosition).toHaveBeenCalledOnce();
  });

  it('should select all options currently supplied by the API', async () => {
    fixture.componentRef.setInput('options', ['Platform API', 'Platform UI', 'Project Atlas']);
    fixture.detectChanges();
    await fixture.whenStable();

    const toggleAll = (component as unknown as { toggleAllOptions: () => void }).toggleAllOptions;
    toggleAll.call(component);

    expect(component.value()).toEqual(['Platform API', 'Platform UI', 'Project Atlas']);

    toggleAll.call(component);
    expect(component.value()).toEqual([]);
  });

  it('should show a required error once touched without selections', async () => {
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector(
      '.tp-input-autocomplete-multiselect__trigger',
    ) as HTMLInputElement;
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    const error = fixture.nativeElement.querySelector(
      '.tp-input-autocomplete-multiselect__error',
    ) as HTMLElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(error.textContent?.trim()).toBe('This field is required');
  });
});
