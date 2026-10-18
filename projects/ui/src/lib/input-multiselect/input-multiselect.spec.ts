import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { TpInputMultiselect } from './input-multiselect';

describe('InputMultiselect', () => {
  let component: TpInputMultiselect;
  let fixture: ComponentFixture<TpInputMultiselect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TpInputMultiselect],
    }).compileComponents();

    fixture = TestBed.createComponent(TpInputMultiselect);
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
    expect(formField.style.getPropertyValue('--tp-input-multiselect-focus-color')).toBe(
      'var(--tp-color-red-600)',
    );
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
      '.tp-input-multiselect__select-all .tp-input-multiselect__option-label',
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
    expect(document.querySelector('.tp-input-multiselect__select-all')).toBeTruthy();

    fixture.componentRef.setInput('useSelectAll', false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.useSelectAll()).toBe(false);
    expect(document.querySelector('.tp-input-multiselect__select-all')).toBeNull();
  });

  it('should show an up or down chevron based on the panel state', () => {
    const arrowButton = fixture.nativeElement.querySelector(
      '.tp-input-multiselect__trailing-action',
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

  it('should select and unselect every option', async () => {
    fixture.componentRef.setInput('options', ['Platform API', 'Platform UI']);
    fixture.detectChanges();
    await fixture.whenStable();

    const toggleAll = (component as unknown as { toggleAll: () => void }).toggleAll;
    toggleAll.call(component);
    expect(component.value()).toEqual(['Platform API', 'Platform UI']);

    toggleAll.call(component);
    expect(component.value()).toEqual([]);
  });

  it('should use the configured display field for object options', async () => {
    const options = [
      { id: 1, name: 'Platform API' },
      { id: 2, name: 'Platform UI' },
    ];
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('displayWith', (option: unknown) =>
      typeof option === 'object' && option !== null
        ? (option as { name: string }).name
        : String(option),
    );
    component.value.set([options[0]]);
    fixture.detectChanges();
    await fixture.whenStable();

    const optionText = (component as unknown as { optionText: (option: unknown) => string })
      .optionText;
    expect(optionText.call(component, options[0])).toBe('Platform API');

    const chip = fixture.nativeElement.querySelector('.tp-select-chip__label') as HTMLElement;
    expect(chip.textContent?.trim()).toBe('Platform API');
    expect(component.value()).toEqual([options[0]]);
  });

  it('should clear the trigger after a keyboard selection', async () => {
    fixture.componentRef.setInput('options', ['Platform API', 'Platform UI']);
    component.value.set(['Platform API', 'Platform UI']);
    fixture.detectChanges();
    await fixture.whenStable();

    const triggerInput = fixture.nativeElement.querySelector(
      '.tp-input-multiselect__trigger',
    ) as HTMLInputElement;
    triggerInput.value = '__tp-input-multiselect-select-all__';

    const selectOption = (
      component as unknown as {
        selectOption: (event: {
          option: {
            value: string;
            deselect: (emitEvent: boolean) => void;
          };
        }) => void;
      }
    ).selectOption;
    selectOption.call(component, {
      option: {
        value: '__tp-input-multiselect-select-all__',
        deselect: () => undefined,
      },
    });

    expect(component.value()).toEqual([]);
    expect(triggerInput.value).toBe('');
  });

  it('should limit visible chips and report the remainder', async () => {
    fixture.componentRef.setInput('maxChips', 1);
    component.value.set(['Platform API', 'Platform UI']);
    fixture.detectChanges();
    await fixture.whenStable();

    const visibleSelectedValues = (
      component as unknown as { visibleSelectedValues: () => readonly string[] }
    ).visibleSelectedValues();
    const hiddenSelectedCount = (
      component as unknown as { hiddenSelectedCount: () => number }
    ).hiddenSelectedCount();

    expect(visibleSelectedValues).toEqual(['Platform API']);
    expect(hiddenSelectedCount).toBe(1);
  });

  it('should clear every selected value', () => {
    component.value.set(['Platform API', 'Platform UI']);

    const clearAll = (component as unknown as { clearAll: (event: MouseEvent) => void }).clearAll;
    clearAll.call(component, new MouseEvent('click'));

    expect(component.value()).toEqual([]);
  });

  it('should float the title when values are selected', () => {
    component.value.set(['Platform API']);

    const floatLabel = (
      component as unknown as { floatLabel: () => 'always' | 'auto' }
    ).floatLabel();

    expect(floatLabel).toBe('always');
  });

  it('should keep the title floating above selected values', async () => {
    fixture.componentRef.setInput('title', 'Projects');
    component.value.set(['Platform API']);
    fixture.detectChanges();
    await fixture.whenStable();

    const title = fixture.nativeElement.querySelector('.mat-mdc-floating-label') as HTMLElement;
    const triggerInput = fixture.nativeElement.querySelector(
      '.tp-input-multiselect__trigger',
    ) as HTMLInputElement;

    expect(title.classList).toContain('mdc-floating-label--float-above');
    expect(triggerInput.value).toBe('Platform API');
  });

  it('should clear deferred panel-position callbacks when destroyed', async () => {
    vi.useFakeTimers();
    const deferredCallback = vi.fn();
    const internals = component as unknown as {
      panelPositionTimeout: ReturnType<typeof setTimeout> | undefined;
    };

    internals.panelPositionTimeout = setTimeout(deferredCallback, 0);

    fixture.destroy();

    expect(internals.panelPositionTimeout).toBeUndefined();

    await vi.runAllTimersAsync();
    expect(deferredCallback).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should coalesce deferred panel-position updates', async () => {
    vi.useFakeTimers();
    const internals = component as unknown as {
      optionsTrigger: () => { updatePosition: () => void } | undefined;
      panelPositionTimeout: ReturnType<typeof setTimeout> | undefined;
      updatePanelPosition: () => void;
    };
    const trigger = internals.optionsTrigger();
    const updatePosition = vi.spyOn(trigger!, 'updatePosition');

    internals.updatePanelPosition();
    internals.updatePanelPosition();
    await new Promise<void>((resolve) => queueMicrotask(resolve));

    expect(updatePosition).toHaveBeenCalledTimes(1);
    expect(internals.panelPositionTimeout).toBeDefined();

    await vi.advanceTimersByTimeAsync(0);
    expect(updatePosition).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});
