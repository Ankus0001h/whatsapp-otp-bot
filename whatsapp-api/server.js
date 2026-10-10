const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

const port = 3001;

// Initialize WhatsApp Client with LocalAuth to save session
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('\n==================================================');
    console.log('PLEASE SCAN THIS QR CODE WITH YOUR WHATSAPP APP');
    console.log('==================================================\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('\n==================================================');
    console.log('SUCCESS! WHATSAPP CLIENT IS READY AND CONNECTED!');
    console.log('==================================================\n');
});

client.on('auth_failure', (msg) => {
    console.error('AUTHENTICATION FAILED', msg);
});

client.on('disconnected', (reason) => {
    console.log('Client was disconnected', reason);
});

client.initialize();

// API Endpoint to send messages
app.post('/send-message', async (req, res) => {
    try {
        const { phone, message } = req.body;
        
        if (!phone || !message) {
            return res.status(400).json({ success: false, error: 'Phone and message are required' });
        }

        // WhatsApp IDs usually look like 91XXXXXXXXXX@c.us
        let chatId = phone;
        if (!chatId.endsWith('@c.us')) {
            chatId = `${chatId}@c.us`;
        }

        // Send the message
        await client.sendMessage(chatId, message);
        console.log(`[SUCCESS] Message sent to ${phone}`);
        
        return res.json({ success: true });
    } catch (error) {
        console.error('[ERROR] Failed to send message:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`WhatsApp API Server running at http://localhost:${port}`);
    console.log('Waiting for WhatsApp to initialize...');
});
