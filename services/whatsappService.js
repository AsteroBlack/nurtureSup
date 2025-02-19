const { Client, LocalAuth, MessageMedia, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');


const wwjs = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-gpu',],
    },
    webVersionCache: {
        type: 'remote',
        remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2407.3.html`
    }
});

wwjs.on('ready', () => {
    console.log('Client is ready!');
});

wwjs.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});


wwjs.on('message', async (msg) => {
    try {
        if (msg.from != 'status@broadcast') {
            const contact = await msg.getContact()
            console.log(msg, msg.body)

            const url = 'https://upload.wikimedia.org/wikipedia/commons/7/78/Image.jpg'
            const media = await MessageMedia.fromUrl(url)
            media.mimetype = "image/jpg";
            media.filename = "Image.jpg";
            wwjs.sendMessage(msg.from, media, { caption: 'www.hoyoverse.com' }).then((res) => {
                console.log('messageMediaSend')
            }).catch((err) => {
                console.log('An error has occurred', err)
            });

        }
    } catch (error) {
        console.log(error)
    }
})

const sendWaMsg = async (number, sendMsg) => {
    const numbers = [`225${number}@c.us`, `225${number.slice(2)}@c.us`]

    console.log(numbers)
    const url = 'https://upload.wikimedia.org/wikipedia/commons/7/78/Image.jpg'
    const media = await MessageMedia.fromUrl(url)
    media.mimetype = "image/jpg";
    media.filename = "Image.jpg";

    numbers.forEach(async (number) => {
        try {
            wwjs.sendMessage(number, media, { caption: `${sendMsg}` })
            console.log('messageMediaSend')
        }
        catch (err) {
            console.log('An error has occurred', err)
        };
    })

}




module.exports = { wwjs, sendWaMsg }