#include <SoftwareSerial.h>
#include <ArduinoJson.h>
#include <TimerOne.h>

//Initialise Arduino to NodeMCU (5=Rx & 6=Tx)
SoftwareSerial Arduino_SoftSerial(5, 6);  //RX,TX

/*#include <Servo.h>
Servo horizontal;
int servoY = 90;
Servo vertical;
int servoX = 0;
*/

#include <ServoTimer2.h>

ServoTimer2 horizontalServo;
float servoY = 1500;

ServoTimer2 verticalServo;
float servoX = 750;

//0   -> 750
//90  -> 1500
//180 -> 2250


int tolX = 100;
int tolY = 100;
int dtime = 10;

int right = analogRead(A0);   //
int bottom = analogRead(A1);  //
int left = analogRead(A2);    //
int up = analogRead(A3);      //


int analogInput = A5;
float vout = 0.0;
float vin = 0.0;
float R1 = 10000.0;  // 10K ohm
float R2 = 1000.0;   // 1K ohm
int voutValue = 0;
float rainValue = 0;

unsigned long ms = 0;
int status = 1;
StaticJsonDocument<128> readDoc;
StaticJsonDocument<128> doc;

void setup() {

  Serial.begin(57600);

  Arduino_SoftSerial.begin(9600);


  pinMode(analogInput, INPUT);
  horizontalServo.attach(9);  //bottom
  verticalServo.attach(10);   //up
  horizontalServo.write(servoY);
  verticalServo.write(servoX);
}


void loop() {


  if (status == 1) {

    right = analogRead(A0);   //
    bottom = analogRead(A1);  //
    left = analogRead(A2);    //
    up = analogRead(A3);      //

    voutValue = analogRead(analogInput);

    vout = (voutValue * 5.0) / 1024.0;
    vin = vout / (R2 / (R1 + R2));

    if (vin / 10 < 0.09) {
      vin = 0.0;
    }


    rainValue = analogRead(A4);

    int y_Diff = up - bottom;
    int x_Diff = right - left;


    if (y_Diff > 0 && tolY < y_Diff) {

      if (servoY < 2250) {

        servoY += 8.3;
        horizontalServo.write(servoY);
      }

    } else if (y_Diff < 0 && (-1 * tolY) > y_Diff) {

      if (servoY > 750) {
        servoY -= 8.3;
        horizontalServo.write(servoY);
      }
    }
    if (x_Diff > 0 && tolX < x_Diff) {

      if (servoX < 1500) {
        servoX += 8.3;
        verticalServo.write(servoX);
      }

    } else if (x_Diff < 0 && (-1 * tolX) > x_Diff) {
      if (servoX > 750) {
        servoX -= 8.3;
        verticalServo.write(servoX);
      }
    }

    delay(15);

    if (millis() - ms > 2000) {
      sendData();
      ms = millis();
    }
  }


  if (Arduino_SoftSerial.available() > 0) {

    DeserializationError error = deserializeJson(readDoc, Arduino_SoftSerial);
    if (error == DeserializationError::Ok) {
      Serial.print("status = ");

      if (readDoc["status"].as<int>() != 0)
        status = readDoc["status"].as<int>();

      Serial.println(status);
      Serial.print("X = ");
      Serial.println(readDoc["x"].as<int>());
      Serial.print("Y = ");
      Serial.println(readDoc["y"].as<int>());

      int x = readDoc["x"].as<int>();
      int y = readDoc["y"].as<int>();


      if (x != 0) {
        int xx = (750 + (x * 8.3));

        Serial.print("Xx = ");
        Serial.println(xx);
        horizontalServo.write(xx);
      }
      if (y != 0) {
        int yy = (750 + (y * 8.3));
        Serial.print("yy = ");
        Serial.println(yy);
        if (yy > 1500)
          yy = 1500;

        verticalServo.write(yy);
      }

      readDoc.clear();
    }
  }
}


void sendData() {

  int rain = 0;
  if (rainValue < 400)
    rain = 1;

  doc["voltage"] = (vin / 10);
  doc["rain"] = rain;
  doc["x"] = servoX;
  doc["y"] = servoY;
  
  serializeJson(doc, Arduino_SoftSerial);
  doc.clear();
}