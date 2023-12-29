const express = require('express');
const sharp = require('sharp');
const multer = require('multer');
const path = require('path');
const fs = require("fs");
const { env } = require('process');

const Port = env.TESTPORT || 8080
const app = express();
const port = Port; // Update the port to env port or 8080

// Define a storage location for uploaded files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve the HTML page (don't use express.static here)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle file upload and metadata stripping
app.post('/strip-metadata', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        const imageBuffer = req.file.buffer;

        // Strip Exif metadata using sharp
        const strippedImageBuffer = await sharp(imageBuffer).jpeg().toBuffer();
        const NewPng = await sharp(strippedImageBuffer.buffer).png().toBuffer()

        // Set the response content type to image/jpeg
        res.setHeader('Content-Type', 'image/jpeg');

        // Send the stripped image as a response
        res.send(NewPng);
    } catch (error) {
        console.error('Error stripping metadata:', error);
        res.status(500).send('Error stripping metadata');
    }
});

app.get('/get-port', (req, res) => {
    res.json({ port: Port });
});

app.listen(port, () => {
    console.log(`Meta Remover running on http://localhost:${port}`);
});
