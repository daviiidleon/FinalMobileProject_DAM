// src/app/page/predicciones/predicciones.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader,
  IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon,
  IonLabel, IonSpinner, IonProgressBar, IonList, IonItem
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bulbOutline, saveOutline, syncCircleOutline, receiptOutline, walletOutline, analyticsOutline, calculatorOutline, searchCircleOutline, fastFoodOutline, flashOffOutline, schoolOutline, handLeftOutline, chevronForwardOutline, closeCircleOutline, golfOutline, alertCircleOutline, syncOutline, trendingUpOutline } from 'ionicons/icons';

import { HeaderComponent } from '../../component/header/header.component';
import { SideMenuComponent } from '../../component/side-menu/side-menu.component';
// CORRECCIÓN 1: Ruta del servicio ajustada para una carpeta 'services'
import { PredictionsService, FinancialTip, PersonalizedSuggestion } from '../../services/predictions.service';

@Component({
  selector: 'app-predicciones',
  templateUrl: './predicciones.page.html',
  styleUrls: ['./predicciones.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, CurrencyPipe, HeaderComponent, SideMenuComponent,
    IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader,
    IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonIcon,
    IonLabel, IonSpinner, IonProgressBar, IonList, IonItem
  ]
})
export class PrediccionesPage implements OnInit {

  isLoading: boolean = true;

  private availableEconomicTipsPool: FinancialTip[] = [];
  public displayedEconomicTips: FinancialTip[] = [];
  private masterTipList: FinancialTip[] = [];

  public personalizedSuggestions: PersonalizedSuggestion[] = [];

  constructor(private predictionsService: PredictionsService) {
    addIcons({ bulbOutline, saveOutline, syncCircleOutline, receiptOutline, walletOutline, analyticsOutline, calculatorOutline, searchCircleOutline, fastFoodOutline, flashOffOutline, schoolOutline, handLeftOutline, chevronForwardOutline, closeCircleOutline, golfOutline, alertCircleOutline, syncOutline, trendingUpOutline });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.loadInitialData();
  }

  async loadInitialData() {
    this.isLoading = true;
    this.personalizedSuggestions = [];
    this.displayedEconomicTips = [];

    // CORRECCIÓN 2: Se añade el tipo explícito 'FinancialTip[]' a 'allTips'
    this.predictionsService.getEconomicTips().subscribe((allTips: FinancialTip[]) => {
      this.masterTipList = allTips;
      this.initializeEconomicTips();
      this.loadPersonalizedSuggestions();
    });
  }

  loadPersonalizedSuggestions() {
    // CORRECCIÓN 3: Se añade el tipo explícito 'PersonalizedSuggestion[]' a 'suggestions'
    this.predictionsService.getPersonalizedSuggestions().subscribe((suggestions: PersonalizedSuggestion[]) => {
      this.personalizedSuggestions = suggestions;
      this.isLoading = false;
    });
  }

  initializeEconomicTips() {
    this.availableEconomicTipsPool = [...this.masterTipList].sort(() => 0.5 - Math.random());
    this.displayedEconomicTips = this.availableEconomicTipsPool.splice(0, 3);
  }

  replaceEconomicTip(index: number) {
    if (this.availableEconomicTipsPool.length === 0) {
      this.availableEconomicTipsPool = [...this.masterTipList]
        .filter(tip => !this.displayedEconomicTips.some(displayedTip => displayedTip.title === tip.title))
        .sort(() => 0.5 - Math.random());
    }
    const newTip = this.availableEconomicTipsPool.pop();
    if (newTip) {
      this.displayedEconomicTips[index] = newTip;
    }
  }

  dismissPersonalizedSuggestion(index: number) {
    this.personalizedSuggestions.splice(index, 1);
  }
}
