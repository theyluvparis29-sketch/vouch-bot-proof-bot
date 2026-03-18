const express = require('express');
const app = express();

// Keep-alive server for Render
app.get('/', (req, res) => res.send('Vouch and Proof Bots are Online!'));
app.listen(3000, () => console.log('✅ Web server is ready on port 3000!'));

const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, Events } = require('discord.js');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds] 
});

// Anti-crash system: logs errors instead of stopping the bot
process.on('unhandledRejection', error => console.error('Unhandled promise rejection:', error));

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

    try {
        await client.application.commands.set([vouch, proof]);
        console.log('✅ Slash commands registered successfully.');
    } catch (err) {
        console.error('❌ Failed to register commands:', err);
    }
});

client.on(Events.InteractionCreate, async i => {
    if (!i.isChatInputCommand()) return;

    // Use deferReply to prevent "Interaction Failed" errors if Discord is slow
    await i.deferReply().catch(err => console.error("Error deferring reply:", err));

    try {
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
                .setDescription(`**seller :** ${s}\n**buyer :** ${b}\n**order :** ${o}\n**rating :** ${r}\n**trade proof :** [${p.name}](${p.url})`)
                .setImage('https://i.imgur.com') // Use permanent links
                .setThumbnail('https://i.imgur.com');
            
            return await i.editReply({ embeds: [embed] });
        }

        // Proof Command
        if (i.commandName === 'proof') {
            const s = i.options.getMember('seller');
            const img = i.options.getAttachment('image');
            const pay = i.options.getString('payment');
            const count = i.options.getInteger('count');

            const embed = new EmbedBuilder()
                .setColor(0x2b2d31)
                .setDescription(`**seller :** ${s}\n**proof :** [${img.name}](${img.url})\n**Payment :** ${pay}\n**proof count :** ${count}`)
                .setImage('https://i.imgur.com')
                .setThumbnail('https://i.imgur.com');
            
            return await i.editReply({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Execution error:', error);
        await i.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// Use Environment Variables for security
client.login(process.env.TOKEN);
