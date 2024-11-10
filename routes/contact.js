const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.status(200).json({ message: 'Contact information saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save contact information' });
  }
});

module.exports = router;
