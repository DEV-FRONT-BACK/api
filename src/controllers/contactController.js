import Contact from '../models/Contact.js';
import User from '../models/User.js';

export const requestContact = async (req, res) => {
  try {
    const { contactId } = req.body;

    if (!contactId) {
      return res.status(400).json({
        error: 'ID du contact requis',
      });
    }

    if (contactId === req.userId.toString()) {
      return res.status(400).json({
        error: "Impossible de s'ajouter soi-même",
      });
    }

    const contactUser = await User.findById(contactId);
    if (!contactUser) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
      });
    }

    const existingContact = await Contact.findOne({
      $or: [
        { userId: req.userId, contactId: contactId },
        { userId: contactId, contactId: req.userId },
      ],
    });

    if (existingContact) {
      return res.status(400).json({
        error: 'Relation de contact existante',
        status: existingContact.status,
      });
    }

    const contact = await Contact.create({
      userId: req.userId,
      contactId: contactId,
      status: 'pending',
      initiatedBy: req.userId,
    });

    await Contact.create({
      userId: contactId,
      contactId: req.userId,
      status: 'pending',
      initiatedBy: req.userId,
    });

    const populatedContact = await Contact.findById(contact._id)
      .populate('userId', 'username email avatar')
      .populate('contactId', 'username email avatar');

    res.status(201).json({
      message: 'Demande de contact envoyée',
      contact: populatedContact.toPublicJSON(),
    });
  } catch (error) {
    console.error('Erreur requestContact:', error);
    res.status(500).json({
      error: 'Erreur serveur',
    });
  }
};

export const acceptContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        error: 'Demande de contact non trouvée',
      });
    }

    if (contact.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        error: 'Non autorisé',
      });
    }

    if (contact.status !== 'pending') {
      return res.status(400).json({
        error: "La demande n'est pas en attente",
      });
    }

    contact.status = 'accepted';
    await contact.save();

    const reciprocalContact = await Contact.findOne({
      userId: contact.contactId,
      contactId: contact.userId,
    });

    if (reciprocalContact) {
      reciprocalContact.status = 'accepted';
      await reciprocalContact.save();
    }

    const populatedContact = await Contact.findById(contact._id)
      .populate('userId', 'username email avatar')
      .populate('contactId', 'username email avatar');

    res.status(200).json({
      message: 'Contact accepté',
      contact: populatedContact.toPublicJSON(),
    });
  } catch (error) {
    console.error('Erreur acceptContact:', error);
    res.status(500).json({
      error: 'Erreur serveur',
    });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        error: 'Contact non trouvé',
      });
    }

    if (contact.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        error: 'Non autorisé',
      });
    }

    await Contact.deleteOne({ _id: contact._id });

    await Contact.deleteOne({
      userId: contact.contactId,
      contactId: contact.userId,
    });

    res.status(200).json({
      message: 'Contact supprimé',
    });
  } catch (error) {
    console.error('Erreur deleteContact:', error);
    res.status(500).json({
      error: 'Erreur serveur',
    });
  }
};

export const getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contacts = await Contact.find({
      userId: req.userId,
      status: 'accepted',
    })
      .populate('contactId', 'username email avatar online lastSeen')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments({
      userId: req.userId,
      status: 'accepted',
    });

    res.status(200).json({
      contacts: contacts.map((c) => ({
        id: c._id,
        contact: c.contactId,
        status: c.status,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Erreur getContacts:', error);
    res.status(500).json({
      error: 'Erreur serveur',
    });
  }
};

export const getPendingContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({
      userId: req.userId,
      status: 'pending',
    })
      .populate('contactId', 'username email avatar')
      .populate('initiatedBy', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      contacts: contacts.map((c) => ({
        id: c._id,
        contact: c.contactId,
        status: c.status,
        initiatedBy: c.initiatedBy,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    console.error('Erreur getPendingContacts:', error);
    res.status(500).json({
      error: 'Erreur serveur',
    });
  }
};

export const blockContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        error: 'Contact non trouvé',
      });
    }

    if (contact.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        error: 'Non autorisé',
      });
    }

    contact.status = 'blocked';
    await contact.save();

    res.status(200).json({
      message: 'Contact bloqué',
      contact: contact.toPublicJSON(),
    });
  } catch (error) {
    console.error('Erreur blockContact:', error);
    res.status(500).json({
      error: 'Erreur serveur',
    });
  }
};

export const unblockContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        error: 'Contact non trouvé',
      });
    }

    if (contact.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        error: 'Non autorisé',
      });
    }

    if (contact.status !== 'blocked') {
      return res.status(400).json({
        error: "Le contact n'est pas bloqué",
      });
    }

    contact.status = 'accepted';
    await contact.save();

    res.status(200).json({
      message: 'Contact débloqué',
      contact: contact.toPublicJSON(),
    });
  } catch (error) {
    console.error('Erreur unblockContact:', error);
    res.status(500).json({
      error: 'Erreur serveur',
    });
  }
};

export const getBlockedContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({
      userId: req.userId,
      status: 'blocked',
    })
      .populate('contactId', 'username email avatar')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      contacts: contacts.map((c) => ({
        id: c._id,
        contact: c.contactId,
        status: c.status,
        blockedAt: c.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Erreur getBlockedContacts:', error);
    res.status(500).json({
      error: 'Erreur serveur',
    });
  }
};
