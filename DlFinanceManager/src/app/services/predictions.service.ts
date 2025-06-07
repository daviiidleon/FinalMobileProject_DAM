// src/app/services/predictions.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Tipos de datos que simulan tus modelos de Java
export interface FinancialTip {
  icon: string;
  title: string;
  message: string;
}

export interface PersonalizedSuggestion {
  type: 'SAVINGS_POTENTIAL' | 'SUBSCRIPTION' | 'SAVINGS_GOAL' | 'BUDGET_EXCEEDED' | 'BALANCE_PROJECTION';
  icon: string;
  title:string;
  message: string;
  details?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PredictionsService {

  private allEconomicTips: FinancialTip[] = [
    { icon: 'bulb-outline', title: 'Fondo de Emergencia', message: 'Construye un fondo de emergencia de 3 a 6 meses de gastos esenciales.' },
    { icon: 'save-outline', title: 'Regla 50/30/20', message: 'Asigna 50% de tus ingresos a necesidades, 30% a deseos y 20% a ahorro.' },
    { icon: 'sync-circle-outline', title: 'Automatiza tus Ahorros', message: 'Configura transferencias automáticas a tu cuenta de ahorros.' },
    { icon: 'receipt-outline', title: 'Revisa tus Suscripciones', message: 'Cancela las que no utilices regularmente para ahorrar dinero cada mes.' },
    { icon: 'wallet-outline', title: 'Evita Deudas Caras', message: 'Prioriza el pago de deudas con altas tasas de interés como las de tarjetas de crédito.' },
    { icon: 'analytics-outline', title: 'Invierte a Largo Plazo', message: 'Considera opciones de inversión diversificadas para hacer crecer tu dinero.' },
    { icon: 'calculator-outline', title: 'Presupuesta tus Gastos', message: 'Crea un presupuesto mensual para saber exactamente a dónde va tu dinero.' },
    { icon: 'search-circle-outline', title: 'Compara Precios', message: 'Antes de una compra grande, compara precios y busca las mejores ofertas.' },
    { icon: 'fast-food-outline', title: 'Prepara Comidas en Casa', message: 'Reduce gastos significativamente cocinando en lugar de comer fuera.' },
    { icon: 'flash-off-outline', title: 'Eficiencia Energética', message: 'Pequeños cambios en casa pueden significar grandes ahorros en tus facturas.' },
    { icon: 'school-outline', title: 'Educación Financiera', message: 'Dedica tiempo a aprender sobre finanzas para tomar mejores decisiones.' },
    { icon: 'hand-left-outline', title: 'Negocia tus Servicios', message: 'Llama a tus proveedores (internet, teléfono) y negocia mejores tarifas.' }
  ];

  constructor() { }

  getEconomicTips(): Observable<FinancialTip[]> {
    return of(this.allEconomicTips).pipe(delay(500));
  }

  getPersonalizedSuggestions(): Observable<PersonalizedSuggestion[]> {
    const mockSuggestions: PersonalizedSuggestion[] = [
      {
        type: 'SAVINGS_GOAL',
        icon: 'golf-outline',
        title: 'Meta: Viaje a Roma',
        message: '¡Sigue así! Estás progresando en tu objetivo.',
        details: {
          savedAmount: 1200,
          targetAmount: 3000,
          progress: 1200 / 3000
        }
      },
      {
        type: 'BUDGET_EXCEEDED',
        icon: 'alert-circle-outline',
        title: 'Presupuesto Excedido',
        message: 'Has superado tu presupuesto en la categoría "Restaurantes" este mes.',
        details: {
          category: 'Restaurantes',
          spent: 250,
          budget: 200
        }
      },
      {
        type: 'SUBSCRIPTION',
        icon: 'sync-outline',
        title: 'Revisa tus Suscripciones',
        message: 'Hemos detectado 4 pagos recurrentes. Asegúrate de que todavía los necesitas.',
        details: {
          count: 4
        }
      },
      {
        type: 'BALANCE_PROJECTION',
        icon: 'trending-up-outline',
        title: 'Proyección de Saldo',
        message: 'Si continúas con tu ritmo actual, tu saldo a fin de mes será de 1,850.45 €.',
        details: {
          projectedBalance: 1850.45
        }
      }
    ];

    return of(mockSuggestions).pipe(delay(1200));
  }
}
