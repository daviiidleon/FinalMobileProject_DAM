import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrediccionesPage } from './predicciones.page';

describe('PrediccionesPage', () => {
  let component: PrediccionesPage;
  let fixture: ComponentFixture<PrediccionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PrediccionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
