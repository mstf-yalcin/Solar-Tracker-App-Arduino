
#include <SoftwareSerial.h>
#include <ArduinoJson.h>
#include <TimerOne.h>


/*#include <Servo.h>
Servo horizontal;
int servoY = 90;

Servo vertical;
int servoX = 0;
*/

#include <ServoTimer2.h>

ServoTimer2  horizontalServo;
float servoY = 1500;

ServoTimer2  verticalServo;
float servoX = 750;

//0   -> 750
//90  -> 1500
//180 -> 2250



//Initialise Arduino to NodeMCU (5=Rx & 6=Tx)
SoftwareSerial nodemcu(5, 6);




int tolX = 100;
int tolY = 100;
int dtime = 10;

int right = analogRead(A0); //
int bottom = analogRead(A1); //
int left = analogRead(A2); //
int up = analogRead(A3); //
 

int analogInput = A5;
float vout = 0.0;
float vin = 0.0;
float R1 = 10000.0; // 10K ohm
float R2 = 1000.0; // 1K ohm
int voutValue = 0;
float rainValue = 0;

 
void setup()
{
  Serial.begin(9600);


  pinMode(analogInput, INPUT);
  horizontalServo.attach(9); //alt
  verticalServo.attach(10);//ust
  horizontalServo.write(servoY);
  verticalServo.write(servoX);



  nodemcu.begin(9600);
  delay(1000);

  //interrupt 1sn
  Timer1.initialize(1000000);
  Timer1.attachInterrupt(sendData);

}

 
void loop()
{

 
  right = analogRead(A0); //
  bottom = analogRead(A1); //
  left = analogRead(A2); //
  up = analogRead(A3); //
 

  voutValue = analogRead(analogInput);

  vout = (voutValue * 5.0) / 1024.0;
  vin = vout / (R2 / (R1 + R2));

  if (vin < 0.09)
  {
    vin = 0.0;
  }

  Serial.print("VOLTAJ V= ");
  Serial.println(vin);

  rainValue = analogRead(A4);
  /*Serial.print("rain ");
    Serial.println(rain);
  */


  int y_Diff = up - bottom;
  int x_Diff = right - left;




  if (y_Diff > 0 && tolY < y_Diff )
  {

    if (servoY < 2250)
    {

      servoY+=8.3;
      horizontalServo.write(servoY);
      /*
        Serial.print("servoY: ");
        Serial.println(servoY);
      */
    }

  }
  else if (y_Diff < 0 &&  (-1 * tolY) > y_Diff)
  {

    if (servoY > 750)
    {
      servoY-=8.3;
      horizontalServo.write(servoY);
      /* Serial.print("servoY: ");
        Serial.println(servoY);
      */
    }

  }
  if (x_Diff > 0 && tolX < x_Diff)
  {

    if (servoX < 1700)
    {
      servoX+=8.3;
      verticalServo.write(servoX);
    }

  }
  else if (x_Diff < 0 && (-1 * tolX) > x_Diff)
  {
    if (servoX > 750)
    {
      servoX-=8.3;
      verticalServo.write(servoX);
    }

  }
 

  delay(15);



}


void sendData()
{
 
  StaticJsonBuffer<1000> jsonBuffer;
  JsonObject& data = jsonBuffer.createObject();

 
  Serial.println("write data");
  int rain=0;
  if(rainValue<400)
  rain=1;

  data["voltage"] = vin;
  data["rain"] = rain;
  //Send data to NodeMCU
  data.printTo(nodemcu);
  jsonBuffer.clear();
 
  Serial.println(rain);
  Serial.println(vout);

}
