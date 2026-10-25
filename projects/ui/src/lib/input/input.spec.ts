import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TpInput } from './input';

describe('Input', () => {
  let component: TpInput;
  let fixture: ComponentFixture<TpInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TpInput],
    }).compileComponents();

    fixture = TestBed.createComponent(TpInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use its color for the focus ring', async () => {
    fixture.componentRef.setInput('color', 'red');
    fixture.detectChanges();
    await fixture.whenStable();

    const formField = fixture.nativeElement.querySelector('mat-form-field') as HTMLElement;

    expect(formField.style.getPropertyValue('--tp-input-focus-color')).toBe(
      'var(--tp-color-red-600)',
    );
  });

  it('should render the title as a floating Material label', async () => {
    fixture.componentRef.setInput('title', 'Project name');
    fixture.detectChanges();
    await fixture.whenStable();

    const label = fixture.nativeElement.querySelector('mat-label') as HTMLElement;
    expect(label.textContent?.trim()).toBe('Project name');
  });

  it('should mark a required input and show the required marker', async () => {
    fixture.componentRef.setInput('title', 'Project name');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const marker = fixture.nativeElement.querySelector('.tp-input__required-marker') as HTMLElement;

    expect(input.required).toBe(true);
    expect(marker).toBeTruthy();
  });

  it('should not show a required marker without a title', async () => {
    fixture.componentRef.setInput('title', '');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const marker = fixture.nativeElement.querySelector('.tp-input__required-marker') as HTMLElement;

    expect(marker).toBeNull();
  });

  it('should show the required error only after an empty input is touched', async () => {
    fixture.componentRef.setInput('title', 'Project name');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.tp-input__error')).toBeNull();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.tp-input__error') as HTMLElement;
    expect(component.touched()).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(error.textContent?.trim()).toBe('This field is required');
  });

  it('should clear the required error when a value is entered', async () => {
    fixture.componentRef.setInput('required', true);
    component.touched.set(true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'Team Platform';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(input.getAttribute('aria-invalid')).toBe('false');
    expect(fixture.nativeElement.querySelector('.tp-input__error')).toBeNull();
  });

  it('should support a custom required message', async () => {
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('requiredMessage', 'Project name is required');
    component.touched.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.tp-input__error') as HTMLElement;
    expect(error.textContent?.trim()).toBe('Project name is required');
  });

  it('should update a free-text signal value', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'Team Platform';
    input.dispatchEvent(new Event('input'));

    expect(component.value()).toBe('Team Platform');
  });

  it('should update a numeric signal value for the number variant', async () => {
    fixture.componentRef.setInput('variant', 'number');
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '42';
    input.dispatchEvent(new Event('input'));

    expect(input.type).toBe('number');
    expect(component.value()).toBe(42);
  });

  it('should apply height and max-height control tokens', async () => {
    fixture.componentRef.setInput('height', '36px');
    fixture.componentRef.setInput('maxHeight', '44px');
    fixture.detectChanges();
    await fixture.whenStable();

    const formField = fixture.nativeElement.querySelector('mat-form-field') as HTMLElement;

    expect(formField.style.getPropertyValue('--tp-input-height')).toBe('36px');
    expect(formField.style.getPropertyValue('--tp-input-max-height')).toBe('44px');
  });

  it.each([
    ['sm', 'var(--tp-font-size-default)'],
    ['md', 'var(--tp-text-md)'],
    ['lg', 'var(--tp-text-lg)'],
  ] as const)('should map %s content size to its typography token', async (size, token) => {
    fixture.componentRef.setInput('contentSize', size);
    fixture.detectChanges();
    await fixture.whenStable();

    const formField = fixture.nativeElement.querySelector('mat-form-field') as HTMLElement;

    expect(formField.style.getPropertyValue('--tp-input-content-size')).toBe(token);
  });
});
