import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Platform } from '@ionic/angular';
import * as nipplejs from 'nipplejs';
import { Router } from '@angular/router';
import { userData } from '../../userData';
import { Socket } from 'ngx-socket-io';


@Component({
  selector: 'app-controller',
  templateUrl: './controller.page.html',
  styleUrls: ['./controller.page.scss'],
})
export class ControllerPage implements AfterViewInit {

  constructor(private router: Router, private platform: Platform, private fireDb: AngularFireDatabase, private userData: userData, private socket: Socket,) {




    platform.ready().then(() => {
      console.log('Width: ' + platform.width());
      console.log('Height: ' + platform.height());
    });
    this.socket.connect();





  }

  data;
  ngAfterViewInit() {

    // this.fireDb.database.ref().once('value',data=>{
    //   console.log(data.val());
    //   this.data=data.val();

    // }).then(()=>{
    //   this._degreeX=this.data.x;
    //   this._degreeY=this.data.y;
    //   this._grabDegree=this.data.grab;
    //   this.pageControl=this.data.page;
    //   this.userData.pageControl=this.pageControl;
    //   this.radius=this.data.radius;


    //   setTimeout(() => {
    //     if(this.pageControl==0)
    //     {
    //       //!!!!!!!!!!!
    //       this.joystick.destroy();


    //       this.zone=document.getElementById('zone_joystick');
    //       this.stick();
    //     }
    //     },100);
    // })


  }


  ionViewDidEnter() {
    this.pageControl = this.userData.pageControl;
    this.fireDb.database.ref("/controller").once('value', data => {
      var val = data.val();
      this._degreeX = val.x;
      this._degreeY = val.y;
    });

    if (this.pageControl == 0) {
      this.zone = document.getElementById('zone_joystick');
      setTimeout(() => {
        this.stick();
      },);
    }
  }

  settings() {
    this.router.navigateByUrl('/settings');
  }

  pageControl = 0;
  tempPageControl;
  radius = 70;
  joystick;
  zone;

  press = 0;
  _up = 0;
  _down = 0;
  _left = 0;
  _right = 0;

  _grabDegree = 0;
  _grabPress = 0;

  _degreeX = 90;
  _degreeY = 20;

  durationY = 200;
  durationX = 200;

  singleDuration = 200;

  x;
  y;
  countX = 0;
  countY = 0;


  tempSize;

  down() {
    if (this._degreeY > 0) {

      this._degreeY--;
      this.updateY();

    }

  }

  up() {
    if (this._degreeY < 180) {
      this._degreeY++;
      this.updateY();
    }

  }

  left() {
    if (this._degreeX > 0) {
      this._degreeX--;
      this.updateX();
    }

  }

  right() {
    if (this._degreeX < 180) {
      this._degreeX++;
      this.updateX();
    }

  }


  pressUp() {
    this.press = 1;
    this.upDegreeY();
  }

  pressDown() {
    this.press = 1;
    this.downDegreeY();
  }


  pressLeft() {
    this.press = 1;
    this.leftDegreeX();
  }

  pressRight() {
    this.press = 1;
    this.rightDegreeX();
  }


  grabClick(e) {
    if (e == 1 && this._grabDegree < 180) {
      this._grabDegree++;
      this.updateGrab();
    }
    else if (e == 0 && this._grabDegree > 0) {
      this._grabDegree--;
      this.updateGrab();
    }

  }

  grabPress(e) {

    this._grabPress = 1;
    this.grabDegree(e);
  }


  grabDegree(e) {
    setTimeout(() => {
      if (this._grabPress == 1 && this._grabDegree < 180 && e == 1) {
        this._grabDegree++;
        this.updateGrab();

        if (this.singleDuration > 30) {
          this.singleDuration -= 10;
        }
        this.grabDegree(e);
      }
      else if (this._grabPress == 1 && this._grabDegree > 0 && e == 0) {
        this._grabDegree--;
        this.updateGrab();

        if (this.singleDuration > 30) {
          this.singleDuration -= 10;
        }
        this.grabDegree(e);
      }
    }, this.singleDuration);
  }
  grabDefault() {
    this._grabDegree = 0;
    this.updateGrab();

  }

  grabEnd() {
    this._grabPress = 0;
    this.singleDuration = 200;
  }

  panEnd() {
    this.press = 0;
    this.singleDuration = 200;
  }

  rightDegreeX() {
    setTimeout(() => {
      if (this.press == 1 && this._degreeX < 180) {
        this._degreeX++;
        this.updateX();

        if (this.singleDuration > 30) {
          this.singleDuration -= 10;
        }
        this.rightDegreeX();
      }
    }, this.singleDuration);
  }

  leftDegreeX() {
    setTimeout(() => {
      if (this.press == 1 && this._degreeX > 0) {
        this._degreeX--;
        this.updateX();

        if (this.singleDuration > 30) {
          this.singleDuration -= 10;

        }
        this.leftDegreeX();
      }
    }, this.singleDuration);
  }

  upDegreeY() {
    setTimeout(() => {
      if (this.press == 1 && this._degreeY < 180) {
        this._degreeY++;
        this.updateY();
        if (this.singleDuration > 30) {
          this.singleDuration -= 10;

        }
        this.upDegreeY();
      }
    }, this.singleDuration);
  }

  downDegreeY() {
    setTimeout(() => {
      if (this.press == 1 && this._degreeY > 0) {
        this._degreeY--;
        this.updateY();
        if (this.singleDuration > 30) {
          this.singleDuration -= 10;
        }
        this.downDegreeY();
      }
    }, this.singleDuration);
  }

  pageController(e) {

    console.log(e.detail.value);
  }

  changeSize() {
    this.pageControl = 3;
    this.tempSize = this.radius;
    this.stickSize();
  }


  back() {
    this.joystickSize.destroy();
    this.pageControl = 0;
    this.radius = this.tempSize;

    this.zone = document.getElementById('zone_joystick');
    setTimeout(() => {
      this.stick();
    },);
  }

  confirm() {
    this.fireDb.database.ref().update({
      radius: this.radius
    })

    this.joystickSize.destroy();
    this.pageControl = 0;
    this.zone = document.getElementById('zone_joystick');
    setTimeout(() => {
      this.stick();
    },);

  }

  restore() {
    this.joystickSize.destroy();
    this.pageControl = 0;
    this.radius = 70;
    this.fireDb.database.ref().update({
      radius: this.radius
    })
    this.zone = document.getElementById('zone_joystick');
    setTimeout(() => {
      this.stick();
    },);
  }

  getRadius(radius) {

    this.joystickSize.destroy();
    this.radius = radius.detail.value;
    console.log(radius.detail.value);
    this.stickSize();
  }


  changeY(y) {
    this._degreeY = y.detail.value;
    this.updateY();
  }

  changeX(x) {
    this._degreeX = x.detail.value;
    this.updateX();
  }



  stick() {
    this.zone = document.getElementById('zone_joystick')
    var joystick = {
      mode: 'static',
      zone: this.zone,
      position: {
        left: '40%',
        top: '15%'
      },
      size: this.radius * 2,
      color: 'black',
    } as nipplejs.JoystickManagerOptions;

    this.joystick = nipplejs.create(joystick);

  }

  joystickSize;
  stickSize() {

    var stick = document.getElementById('stickSize')

    var joystick = {
      mode: 'static',
      zone: stick,
      position: {
        left: '40%',
        top: '15%'
      },
      size: this.radius * 2,
      color: 'black',
    } as nipplejs.JoystickManagerOptions;

    this.joystickSize = nipplejs.create(joystick);

  }



  //Y--->X
  //X--->Y


  updateY() {
    // this.socket.emit('sendData', { "y": this._degreeY });
    this.socket.emit('sendData', { "status": 2, "x": this._degreeX, "y": this._degreeY });
    this.fireDb.database.ref("/controller").update({
      y: this._degreeY
    });
  }

  updateX() {
    this.socket.emit('sendData', { "status": 2, "x": this._degreeX, "y": this._degreeY });

    this.fireDb.database.ref("/controller").update({
      x: this._degreeX
    });
    // this.socket.emit('message', 1);
    // this.socket.emit('sendData', {"x": this._degreeX });

  }

  updateGrab() {
    this.fireDb.database.ref().update({
      grab: this._grabDegree
    });
  }

  degreeY() {
    setTimeout(() => {

      if (this.press == 0) {
        return;
      }
      if (this.press == 1 && this._left == 1 && this._degreeY > 0) {
        this._degreeY--;
        this.updateY();
      }
      else if (this.press == 1 && this._right == 1 && this._degreeY < 180) {
        this._degreeY++;
        this.updateY();
      }

      this.degreeY();
    }, this.durationX);
  }


  degreeX() {
    setTimeout(() => {
      if (this.press == 0) {
        return;
      }
      if (this.press == 1 && this._up == 1 && this._degreeX > 0) {
        this._degreeX--;
        this.updateX();

      }
      else if (this.press == 1 && this._down == 1 && this._degreeX < 180) {
        this._degreeX++;
        this.updateX();

      }

      this.degreeX();
    }, this.durationY);

  }


  getX(x) {
    console.log(x.value);

    this.fireDb.database.ref().update({
      x: x.value * 3
    });


  }
  getY(y) {
    console.log(y.value);
    this.fireDb.database.ref().update({
      y: y.value * 3
    });
  }




  start(e) {
    this.x = e.changedTouches[0].clientX;
    this.y = e.changedTouches[0].clientY;

    this.press = 1;

    this.degreeX();
    this.degreeY();
  }


  move(e) {

    var y = e.changedTouches[0].clientY;
    var x = e.changedTouches[0].clientX;

    this.xDirection(x);
    this.yDirection(y);

    this.speedX(e);
    this.speedY(e);

    // console.log(e.changedTouches[0].clientX-this.x);
    //  if(x>135 && x<265)
    //  {
    //    this.drag.nativeElement.style.left=65+(e.changedTouches[0].clientX-this.x)+'px';
    //  }
    //  if(y>200 && y<330)
    //  {
    //   this.drag.nativeElement.style.top=65+(e.changedTouches[0].clientY-this.y)+'px';
    //  }

  }

  xDirection(x) {

    //xDirection
    if (this.x + 15 < x) {
      this._left = 0;
      this._right = 1;

      if (this.countX == -1) {
        this.durationX = 200;
      }

      this.countX = 1;
    }
    else if (this.x > x + 15) {
      this._left = 1;
      this._right = 0;

      if (this.countX == 1) {
        this.durationX = 200;
      }

      this.countX = -1;
    }

    else {
      this._left = 0;
      this._right = 0;
    }

  }

  yDirection(y) {
    //y direction
    if (this.y + 15 < y) {
      this._up = 0;
      this._down = 1;

      if (this.countY == 1) {
        this.durationY = 200;
      }

      this.countY = -1;
    }

    else if (this.y > y + 15) {
      this._up = 1;
      this._down = 0;

      if (this.countY == -1) {
        this.durationY = 200;
      }
      this.countY = 1;

    }
    else {
      this._up = 0;
      this._down = 0;
    }

  }

  speedX(e) {
    setTimeout(() => {
      if (this._right == 1 && e.changedTouches[0].clientX - this.x > 50 && this.durationX > 40) {
        this.durationX -= 10;
      }
      else if (this._right == 1 && e.changedTouches[0].clientX - this.x <= 50 && this.durationX < 200) {
        this.durationX += 10;
      }

      if (this._left == 1 && Math.abs(e.changedTouches[0].clientX - this.x) > 50 && this.durationX >= 40) {
        this.durationX -= 10;
      }
      else if (this._left == 1 && Math.abs(e.changedTouches[0].clientX - this.x) <= 50 && this.durationX < 200) {
        this.durationX += 10;
      }
    }, 100);
  }

  speedY(e) {
    setTimeout(() => {
      if (this._down == 1 && e.changedTouches[0].clientY - this.y > 50 && this.durationY >= 40) {
        this.durationY -= 10;
      }
      else if (this._down == 1 && e.changedTouches[0].clientY - this.y < 50 && this.durationY < 200) {
        this.durationY += 5;
      }

      if (this._up == 1 && Math.abs(e.changedTouches[0].clientY - this.y) > 50 && this.durationY >= 40) {
        this.durationY -= 10;
      }
      else if (this._up == 1 && Math.abs(e.changedTouches[0].clientY - this.y) <= 50 && this.durationY < 200) {
        this.durationY += 10;
      }
    }, 100);
  }


  end(e) {
    // var drag=document.getElementById('drag');

    // this.drag.nativeElement.style.left=64+'px';
    // this.drag.nativeElement.style.top=64+'px';

    this.press = 0;
    this._left = 0;
    this._right = 0;
    this._up = 0;
    this._down = 0;
    this.x = 0;
    this.y = 0;
    this.durationY = 200;
    this.durationX = 200;
    this.countY = 0;
    this.countX = 0;
  }


}
