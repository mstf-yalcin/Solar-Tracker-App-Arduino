import {Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';




import { AngularFirestoreModule } from '@angular/fire/compat/firestore/'; 
import {AngularFireModule} from '@angular/fire/compat'
import {environment} from '../environments/environment';




import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NgChartsModule } from 'ng2-charts';
 
import {HammerGestureConfig,HAMMER_GESTURE_CONFIG,} from '@angular/platform-browser';
import * as Hammer from 'hammerjs';
import {HammerModule} from '@angular/platform-browser'


import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const config: SocketIoConfig = { url: '4.231.20.86:80', options: {transports : ['websocket','polling'] } };
// 4.231.20.86
// 20.229.169.100:80



declare var Hammer: any;
@Injectable({providedIn: 'root'})
// export class MyHammerConfig extends HammerGestureConfig {
//   overrides = <any> {
//       'pinch': { enable: true },
//       'rotate': { enable: true },
//       'pan':{ direction: Hammer.DIRECTION_ALL}
//   }
// }

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,NgChartsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,HammerModule, SocketIoModule.forRoot(config),
    IonicModule.forRoot(), ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}