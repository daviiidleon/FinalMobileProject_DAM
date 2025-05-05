import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AhorroPage } from './ahorro.page';

describe('AhorroPage', () => {
  let component: AhorroPage;
  let fixture: ComponentFixture<AhorroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AhorroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
