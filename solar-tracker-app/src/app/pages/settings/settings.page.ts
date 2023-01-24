import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { NavController } from '@ionic/angular';
import { userData } from '../../userData';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(private userData: userData, private nav: NavController, private fireDb: AngularFireDatabase, private socket: Socket,) {
    this.socket.connect();
  }

  ngOnInit() {
  }
  pageControl;
  radioButton = true;
  toggleText = "Solar";
  checkStat;
  ionViewWillEnter() {
    (this.pageControl) = (this.userData.pageControl).toString();
    this.checkStat = this.userData.checkStat;
    console.log(this.checkStat);
    console.log(this.pageControl);
  }

  pageController(event) {
    this.userData.pageControl = event.detail.value;
    console.log(event.detail.value);
  }

  toggle(e) {
    if (e.detail.checked) {
      this.userData.checkStat = true;
      this.radioButton = false;
      this.toggleText = "Controller";
      this.socket.emit('sendData', { "status": 2 });
    }
    else {
      this.userData.checkStat = false;
      this.radioButton = true;
      this.toggleText = "Solar";
      this.socket.emit('sendData', { "status": 1 });
    }
  }
  back() {
    if (this.radioButton)
      this.nav.navigateRoot(['/home']);
    else
      this.nav.navigateRoot(['/controller']);
  }

  controller() {
    this.nav.navigateRoot(['/controller']);
  }

  solar() {
    this.nav.navigateRoot(['/home']);
  }

}
