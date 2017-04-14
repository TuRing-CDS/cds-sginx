/**
 * Created by Z on 2017-04-13.
 */
const Service = require('../dist/Service').Service;

const service = new Service('ws://localhost:3001', 'demo');

service.on('event', (ctx, data, callback) => {
    console.log('???', data);
    callback(null, 'aaaa');
    setInterval(() => {
        ctx.emit('aaa', data+":"+new Date());
    }, 1000);
});