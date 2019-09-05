//#include <ESP8266httpUpdate.h>
//
//void printDebugMessage(String); 
//
//void checkForUpdates() {
//  String firmwareURL = FIRMWARE_URL;
//  String firmwareFileURL = firmwareURL + PROJECT_SHORT_NAME + "_" + (FIRMWARE_VERSION + 1) + ".bin";
//
//  printDebugMessage("Current firmware version:" + String(PROJECT_SHORT_NAME) + "_" + (FIRMWARE_VERSION));
//  HTTPClient httpClient;
//  httpClient.begin(firmwareFileURL);
//  int httpCode = httpClient.GET();
//  if ( httpCode == 200 ) {
//    printDebugMessage("New firmware found. Updating...");
//    t_httpUpdate_return ret = ESPhttpUpdate.update(firmwareFileURL);
//  }
//  else {
//    printDebugMessage("No updates available");
//  }
//}

