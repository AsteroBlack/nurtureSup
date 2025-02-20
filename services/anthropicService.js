const { Anthropic } = require("@anthropic-ai/sdk");
require("dotenv").config();
const fs = require("fs");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const analyzeMenuImage = async (imagePath) => {
    try {
        const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });

       
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            system: "Tu es un assistant qui analyse des menus de restaurant envoyés sous forme d'image. Si l'image contient un menu, extrait les plats en JSON bien structuré avec uniquement les jours et le menu du jour. Réponds uniquement en JSON sans autre texte.",
            messages: [{
                role: "user",
                content: [{
                    type: "image",
                    source: {
                        type: "base64",
                        media_type: "image/jpeg",
                        data: imageBase64
                    }
                }, {
                    type: "text",
                    text: "Analyse ce menu et retourne les plats en JSON"
                }]
            }]
        });

        
        return response.content[0].text;

    } catch (error) {
        console.error("Erreur Anthropic :", error);
        return null;
    }
};

module.exports =  {analyzeMenuImage}