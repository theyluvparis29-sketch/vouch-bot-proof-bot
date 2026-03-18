const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Vouch and Proof Bots are Online!'));
app.listen(3000, () => console.log('Server is ready!'));

// ... Your Vouch Bot and Proof Bot code follows below ...
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, Events } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async c => {
    console.log(`✅ Ready! Logged in as ${c.user.tag}`);
    
    const vouch = new SlashCommandBuilder()
        .setName('vouch')
        .setDescription('Submit a trade vouch')
        .addUserOption(o => o.setName('seller').setDescription('The seller').setRequired(true))
        .addUserOption(o => o.setName('buyer').setDescription('The buyer').setRequired(true))
        .addStringOption(o => o.setName('order').setDescription('What was bought').setRequired(true))
        .addIntegerOption(o => o.setName('rating').setDescription('Rating 1-10').setRequired(true))
        .addAttachmentOption(o => o.setName('proof').setDescription('Upload trade proof').setRequired(true));

    const proof = new SlashCommandBuilder()
        .setName('proof')
        .setDescription('Show proof of payment')
        .addUserOption(o => o.setName('seller').setDescription('The seller').setRequired(true))
        .addAttachmentOption(o => o.setName('image').setDescription('Proof image').setRequired(true))
        .addStringOption(o => o.setName('payment').setDescription('Payment method').setRequired(true))
        .addIntegerOption(o => o.setName('count').setDescription('Proof count').setRequired(true));

    await client.application.commands.set([vouch, proof]);
});

client.on(Events.InteractionCreate, async i => {
    // Only handle Chat Input (Slash Commands)
    if (!i.isChatInputCommand()) return;

    // Vouch Command
    if (i.commandName === 'vouch') {
        const s = i.options.getMember('seller');
        const b = i.options.getUser('buyer');
        const o = i.options.getString('order');
        const r = i.options.getInteger('rating');
        const p = i.options.getAttachment('proof');

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle('new vouch ♡')
            .setDescription(`**<:01000white:1478542843801768149> seller :** ${s}\n**<:01000white:1478542843801768149> buyer :** ${b}\n**<:01000white:1478542843801768149> order :** ${o}\n**<:01000white:1478542843801768149> rating :** ${r}\n**<:01000white:1478542843801768149> trade proof :** [${p.name}](${p.url})`)
            .setImage('https://cdn.discordapp.com/attachments/1483632845170675905/1483633470172430488/Screenshot_20260303-215910.jpg?ex=69bb4cd7&is=69b9fb57&hm=1aee79ae5185ca0314cec32c393ef37000a7f1fa7689223ce9ebea4e30bfe3e1&')
            .setThumbnail('https://cdn.discordapp.com/attachments/1483632845170675905/1483633524606111844/Screenshot_20260303-221158.jpg?ex=69bb4ce4&is=69b9fb64&hm=0c9b5e7f368ded653c4a1debf5af0e332a8edf5eea8cd64391528ca6dc7b33e0&S');
        
        return await i.reply({ embeds: [embed] });
    }

    // Proof Command
    if (i.commandName === 'proof') {
        const s = i.options.getMember('seller');
        const img = i.options.getAttachment('image');
        const pay = i.options.getString('payment');
        const count = i.options.getInteger('count');

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setDescription(`**<:01000white:1478542843801768149> seller :** ${s}\n**<:01000white:1478542843801768149> proof :** [${img.name}](${img.url})\n**<:01000white:1478542843801768149> Payment :** ${pay}\n**<:01000white:1478542843801768149> proof count :** ${count}`)
            .setImage('https://cdn.discordapp.com/attachments/1483632845170675905/1483633258397700216/Screenshot_20260303-214443.jpg?ex=69bb4ca5&is=69b9fb25&hm=1bda1b3b46ead5e9b8c056d6a1505b862648555b8eea1185110031568b8805db&')
            .setThumbnail('https://cdn.discordapp.com/attachments/1483632845170675905/1483633333635383326/Screenshot_20260303-220917.png?ex=69bb4cb7&is=69b9fb37&hm=25b9a373d4390be7e476d4681e4b52606e640547d9c51adbea42acdfb5b447b3&');
        
        return await i.reply({ embeds: [embed] });
    }
});

client.login('MTQ4MjkyMDMxMzE1NDE3OTIyNQ.GUFz3X.trOpipvhnNDBymKtzN35DK42-GGKJCfYa_ZSH4');



