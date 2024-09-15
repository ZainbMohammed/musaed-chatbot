
import pkg from "qrcode-terminal";
import Whatsapp from "whatsapp-web.js";
import OpenAI from 'openai';
import express from "express";
import qr2 from "qrcode";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { env } from "process";
import { config } from "dotenv";
import { MongoClient } from "mongodb";

config(); // Load environment variables from .env file

const { Client, LocalAuth ,Buttons} = Whatsapp;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const appEx = express();
appEx.use(express.urlencoded({ extended: true }));

// MongoDB configuration
const mongoUri = process.env.MONGO_URI;
const mongoClient = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

async function getMongoData(collectionName, query = {}) {
    try {
        await mongoClient.connect();
        const database = mongoClient.db(process.env.MONGO_DB_NAME);
        const collection = database.collection(collectionName);
        const data = await collection.find(query).toArray();
        return data;
    } finally {
        await mongoClient.close();
    }
}

async function setMongoData(collectionName, query, data) {
    try {
        await mongoClient.connect();
        const database = mongoClient.db(process.env.MONGO_DB_NAME);
        const collection = database.collection(collectionName);
        await collection.updateOne(query, { $set: data }, { upsert: true });
    } finally {
        await mongoClient.close();
    }
}

const openai = new OpenAI({apiKey: env.OPEN_AI_KEY});

async function getPrompt(phoneNumber) {
    const products = await getMongoData("products");
    const queries = await getMongoData("customerQueries");
    const policies = await getMongoData("businessPolicies");
    const transactions = await getMongoData("transactionProcedures");
    const company = await getMongoData("companys");

    return `
       You are a customer service agent for [${company.name}], a company specializing in [${company.industry}]. Your role is to assist customers with their inquiries, automate messages, handle transactions, and continuously learn from interactions to improve responses. You will act as if you are the owner of the company and take responsibility for customer satisfaction. Here are some basic details and instructions to help you provide excellent customer service:

Product/Service Information:
 ${products.map(product => ` ${product.name}: ${product.description}، ${product.price}، ${product.features}`).join('\n')}

Common Customer Inquiries:
${queries.map(query => ` - ${query}`).join('\n')}

Company Policies:
${policies.map(policy => ` - ${policy.type}: ${policy.detail}`).join('\n')}

Tone and Style for Customer Interactions:

Use a friendly and helpful tone. Always address the customer by name when possible.
Act like the owner of the company, showing responsibility and care for customer satisfaction.
Reply in the same language as the client.
Transaction Procedures:
${transactions.map(transaction => ` - ${transaction}`).join('\n')}

Escalation Protocols:

If an issue is not resolved or requires special attention, escalate the conversation to a human agent by collecting the customer's contact information and providing it to the support team.
Learning from Interactions:

Continuously learn from each interaction by remembering past customer inquiries and feedback.
Adjust responses based on new information to improve the accuracy and relevance of future interactions.
Ask clarifying questions when needed to better understand the customer's needs and provide tailored solutions.
Speak in simple Arabic.
More Information about the Store:

A store specializing in gifts.
You can read about the products from the official website ${company.site}
You can use the official website to gather your information.
Example conversation:

Customer: "Hello, I need help with my recent order."
Agent: "Hello [customer's name], I'm here to help you! Can you provide me with your order number so I can assist you better? Also, can you tell me the issue you're facing with your order?"

Customer: "What is your return policy?"
Agent: "You can return products within 30 days of purchase with a receipt. Would you like to start the return process for your recent order? If so, can you provide me with the reason for the return so I can assist you better?"

Customer: "I had an issue with the delivery of my last order."
Agent: "I'm sorry to hear that, [customer's name]. Can you provide me with more details about the issue? For example, was there a delay in delivery, or was the product not as expected? Your feedback will help us improve our service."

Proactive Interaction:
Proactively ask customers if they need help with anything else or if they have any feedback they would like to share.
Use insights from customer interactions to suggest related products or services.
Make the first message more detailed, mentioning that you are an online store and can handle orders and send them to the store. You are a customer service agent, but you can interact with operations. Be clear and explain everything.
Remember to always be polite, address customer concerns promptly, and provide accurate information based on the details provided. By learning from each interaction and asking the right questions, you can continuously improve customer service and satisfaction.
        
    `;
}

appEx.get("/authenticate/:phoneNumber", async (req, res) => {
    const phoneNumber = req.params.phoneNumber;
    const prompt = await getPrompt(phoneNumber);
    console.log(`**********************************Client is ready**************************`)

    var arr_chat = [
        {
            role: "system",
            content: prompt,
        },
    ];

    const sessionName = `session-${phoneNumber}`;
    const client = new Client({
        authStrategy: new LocalAuth({ clientId: sessionName }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-gpu'],
        },
        webVersionCache: { type: 'remote', remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html' }
    });

    console.log("Client is not ready to use!");
    console.log(client);
    client.on("qr", (qrCode) => {
        pkg.generate(qrCode, { small: true });
        qr2.toDataURL(qrCode, (err, src) => {
            if (err) res.send("Error occurred");
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                <title>WhatsGPT</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Raleway">
                <style>
                body,h1 {font-family: "Raleway", sans-serif}
                body, html {height: 100%}
                .bgimg {
                  background-image: url('./images/bg-left.png');
                  min-height: 100%;
                  background-position: center;
                  background-size: cover;
                }
                </style>
                </head>
                <body>
                <div class="bgimg w3-display-container w3-animate-opacity w3-text-white">
                  <div class="w3-display-topleft w3-padding-large w3-xlarge">
                  WhatsGPT
                  </div>
                  <div class="w3-display-middle">
                 <center>
                    <h2 class="w3-jumbo w3-animate-top">تم إنشاء رمز QR</h2>
                    <hr class="w3-border-grey" style="margin:auto;width:40%">
                    <p class="w3-center"><div><img src='${src}'/></div></p>
                    </center>
                  </div>
                  <div class="w3-display-bottomleft w3-padding-large">
                    مدعوم بواسطة <a href="/" target="_blank">WhatsGPT</a>
                  </div>
                </div>
                </body>
                </html>
            `);
        });
    });

    client.on("ready", () => {
        console.log("Client is ready!");
    });

    client.initialize();

    client.on("message", async (message) => {
        const chat = await message.getChat();
        const userId = chat.id.user;
        console.log(userId);
        console.log(arr_chat);

        await setMongoData("chats", { userId: chat.id.user }, { messages: arr_chat });

        const userChatData = await getMongoData("chats", { userId: chat.id.user });

        if (userChatData.length > 0) {
            arr_chat = userChatData[0].messages;
            arr_chat.push({
                role: "user",
                content: message.body,
            });

            await setMongoData("chats", { userId: chat.id.user }, { messages: arr_chat });

            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: arr_chat,
            });

            const responseText = completion.choices[0].message.content;
            message.reply(responseText);

            arr_chat.push({
                role: "system",
                content: responseText,
            });

            await setMongoData("chats", { userId: chat.id.user }, { messages: arr_chat });
        } else {
            console.log("No data available");
        }
    });
});

appEx.post("/submit", (req, res) => {
    const message = req.body.message;
    const phoneNumber = req.body.phoneNumber;
    res.redirect("/authenticate/" + phoneNumber );
});

appEx.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

appEx.listen(process.env.PORT, function () {
    console.log("Example app listening on port " +`localhost:${process.env.PORT}` + "!");
});

