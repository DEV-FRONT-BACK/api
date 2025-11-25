import { expect } from 'chai';
import mongoose from 'mongoose';
import Contact from '../src/models/Contact.js';
import { createLoggedClient } from './helpers/client.ts';

describe("Tests d'Intégration - Contacts", () => {
  const USER_1_EMAIL = 'user+1@example.com';
  const USER_2_EMAIL = 'user+2@example.com';
  const USER_3_EMAIL = 'user+3@example.com';
  const USER_1_ID = '650d9c2e5f1b2a00123abcd1';
  const USER_2_ID = '650d9c2e5f1b2a00123abcd2';

  describe('POST /api/contacts/request', () => {
    it('devrait envoyer une demande de contact', async () => {
      const client = await createLoggedClient(USER_1_EMAIL);
      const res = await client.post('/api/contacts/request').send({ contactId: USER_2_ID });

      expect(res.status).to.equal(201);
      expect(res.body.message).to.equal('Demande de contact envoyée');
      expect(res.body.contact).to.exist;
      expect(res.body.contact.status).to.equal('pending');
    });

    it('devrait rejeter une demande à soi-même', async () => {
      const client = await createLoggedClient(USER_1_EMAIL);
      const res = await client.post('/api/contacts/request').send({ contactId: USER_1_ID });

      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('soi-même');
    });

    it('devrait rejeter un utilisateur inexistant', async () => {
      const client = await createLoggedClient(USER_1_EMAIL);
      const fakeId = new mongoose.Types.ObjectId();
      const res = await client.post('/api/contacts/request').send({ contactId: fakeId });

      expect(res.status).to.equal(404);
      expect(res.body.error).to.equal('Utilisateur non trouvé');
    });

    it('devrait rejeter une demande en double', async () => {
      const client = await createLoggedClient(USER_1_EMAIL);
      await client.post('/api/contacts/request').send({ contactId: USER_2_ID });

      const res = await client.post('/api/contacts/request').send({ contactId: USER_2_ID });

      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('existante');
    });
  });

  describe('PUT /api/contacts/:id/accept', () => {
    it('devrait accepter une demande de contact', async () => {
      const client1 = await createLoggedClient(USER_1_EMAIL);
      const client2 = await createLoggedClient(USER_2_EMAIL);

      await client1.post('/api/contacts/request').send({ contactId: USER_2_ID });

      const bobContact = await Contact.findOne({
        userId: USER_2_ID,
        contactId: USER_1_ID,
      });

      const res = await client2.put(`/api/contacts/${bobContact._id}/accept`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Contact accepté');
      expect(res.body.contact.status).to.equal('accepted');

      const reciprocalContact = await Contact.findOne({
        userId: USER_1_ID,
        contactId: USER_2_ID,
      });
      expect(reciprocalContact.status).to.equal('accepted');
    });

    it('devrait rejeter si non-destinataire', async () => {
      const client1 = await createLoggedClient(USER_1_EMAIL);
      const client3 = await createLoggedClient(USER_3_EMAIL);

      await client1.post('/api/contacts/request').send({ contactId: USER_2_ID });

      const bobContact = await Contact.findOne({
        userId: USER_2_ID,
        contactId: USER_1_ID,
      });

      const res = await client3.put(`/api/contacts/${bobContact._id}/accept`);

      expect(res.status).to.equal(403);
      expect(res.body.error).to.equal('Non autorisé');
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('devrait supprimer un contact', async () => {
      const client = await createLoggedClient(USER_1_EMAIL);
      await client.post('/api/contacts/request').send({ contactId: USER_2_ID });

      const aliceContact = await Contact.findOne({
        userId: USER_1_ID,
        contactId: USER_2_ID,
      });

      await client.delete(`/api/contacts/${aliceContact._id}`);

      const deletedContact = await Contact.findById(aliceContact._id);
      expect(deletedContact).to.be.null;

      const reciprocalContact = await Contact.findOne({
        userId: USER_2_ID,
        contactId: USER_1_ID,
      });
      expect(reciprocalContact).to.be.null;
    });
  });

  describe('GET /api/contacts', () => {
    it('devrait récupérer les contacts acceptés', async () => {
      const client1 = await createLoggedClient(USER_1_EMAIL);
      const client2 = await createLoggedClient(USER_2_EMAIL);

      await client1.post('/api/contacts/request').send({ contactId: USER_2_ID });
      const bobContact = await Contact.findOne({ userId: USER_2_ID, contactId: USER_1_ID });
      await client2.put(`/api/contacts/${bobContact._id}/accept`);

      const res = await client1.get('/api/contacts');

      expect(res.status).to.equal(200);
      expect(res.body.contacts).to.be.an('array');
      expect(res.body.contacts.length).to.equal(1);
      expect(res.body.contacts[0].status).to.equal('accepted');
    });
  });

  describe('GET /api/contacts/pending', () => {
    it('devrait récupérer les demandes en attente', async () => {
      const client1 = await createLoggedClient(USER_1_EMAIL);
      const client2 = await createLoggedClient(USER_2_EMAIL);

      await client1.post('/api/contacts/request').send({ contactId: USER_2_ID });

      const res = await client2.get('/api/contacts/pending');

      expect(res.status).to.equal(200);
      expect(res.body.contacts).to.be.an('array');
      expect(res.body.contacts.length).to.equal(1);
      expect(res.body.contacts[0].status).to.equal('pending');
    });
  });

  describe('POST /api/contacts/:id/block', () => {
    it('devrait bloquer un contact', async () => {
      const client = await createLoggedClient(USER_1_EMAIL);
      await client.post('/api/contacts/request').send({ contactId: USER_2_ID });
      const aliceContact = await Contact.findOne({ userId: USER_1_ID, contactId: USER_2_ID });

      const res = await client.post(`/api/contacts/${aliceContact._id}/block`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Contact bloqué');
      expect(res.body.contact.status).to.equal('blocked');
    });

    it("devrait empêcher un utilisateur bloqué d'envoyer des messages", async () => {
      const client1 = await createLoggedClient(USER_1_EMAIL);
      const client2 = await createLoggedClient(USER_2_EMAIL);

      await client1.post('/api/contacts/request').send({ contactId: USER_2_ID });
      const bobContact = await Contact.findOne({ userId: USER_2_ID, contactId: USER_1_ID });
      await client2.post(`/api/contacts/${bobContact._id}/block`);

      const res = await client1.post('/api/messages').send({ recipient_id: USER_2_ID, content: 'Test' });

      expect(res.status).to.equal(403);
      expect(res.body.error).to.include('ne pouvez pas envoyer');
    });
  });

  describe('POST /api/contacts/:id/unblock', () => {
    it('devrait débloquer un contact', async () => {
      const client = await createLoggedClient(USER_1_EMAIL);
      await client.post('/api/contacts/request').send({ contactId: USER_2_ID });
      const aliceContact = await Contact.findOne({ userId: USER_1_ID, contactId: USER_2_ID });
      await client.post(`/api/contacts/${aliceContact._id}/block`);

      const res = await client.post(`/api/contacts/${aliceContact._id}/unblock`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Contact débloqué');
      expect(res.body.contact.status).to.equal('accepted');
    });
  });

  describe('GET /api/contacts/blocked', () => {
    it('devrait récupérer les contacts bloqués', async () => {
      const client = await createLoggedClient(USER_1_EMAIL);
      await client.post('/api/contacts/request').send({ contactId: USER_2_ID });
      const aliceContact = await Contact.findOne({ userId: USER_1_ID, contactId: USER_2_ID });
      await client.post(`/api/contacts/${aliceContact._id}/block`);

      const res = await client.get('/api/contacts/blocked');

      expect(res.status).to.equal(200);
      expect(res.body.contacts).to.be.an('array');
      expect(res.body.contacts.length).to.equal(1);
      expect(res.body.contacts[0].status).to.equal('blocked');
    });
  });
});
