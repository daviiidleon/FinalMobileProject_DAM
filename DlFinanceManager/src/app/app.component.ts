import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AccountService } from './services/account.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonApp,
    IonRouterOutlet,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  selectedAccountName: string = 'Select Account';
  private accountSubscription!: Subscription;

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.accountSubscription = this.accountService.selectedAccount$.subscribe(account => {
      console.log('Selected account updated in AppComponent:', account);
      this.selectedAccountName = account ? account.nombre : 'Select Account';
    });
  }

  ngOnDestroy() {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
  }
}
