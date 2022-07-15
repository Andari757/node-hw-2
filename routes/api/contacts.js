const express = require('express');
const Contact = require('../../models/contact');
const authorize = require("../../middlewares/authorize")
const router = (
  express.Router()
);


router.get('/', authorize, async (req, res, next) => {
  const { _id: owner } = req.user;
  const contacts = await Contact.find({ owner })
    .populate("owner", "email");
  res.json(contacts);
});


router.get('/:contactId', authorize, async (req, res, next) => {
  const { _id: owner } = req.user;
  const contact = await Contact.find({ owner: owner, _id: req.params.contactId })
    .populate("owner", "email");
  if (contact.length > 0) {
    res.status(200);
    res.json(contact);
  } else {
    res.status(404);
    res.json({ message: 'not found' });
  }
});


router.post('/', authorize, async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const contact = await Contact.create({ ...req.body, owner });
    await contact.save();
    res.status(201);
    res.json(contact);
  }
  catch (e) { next(e) }
});


router.delete('/:contactId', authorize, async (req, res, next) => {
  const { _id: owner } = req.user;
  const contact = await Contact.findOneAndRemove({ owner: owner, _id: req.params.contactId });
  if (contact) {
    res.status(200);
    res.json({ message: 'contact successfully removed' });
  } else {
    res.status(404);
    res.json({ message: 'not found' });
  }
});


router.put('/:contactId', authorize, async (req, res, next) => {
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
