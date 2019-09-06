#include <Servo.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiManager.h>
#include "LedMatrix.h"
#include <time.h>
#include <string.h>
#include <stdio.h>

#include "SpringyValue.h"
#include "settings.h"
#include "config.h"
#include "WS2812_util.h"
#include "OTA_update.h"


Servo myServo;

long oldTime = 0;
int oscillationDuration = MAX_OSCILLATION_DURATION;
String chipID;
String serverURL = SERVER_URL;
long currentMillis = 0;
String tap = "end";
LedMatrix ledMatrix = LedMatrix(1, MATRIX_CS_PIN);
long int hash;

void printDebugMessage(String message) {
#ifdef DEBUG_MODE
  Serial.println(String(PROJECT_SHORT_NAME) + ": " + message);
#endif
}

void connectToDefault() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(BACKUP_SSID, BACKUP_PASSWORD);

  int timer = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    timer += 500;
    hideColor();
    strip.setPixelColor(0, 100, 100, 0);
    strip.show();
    if (timer > 10000){
      hideColor();
      strip.setPixelColor(0, 100, 0, 0);
      strip.show();
      break;
    }
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
  }
}

String generateChipID()
{
  String chipIDString = String(ESP.getChipId() & 0xffff, HEX);

  chipIDString.toUpperCase();
  while (chipIDString.length() < 4)
    chipIDString = String("0") + chipIDString;

  return chipIDString;
}

void setup()
{
  pinMode(BUTTONLOW_PIN, OUTPUT);
  digitalWrite(BUTTONLOW_PIN, LOW);

  Serial.begin(115200); Serial.println("");
  strip.begin();
  strip.setBrightness(255);
  setAllPixels(0, 255, 255, 1.0);

  WiFiManager wifiManager;
  int counter = 0;
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  ledMatrix.init();
  ledMatrix.setIntensity(LED_MATRIX_BRIGHTNESS);
  ledMatrix.clear();
  ledMatrix.commit();

  while (digitalRead(BUTTON_PIN) == LOW)
  {
    counter++;
    delay(10);

    if (counter > 500)
    {
      wifiManager.resetSettings();
      printDebugMessage("Remove all wifi settings!");
      setAllPixels(255, 0, 0, 1.0);
      fadeBrightness(255, 0, 0, 1.0);
      ESP.reset();
    }
  }

  chipID = generateChipID();
  printDebugMessage(SERVER_URL);
  printDebugMessage(String("Last 2 bytes of chip ID: ") + chipID);
  String configSSID = String(CONFIG_SSID) + "_" + chipID;

  connectToDefault(); 
  wifiManager.autoConnect(configSSID.c_str());
  fadeBrightness(0, 255, 255, 1.0);
  myServo.attach(SERVO_PIN);
  //  checkForUpdates();

  HTTPClient http;
  http.begin(serverURL);
  uint16_t httpCode = http.GET();
  http.end();
  strip.show();
}

//This method starts an oscillation movement in both the LED and servo
void oscillate(float springConstant, float dampConstant, int color)
{
  SpringyValue spring;
  ledMatrix.setIntensity(LED_MATRIX_BRIGHTNESS);

  byte red = (color >> 16) & 0xff;
  byte green = (color >> 8) & 0xff;
  byte blue = color & 0xff;

  spring.c = springConstant;
  spring.k = dampConstant / 100;
  spring.perturb(255);

  //Start oscillating
  for (int i = 0; i < oscillationDuration; i++)
  {
    spring.update(0.01);
    setAllPixels(red, green, blue, abs(spring.x) / 255.0);
    myServo.write(90 + spring.x / 4);

    //Check for button press
    if (digitalRead(BUTTON_PIN) == LOW)
    {
      //Fade the current color out
      fadeMatrix(ledMatrix);
      fadeBrightness(red, green, blue, abs(spring.x) / 255.0);
      return;
    }

    if ((i % 6) == 0) {
      ledMatrix.clear();
      ledMatrix.scrollTextLeft();
      ledMatrix.drawText();
      ledMatrix.commit();
    }

    delay(10);
  }

  fadeBrightness(red, green, blue, abs(spring.x) / 255.0);
  fadeMatrix(ledMatrix);
}

void sendHttp(String tapState){
  HTTPClient http;
  Serial.println(serverURL + "add_task.php?id=" + chipID + "&hash=" + hash + "&tap=" + tapState);
  http.begin(serverURL + "add_task.php?id=" + chipID + "&hash=" + hash + "&tap=" + tapState);
  uint16_t httpCode = http.GET();
  http.end();
  }

void sendButtonPress()
{
  printDebugMessage("Sending button press to server");
  if (tap == "end") {
     hash = time(NULL);
  }
  if (tap == "start") {
    setAllPixels(0,0,205, 1.0);
    strip.setBrightness(3000);
    tap = "end";
    Serial.println("Done");
  } else if (tap == "pause") {
     setAllPixels(34,139,34, 1.0);
     strip.setBrightness(3000);
    tap = "endPause";
    Serial.println("Active");
  } else {
    setAllPixels(34,139,34, 1.0);
    strip.setBrightness(3000);
    tap = "start";
    Serial.println("Active");
    }
    sendHttp(tap);
  if (tap == "endPause"){
      tap = "start";
    }
}
void sendLongPress(){
  if (tap == "start"){
    tap = "pause";
    setAllPixels(255,255,0, 1.0);
    strip.setBrightness(3000);
    Serial.println("Pause");
    sendHttp(tap);
    }
}

void loop()
{
  if (digitalRead(BUTTON_PIN) == LOW){
    delay(300);
    if (digitalRead(BUTTON_PIN) == LOW){
      Serial.println("Long press");
      sendLongPress();
      delay(700);
    }else{
      Serial.println("Short press");
      sendButtonPress();
      delay(500);
    }
  }
}
