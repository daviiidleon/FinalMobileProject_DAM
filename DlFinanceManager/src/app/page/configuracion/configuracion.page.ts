import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonContent, IonHeader, IonIcon, IonTitle, IonToolbar} from '@ionic/angular/standalone';
import {HeaderComponent} from "../../component/header/header.component";
import {SideMenuComponent} from "../../component/side-menu/side-menu.component";

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
  standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HeaderComponent, SideMenuComponent, IonIcon]
})
export class ConfiguracionPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
