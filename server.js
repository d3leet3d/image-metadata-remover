const express = require('express');
const sharp = require('sharp');
const multer = require('multer');
const path = require('path');
const { env } = require('process');

const app = express();
const port = env.PORT || 8080; 
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});




app.post('/strip-metadata', upload.array('image[]'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No files uploaded.');
        }

        const strippedImageUrls = [];

        for (const file of req.files) {
            const imageBuffer = file.buffer;

            // Strip Exif metadata using sharp
            const strippedImageBuffer = await sharp(imageBuffer).jpeg().toBuffer();
            const newPNG = await sharp(strippedImageBuffer).png().toBuffer();
            const dataUrl = `data:image/png;base64,${newPNG.toString('base64')}`;
            strippedImageUrls.push(dataUrl);
        }
        
        res.json(strippedImageUrls);
    } catch (error) {
        console.error('Error stripping metadata:', error);
        res.status(500).send('Error stripping metadata');
    }
});

// ...


app.listen(port, () => {
    console.log(`MetaData-Remover running at http://localhost:${port}`);
});
