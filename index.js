const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot is online!'));
app.listen(3000, () => console.log('Keep-alive server is running on port 3000'));

const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, ApplicationCommandOptionType } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// --- DATABASE SETUP ---
const db = new sqlite3.Database('./vouchers.db');
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS vouches (user_id TEXT PRIMARY KEY, count INTEGER DEFAULT 0)");
});

// --- CONFIGURATION ---
const TOKEN = 'MTQ4MjkyMDMxMzE1NDE3OTIyNQ.GYcCYK.9FwNiW5gq7tzPwteKIopTCQim6Yk_-eZNQPKxE'; 
const CLIENT_ID = '1482920313154179225'; 

// Assets for VOUCH command
const VOUCH_BANNER = 'https://cdn.discordapp.com/attachments/1483632845170675905/1483633258397700216/Screenshot_20260303-214443.jpg?ex=69bb4ca5&is=69b9fb25&hm=1bda1b3b46ead5e9b8c056d6a1505b862648555b8eea1185110031568b8805db&';
const VOUCH_THUMBNAIL = 'https://cdn.discordapp.com/attachments/1483632845170675905/1483633333635383326/Screenshot_20260303-220917.png?ex=69bb4cb7&is=69b9fb37&hm=25b9a373d4390be7e476d4681e4b52606e640547d9c51adbea42acdfb5b447b3&';

// Assets for PROOF command
const PROOF_BANNER = 'https://cdn.discordapp.com/attachments/1483632845170675905/1483633470172430488/Screenshot_20260303-215910.jpg?ex=69bb4cd7&is=69b9fb57&hm=1aee79ae5185ca0314cec32c393ef37000a7f1fa7689223ce9ebea4e30bfe3e1&';
const PROOF_THUMBNAIL = 'https://cdn.discordapp.com/attachments/1483632845170675905/1483633524606111844/Screenshot_20260303-221158.jpg?ex=69bb4ce4&is=69b9fb64&hm=0c9b5e7f368ded653c4a1debf5af0e332a8edf5eea8cd64391528ca6dc7b33e0&';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// --- REGISTER SLASH COMMANDS ---
const commands = [
    {
        name: 'vouch',
        description: 'Submit a new vouch for a seller',
        options: [
            { name: 'seller', description: 'The user who sold the item', type: ApplicationCommandOptionType.User, required: true },
            { name: 'buyer', description: 'The user who bought the item', type: ApplicationCommandOptionType.User, required: true },
            { name: 'order', description: 'What was bought?', type: ApplicationCommandOptionType.String, required: true },
            { name: 'rating', description: 'Rating (e.g. 5/5)', type: ApplicationCommandOptionType.String, required: true },
            { name: 'proof', description: 'Upload a screenshot of the trade', type: ApplicationCommandOptionType.Attachment, required: true },
        ]
    },
    {
        name: 'proof',
        description: 'Submit transaction proof',
        options: [
            { name: 'seller', description: 'The seller involved', type: ApplicationCommandOptionType.User, required: true },
            { name: 'payment', description: 'Payment method used', type: ApplicationCommandOptionType.String, required: true },
            { name: 'count', description: 'Proof count/number', type: ApplicationCommandOptionType.String, required: true },
            { name: 'image', description: 'The proof image', type: ApplicationCommandOptionType.Attachment, required: true },
        ]
    }
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.on('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`✅ Logged in as ${client.user.tag}`);
    } catch (error) {
        console.error(error);
    }
});

// --- HELPER FUNCTION: UPDATE VOUCHES ---
function updateVouchCount(userId, callback) {
    db.run(
        `INSERT INTO vouches (user_id, count) VALUES (?, 1) 
         ON CONFLICT(user_id) DO UPDATE SET count = count + 1`,
        [userId],
        function(err) {
            if (err) return console.error(err.message);
            db.get(`SELECT count FROM vouches WHERE user_id = ?`, [userId], (err, row) => {
                callback(row ? row.count : 1);
            });
        }
    );
}

// --- HANDLE INTERACTIONS ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'vouch') {
        const seller = interaction.options.getUser('seller');
        const buyer = interaction.options.getUser('buyer');
        const order = interaction.options.getString('order');
        const rating = interaction.options.getString('rating');
        const proof = interaction.options.getAttachment('proof');

        updateVouchCount(seller.id, (totalVouches) => {
            const vouchEmbed = new EmbedBuilder()
                .setColor('#7c0a02')
                .setTitle('🗼 new vouch')
                .setThumbnail(VOUCH_THUMBNAIL) // Fixed: Using your Vouch Thumbnail variable
                .setDescription(
                    `承 **seller** : ${seller}\n` +
                    `承 **buyer** : ${buyer}\n` +
                    `承 **order** : ${order}\n` +
                    `承 **rating** : ${rating}\n` +
                    `承 **total vouches** : ${totalVouches}\n` +
                    `承 **trade proof** : [Click Here](${proof.url})`
                )
                .setImage(VOUCH_BANNER)
                .setTimestamp()
                .setFooter({ text: `Vouch Logged`, iconURL: client.user.displayAvatarURL() });

            interaction.reply({ embeds: [vouchEmbed] });
        });
    }

    if (interaction.commandName === 'proof') {
        const seller = interaction.options.getUser('seller');
        const payment = interaction.options.getString('payment');
        const count = interaction.options.getString('count');
        const proof = interaction.options.getAttachment('image');

        updateVouchCount(seller.id, (totalVouches) => {
            const proofEmbed = new EmbedBuilder()
                .setColor('#7c0a02')
                .setTitle('🗼 new proof')
                .setThumbnail(PROOF_THUMBNAIL) // Fixed: Using your Proof Thumbnail variable
                .setDescription(
                    `承 **seller** : ${seller}\n` +
                    `承 **proof link** : [Click Here](${proof.url})\n` +
                    `承 **Payment** : ${payment}\n` +
                    `承 **proof count** : ${count}\n` +
                    `承 **total verified** : ${totalVouches}`
                )
                .setImage(PROOF_BANNER)
                .setTimestamp()
                .setFooter({ text: `Proof Logged`, iconURL: client.user.displayAvatarURL() });

            interaction.reply({ embeds: [proofEmbed] });
        });
    }
});

client.login(TOKEN);
