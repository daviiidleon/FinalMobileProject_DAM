import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {IonContent, IonIcon} from "@ionic/angular/standalone";
import {Router} from "@angular/router";
import {
  clipboardSharp, gitCompareSharp, albumsSharp, newspaperSharp, trendingUpSharp, statsChartSharp, documentTextSharp, cogSharp
} from "ionicons/icons";
import {addIcons} from "ionicons";

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  imports: [
    IonContent,
    IonIcon
  ]
})
export class SideMenuComponent  implements OnInit {
  user: any = null;


  constructor(
    private cd: ChangeDetectorRef,
    private router: Router
  ) {
    addIcons({   clipboardSharp, gitCompareSharp, albumsSharp, newspaperSharp, trendingUpSharp, statsChartSharp, documentTextSharp, cogSharp
    });
  }

  ngOnInit() {}

}
