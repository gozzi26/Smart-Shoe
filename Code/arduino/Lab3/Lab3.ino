

#include <MPU6050.h>
#include <Wire.h>


MPU6050 mpu;

// LED pins where led1 = leftmost LED facing you, led4 = rightmost LED facing you
// led 1 = Heel
// led 2 = MM
// led 3 = LF
// led 4 = MF
int led1 = 6;
int led2 = 9;
int led3 = 10;
int led4 = 11;

// ANALOG pins
int heel = A3;
int mm = A1;
int lf = A2;
int mf = A0;

// FSR readings 
int heelVal, mmVal, lfVal, mfVal = 0;

// Mapped FSR readings for LEDS
int heelMapped, mmMapped, lfMapped, mfMapped = 0;

// used for accelometer 
float xAxisVal, yAxisVal, zAxisVal = 0; 
boolean deviceInMotion;


// time variables for initial push and realtime reads
unsigned long currentTime, previousTime = 0;

void setup() {
  Serial.begin(115200);

   while(!mpu.begin(MPU6050_SCALE_2000DPS, MPU6050_RANGE_16G))
  {
        // ensure mpu is connected
        delay(500);
  }

  // Dodatkowe opoznienie zasilania akcelerometru 3ms
  mpu.setAccelPowerOnDelay(MPU6050_DELAY_3MS); // short delay of the accelometer start
     
  // Wylaczamy sprzetowe przerwania dla wybranych zdarzen
  // disabling modes not used in this lab 
  mpu.setIntFreeFallEnabled(false);  
  mpu.setIntZeroMotionEnabled(false);
  mpu.setIntMotionEnabled(false);
     
  // Ustawiamy filtr gorno-przepustowy
  mpu.setDHPFMode(MPU6050_DHPF_5HZ); //gyroscope's throughput filter 
     
  // Ustawiamy granice wykrywania ruchu na 4mg (zadana wartosc dzielimy przez 2)
  // oraz minimalny czas trwania na 5ms
  mpu.setMotionDetectionThreshold(2); //activity
  mpu.setMotionDetectionDuration(5);
     
  // Ustawiamy granice wykrywania bezruchu na 8mg (zadana wartosc dzielimy przez 2)
  // oraz minimalny czas trwania na 2ms
  mpu.setZeroMotionDetectionThreshold(8); // inactivity 
  mpu.setZeroMotionDetectionDuration(2);    


  // analog 
  pinMode(heel, INPUT); 
  pinMode(mm, INPUT); 
  pinMode(lf, INPUT);
  pinMode(mf, INPUT);

  // leds 
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
  pinMode(led3, OUTPUT);
  pinMode(led4, OUTPUT);

  

}

void loop() {

  // update time
  currentTime = millis();
  
  // read from FSR 
  heelVal = analogRead(heel);
  mmVal = analogRead(mm);
  lfVal = analogRead(lf);
  mfVal = analogRead(mf);  

    // map values from FSR range (0..1023) to LED range (0...255)
  heelMapped = map(heelVal, 0, 1023, 0, 255);
  mmMapped = map(mmVal, 0, 1023, 0, 255);
  lfMapped = map(lfVal, 0, 1023, 0, 255);
  mfMapped = map(mfVal, 0, 1023, 0, 255);

  // set LED brightness to mapped values
  analogWrite(led1, heelMapped);
  analogWrite(led2, mmMapped);
  analogWrite(led3, lfMapped);
  analogWrite(led4, mfMapped);

  // acceleration vectors
  Vector rawAccel = mpu.readRawAccel();
  Vector normAccel = mpu.readNormalizeAccel();

   // board activity state (in motion y/n)
  Activites act = mpu.readActivites();
  
  if (act.isActivity) {
    deviceInMotion = true;
  }

  if (act.isInactivity) {
    deviceInMotion = false;
  }

  xAxisVal = rawAccel.XAxis; //normAccel.XAxis
  yAxisVal = rawAccel.YAxis; //normAccel.YAxis
  zAxisVal = rawAccel.ZAxis; //normAccel.ZAxis
   
  // print out data after short delay to ensure valid data is being sent
  if ((currentTime - previousTime) >= 100) {
    previousTime = currentTime;

    // string format:
    // heelReading$mmReading$lfReading$mfReading$activityBoolean$xAccel$yAccel$zAccel
    
    String toPrint = String(heelVal) + "$" 
    + String(mmVal) + "$" + String(lfVal) + "$" + String(mfVal) + "$" 
    + String(deviceInMotion) + "$" + String(xAxisVal) + "$" + String(yAxisVal) + "$"
    + String(zAxisVal);

    Serial.print(toPrint);
    Serial.println();
  }

  delay(10); // short delay between reads
}
