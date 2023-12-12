const qrcode = require('qrcode-terminal');
var request = require('request');


const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
        // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        executablePath: '/usr/bin/google-chrome-stable',
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process', // <- this one doesn't works in Windows
          '--disable-gpu'
        ],
      },
      takeoverOnConflict: true,
    authStrategy: new LocalAuth({ clientId: "marketsosialmedia" })
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});
client.on('message', async message => {
	console.log(message);
  
    if(message.hasMedia) {
        const media = await message.downloadMedia();
        // do something with the media data here
        var options = {
            'method': 'POST',
            'url': 'https://whatsapp.codingaja.com/api/message',
            'headers': {
            },
            formData: {
                'phone': message.from,
                'name': message._data?.notifyName,
                'body': message.body,
                'type': message.type,
                'mimetype' : media.mimetype ,
                'file' : media.data 
            }
          }
        console.log(options)

          request(options, function (error, response) {
            if (error) throw new Error(error);
            // console.log(response.body);
          });
    }else{
        var options = {
            'method': 'POST',
            'url': 'https://whatsapp.codingaja.com/api/message',
            'headers': {
            },
            formData: {
              'phone': message.from,
              'name': message._data?.notifyName,
              'body': message.body,
              'type': message.type,
    
            }
          };
          request(options, function (error, response) {
            if (error) throw new Error(error);
            // console.log(response.body);
          });
    }
 
  
});
 

client.initialize();
 