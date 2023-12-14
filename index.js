const qrcode = require('qrcode-terminal');
const fs = require('fs');
var request = require('request');


const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        // executablePath: '/usr/bin/google-chrome-stable',
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

client.on('ready',async () => {
    console.log('Client is ready!');
    const allExtractedData = [];
    const chats = await client.getChats()
 
// Iterate through each chat
for (const chat of chats) {
  // console.log(chat);
  // Fetch messages for the current chat
  const messages = await chat.fetchMessages({ limit: 10000 });

  // Extracted data for each message
  const extractedData = await Promise.all(messages.map(async (message) => {
    const extractedMessage = {
      ack: message.ack,
      from: message.from,
      to: message.to,
      author: message.author,
      type: message.type,
      body: message.body,
      fromMe: message.fromMe,
      hasMedia: message.hasMedia,
      timestamp: message.timestamp,
      deviceType: message.deviceType,
    };

    if (message.hasMedia) {
      try {
        // Download media and add it to the extracted message
        const mediaFile = await message.downloadMedia();
        extractedMessage.mediaFile = mediaFile;
      } catch (error) {
        console.error('Error downloading media:', error);
      }
    }

    return extractedMessage;
  }));

  const avatar =  await client.getProfilePicUrl(chat.id._serialized);
  // Contact information for the current chat
  const contactInfo = {
    deviceId: client.info.me._serialized,
    chatId: chat.id._serialized,
    isGroup: chat.isGroup,
    name: chat.name,
    avatar: avatar,
    onChat: extractedData,
  };

  var options = {
    'method': 'POST',
    'url': 'localhost/api/message',
    'headers': {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify()}
    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.body);
    });
  // Add the extractedData to the array
  // allExtractedData.push(contactInfo);
  const dir = 'backup/'+client.info.me._serialized;
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dir+"/"+contactInfo.chatId+'.json', JSON.stringify(contactInfo, null, 2));
}
// const jsonFilePath = 'allExtractedData.json';
// fs.writeFileSync(jsonFilePath, JSON.stringify(allExtractedData, null, 2));


// console.log(allExtractedData);

// Log the extracted data

// console.log(extractedData);

});
client.on('message', async message => {
	console.log(message);
  const extractedMessage = {
    ack: message.ack,
    from: message.from,
    to: message.to,
    author: message.author,
    type: message.type,
    body: message.body,
    fromMe: message.fromMe,
    hasMedia: message.hasMedia,
    timestamp: message.timestamp,
    deviceType: message.deviceType,
  };

  if (message.hasMedia) {
    try {
      // Download media and add it to the extracted message
      const mediaFile = await message.downloadMedia();
      extractedMessage.mediaFile = mediaFile;
    } catch (error) {
      console.error('Error downloading media:', error);
    }
  }
  const info = await message.getContact();
  const avatar = await info.getProfilePicUrl();
  const contactInfo = {
    deviceId: client.info.me._serialized,
    chatId: message.id.remote,
    isGroup: info.isGroup,
    name: info.pushname,
    avatar: avatar,
    onChat: extractedMessage,
  };

  console.log(contactInfo);
    // if(message.hasMedia) {
    //     const media = await message.downloadMedia();
    //     // do something with the media data here
    //     var options = {
    //         'method': 'POST',
    //         'url': 'https://whatsapp.codingaja.com/api/message',
    //         'headers': {
    //         },
    //         formData: {
    //             'phone': message.from,
    //             'name': message._data?.notifyName,
    //             'body': message.body,
    //             'type': message.type,
    //             'mimetype' : media.mimetype ,
    //             'file' : media.data 
    //         }
    //       }
    //     console.log(options)

    //       request(options, function (error, response) {
    //         if (error) throw new Error(error);
    //         // console.log(response.body);
    //       });
    // }else{
    //     var options = {
    //         'method': 'POST',
    //         'url': 'https://whatsapp.codingaja.com/api/message',
    //         'headers': {
    //         },
    //         formData: {
    //           'phone': message.from,
    //           'name': message._data?.notifyName,
    //           'body': message.body,
    //           'type': message.type,
    
    //         }
    //       };
    //       request(options, function (error, response) {
    //         if (error) throw new Error(error);
    //         // console.log(response.body);
    //       });
    // }
 
  
});
 

client.initialize();
 