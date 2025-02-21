const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const { analyzeMenuImage } = require('./anthropicService')
const { DB } = require('../config/db')
const Menu = DB.menu

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
})

wwjs.on('ready', () => {
    console.log('Client is ready!')
})

wwjs.on('qr', qr => {
    qrcode.generate(qr, { small: true })
})

//Retour par defaut
// wwjs.on('message', async (msg) => {
//     try {
//         if (msg.from != 'status@broadcast') {
//             const contact = await msg.getContact()
//             console.log(msg, msg.body)

//             const url = 'https://upload.wikimedia.org/wikipedia/commons/7/78/Image.jpg'
//             const media = await MessageMedia.fromUrl(url)
//             media.mimetype = "image/jpg"
//             media.filename = "Image.jpg"
//             wwjs.sendMessage(msg.from, media, { caption: 'www.hoyoverse.com' }).then((res) => {
//                 console.log('messageMediaSend')
//             }).catch((err) => {
//                 console.log('An error has occurred', err)
//             })

//         }
//     } catch (error) {
//         console.log(error)
//     }
// })


//Analyse et ajout du menu dans la db
wwjs.on('message', async msg => {
    if (msg.hasMedia) {
        const media = await msg.downloadMedia()
        const imagePath = `./tmp/${msg.id.id}.jpg`

        // Fonction pour obtenir le numero de la semaine actuelle
        const getWeekNumber = (date) => {
            const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
            return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        };

        const today = new Date();
        const weekNumber = getWeekNumber(today);
        const week = `Semaine-${weekNumber + 1}-${new Date().getFullYear()}`

        const verifWeek = await Menu.findOne({ where: { week: week } })
        if (verifWeek)  {
            wwjs.sendMessage(msg.from, `☑️ Le menu de la semaine ${weekNumber + 1} a deja ete ajoute`)
            return
        }
             
        require("fs").writeFileSync(imagePath, media.data, { encoding: "base64" })

        wwjs.sendMessage(msg.from, "🔍 Analyse du menu en cours...")

        const menu = await analyzeMenuImage(imagePath)

        //Convertir en JSON le menu
        let menuData
        try {
            menuData = JSON.parse(menu)
        } catch (error) {
            menuData = menu
        }

        console.log(menuData)


        if (!menuData) {
            wwjs.sendMessage(msg.from, "❌ Impossible d'extraire un menu valide.")
            return
        }

        // Vérifier que le JSON contient bien un menu complet
        if (!menuData["lundi"] || !menuData["mardi"]) {
            wwjs.sendMessage(msg.from, menuData)
            return
        }

        // Sauvegarde en base avec identification de la semaine
        await Menu.create({
            week: week,
            menuData: menuData
        })

        wwjs.sendMessage(msg.from, "✅ Menu enregistré avec succès en base de données !")
    }
})

//Envoi de message
const sendWaMsg = async (number, sendMsg) => {
    const numbers = [`225${number}@c.us`, `225${number.slice(2)}@c.us`]

    console.log(numbers)
    const url = 'https://upload.wikimedia.org/wikipedia/commons/7/78/Image.jpg'
    const media = await MessageMedia.fromUrl(url)
    media.mimetype = "image/jpg"
    media.filename = "Image.jpg"

    numbers.forEach(async (number) => {
        try {
            wwjs.sendMessage(number, media, { caption: `${sendMsg}` })
            console.log('messageMediaSend')
        }
        catch (err) {
            console.log('An error has occurred', err)
        }
    })

}




module.exports = { wwjs, sendWaMsg }