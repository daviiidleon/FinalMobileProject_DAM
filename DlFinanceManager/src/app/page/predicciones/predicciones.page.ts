import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonButton, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar} from '@ionic/angular/standalone';
import {HeaderComponent} from "../../component/header/header.component";
import {SideMenuComponent} from "../../component/side-menu/side-menu.component";

@Component({
  selector: 'app-predicciones',
  templateUrl: './predicciones.page.html',
  styleUrls: ['./predicciones.page.scss'],
  standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HeaderComponent, SideMenuComponent, IonIcon, IonButton]
})
export class PrediccionesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
