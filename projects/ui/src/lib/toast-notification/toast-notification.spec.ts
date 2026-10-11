import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TpToastNotification } from './toast-notification';

describe('TpToastNotification', () => {
  let component: TpToastNotification;
  let fixture: ComponentFixture<TpToastNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TpToastNotification],
    }).compileComponents();

    fixture = TestBed.createComponent(TpToastNotification);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('duration', 0);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
