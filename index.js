/**
 * Copyright 2020 Next Level Timing LLC

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
 persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

let SocketClient = require('socket.io-client');

class NLTClient {
    constructor () {
        // Set a decoder start time, this will be reset for each race
        this.decoderStartTime = (new Date).getTime();

        // Setup the socket we need to listen on
        this.socket = null;
        this.connectSocket();
    }

    connectSocket() {
        this.socket = SocketClient('http://localhost:3001/race-client');

        this.socket.on('connect', () => {
            console.log('Race socket connected');
        });
        this.socket.on('disconnect', () => {
            console.log('Race socket disconnected');
        });
        this.socket.on('api', (request, callback) => {
            // Check if the callback is supplied, if not, make a callback to handle errors
            if (typeof callback !== 'function') {
                callback = function () {
                    console.log('Api callback fired, no callback function in request. Arguments supplied:', arguments);
                }
            }

            // Check if there is a method
            if (typeof request === 'undefined' || request == null || typeof request.method === 'undefined') {
                callback('Method not found');
                return;
            }

            // If the race has started staging reset the decoder time
            if (request.method === 'receiveRaceUpdate' && request.data.status === 'staging'  && request.data.status === 'staging') {
                this.decoderStartTime = (new Date).getTime();
            }
        });
    }

    emitLap(transponder) {
        // Verify we have connected to the socket
        if (!this.socket) {
            return false;
        }

        // Calculate the decoders time
        let decoderTime = ((new Date).getTime() - this.decoderStartTime);

        // Generate the lap message
        let message = {
            method: 'createLap', // Function within the Next Level Timing system
            data: {
                transponder: transponder.toString(), // Transponder
                decoder_time: decoderTime, // Decoder's time in milliseconds
                monitor_time: (new Date).getTime() // PC time in milliseconds
            }
        };

        // Emit a lap into the decoder socket
        this.socket.emit('api', message, function (err, data) {
            if (err) {
                console.log('Failed to record lap', err);
                return false;
            }

            // You get a response letting you know things worked. You can do what you want it
            console.log('serial response', err, data);
        });
    }
}

let client = new NLTClient({});

// This is where your code comes in. Below is just an example lap event on an interval. Use emitLap whenever your decoder detects a new lap.
// It is important to note that while the application does have a minimum lap time, it is not intended to be used by the decoder as a debouncing function.
setInterval(() => {
    client.emitLap('123123');
}, 5000);