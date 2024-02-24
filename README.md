# Communicating Between an Arduino and a Node.js Server

This tutorial will walkthrough the process of creating an Arduino IOT device that controls aspects fo a website. In this example the website will simpy display a red block that will fade when a dial on an Arduino is adjusted.

## HTML and JavaScript

Create an HTML file called `index.html`. Add the following code:

```javascript
<!doctype html>
<html>
  <head>

    <script src='https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.js'></script>

    <script>

    var socket = io();

    socket.on('data', function(data) {
        console.log(data);
        document.getElementById('sample').style.opacity = data+"%";
    });

    </script>

    <style>

      #sample {
        background-color: red;
        width: 300px;
        height: 300px;
      }

    </style>

  </head>
  <body>

    <h1>Communicating from an Arduino to Node.js</h1>
    <div id="sample"></div>

  </body>
</html>
```

The above code creates a webpage with a red square. Whn the dial is turned on the Arduino device, the red square will fade in and out.

## Node.js Server

Before we setup the Node.js server we need to know the name of the serialport your Arduino is attached to. You can find the name of your serialport, it will look something like `/dev/tty.wchusbserialfa1410`. On a Mac using the Terminal and entering the following command:

```
ls /dev/{tty,cu}.*
```

On a PC you can use the command line and the following command:

```
chgport
```

On my PC when I use the `chgport` command I get the following output:

```
AUX = \DosDevices\COM1
COM1 = \Device\Serial0
COM3 = \Device\Serial2
```

In my Node.js I would use `COM3` as my serialport string.

If you're not sure which one is your Arduino, just disconnet your Arduino and execute the cpommand again and take note of which port is no longer on the list.

Or you can find the name in [Arduino Create](https://create.arduino.cc/editor) in the drop down menu used to select your Arduino.

Create a file called `app.js` and add the following code:

```javascript
var http = require("http");
var fs = require("fs");
var index = fs.readFileSync("index.html");

var SerialPort = require("serialport");
const parsers = SerialPort.parsers;

const parser = new parsers.Readline({
  delimiter: "\r\n",
});

var port = new SerialPort("/dev/tty.wchusbserialfa1410", {
  baudRate: 9600,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
  flowControl: false,
});

port.pipe(parser);

var app = http.createServer(function (req, res) {
  res.writeHead(200, {"Content-Type": "text/html"});
  res.end(index);
});

var io = require("socket.io").listen(app);

io.on("connection", function (socket) {
  console.log("Node is listening to port");
});

parser.on("data", function (data) {
  console.log("Received data from port: " + data);
  io.emit("data", data);
});

app.listen(3000);
```

The above code listend for a message from the Arduino over the USD port and then passes a message onto the HTML/JavaScript using Socket.io.

> [!Note]
> Make sure to change the name of the serialport.

## The Arduino

Using [Arduino Create](https://create.arduino.cc/editor) create the following sketch and upload it to your Arduino.

```csharp
int percent = 0;
int prevPercent = 0;

void setup() {
  Serial.begin( 9600 );
}

void loop() {

  percent = round(analogRead(0) / 1024.00 * 100);

  if(percent != prevPercent) {
    Serial.println(percent);
    prevPercent = percent;
  }

  delay(100);

}
```

The previous code will generate a percentage pased on the dial and pass the number on to the Node.js server using the serialport.

> View the Arduino code on Arduino Create:  
> https://create.arduino.cc/editor/professoradam/da29d7ec-2df5-4528-82ce-817710aadb1a/preview

You will need to setup the following circuit using your Arduino:

![Tinkercad Circuit](_readme/tinkercad-to-nodejs.png)

> View the Circuit on Tinkercad:  
> https://www.tinkercad.com/things/5Siec0jdhZo-arduinotobrowser

## Launch Application

1. Using [Arduino Create](https://create.arduino.cc/editor) upload the sketch to your Arduino.
2. Using the Terminal start your Node.js app using `node app.js`.
3. Open up a browser and enter the URL `http://localhost:3000/`.
4. Turn the dial on the Arduino device and watch the red square in the browser.

> Full tutorial URL:  
> https://codeadam.ca/learning/arduino-to-nodejs.html

---

## Repo Resources

- [Visual Studio Code](https://code.visualstudio.com/)
- [Arduino Create](https://create.arduino.cc/editor)
- [SerialPort NPM](https://www.npmjs.com/package/serialport)
- [Socket.io](https://socket.io/)

<a href="https://codeadam.ca">
<img src="https://codeadam.ca/images/code-block.png" width="100">
</a>
