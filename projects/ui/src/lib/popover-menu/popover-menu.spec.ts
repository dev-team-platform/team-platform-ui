import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TpPopoverMenu } from './popover-menu';

describe('TpPopoverMenu', () => {
  let component: TpPopoverMenu;
  let fixture: ComponentFixture<TpPopoverMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TpPopoverMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(TpPopoverMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
