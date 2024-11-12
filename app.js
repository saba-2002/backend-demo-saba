require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const AWS = require('aws-sdk');
const app = express();

app.use(cors());
app.use(express.json());

// Set up AWS Secrets Manager
const client = new AWS.SecretsManager({
  region: 'us-east-1', // Set your region
});

// Function to retrieve MongoDB URI from AWS Secrets Manager
async function getMongoURI() {
  try {
    const data = await client.getSecretValue({ SecretId: 'myapp/mongouri' }).promise();
    if ('SecretString' in data) {
      const secret = JSON.parse(data.SecretString);
      return secret.MONGO_URI;
    }
  } catch (err) {
    console.error("Error retrieving MongoDB URI from Secrets Manager:", err);
    throw err;
  }
}

// Connect to MongoDB Atlas
(async () => {
  const mongoURI = await getMongoURI();
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));
})();

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

app.post('/api/contact', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json({ message: 'Thank you for contacting us!' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
