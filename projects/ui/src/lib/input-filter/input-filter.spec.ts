import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { TpInputFilter } from './input-filter';

describe('TpInputFilter', () => {
  let component: TpInputFilter;
  let fixture: ComponentFixture<TpInputFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TpInputFilter] }).compileComponents();
    fixture = TestBed.createComponent(TpInputFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders the input read-only and supports parent-controlled values', async () => {
    fixture.componentRef.setInput('value', 'Project Alpha');
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.readOnly).toBe(true);
    expect(input.value).toBe('Project Alpha');
    input.value = 'Changed locally';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.value()).toBe('Project Alpha');
  });

  it('opens a top-start popover sized to the input and emits open', async () => {
    const onOpen = vi.fn();
    component.onOpen.subscribe(onOpen);
    fixture.nativeElement.querySelector('.tp-input-filter__field').click();
    fixture.detectChanges();
    await fixture.whenStable();

    const panel = document.querySelector('.tp-popover-menu__panel') as HTMLElement;
    const field = fixture.nativeElement.querySelector('.tp-input-filter__field') as HTMLElement;
    expect(panel).toBeTruthy();
    expect(panel.getBoundingClientRect().width).toBeCloseTo(field.getBoundingClientRect().width);
    expect(component.open()).toBe(true);
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('does not open while disabled', async () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.nativeElement.querySelector('.tp-input-filter__field').click();
    fixture.detectChanges();
    expect(component.open()).toBe(false);
    expect(document.querySelector('.tp-popover-menu__panel')).toBeNull();
  });
});
