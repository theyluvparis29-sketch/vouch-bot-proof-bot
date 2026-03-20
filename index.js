const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot is online!'));
app.listen(3000, () => console.log('Keep-alive server is running on port 3000'));

const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, ApplicationCommandOptionType } = require('discord.js');
const Database = require('better-sqlite3');

// --- DATABASE SETUP ---
const db = new Database('vouchers.db');
db.prepare("CREATE TABLE IF NOT EXISTS vouches (user_id TEXT PRIMARY KEY, count INTEGER DEFAULT 0)").run();

// --- CONFIGURATION ---
const TOKEN = 'YOUR_BOT_TOKEN_HERE'; // <--- PASTE YOUR TOKEN INSIDE THE QUOTES
const CLIENT_ID = '1482920313154179225'; 

const VOUCH_BANNER = 'https://cdn.discordapp.com';
const VOUCH_THUMBNAIL = 'https://cdn.discordapp.com';
const PROOF_BANNER = 'https://cdn.discordapp.com';
const PROOF_THUMBNAIL = 'https://cdn.discordapp.com';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
    {
        name: 'vouch',
        description: 'Submit a new vouch for a seller',
        options: [
            { name: 'seller', description: 'The user who sold the item', type: ApplicationCommandOptionType.User, required: true },
            { name: 'buyer', description: 'The user who bought the item', type: ApplicationCommandOptionType.User, required: true },
            { name: 'order', description: 'What was bought?', type: ApplicationCommandOptionType.String, required: true },
            { name: 'rating', description: 'Rating (e.g. 5/5)', type: ApplicationCommandOptionType.String, required: true },
            { name: 'proof', description: 'Upload a screenshot of the trade', type: ApplicationCommandOptionType.Attachment, required: true }
        ]
    },
    {
        name: 'proof',
        description: 'Submit proof of a transaction',
        options: [
            { name: 'seller', description: 'The user who sold the item', type: ApplicationCommandOptionType.User, required: true },
            { name: 'image', description: 'Upload a screenshot of the proof', type: ApplicationCommandOptionType.Attachment, required: true },
            { name: 'payment', description: 'Payment method', type: ApplicationCommandOptionType.String, required: true },
            { name: 'count', description: 'Proof count', type: ApplicationCommandOptionType.String, required: true }
        ]
    }
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.on('ready', async () => {
    try {
        console.log(`Logged in as ${client.user.tag}!`);
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    await interaction.deferReply(); 

    const { commandName, options } = interaction;

    if (commandName === 'vouch' || commandName === 'proof') {
        const seller = options.getUser('seller');
        if (!seller) return interaction.editReply("Seller not found.");

        db.prepare("INSERT INTO vouches (user_id, count) VALUES (?, 1) ON CONFLICT(user_id) DO UPDATE SET count = count + 1").run(seller.id);
        const row = db.prepare("SELECT count FROM vouches WHERE user_id = ?").get(seller.id);
        const totalVouches = row ? row.count : 0;

        if (commandName === 'vouch') {
            const buyer = options.getUser('buyer');
            const proof = options.getAttachment('proof');
            
            const vouchEmbed = new EmbedBuilder()
                .setColor('#7c0a02')
                .setTitle('🗼 new vouch')
                .setThumbnail(VOUCH_THUMBNAIL)
                .setDescription(`承 **seller** : ${seller}\n承 **buyer** : ${buyer}\n承 **order** : ${options.getString('order')}\n承 **rating** : ${options.getString('rating')}\n承 **total vouches** : ${totalVouches}\n承 **trade proof** : [Click Here](${proof.url})`)
                .setImage(VOUCH_BANNER)
                .setTimestamp()
                .setFooter({ text: `Vouch Logged`, iconURL: client.user.displayAvatarURL() });

            await interaction.editReply({ embeds: [vouchEmbed] });
        }

        if (commandName === 'proof') {
            const proof = options.getAttachment('image');
            
            const proofEmbed = new EmbedBuilder()
                .setColor('#7c0a02')
                .setTitle('🗼 new proof')
                .setThumbnail(PROOF_THUMBNAIL)
                .setDescription(`承 **seller** : ${seller}\n承 **proof link** : [Click Here](${proof.url})\n承 **Payment** : ${options.getString('payment')}\n承 **proof count** : ${options.getString('count')}\n承 **total verified** : ${totalVouches}`)
                .setImage(PROOF_BANNER)
                .setTimestamp()
                .setFooter({ text: `Proof Logged`, iconURL: client.user.displayAvatarURL() });

            await interaction.editReply({ embeds: [proofEmbed] });
        }
    }
});

client.login(TOKEN);
