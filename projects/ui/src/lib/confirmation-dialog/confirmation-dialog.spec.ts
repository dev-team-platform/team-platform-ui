import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { TpButton } from '../button/button';
import { TpConfirmationDialog, TpConfirmationDialogType } from './confirmation-dialog';

@Component({
  imports: [TpConfirmationDialog],
  template: `<tp-confirmation-dialog [(open)]="open" (onConfirm)="confirmed = true">
    <p>Projected confirmation content</p>
  </tp-confirmation-dialog>`,
})
class TestHost {
  open = signal(true);
  confirmed = false;
}

describe('TpConfirmationDialog', () => {
  let fixture: ComponentFixture<TpConfirmationDialog>;
  let component: TpConfirmationDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TpConfirmationDialog, TestHost],
    }).compileComponents();
    fixture = TestBed.createComponent(TpConfirmationDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  async function open(type: TpConfirmationDialogType = 'info') {
    fixture.componentRef.setInput('type', type);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('starts closed', () => {
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it.each([
    ['info', 'info', 'blue', 'blue'],
    ['warning', 'warning', 'amber', 'blue'],
    ['question', 'help', 'yellow', 'blue'],
    ['delete-forever', 'delete_forever', 'red', 'red'],
  ] as const)(
    'renders %s with its icon and default buttons',
    async (type, icon, color, confirmColor) => {
      await open(type);
      const headerIcon = fixture.nativeElement.querySelector(
        '.tp-confirmation-dialog__icon',
      ) as HTMLElement;
      expect(headerIcon.textContent?.trim()).toBe(icon);
      expect(headerIcon.style.color).toBe(`var(--tp-color-${color}-500)`);
      const buttons = fixture.debugElement
        .queryAll(By.directive(TpButton))
        .map((el) => el.componentInstance as TpButton);
      expect(buttons[0].variant()).toBe('outlined');
      expect(buttons[0].color()).toBe('gray');
      expect(buttons[1].variant()).toBe('filled');
      expect(buttons[1].color()).toBe(confirmColor);
      expect(
        [...fixture.nativeElement.querySelectorAll('button')].map((el: HTMLElement) =>
          el.textContent?.trim(),
        ),
      ).toEqual(['Cancel', 'OK']);
    },
  );

  it('supports custom titles and colors even for delete-forever', async () => {
    fixture.componentRef.setInput('confirmTitle', 'Proceed');
    fixture.componentRef.setInput('cancelTitle', 'Go back');
    fixture.componentRef.setInput('confirmColor', 'emerald');
    fixture.componentRef.setInput('cancelColor', 'purple');
    await open('delete-forever');
    const buttons = fixture.debugElement
      .queryAll(By.directive(TpButton))
      .map((el) => el.componentInstance as TpButton);
    expect(buttons.map((button) => button.color())).toEqual(['purple', 'emerald']);
    expect(
      [...fixture.nativeElement.querySelectorAll('button')].map((el: HTMLElement) =>
        el.textContent?.trim(),
      ),
    ).toEqual(['Go back', 'Proceed']);
  });

  it.each(['confirm', 'cancel'] as const)(
    'closes and emits only on%s for its button',
    async (action) => {
      const confirmed = vi.fn();
      const canceled = vi.fn();
      const state = vi.fn();
      component.onConfirm.subscribe(confirmed);
      component.onCancel.subscribe(canceled);
      component.open.subscribe(state);
      await open();
      const buttons = fixture.nativeElement.querySelectorAll('button');
      buttons[action === 'confirm' ? 1 : 0].click();
      fixture.detectChanges();
      expect(component.open()).toBe(false);
      expect(state).toHaveBeenCalledWith(false);
      expect(confirmed).toHaveBeenCalledTimes(action === 'confirm' ? 1 : 0);
      expect(canceled).toHaveBeenCalledTimes(action === 'cancel' ? 1 : 0);
      expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
    },
  );

  it('does not close on Escape, backdrop clicks, or body clicks', async () => {
    const confirmed = vi.fn();
    const canceled = vi.fn();
    component.onConfirm.subscribe(confirmed);
    component.onCancel.subscribe(canceled);
    await open();
    fixture.nativeElement.querySelector('.tp-dialog-backdrop').click();
    fixture.nativeElement.querySelector('.tp-confirmation-dialog__body').click();
    fixture.nativeElement
      .querySelector('[role="dialog"]')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(component.open()).toBe(true);
    expect(confirmed).not.toHaveBeenCalled();
    expect(canceled).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('button').length).toBe(2);
  });

  it('projects body content and updates the parent open model', async () => {
    const host = TestBed.createComponent(TestHost);
    host.detectChanges();
    await host.whenStable();
    expect(host.nativeElement.querySelector('.tp-confirmation-dialog__body').textContent).toContain(
      'Projected confirmation content',
    );
    host.nativeElement.querySelectorAll('button')[1].click();
    host.detectChanges();
    expect(host.componentInstance.open()).toBe(false);
    expect(host.componentInstance.confirmed).toBe(true);
  });
});
