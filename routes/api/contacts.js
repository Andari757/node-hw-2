const express = require('express');
const Contact = require('../../models/contact');

const router = (
  express.Router()
);


router.get('/', async (req, res, next) => {
  const contacts = await Contact.find();
  res.json(contacts);
});


router.get('/:contactId', async (req, res, next) => {
  const contact = await Contact.findOne({ _id: req.params.contactId });
  if (contact) {
    res.status(200);
    res.json(contact);
  } else {
    res.status(404);
    res.json({ message: 'not found' });
  }
});


router.post('/', async (req, res, next) => {
  const contact = new Contact(req.body);
  try {
    await contact.save();
    res.status(201);
    res.json(contact);
  }
  catch (e) { next(e) }
});


router.delete('/:contactId', async (req, res, next) => {
  const contact = await Contact.findOne({ _id: req.params.contactId });
  if (contact) {
    await contact.remove();
    res.status(200);
    res.json({ message: 'contact successfully removed' });
  } else {
    res.status(404);
    res.json({ message: 'not found' });
  }
});


router.put('/:contactId', async (req, res, next) => {
  const contact = await Contact.findOne({ _id: req.params.contactId });
  if (contact) {
    Object.assign(contact, req.body);
    await contact.save();
    res.status(200);
    res.json(contact);
  } else {
    res.status(404);
    res.json({ message: 'not found' });
  }
});


router.patch('/:contactId/favorite', async (req, res, next) => {
  const { favorite } = req.body;
  if (typeof favorite !== 'boolean') {
    res.status(400);
    res.json({ message: 'missing field favorite' });
    return;
  }
  const contact = await Contact.findOne({ _id: req.params.contactId });
  if (contact) {
    contact.favorite = favorite;
    await contact.save();
    res.status(200);
    res.json(contact);
  } else {
    res.status(404);
    res.json({ message: 'not found' });
  }
});


module.exports = (
  router
);
