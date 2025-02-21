const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const { analyzeMenuImage } = require('./anthropicService')
const { DB } = require('../config/db')
const getWeekNumber = require('../middleware/weekFunction')
const Menu = DB.menu
const User = DB.user

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

//Analyse et ajout du menu dans la db
wwjs.on('message', async msg => {
    if (msg.hasMedia) {
        const media = await msg.downloadMedia()
        const imagePath = `./tmp/${msg.id.id}.jpg`

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

        const users = await User.findAll()
        users.forEach(user => {
            sendWaMsg(user.number, `🤗 Salut ${user.name} \n Le Menu de ma semaine est disponible, Si vous souhaitez commander cliquez sur le lien ci-dessous et passez vos commande avant 12h \n https://lien.com`)
        })
    }
})





module.exports = { wwjs, sendWaMsg }