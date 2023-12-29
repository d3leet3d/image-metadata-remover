const express = require('express');
const sharp = require('sharp');
const multer = require('multer');
const path = require('path');
const { env } = require('process');

const app = express();
const port = env.PORT || 8080; // Default to port 8080 if env.PORT is not defined

// Define a storage location for uploaded files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve the HTML page (don't use express.static here)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ...

// Handle file upload and metadata stripping
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

            // Save the stripped image to a temporary file or cloud storage
            // Generate a URL for the saved image (e.g., using a CDN or local path)
            // For example, you can save to a local path:
            // const savedImagePath = `/path/to/saved/image/${uniqueIdentifier}.png`;
            // fs.writeFileSync(savedImagePath, newPNG);

            // Add the URL to the array
            // strippedImageUrls.push(savedImagePath);

            // For demonstration purposes, we'll use a data URL
            const dataUrl = `data:image/png;base64,${newPNG.toString('base64')}`;
            strippedImageUrls.push(dataUrl);
        }

        // Send the array of image URLs as a JSON response
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
