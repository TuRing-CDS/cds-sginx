/**
 * Created by Z on 2017-04-12.
 */
// const Io = require('socket.io-client');
//
// const client = Io('ws://localhost:3001');
//
// client.on('connect', () => {
//     console.log('connect');
//     client.emit('invoke', 'demo', 'event', {hello: 'hello'}, console.log);
// });
//
// client.on('aaa',(msg)=>{
//     console.log(msg);
// })

const array = Array(3000).fill('').map((item, index) => {
    return 'https://bluetooth.com/membership-working-groups/member-directory?hits=40&page=' + (index + 1);
});
const fetch = require('node-fetch');
const fs = require('fs');
const filePath = './demo.csv';
const cheerio = require('cheerio');

const fn = function (array, callback) {
    let item = array.shift();
    console.log('开始抓取',item,array.length);
    if (!item) {
        return callback(null, true);
    }
    console.time(item);
    fetch(item).then((res) => {
        return res.text();
    }).then((text) => {
        let $ = cheerio.load(text);
        let result = [];
        $('.interior-table tbody tr').each(function () {
            let companyName = $(this).find('td').eq(0).text().trim();
            let companyUrl = $(this).find('td a').attr('href');
            result.push([companyName, companyUrl].join(','));
        });
        fs.appendFileSync(filePath, result.join('\r\n'));
        console.timeEnd(item);
        fn(array, callback);
    }).catch((ex)=>{
        callback(ex);
    })
}


fn(array, console.log);
