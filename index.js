const express = require('express');
const multer = require('multer');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// App setup
const app = express();
const PORT = process.env.PORT || 8000;
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// MongoDB setup
const uri = process.env.MONGO_URI || "mongodb+srv://task-seo:zCYeoNh5FpHVdQfy@cluster0.v58lgaw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let jobCollection, bidsCollection;

// MongoDB connection
async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    jobCollection = client.db('soloSphere').collection('jobs');
    bidsCollection = client.db('soloSphere').collection('bids');
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
run().catch(console.dir);

// Sample route to check MongoDB connection and upload files
app.post('/upload', upload.array('files'), async (req, res) => {
  try {
    const fileData = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      extension: path.extname(file.originalname),
    }));

    const result = await jobCollection.insertMany(fileData);
    res.json({ message: 'Files uploaded successfully', files: result.ops });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
