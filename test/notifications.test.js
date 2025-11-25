import { expect } from 'chai';
import mongoose from 'mongoose';
import Contact from '../src/models/Contact.js';
import Notification from '../src/models/Notification.js';
import { createLoggedClient } from './helpers/client.ts';

describe("Tests d'Intégration - Notifications", () => {
  const USER_1_EMAIL = 'user+1@example.com';
  const USER_2_EMAIL = 'user+2@example.com';
  const USER_1_ID = '650d9c2e5f1b2a00123abcd1';
  const USER_2_ID = '650d9c2e5f1b2a00123abcd2';

  describe('GET /api/notifications', () => {
    it("devrait récupérer les notifications de l'utilisateur", async () => {
      const client1 = await createLoggedClient(USER_1_EMAIL);
      const client2 = await createLoggedClient(USER_2_EMAIL);

      await client1.post('/api/contacts/request').send({ contactId: USER_2_ID });

      const res = await client2.get('/api/notifications');

      expect(res.status).to.equal(200);
      expect(res.body.notifications).to.be.an('array');
      expect(res.body.notifications.length).to.equal(1);
      expect(res.body.notifications[0].type).to.equal('contact_request');
      expect(res.body.unreadCount).to.equal(1);
    });

    it('devrait filtrer les notifications non lues', async () => {
      const client1 = await createLoggedClient(USER_1_EMAIL);
      const client2 = await createLoggedClient(USER_2_EMAIL);

      await client1.post('/api/contacts/request').send({ contactId: USER_2_ID });

      const res = await client2.get('/api/notifications?unreadOnly=true');

      expect(res.status).to.equal(200);
      expect(res.body.notifications).to.be.an('array');
      expect(res.body.notifications.every((n) => !n.read)).to.be.true;
    });

    it('devrait paginer les notifications', async () => {
      const client = await createLoggedClient(USER_1_EMAIL);

      const res = await client.get('/api/notifications?page=1&limit=10');

      expect(res.status).to.equal(200);
      expect(res.body.pagination).to.exist;
      expect(res.body.pagination.page).to.equal(1);
      expect(res.body.pagination.limit).to.equal(10);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('devrait marquer une notification comme lue', async () => {
      const client1 = await createLoggedClient(USER_1_EMAIL);
      const client2 = await createLoggedClient(USER_2_EMAIL);

      await client1.post('/api/contacts/request').send({ contactId: USER_2_ID });

      const notificationsRes = await client2.get('/api/notifications');
      const notificationId = notificationsRes.body.notifications[0].id;

      const res = await client2.put(`/api/notifications/${notificationId}/read`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Notification marquée comme lue');
      expect(res.body.notification.read).to.be.true;
    });

    it('devrait rejeter si non-propriétaire', async () => {
      const client1 = await createLoggedClient(USER_1_EMAIL);
      const client2 = await createLoggedClient(USER_2_EMAIL);

      await client1.post('/api/contacts/request').send({ contactId: USER_2_ID });

      const notificationsRes = await client2.get('/api/notifications');
      const notificationId = notificationsRes.body.notifications[0].id;

      const res = await client1.put(`/api/notifications/${notificationId}/read`);

      expect(res.status).to.equal(403);
      expect(res.body.error).to.equal('Non autorisé');
    });

    it('devrait rejeter une notification inexistante', async () => {
      const client = await createLoggedClient(USER_1_EMAIL);
      const fakeId = new mongoose.Types.ObjectId();

      const res = await client.put(`/api/notifications/${fakeId}/read`);

      expect(res.status).to.equal(404);
      expect(res.body.error).to.equal('Notification non trouvée');
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    it('devrait marquer toutes les notifications comme lues', async () => {
      const client1 = await createLoggedClient(USER_1_EMAIL);
      const client2 = await createLoggedClient(USER_2_EMAIL);

      await client1.post('/api/contacts/request').send({ contactId: USER_2_ID });
      await client1.post('/api/messages').send({ recipient_id: USER_2_ID, content: 'Test' });

      const res = await client2.put('/api/notifications/read-all');

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Toutes les notifications marquées comme lues');
      expect(res.body.modifiedCount).to.be.at.least(1);

      const notificationsRes = await client2.get('/api/notifications');
      expect(notificationsRes.body.unreadCount).to.equal(0);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('devrait supprimer une notification', async () => {
      const client1 = await createLoggedClient(USER_1_EMAIL);
      const client2 = await createLoggedClient(USER_2_EMAIL);

      await client1.post('/api/contacts/request').send({ contactId: USER_2_ID });

      const notificationsRes = await client2.get('/api/notifications');
      const notificationId = notificationsRes.body.notifications[0].id;

      const res = await client2.delete(`/api/notifications/${notificationId}`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Notification supprimée');

      const deletedNotification = await Notification.findById(notificationId);
      expect(deletedNotification).to.be.null;
    });

    it('devrait rejeter si non-propriétaire', async () => {
      const client1 = await createLoggedClient(USER_1_EMAIL);
      const client2 = await createLoggedClient(USER_2_EMAIL);

      await client1.post('/api/contacts/request').send({ contactId: USER_2_ID });

      const notificationsRes = await client2.get('/api/notifications');
      const notificationId = notificationsRes.body.notifications[0].id;

      const res = await client1.delete(`/api/notifications/${notificationId}`);

      expect(res.status).to.equal(403);
      expect(res.body.error).to.equal('Non autorisé');
    });
  });

  describe('Création automatique de notifications', () => {
    it("devrait créer une notification lors d'une demande de contact", async () => {
      const client1 = await createLoggedClient(USER_1_EMAIL);

      await client1.post('/api/contacts/request').send({ contactId: USER_2_ID });

      const notification = await Notification.findOne({
        userId: USER_2_ID,
        type: 'contact_request',
      });

      expect(notification).to.exist;
      expect(notification.fromUser.toString()).to.equal(USER_1_ID);
      expect(notification.read).to.be.false;
    });

    it("devrait créer une notification lors de l'acceptation d'un contact", async () => {
      const client1 = await createLoggedClient(USER_1_EMAIL);
      const client2 = await createLoggedClient(USER_2_EMAIL);

      await client1.post('/api/contacts/request').send({ contactId: USER_2_ID });

      const bobContact = await Contact.findOne({ userId: USER_2_ID, contactId: USER_1_ID });
      await client2.put(`/api/contacts/${bobContact._id}/accept`);

      const notification = await Notification.findOne({
        userId: USER_1_ID,
        type: 'contact_accepted',
      });

      expect(notification).to.exist;
      expect(notification.fromUser.toString()).to.equal(USER_2_ID);
    });

    it("devrait créer une notification lors de la réception d'un message", async () => {
      const client = await createLoggedClient(USER_1_EMAIL);

      await client.post('/api/messages').send({
        recipient_id: USER_2_ID,
        content: 'Test notification',
      });

      const notification = await Notification.findOne({
        userId: USER_2_ID,
        type: 'message',
      });

      expect(notification).to.exist;
      expect(notification.fromUser.toString()).to.equal(USER_1_ID);
      expect(notification.content).to.include('Test notification');
    });
  });
});
