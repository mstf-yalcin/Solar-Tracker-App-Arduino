#include <SoftwareSerial.h>
#include <ArduinoJson.h>
#include <Ticker.h>
#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

#include <SocketIOclient.h>
#include <Hash.h>

#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"


#include <Adafruit_BMP085.h>

Adafruit_BMP085 bmp;

SoftwareSerial Node_SoftSerial(D7, D8);  //RX,TX

int status = 1;
StaticJsonDocument<128> readDoc;
StaticJsonDocument<128> doc;

Ticker ticker;


// #include <WebSocketsClient.h>

// #include <Servo.h>
// Servo servoMotorX;
// Servo servoMotorY;

ESP8266WiFiMulti WiFiMulti;
SocketIOclient socketIO;


#define API_KEY "AIzaSyALnV_dJHRRyviwQQgtjl_ixoe91kSHdXg"

#define DATABASE_URL "https://arduino-bd3b7-default-rtdb.europe-west1.firebasedatabase.app"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

bool signupOK = false;

#include <time.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "europe.pool.ntp.org");



double voltage;
int rain;
int x;
int y;

#define USE_SERIAL Serial

void socketIOEvent(socketIOmessageType_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case sIOtype_DISCONNECT:
      USE_SERIAL.printf("[IOc] Disconnected!\n");
      break;
    case sIOtype_CONNECT:
      USE_SERIAL.printf("[IOc] Connected to url: %s\n", payload);

      // join default namespace (no auto join in Socket.IO V3)
      socketIO.send(sIOtype_CONNECT, "/");
      break;
    case sIOtype_EVENT:
      {


        USE_SERIAL.printf("[IOc] get event: %s\n", payload);

        StaticJsonDocument<128> doc;
        DeserializationError error = deserializeJson(doc, payload);

        if (error) {
          Serial.print(F("deserializeJson() failed: "));
          Serial.println(error.f_str());
          return;
        }

        const char* root_0 = doc[0];
        JsonObject root_1 = doc[1];
        int status = root_1["status"]; 
        int x = root_1["x"];  
        int y = root_1["y"];
        sendData(status, x, y);

      }

      break;
    case sIOtype_ACK:
      USE_SERIAL.printf("[IOc] get ack: %u\n", length);
      hexdump(payload, length);
      break;
    case sIOtype_ERROR:
      USE_SERIAL.printf("[IOc] get error: %u\n", length);
      hexdump(payload, length);
      break;
    case sIOtype_BINARY_EVENT:
      USE_SERIAL.printf("[IOc] get binary: %u\n", length);
      hexdump(payload, length);
      break;
    case sIOtype_BINARY_ACK:
      USE_SERIAL.printf("[IOc] get binary ack: %u\n", length);
      hexdump(payload, length);
      break;
  }
}

void setup() {
  // USE_SERIAL.begin(921600);
  USE_SERIAL.begin(115200);

  Node_SoftSerial.begin(9600);

  // ticker.attach(5, sendData);

  //Serial.setDebugOutput(true);
  USE_SERIAL.setDebugOutput(true);

  USE_SERIAL.println();
  USE_SERIAL.println();
  USE_SERIAL.println();

  for (uint8_t t = 4; t > 0; t--) {
    USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
    USE_SERIAL.flush();
    delay(1000);
  }

  if (WiFi.getMode() & WIFI_AP) {
    WiFi.softAPdisconnect(true);
  }

  WiFiMulti.addAP("Mi 9T Pro", "Asdfghjk12");

  while (WiFiMulti.run() != WL_CONNECTED) {
    delay(100);
  }

  String ip = WiFi.localIP().toString();
  USE_SERIAL.printf("[SETUP] WiFi Connected %s\n", ip.c_str());

  timeClient.begin();               
  timeClient.setTimeOffset(10800);  

  bmp.begin();
    config.api_key = API_KEY;

  config.database_url = DATABASE_URL;

  config.token_status_callback = tokenStatusCallback;

  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase conected.");
    signupOK = true;
  } else {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  Firebase.begin(&config, &auth); 
  Firebase.reconnectWiFi(true);

  // server address, port and URL
  socketIO.begin("4.231.20.86", 80, "/socket.io/?EIO=4");
  socketIO.onEvent(socketIOEvent);
}

unsigned long messageTimestamp = 0;
void loop() {
  socketIO.loop();

  if (Firebase.ready() && signupOK && Node_SoftSerial.available() > 0) {

    DeserializationError error = deserializeJson(readDoc, Node_SoftSerial);

    if (error == DeserializationError::Ok) {
      voltage = readDoc["voltage"].as<double>();
      rain = readDoc["rain"].as<int>();
      x = readDoc["x"].as<int>();
      y = readDoc["y"].as<int>();

      Serial.print("voltage = ");
      Serial.println(voltage);
      Serial.print("rain = ");
      Serial.println(rain);

      sendFirebaseData(voltage, rain);
      readDoc.clear();
    }
  }
}


void sendFirebaseData(double voltage, int rain) {
  FirebaseJson json;
  json.add("date", getDate());
  json.add("rain", rain);
  json.add("volt", voltage);

  FirebaseJson jsonController;
  int newX = abs((750 - x) / 8.5);
  int newY = abs((750 - y) / 8.5);

  jsonController.add("x", newX);
  jsonController.add("y", newY);

  Firebase.RTDB.setDouble(&fbdo, "/Temp", bmp.readTemperature());

  if (Firebase.RTDB.pushJSON(&fbdo, "/data", &json)) {
    Serial.println("Success");
    Firebase.RTDB.updateNode(&fbdo, "/controller", &jsonController);

  } else {
    Serial.println("Error");
    Serial.println("Error Code: " + fbdo.errorReason());
  }

  String date = getDate();
}

String getDate() {
  timeClient.update();

  time_t epochTime = timeClient.getEpochTime();
  String formattedTime = timeClient.getFormattedTime();

  struct tm* ptm = gmtime((time_t*)&epochTime);
  int monthDay = ptm->tm_mday;
  int currentMonth = ptm->tm_mon + 1;
  int currentYear = ptm->tm_year + 1900;

  String currentDate = String(currentYear) + "-" + String(currentMonth) + "-" + String(monthDay) + " " + formattedTime;

  return currentDate;
}

void sendData(int status, int x, int y) {
  doc["status"] = status;
  doc["x"] = x;
  doc["y"] = y;

  serializeJson(doc, Node_SoftSerial);
  doc.clear();
}


// void WriteServo(int x, int y) {
//   servoMotorX.write(x);
//   servoMotorY.write(y);
// }