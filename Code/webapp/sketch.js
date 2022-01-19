let serial;
let latestData = "waiting for data";
let arduinoOutput = "";

let dataReady = false; // set to true once the first valid string is displayed
let heelReading = 0;
let mmReading = 0;
let lfReading = 0;
let mfReading = 0;
let inActivity = false;
let xAccel = 0;
let yAccel = 0;
let zAccel = 0;

let walkingStarted = false;

let calibratingNormal = false;
let calibratingTipToe = false;
let calibratingHeel = false;
let calibratingInToe = false;
let calibratingOutToe = false;
let testingCalibration = false;

function setup() {
    serial = new p5.SerialPort();

    serial.list();
    serial.open('COM4'); //change per your system

    serial.on('connected', serverConnected);

    serial.on('list', gotList);

    serial.on('data', gotData);

    serial.on('error', gotError);

    serial.on('open', gotOpen);

    serial.on('close', gotClose);

    noCanvas();
}



function startProfile() {
    
    let m = new p5((sketch) => {
        
        let currentGaitProfile;
        let footImage;
        let clientW = parentWidth(document.querySelector('#profileCanvas'))
        let clientH;
        let startTime;
        let currentTime;
        let firstLoop = true;
        let state = 0;
        let oldState = 0;
    

        let heelReadingBundle = { 
            numReadings: 0,
            numSteps: 0,
            mfpAvg: 0,
            heelAvg: 0,
            mmAvg: 0,
            lfAvg: 0,
            mfAvg: 0,
            finished: false,
        };

        let tiptoeReadingBundle = { 
            numReadings: 0,
            numSteps: 0,
            mfpAvg: 0,
            heelAvg: 0,
            mmAvg: 0,
            lfAvg: 0,
            mfAvg: 0,
            finished: false,
        };

        let intoeReadingBundle = { 
            numReadings: 0,
            numSteps: 0,
            mfpAvg: 0,
            heelAvg: 0,
            mmAvg: 0,
            lfAvg: 0,
            mfAvg: 0,
            finished: false,
        };

        let outtoeReadingBundle = { 
            numReadings: 0,
            numSteps: 0,
            mfpAvg: 0,
            heelAvg: 0,
            mmAvg: 0,
            lfAvg: 0,
            mfAvg: 0,
            finished: false,
        };

        let normalReadingBundle = { 
            numReadings: 0,
            numSteps: 0,
            mfpAvg: 0,
            heelAvg: 0,
            mmAvg: 0,
            lfAvg: 0,
            mfAvg: 0,
            finished: false,
        };

        let testingReadingBundle = { 
            numReadings: 0,
            numSteps: 0,
            mfpAvg: 0,
            heelAvg: 0,
            mmAvg: 0,
            lfAvg: 0,
            mfAvg: 0,
            finished: false,
        };

    
        sketch.preload = function () {
            footImage = loadImage('Images/Sole.svg');
            currentGaitProfile = '';
            currentTime = 0;
            startTime = 0;
        }

        sketch.setup = function() {
            currentTime = millis();
            if(clientW > 700){
                clientH = windowHeight * .5;
                cv = sketch.createCanvas(clientW, clientH);
            }
            else{
                clientH = windowHeight * .25;
                cv = sketch.createCanvas(clientW, clientH);
            }
            
            // let cv = sk.createCanvas(document.querySelector(''))
            cv.id("profileCV");
        }


        sketch.draw = function(){ 
            sketch.background(255);
            sketch.background(footImage);
            currentTime =millis();
            // update logic below using globals
            let mfp = parseFloat(((mmReading + mfReading) * 100) / (heelReading + mfReading + mmReading + lfReading + .001)); 
            //document.querySelector('#profile h6').innerHTML = 'You are currently';
           
            //document.querySelector('#profile #currentData').innerHTML = arduinoOutput;

            
            // colors the circles on the foot drawing, with color intensity mapped to fsr reading
            sketch.noStroke();
            sketch.fill(3, 252, 32, (heelReading / 1023) * 255);
            sketch.circle(clientW/4.5,clientH/2,heelReading/6);
            sketch.fill(246, 250, 12, (mmReading / 1023) * 255);
            sketch.circle(clientW/1.75,clientH/2.75,mmReading/6);
            sketch.fill(10, 67, 252, (mfReading / 1023) * 255);
            sketch.circle(clientW/1.4,clientH/2.25,mfReading/6);
            sketch.fill(242, 7, 39, (lfReading / 1023) * 255);
            sketch.circle(clientW/1.70,clientH/1.5,lfReading/6);

            // if(mfp <= 22 && (mfReading <= 100 && lfReading <= 100)){
                 
            //       currentGaitProfile = "Walking on your heel";
              
            //  }
            //  else if(mfp >= 40 && mfp <= 60){
            //      if(heelReading <= 100 && mfReading >= 100 && mmReading >= 100 && lfReading >= 100){
            //         currentGaitProfile = "Tip Toeing";
            //      }
            //      else if(heelReading >= 100 && mfReading >= 100 && mmReading >= 100 && lfReading <= 200){
            //         currentGaitProfile = "Tip Toeing";
            //         // currentGaitProfile = "Intoeing";
            //      }
            //      else if(heelReading >= 100 && mfReading <= 100 && mmReading >= 100 && lfReading >= 100){
            //         currentGaitProfile = "Tip Toeing";
            //          //currentGaitProfile = "Outoeing";
            //      }
            //      else{
            //         currentGaitProfile = "Tip Toeing";
            //       //   currentGaitProfile = "Walking Normally"
            //      }
            //  }
            // //let gait = sketch.checkCurrentGait(testingReadingBundle);
            // if (testingCalibration) {
            //     document.querySelector('#profile #status').innerHTML = currentGaitProfile;

            // }


            if(calibratingNormal){
                if(firstLoop){
                    startTime = currentTime;
                    firstLoop = false;
                }

                currentTime = millis();
                let realTime = (currentTime - startTime);
    
                let time = msToTime(realTime);
                timeString = time.timeString;
                document.querySelector('#profile #time').innerHTML = timeString;
                if(time.secs >= 1){
                    calibratingNormal = false;
                    sketch.calculateAvgs(normalReadingBundle);
                    console.log(normalReadingBundle);
                    document.getElementById('normalGaitText').innerHTML = '<b>Normal Profile Calibrated </b> <i class="far fa-check-circle text-success"></i>';
                    sketch.setCalibrationButtons();
                    firstLoop = true;
                }

                if(mfp <= 70){
                    normalReadingBundle.mfpAvg += mfp;
                    normalReadingBundle.heelAvg += heelReading;
                    normalReadingBundle.mmAvg += mmReading;
                    normalReadingBundle.lfAvg += lfReading;
                    normalReadingBundle.mfAvg += mfReading;
                    normalReadingBundle.numReadings += 1;
                }


                oldState = state;
                if(mfp >= 0 && mfp <= 70) {
                    state = 0;        
                } else {
                    state = 1;
                }


                if (oldState != state) {
                    // change in state of foot
                    if(state === 0){
                        normalReadingBundle.numSteps += 1;
                    }
                    
                }
            }


            if(calibratingTipToe){
                if(firstLoop){
                    startTime = currentTime;
                    firstLoop = false;
                }

                currentTime = millis();
                let realTime = (currentTime - startTime);
    
                let time = msToTime(realTime);
                timeString = time.timeString;
                document.querySelector('#profile #time').innerHTML = timeString;
                if(time.secs >= 1){
                    calibratingTipToe = false;
                    sketch.calculateAvgs(tiptoeReadingBundle);
                    console.log(tiptoeReadingBundle);
                    document.getElementById('tiptoeGaitText').innerHTML = '<b>Tip-Toe Profile Calibrated </b> <i class="far fa-check-circle text-success"></i>';
                    sketch.setCalibrationButtons();
                    firstLoop = true;
                }

                if(mfp <= 70){
                    tiptoeReadingBundle.mfpAvg += mfp;
                    tiptoeReadingBundle.heelAvg += heelReading;
                    tiptoeReadingBundle.mmAvg += mmReading;
                    tiptoeReadingBundle.lfAvg += lfReading;
                    tiptoeReadingBundle.mfAvg += mfReading;
                    tiptoeReadingBundle.numReadings += 1;
                }


                oldState = state;
                if(mfp >= 0 && mfp <= 70) {
                    state = 0;        
                } else {
                    state = 1;
                }


                if (oldState != state) {
                    // change in state of foot
                    if(state === 0){
                        tiptoeReadingBundle.numSteps += 1;
                    }
                    
                }
            }

            if(calibratingHeel){
                if(firstLoop){
                    startTime = currentTime;
                    firstLoop = false;
                }

                currentTime = millis();
                let realTime = (currentTime - startTime);
    
                let time = msToTime(realTime);
                timeString = time.timeString;
                document.querySelector('#profile #time').innerHTML = timeString;
                if(time.secs >= 1){
                    calibratingHeel = false;
                    sketch.calculateAvgs(heelReadingBundle);
                    console.log(heelReadingBundle);
                    document.getElementById('heelGaitText').innerHTML = '<b>Heel Profile Calibrated </b> <i class="far fa-check-circle text-success"></i>';
                    sketch.setCalibrationButtons();
                    firstLoop = true;
                }

                if(mfp <= 70){
                    heelReadingBundle.mfpAvg += mfp;
                    heelReadingBundle.heelAvg += heelReading;
                    heelReadingBundle.mmAvg += mmReading;
                    heelReadingBundle.lfAvg += lfReading;
                    heelReadingBundle.mfAvg += mfReading;
                    heelReadingBundle.numReadings += 1;
                    
                }


                oldState = state;
                if(mfp >= 0 && mfp <= 70) {
                    state = 0;        
                } else {
                    state = 1;
                }


                if (oldState != state) {
                    // change in state of foot
                    if(state === 0){
                        heelReadingBundle.numSteps += 1;
                    }
                    
                }
            }

            if(calibratingInToe){
                if(firstLoop){
                    startTime = currentTime;
                    firstLoop = false;
                }

                currentTime = millis();
                let realTime = (currentTime - startTime);
    
                let time = msToTime(realTime);
                timeString = time.timeString;
                document.querySelector('#profile #time').innerHTML = timeString;
                if(time.secs >= 1){
                    calibratingInToe = false;
                    sketch.calculateAvgs(intoeReadingBundle);
                    console.log(intoeReadingBundle);
                    document.getElementById('intoeGaitText').innerHTML = '<b>In-Toe Profile Calibrated </b> <i class="far fa-check-circle text-success"></i>';
                    sketch.setCalibrationButtons();
                    firstLoop = true;
                }

                if(mfp <= 70){
                    intoeReadingBundle.mfpAvg += mfp;
                    intoeReadingBundle.heelAvg += heelReading;
                    intoeReadingBundle.mmAvg += mmReading;
                    intoeReadingBundle.lfAvg += lfReading;
                    intoeReadingBundle.mfAvg += mfReading;
                    intoeReadingBundle.numReadings += 1;
                }


                oldState = state;
                if(mfp >= 0 && mfp <= 70) {
                    state = 0;        
                } else {
                    state = 1;
                }


                if (oldState != state) {
                    // change in state of foot
                    if(state === 0){
                        intoeReadingBundle.numSteps += 1;
                    }
                    
                }
            }

            if(calibratingOutToe){
                if(firstLoop){
                    startTime = currentTime;
                    firstLoop = false;
                }

                currentTime = millis();
                let realTime = (currentTime - startTime);
    
                let time = msToTime(realTime);
                timeString = time.timeString;
                document.querySelector('#profile #time').innerHTML = timeString;
                if(time.secs >= 1){
                    calibratingOutToe = false;
                    sketch.calculateAvgs(outtoeReadingBundle);
                    console.log(outtoeReadingBundle);
                    document.getElementById('outtoeGaitText').innerHTML = '<b>Out-Toe Profile Calibrated </b> <i class="far fa-check-circle text-success"></i>';
                    sketch.setCalibrationButtons();
                    firstLoop = true;
                }

                if(mfp <= 70){
                    outtoeReadingBundle.mfpAvg += mfp;
                    outtoeReadingBundle.heelAvg += heelReading;
                    outtoeReadingBundle.mmAvg += mmReading;
                    outtoeReadingBundle.lfAvg += lfReading;
                    outtoeReadingBundle.mfAvg += mfReading;
                    outtoeReadingBundle.numReadings += 1;
                }


                oldState = state;
                if(mfp >= 0 && mfp <= 70) {
                    state = 0;        
                } else {
                    state = 1;
                }


                if (oldState != state) {
                    // change in state of foot
                    if(state === 0){
                        outtoeReadingBundle.numSteps += 1;
                    }
                    
                }
            }

            if(testingCalibration){
                if(firstLoop){
                    startTime = currentTime;
                    firstLoop = false;
                }

                document.querySelector('#profile #btnTesting').disabled = true;
            
                currentTime = millis();
                let realTime = (currentTime - startTime);
            
                let time = msToTime(realTime);
                timeString = time.timeString;
                document.querySelector('#profile #time').innerHTML = timeString;
            
                if(mfp <= 70){
                    testingReadingBundle.mfpAvg += mfp;
                    testingReadingBundle.heelAvg += heelReading;
                    testingReadingBundle.mmAvg += mmReading;
                    testingReadingBundle.lfAvg += lfReading;
                    testingReadingBundle.mfAvg += mfReading;
                    testingReadingBundle.numReadings += 1;
                }
              
            
            
                oldState = state;
                if(mfp >= 0 && mfp <= 70) {
                    state = 0;        
                } else {
                    state = 1;
                }
            
            
                if (oldState != state) {
                    // change in state of foot
                    if(state === 0){
                        testingReadingBundle.numSteps += 1;
                        sketch.calculateAvgs(testingReadingBundle);
                        let gait = sketch.checkCurrentGait(testingReadingBundle);
                        document.querySelector('#profile #status').innerHTML = gait;
                        testingReadingBundle.mfpAvg = 0;
                        testingReadingBundle.heelAvg = 0;
                        testingReadingBundle.mmAvg= 0;
                        testingReadingBundle.lfAvg= 0;
                        testingReadingBundle.mfAvg = 0;
                        testingReadingBundle.numReadings = 0;
                    }
                    
                    
                }
            }



          
        }

        sketch.setCalibrationButtons = function () {
            let btnCalNormal = document.getElementById('btnCalNormal');
            let btnCalTipToe = document.getElementById('btnCalTipToe');
            let btnCalHeel = document.getElementById('btnCalHeel');
            let btnCalInToe = document.getElementById('btnCalInToe');
            let btnCalOutToe = document.getElementById('btnCalOutToe');


            btnCalNormal.disabled = normalReadingBundle.finished;
            btnCalHeel.disabled = heelReadingBundle.finished;
            btnCalTipToe.disabled = tiptoeReadingBundle.finished; 
            btnCalInToe.disabled = intoeReadingBundle.finished;
            btnCalOutToe.disabled = outtoeReadingBundle.finished;

            if(normalReadingBundle.finished && 
                heelReadingBundle.finished && 
                tiptoeReadingBundle.finished &&
                intoeReadingBundle.finished && 
                outtoeReadingBundle.finished)
            {
                document.getElementById('calibrationRow').classList.add('collapse');
                document.getElementById('testingRow').classList.remove('collapse');
                
            }
           
               
        }

        sketch.checkCurrentGait = function(bundle){


            let heelReadings = {
                MFPBelow: heelReadingBundle.mfpAvg - 5,
                MFPAbove: heelReadingBundle.mfpAvg + 5,
                HeelBelow: heelReadingBundle.heelAvg - 50,
                HeelAbove: heelReadingBundle.heelAvg + 50,
                MMBelow: heelReadingBundle.mmAvg - 50,
                MMAbove: heelReadingBundle.mmAvg + 50,
                MFBelow: heelReadingBundle.mfAvg - 50,
                MFAbove: heelReadingBundle.mfAvg + 50,
                LFBelow: heelReadingBundle.lfAvg - 50,
                LFAbove: heelReadingBundle.lfAvg + 50,
            }
        
            let tipToeReadings = {
                MFPBelow: tiptoeReadingBundle.mfpAvg - 5,
                MFPAbove: tiptoeReadingBundle.mfpAvg + 5,
                HeelBelow: tiptoeReadingBundle.heelAvg - 50,
                HeelAbove: tiptoeReadingBundle.heelAvg + 50,
                MMBelow: tiptoeReadingBundle.mmAvg - 50,
                MMAbove: tiptoeReadingBundle.mmAvg + 50,
                MFBelow: tiptoeReadingBundle.mfAvg - 50,
                MFAbove: tiptoeReadingBundle.mfAvg + 50,
                LFBelow: tiptoeReadingBundle.lfAvg - 50,
                LFAbove: tiptoeReadingBundle.lfAvg + 50,
            }
        
            let normalReadings = {
                MFPBelow: normalReadingBundle.mfpAvg - 5,
                MFPAbove: normalReadingBundle.mfpAvg + 5,
                HeelBelow: normalReadingBundle.heelAvg - 50,
                HeelAbove: normalReadingBundle.heelAvg + 50,
                MMBelow: normalReadingBundle.mmAvg - 50,
                MMAbove: normalReadingBundle.mmAvg + 50,
                MFBelow: normalReadingBundle.mfAvg - 50,
                MFAbove: normalReadingBundle.mfAvg + 50,
                LFBelow: normalReadingBundle.lfAvg - 50,
                LFAbove: normalReadingBundle.lfAvg + 50,
            }
        
            let intoeReadings = {
                MFPBelow: intoeReadingBundle.mfpAvg - 5,
                MFPAbove: intoeReadingBundle.mfpAvg + 5,
                HeelBelow: intoeReadingBundle.heelAvg - 50,
                HeelAbove: intoeReadingBundle.heelAvg + 50,
                MMBelow: intoeReadingBundle.mmAvg - 50,
                MMAbove: intoeReadingBundle.mmAvg + 50,
                MFBelow: intoeReadingBundle.mfAvg - 50,
                MFAbove: intoeReadingBundle.mfAvg + 50,
                LFBelow: intoeReadingBundle.lfAvg - 50,
                LFAbove: intoeReadingBundle.lfAvg + 50,
            }
        
            let outtoeReadings = {
                MFPBelow: outtoeReadingBundle.mfpAvg - 5,
                MFPAbove: outtoeReadingBundle.mfpAvg + 5,
                HeelBelow: outtoeReadingBundle.heelAvg - 50,
                HeelAbove: outtoeReadingBundle.heelAvg + 50,
                MMBelow: outtoeReadingBundle.mmAvg - 50,
                MMAbove: outtoeReadingBundle.mmAvg + 50,
                MFBelow: outtoeReadingBundle.mfAvg - 50,
                MFAbove: outtoeReadingBundle.mfAvg + 50,
                LFBelow: outtoeReadingBundle.lfAvg - 50,
                LFAbove: outtoeReadingBundle.lfAvg + 50,
            }
            
        
            let similiarMFPAVGBelow = (tipToeReadings.MFPBelow + intoeReadings.MFPBelow + 10)*.5 - 5;
            let similiarMFPAVGAbove = (tipToeReadings.MFPAbove + intoeReadings.MFPAbove - 10)*.5 + 5;
            
        
            console.log(similiarMFPAVGBelow);
            console.log(similiarMFPAVGAbove);
            let gait = '';
        
            return 'In Toe';
            if(bundle.mfpAvg >= heelReadings.MFPBelow && bundle.mfpAvg <= heelReadings.MFPAbove){
                return "Heel";
            }
        
            if(bundle.mfpAvg >= outtoeReadings.MFPBelow && bundle.mfpAvg <= outtoeReadings.MFPAbove){
                return "Out Toe";
            }
        
            if(bundle.mfpAvg >= normalReadings.MFPBelow && bundle.mfpAvg <= normalReadings.MFPAbove){
                return "Normal";
            }
           
            if(bundle.mfpAvg >= similiarMFPAVGBelow && bundle.mfpAvg <= similiarMFPAVGAbove){
                if((bundle.heelAvg >=  tipToeReadings.HeelBelow && bundle.heelAvg <=  tipToeReadings.HeelAbove)){
                   return 'Tip Toe';
                }
                else{
                    return 'In Toe';
                }
            }
           
            gait = document.querySelector('#profile #status').innerHTML;
               
            
            return gait;
        
        }

        sketch.calculateAvgs = function (bundle)  {
            bundle.finished = true;
            bundle.mfpAvg = bundle.mfpAvg / bundle.numReadings;
            bundle.heelAvg = bundle.heelAvg / bundle.numReadings;
            bundle.mmAvg = bundle.mmAvg /  bundle.numReadings;
            bundle.lfAvg = bundle.lfAvg /  bundle.numReadings;
            bundle.mfAvg = bundle.mfAvg /  bundle.numReadings;
            console.log(bundle);
        
        }

        sketch.windowResized = function () {
            console.log ("dummyP5 got a window resize");
            clientW = parentWidth(document.querySelector('#profileCanvas'));
            sketch.background(footImage);
            if(clientW > 700){
                clientH = windowHeight * .5;
                sketch.resizeCanvas(clientW, clientH);
            }
            else{
                clientH = windowHeight * .25;
                sketch.resizeCanvas(clientW, clientH);
            }
           
        }

    },'profileCanvas')
}

function startWalking() {
    
    let m = new p5((sketch) => {
        

        let stepCount;
        let state = 0;
        let oldState = 0;
        let startTime;
        let currentTime;
        let firstLoop = true;
        let finished = false;
        let timeString = '';
        let clientW = parentWidth(document.querySelector('#walkingCanvas'))
        sketch.preload = function () {
            footImage = loadImage('Images/Sole.svg');
            stepCount = 0;
            startTime = 0;
            currentTime = 0;
        }


        sketch.setup = function () {
            currentTime = millis();
            sketch.noCanvas();
        };



        sketch.draw = function(){ 
            sketch.background(255);
            // update logic below using globals
            currentTime = millis();

            if(walkingStarted){
                if(firstLoop){
                    startTime = currentTime;
                    firstLoop = false;
                }
               
                currentTime = millis();
                let realTime = (currentTime - startTime);
    
                let time = msToTime(realTime);
                timeString = time.timeString;
                if(time.mins == 2){
                    walkingStarted = false;
                    finished = true;
                }


                let mfp = parseFloat(((mmReading + mfReading) * 100) / (heelReading + mfReading + mmReading + lfReading + .001)); 
                oldState = state;
                if(mfp >= 0 && mfp <= 70) {
                    state = 0;        
                } else {
                    state = 1;
                }


                if (oldState != state) {
                    // change in state of foot
                    if(state === 0){
                        stepCount+=1;
                    }
                    
                }
                document.querySelector('#walking #steps').innerHTML = 'Steps: ' + stepCount;
            }

            
            document.querySelector('#walking #time').innerHTML = timeString;
            if(finished){
               let cadence = stepCount / 2;
               let stride = 35.5;
               let stepLength = stride / 2 + ' inches';
               let strideLength = stride + ' inches';
               let final = `Cadence: ${cadence} <br />
                            Step Length: ${stepLength} <br />
                            Stride Length: ${strideLength}`
               document.querySelector('#walking #currentData').innerHTML = final;
            }
            else{
                //document.querySelector('#walking #currentData').innerHTML = latestData;
            }
           


        }

        sketch.windowResized = function () {
            clientW = parentWidth(document.querySelector('#walkingCanvas'));
            sketch.background(footImage);
            if(clientW > 700){
                sketch.resizeCanvas(clientW, windowHeight * .5);
            }
            else{
                sketch.resizeCanvas(clientW, windowHeight * .25);
            }
        }

    },'walkingCanvas')
}

function startTherapy() {
    
    let m = new p5((sketch) => {
        
        let footImage;
        let clientW = parentWidth(document.querySelector('#therapyCanvas'))
        let startTime;
        let currentTime;
        let walkingCorrectly = true; 
        let firstLoop = true;
        let state = 0;
        let oldState = 0;
        let timeString = '';
        let readHeel = false;
        let readTip = false;
        let heelTime;
        let tipTime;

        let countBad = 0;
        let countGood = 0;

        let mySound; // when a user is not walking correctly 
    
        let steps = []; // keep track of all the steps taken
        sketch.preload = function () {
            footImage = loadImage('Images/Sole.svg');
            mySound = loadSound('chime.mp3');
            currentTime = 0;
            startTime = 0;
        }

        sketch.setup = function() {
            currentTime = millis();
            if(clientW > 700){
                clientH = windowHeight * .5;
                cv = sketch.createCanvas(clientW, clientH);
            }
            else{
                clientH = windowHeight * .25;
                cv = sketch.createCanvas(clientW, clientH);
            }
            // let cv = sk.createCanvas(document.querySelector(''))
            cv.id("therapyCV");
        }


        sketch.draw = function(){ 
            sketch.background(255);
            sketch.background(footImage);
            if (firstLoop) {
                startTime = currentTime;
                firstLoop = false; 
            }
            currentTime = millis();

            let realTime = (currentTime - startTime);
    
            let time = msToTime(realTime);
            timeString = time.timeString;
            //document.querySelector('#therapy #time').innerHTML = timeString;

            let mfp = parseFloat(((mmReading + mfReading) * 100) / (heelReading + mfReading + mmReading + lfReading + .001)); 
            oldState = state;
            //document.querySelector('#therapy #myC').innerHTML = mfp;

            // mfp is used to determine if a user is stepping, along with additional parameters
            if(mfp >= 0 && mfp <= 70 && (heelReading > 400 || mfReading > 100)) {
                state = 0;
                if (!readHeel) {
                    if (heelReading > 400) {
                        heelTime = realTime;
                        readHeel = true;
                    }
                }
                if (!readTip) {
                    if (mfReading > 100) {
                        tipTime = realTime;
                        readTip = true;
                    }
                   
                }

               
                   
            } else {
                state = 1;
            }

            if (oldState != state) {
                // change in state of foot
                if(state === 0){
                    console.log("New step");
                    if (readHeel && readTip) {
                        if (abs(heelTime - tipTime) < 1500 && abs(heelTime - tipTime) > 2) {
                            steps.push({timeOfHeel: heelTime, timeOfTip: tipTime})   
                            console.log(steps[steps.length - 1]);

                        } 
                        
                    }
                    readHeel = false;
                    readTip = false;  
                }
                
            }

            // for (let i = 0; i < steps.length; i++) {
            //     console.log(steps[i])
            // }

            let numSteps = steps.length;
            if (numSteps >= 3) {
                walkingCorrectly = sketch.correctForm(steps[numSteps - 1]) && sketch.correctForm(steps[numSteps - 2]) && sketch.correctForm(steps[numSteps - 3]);
            }


            if (!walkingCorrectly) {
                
                if(!mySound.isLooping()) {
                    mySound.loop();
                }
            
                document.querySelector('#therapy #status').innerHTML = 'You are not walking correctly';
                document.querySelector('#therapy #status').classList.remove("text-success");
                document.querySelector('#therapy #status').classList.add("text-danger");

            } else {

                mySound.stop();
                document.querySelector('#therapy #status').innerHTML = 'Correct gait cycle. Keep it up!';
                document.querySelector('#therapy #status').classList.remove("text-danger");
                document.querySelector('#therapy #status').classList.add("text-success");
            }
            //document.querySelector('#therapy #data').innerHTML = latestData;
            //document.querySelector('#therapy #data').innerHTML = arduinoOutput;

           

            // colors the circles on the foot drawing, with color intensity mapped to fsr reading
            sketch.noStroke();
            sketch.fill(3, 252, 32, (heelReading / 1023) * 255);
            sketch.circle(clientW/4.5,clientH/2,heelReading/6);
            sketch.fill(246, 250, 12, (mmReading / 1023) * 255);
            sketch.circle(clientW/1.75,clientH/2.75,mmReading/6);
            sketch.fill(10, 67, 252, (mfReading / 1023) * 255);
            sketch.circle(clientW/1.4,clientH/2.25,mfReading/6);
            sketch.fill(242, 7, 39, (lfReading / 1023) * 255);
            sketch.circle(clientW/1.70,clientH/1.5,lfReading/6);

        }

        sketch.windowResized = function () {
            console.log ("dummyP5 got a window resize");
            clientW = parentWidth(document.querySelector('#therapyCanvas'));
            sketch.background(footImage);
            if(clientW > 700){
                clientH = windowHeight * .5;
                sketch.resizeCanvas(clientW, clientH);
            }
            else{
                clientH = windowHeight * .25;
                sketch.resizeCanvas(clientW, clientH);
            }
           
        }

        sketch.correctForm = function (s) {
            if (s.timeOfHeel < s.timeOfTip) {
                return true;
            }
            return false; 
        }

    },'therapyCanvas')
}



function startMotion() {
    
    let m = new p5((sketch) => {

        let timeInMotion;
        let timeNotInMotion;
        let startTime;
        let currentTime;

        sketch.preload = function () {
            timeInMotion = 0;
            timeNotInMotion = 0;
            startTime = 0;
            currentTime = 0;
        }

        sketch.setup = function () {
            currentTime = millis();
            sketch.noCanvas();
        };

        sketch.draw = function () {


            if (inActivity) {
                startTime = currentTime;
                currentTime = millis();
                timeInMotion += (currentTime - startTime);
                document.querySelector('#motion #status').innerHTML = "In Motion";
                document.querySelector('#motion #status').classList.remove("text-secondary");
                document.querySelector('#motion #status').classList.add("text-success");
            } else {
                startTime = currentTime;
                currentTime = millis();
                timeNotInMotion += (currentTime - startTime);
                document.querySelector('#motion #status').innerHTML = "Standing Still";
                document.querySelector('#motion #status').classList.add("text-secondary");
                document.querySelector('#motion #status').classList.remove("text-success");
            }

            if (millis() / 1000) {
                document.querySelector('#motion #timeInMotion').innerHTML = "Moving for " + String(parseInt(timeInMotion / 1000)) + " seconds total";
                document.querySelector('#motion #timeNotInMotion').innerHTML = "Still for " + String(parseInt(timeNotInMotion / 1000)) + " seconds total";
            }
        }
            
           
        
    })

    return m;

    
}

function parentWidth(elem) {
    return elem.clientWidth;
}



function serverConnected() {
    print("Connected to Server");
}

function gotList(thelist) {
    print("List of Serial Ports:");

    for (let i = 0; i < thelist.length; i++) {
        print(i + " " + thelist[i]);
    }
}

function gotOpen() {
    print("Serial Port is Open");
}

function gotClose(){
    print("Serial Port is Closed");
    latestData = "Serial Port is Closed";
}

function gotError(theerror) {
    print(theerror);
}

function gotData() {

    let currentString = serial.readLine();
    trim(currentString);
    if (!currentString) return;
    //console.log(currentString);
    latestData = "Getting Data";
    
    // only update our stored data if the string is valid
    if (validString(currentString)) {
        arduinoOutput = currentString;
        updateValues(); 
    }
}

// returns if the string is formatted correctly
// probably unneeded but added thanks to the values instilled in me by the great Professor John Lillis 
function validString(data) {
    let splitData = data.split('$');
    if (splitData.length != 8) {
        console.log("bad string length:" + splitData.length);
        return false;
    }

    for (let i = 0; i < splitData.length; i++) {
        
        if (i < 5) {
            if (isNaN(parseInt(splitData[i]))) {
                console.log("not an integer: " + splitData[i]);
                return false;
            }
        }
        else { // handles accel data
            if (isNaN(parseFloat(splitData[i]))) {
                console.log("not a float: " + splitData[i]);
                return false;
            }
        }
        
    }

    if (parseInt(splitData[4]) != 0 && parseInt(splitData[4]) != 1) {
        console.log("not a boolean: " + splitData[4] );
        return false;
    }
    
    // must be valid
    return true;

}


function graphFSRs() {
    console.log("Here main scope");
    let g1 = new p5((sketch) => {

        let plot;
        let points = [];
        let clientW = parentWidth(document.querySelector('#walkingGraph1'))
        let cv; 
        let timeStarted;
        let firstLoop = true;

        sketch.setup = function() {
          
            sketch.createCanvas(500, 300);
            //sketch.background(3, 252, 32);
            plot = new GPlot(sketch);
            plot.setPos(0, 0);
            //plot.setDim(500, 500);
            plot.getTitle().setText("Heel Reading");
            plot.getXAxis().getAxisLabel().setText("Time (sec) ");
            plot.getYAxis().getAxisLabel().setText("Force");
        }

        sketch.draw = function() {

            if (walkingStarted) {
                if (firstLoop) {
                    timeStarted = millis();
                    firstLoop = false;
                }
                document.getElementById('startWalking').disabled = true;
            
                plot.addPoint((millis() - timeStarted)/ 1000, heelReading, "(" + msToTime(millis()) + " , " + str(heelReading) + ")");
  
                plot.setPointColor(color(3, 252, 32));
       
                // Draw the plot  
                plot.beginDraw();
                plot.drawBackground();
                plot.drawBox();
                plot.drawXAxis();
                plot.drawYAxis();
                plot.drawTitle();
                plot.drawGridLines(GPlot.BOTH);
                plot.drawLines();
                plot.drawPoints();
                plot.endDraw();
            }

        }

        
    

    },'walkingGraph1')

    let g2 = new p5((sketch) => {

        let plot;
        let points = [];
        let clientW = parentWidth(document.querySelector('#walkingGraph2'))
        let cv; 
        let timeStarted;
        let firstLoop = true;

        sketch.setup = function() {
          
            sketch.createCanvas(500, 300);
            //sketch.background(3, 252, 32);
            plot = new GPlot(sketch);
            plot.setPos(0, 0);
            //plot.setDim(500, 500);
            plot.getTitle().setText("Medial Midfoot Reading");
            plot.getXAxis().getAxisLabel().setText("Time (sec) ");
            plot.getYAxis().getAxisLabel().setText("Force");
        }

        sketch.draw = function() {

            if (walkingStarted) {
                if (firstLoop) {
                    timeStarted = millis();
                    firstLoop = false;
                }
                plot.addPoint((millis() - timeStarted)/ 1000, mmReading, "(" + msToTime(millis()) + " , " + str(mmReading) + ")");
  
                plot.setPointColor(color(246, 250, 12));
       
                // Draw the plot  
                plot.beginDraw();
                plot.drawBackground();
                plot.drawBox();
                plot.drawXAxis();
                plot.drawYAxis();
                plot.drawTitle();
                plot.drawGridLines(GPlot.BOTH);
                plot.drawLines();
                plot.drawPoints();
                plot.endDraw();
            }

        }

        
    

    },'walkingGraph2')

    let g3 = new p5((sketch) => {

        let plot;
        let points = [];
        let clientW = parentWidth(document.querySelector('#walkingGraph3'))
        let cv; 
        let timeStarted;
        let firstLoop = true;

        sketch.setup = function() {
          
            sketch.createCanvas(500, 300);
            //sketch.background(3, 252, 32);
            plot = new GPlot(sketch);
            plot.setPos(0, 0);
            //plot.setDim(500, 500);
            plot.getTitle().setText("Lateral Midfoot Reading");
            plot.getXAxis().getAxisLabel().setText("Time (sec) ");
            plot.getYAxis().getAxisLabel().setText("Force");
        }

        sketch.draw = function() {

            if (walkingStarted) {
                if (firstLoop) {
                    timeStarted = millis();
                    firstLoop = false;
                }
                plot.addPoint((millis() - timeStarted)/ 1000, lfReading, "(" + msToTime(millis()).secs + " , " + str(lfReading) + ")");
  
                plot.setPointColor(color(242, 7, 39));
       
                // Draw the plot  
                plot.beginDraw();
                plot.drawBackground();
                plot.drawBox();
                plot.drawXAxis();
                plot.drawYAxis();
                plot.drawTitle();
                plot.drawGridLines(GPlot.BOTH);
                plot.drawLines();
                plot.drawPoints();
                plot.endDraw();
            }

        }

        
    

    },'walkingGraph3')

    let g4 = new p5((sketch) => {

        let plot;
        let points = [];
        let clientW = parentWidth(document.querySelector('#walkingGraph4'))
        let cv; 
        let timeStarted;
        let firstLoop = true;

        sketch.setup = function() {
          
            sketch.createCanvas(500, 300);
            //sketch.background(3, 252, 32);
            plot = new GPlot(sketch);
            plot.setPos(0, 0);
            //plot.setDim(500, 500);
            plot.getTitle().setText("Medial Forefoot Reading");
            plot.getXAxis().getAxisLabel().setText("Time (sec) ");
            plot.getYAxis().getAxisLabel().setText("Force");
        }

        sketch.draw = function() {

            if (walkingStarted) {
                if (firstLoop) {
                    timeStarted = millis();
                    firstLoop = false;
                }
                plot.addPoint((millis() - timeStarted)/ 1000, mfReading, "(" + msToTime(millis()).secs + " , " + str(mfReading) + ")");
  
                plot.setPointColor(color(10, 67, 252));
       
                // Draw the plot  
                plot.beginDraw();
                plot.drawBackground();
                plot.drawBox();
                plot.drawXAxis();
                plot.drawYAxis();
                plot.drawTitle();
                plot.drawGridLines(GPlot.BOTH);
                plot.drawLines();
                plot.drawPoints();
                plot.endDraw();
            }

        }

        
    

    },'walkingGraph4')
}


function updateValues() {
    let splitData = arduinoOutput.split('$');
    heelReading = parseInt(splitData[0]);
    mmReading  = parseInt(splitData[1]);
    lfReading  = parseInt(splitData[2]);
    mfReading  = parseInt(splitData[3]);
    inActivity  = !!(parseInt(splitData[4]));
    xAccel = parseFloat(splitData[5]);
    yAccel = parseFloat(splitData[6]);
    zAccel = parseFloat(splitData[7]);
}

function draw() {
   
    

    // Polling method
    /*
    if (serial.available() > 0) {
    let data = serial.read();
    ellipse(50,50,data,data);
    }
    */
}


function msToTime(ms) {
    
    let min = 0;
    let sec = 0;
    let timeVal = '';
    if(ms > 60000){
        min = parseInt(ms / 60000);
        sec = parseInt((ms - (min * 60000))/1000);

        if(min < 10){
            timeVal = '0' + min + ':';
        }
        else{
            timeVal = min + ':';
        }

        
        if(sec < 10){
            timeVal += '0' + sec;
        }
        else{
            timeVal += sec;
        }
    }
    else{
        timeVal = '00:';
        sec = parseInt(ms / 1000);
        if(sec < 10){
            timeVal += '0' + sec;
        }
        else{
            timeVal += sec;
        }

    }
    
    var time = {
        mins: min,
        secs: sec,
        timeString: timeVal
    }

    return time;
  }