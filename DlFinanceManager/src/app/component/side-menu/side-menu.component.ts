import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import {
  clipboardSharp, gitCompareSharp, albumsSharp, newspaperSharp,
  trendingUpSharp, statsChartSharp, documentTextSharp, cogSharp
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  standalone: true,
  imports: [IonContent, IonIcon],
})
export class SideMenuComponent implements OnInit {
  constructor(
    private cd: ChangeDetectorRef,
    private router: Router
  ) {
    addIcons({
      clipboardSharp, gitCompareSharp, albumsSharp, newspaperSharp,
      trendingUpSharp, statsChartSharp, documentTextSharp, cogSharp
    });
  }

  ngOnInit() {}

  goTo(path: string): void {
    this.router.navigate([`/${path}`]);
  }
}
