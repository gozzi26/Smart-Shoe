

First download and extract p5 serialcontrol application on your machine:
https://github.com/p5-serial/p5.serialcontrol/releases/tag/0.1.2

Run the application (p5.serialcontrol) and give it permissions to bypass your firewall. Make sure you click both private and public networks (this is for a windows machine) so that it works both on campus and at home.  This is not a virus, you can be paranoid about it if you want.

Next click 'rescan ports' under "Info" with your microcontrollers plugged in. Select your port under "Connect". This port should be the exact same as when you upload code on Arduino


With your port scanned and selected you should be able to have it work directly using the following lifecycle. If it doesn't work, then click on 'open' under "Connect", then 'close' then restart the p5 serialcontrol application. 

Lifecycle for development/testing/running:

1. Ensure both boards are linked and your arduino code is pushed up to the board.

2. Make sure p5 serialcontrol is running


3. Ensure that the correct port is selected in the "script.js" file (locally) (could be implemented in website where the port can be selected, im writing this prematurely)

4. Launch the website/open index.html with live server to interact with the device. 


5. Close out of p5 serialcontrol before disconnecting your device (not sure if this is needed but good to be safe) 


Arduino important details:

- Be sure to change the analog and LED pins to those corresponding to your device configuration 



