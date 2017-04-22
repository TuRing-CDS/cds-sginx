/**
 * Created by Z on 2017-04-12.
 */
const Io = require('socket.io-client');

const client = Io('ws://localhost:3001');

client.on('connect', () => {
    console.log('connect');
    client.emit('invoke-service', 'demo', 'event', {hello: 'hello'}, console.log);
});

client.on('aaa',(msg)=>{
    console.log(msg);
})

