import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import {IonButtons, IonHeader, IonMenuButton, IonSearchbar, IonTitle, IonToolbar} from "@ionic/angular/standalone";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
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

  constructor(private router: Router) {}

  ngOnInit() {
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.pageTitle = this.getPageTitle(event.urlAfterRedirects);
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  getPageTitle(url: string): string {
    const segments = url.split('/').filter(Boolean);
    if (segments.length === 0) return 'DL Finance Manager';
    const title = segments[segments.length - 1];
    return title.charAt(0).toUpperCase() + title.slice(1).replace('-', ' ');
  }
}

