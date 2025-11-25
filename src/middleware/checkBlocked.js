import Contact from '../models/Contact.js';

export const checkBlocked = async (req, res, next) => {
  try {
    const { recipient_id, recipientId } = req.body;
    const targetId = recipient_id || recipientId;

    if (!targetId) {
      return next();
    }

    const blockedByRecipient = await Contact.findOne({
      userId: targetId,
      contactId: req.userId,
      status: 'blocked',
    });

    if (blockedByRecipient) {
      return res.status(403).json({
        error: 'Vous ne pouvez pas envoyer de message à cet utilisateur',
      });
    }

    const blockedByUser = await Contact.findOne({
      userId: req.userId,
      contactId: targetId,
      status: 'blocked',
    });

    if (blockedByUser) {
      return res.status(403).json({
        error: 'Vous avez bloqué cet utilisateur',
      });
    }

    next();
  } catch (error) {
    console.error('Erreur checkBlocked:', error);
    res.status(500).json({
      error: 'Erreur serveur',
    });
  }
};
