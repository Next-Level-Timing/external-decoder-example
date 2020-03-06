# External Decoder Example
This is an example of an unsupported decoder communicating with the Next Level Timing desktop application to create lap events.

This has tested on app version 1.5.0.

The `emitLap` function sends the application a lap event. You can call this at any time after the client is initialized.
```
client.emitLap('123123');
```

Start the service at any point before starting a race within the application.
```
node index.js
```