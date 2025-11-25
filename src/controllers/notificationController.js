import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 50, unreadOnly = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { userId: req.userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate('fromUser', 'username email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: req.userId,
      read: false,
    });

    res.status(200).json({
      notifications: notifications.map((n) => ({
        id: n._id,
        type: n.type,
        relatedId: n.relatedId,
        fromUser: n.fromUser,
        read: n.read,
        content: n.content,
        createdAt: n.createdAt,
      })),
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Erreur getNotifications:', error);
    res.status(500).json({
      error: 'Erreur serveur',
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        error: 'Notification non trouvée',
      });
    }

    if (notification.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        error: 'Non autorisé',
      });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      message: 'Notification marquée comme lue',
      notification: notification.toPublicJSON(),
    });
  } catch (error) {
    console.error('Erreur markAsRead:', error);
    res.status(500).json({
      error: 'Erreur serveur',
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany({ userId: req.userId, read: false }, { read: true });

    res.status(200).json({
      message: 'Toutes les notifications marquées comme lues',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Erreur markAllAsRead:', error);
    res.status(500).json({
      error: 'Erreur serveur',
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        error: 'Notification non trouvée',
      });
    }

    if (notification.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        error: 'Non autorisé',
      });
    }

    await Notification.deleteOne({ _id: id });

    res.status(200).json({
      message: 'Notification supprimée',
    });
  } catch (error) {
    console.error('Erreur deleteNotification:', error);
    res.status(500).json({
      error: 'Erreur serveur',
    });
  }
};
