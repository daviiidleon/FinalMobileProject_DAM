import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import {IonButtons, IonHeader, IonMenuButton, IonSearchbar, IonTitle, IonToolbar} from "@ionic/angular/standalone";
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  styleUrls: ['./header.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonSearchbar
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  pageTitle: string = 'DL Finance Manager';
  private routerSubscription: Subscription | undefined;
  selectedAccountName: string | null = null;
  private accountSubscription!: Subscription;

  constructor(
    private router: Router,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.pageTitle = this.getPageTitle(event.urlAfterRedirects);
      });
    this.accountSubscription = this.accountService.selectedAccount$.subscribe(account => {
      this.selectedAccountName = account ? account.nombre : 'Select Account';
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.accountSubscription.unsubscribe();
  }

  getPageTitle(url: string): string {
    const segments = url.split('/').filter(Boolean);
    if (segments.length === 0) return 'DL Finance Manager';
    const title = segments[segments.length - 1];
    return title.charAt(0).toUpperCase() + title.slice(1).replace('-', ' ');
  }
}

