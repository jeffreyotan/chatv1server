// load require libraries and modules
const express = require('express');
const expressWS = require('express-ws');
const morgan = require('morgan');
const cors = require('cors');

// configure PORT
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;

// define globals
const ROOM = {};

// create an instance of the express server
const app = express();
const appWS = expressWS(app);

// define middleware and routes
app.use(morgan("combined"));
app.use(cors());

app.ws('/chat', (ws, req) => {
    const name = req.query.name;
    console.info(`New websocket connection: ${name}`);
    // add the web socket connection to the room
    // console.info('=> ROOM: ', JSON.stringify(ROOM));
    // console.info('=> ws:', ws); 
    ws.participantName = name;
    ROOM[name] = ws;
    console.info('=> Completed storing WebSocket in ROOM');

    // setup
    ws.on('message', (payload) => {
        console.info('=> payload: ', payload);
        const chat = JSON.stringify({
            from: name,
            message: payload,
            timestamp: (new Date()).toString()
        });
        for (let person in ROOM) {
            ROOM[person].send(chat);
        }
    });

    ws.on('close', () => {
        console.info(`Closing websocket connection for ${name}`);
        // close our end of the connection
        ROOM[name].close();
        // remove ownself from the room
        delete ROOM[name];
        console.info('=> close ROOM: ', name);
    });
});

// start the web server
app.listen(PORT, () => {
    console.info(`Server was started at port ${PORT} on ${new Date()}`);
});