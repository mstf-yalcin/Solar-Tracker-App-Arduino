
#include <SoftwareSerial.h>
#include <FirebaseArduino.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

#define FIREBASE_HOST ""
#define FIREBASE_AUTH ""
#define WIFI_SSID ""
#define WIFI_PASSWORD ""

#include <ESP8266WiFi.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <time.h>


// Define NTP Client to get time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "europe.pool.ntp.org");

//D6 = Rx & D5 = Tx
SoftwareSerial nodemcu(D6, D5);


void setup() {
  // Initialize Serial port
  Serial.begin(9600);
  nodemcu.begin(9600);


  while (!Serial) continue;

  // Connect to Wi-Fi
  Serial.print("Connecting....");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }


  // Initialize a NTPClient to get time
  timeClient.begin();
  // GMT +1 = 3600
  // GMT +8 = 28800
  // GMT -1 = -3600
  // GMT 0 = 0
  timeClient.setTimeOffset(10800);

  delay(500);
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);


}

void loop() {


  Serial.println("loop..");

  StaticJsonBuffer<1000> jsonBuffer;
  JsonObject& data = jsonBuffer.parseObject(nodemcu);

  if (data == JsonObject::invalid()) {
    Serial.println("Invalid Json Object");
    jsonBuffer.clear();
    return;
  }

  timeClient.update();

  unsigned long epochTime = timeClient.getEpochTime();
  Serial.print("Epoch Time: ");
  Serial.println(epochTime);

  String formattedTime = timeClient.getFormattedTime();
  Serial.print("Formatted Time: ");
  Serial.println(formattedTime);


  //Get a time structure
  struct tm *ptm = gmtime ((time_t *)&epochTime);

  int monthDay = ptm->tm_mday;
  Serial.print("Month day: ");
  Serial.println(monthDay);

  int currentMonth = ptm->tm_mon + 1;
  Serial.print("Month: ");
  Serial.println(currentMonth);
  
  int currentYear = ptm->tm_year + 1900;
  Serial.print("Year: ");
  Serial.println(currentYear);

  //Print complete date:
  String currentDate = String(currentYear) + "-" + String(currentMonth) + "-" + String(monthDay) + " " + String(formattedTime);
  Serial.print("Current date: ");
  Serial.println(currentDate);


  Serial.println("uno JSON Object Recieved");
  Serial.print("Recieved vout:  ");
  float voltage = data["voltage"];
  Serial.println(voltage);
  Serial.print("Recieved Temperature:  ");
  int rain = data["rain"];
  Serial.println(rain);

  Serial.println("-----------------------------------------");

  JsonObject& firebaseData = jsonBuffer.createObject();

  firebaseData["date"] = currentDate;
  firebaseData["volt"] = voltage;
  firebaseData["rain"] = rain;

  Firebase.push("data", firebaseData);

  if (Firebase.failed()) {
    Serial.print("pushing /logs failed:");
    Serial.println(Firebase.error());
    return;
  }

  delay(2000);

}
