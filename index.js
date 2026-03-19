const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot is online!'));
app.listen(3000, () => console.log('Keep-alive server is running on port 3000'));

const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, ApplicationCommandOptionType } = require('discord.js');

// --- CONFIGURATION ---
const TOKEN = 'pMTQ4MjkyMDMxMzE1NDE3OTIyNQ.GrOMXY.YXviJJQbR5iBngcVHow3IIuEEzs6LrsMYWgjYc';
const CLIENT_ID = '1482920313154179225'; // From Discord Dev Portal
const GLOBAL_BANNER = 'https://cdn.discordapp.com/attachments/1483632845170675905/1483633470172430488/Screenshot_20260303-215910.jpg?ex=69bb4cd7&is=69b9fb57&hm=1aee79ae5185ca0314cec32c393ef37000a7f1fa7689223ce9ebea4e30bfe3e1&'; // Your banner image link

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
        options:
    }
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.on('ready', async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`✅ Logged in as ${client.user.tag} and registered slash commands!`);
    } catch (error) {
        console.error(error);
    }
});

// --- HANDLE INTERACTIONS ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'vouch') {
        const seller = interaction.options.getUser('seller');
        const buyer = interaction.options.getUser('buyer');
        const order = interaction.options.getString('order');
        const rating = interaction.options.getString('rating');
        const proof = interaction.options.getAttachment('proof');

        const vouchEmbed = new EmbedBuilder()
            .setColor('#7c0a02') 
            .setTitle('🗼 new vouch')
            .setThumbnail(buyer.displayAvatarURL({ dynamic: true }))
            .setDescription(
                `承 **seller** : ${seller}\n` +
                `承 **buyer** : ${buyer}\n` +
                `承 **order** : ${order}\n` +
                `承 **rating** : ${rating}\n` +
                `承 **trade proof** : [Click Here](${proof.url})`
            )
            .setImage(GLOBAL_BANNER)
            .setTimestamp()
            .setFooter({ text: `Vouch Logged`, iconURL: client.user.displayAvatarURL() });

        await interaction.reply({ embeds: [vouchEmbed] });
    }

    if (interaction.commandName === 'proof') {
        const seller = interaction.options.getUser('seller');
        const payment = interaction.options.getString('payment');
        const count = interaction.options.getString('count');
        const proof = interaction.options.getAttachment('image');

        const proofEmbed = new EmbedBuilder()
            .setColor('#7c0a02')
            .setTitle('🗼 new proof')
            .setThumbnail(seller.displayAvatarURL({ dynamic: true }))
            .setDescription(
                `承 **seller** : ${seller}\n` +
                `承 **proof link** : [Click Here](${proof.url})\n` +
                `承 **Payment** : ${payment}\n` +
                `承 **proof count** : ${count}`
            )
            .setImage(proof.url)
            .setTimestamp()
            .setFooter({ text: `Proof Logged`, iconURL: client.user.displayAvatarURL() });

        await interaction.reply({ embeds: [proofEmbed] });
    }
});
