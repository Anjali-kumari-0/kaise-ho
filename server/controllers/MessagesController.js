import Message from "../models/MessageModel.js";
import User from "../models/UserModel.js";

export const getMessages = async (request, response) => {
  try {
    const user1 = request.userId;
    const user2 = request.body.id;

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });

    // FILTER LOGIC
    const filteredMessages = messages
  .map((msg) => {
    if (msg.isDeletedForEveryone) {
      return { ...msg._doc, content: "This message was deleted" };
    }

    if (msg.deletedFor?.includes(user1)) {
      return null;
    }

    return msg;
  })
  .filter(Boolean);

    return response.status(200).json({ messages: filteredMessages });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
};

export const deleteForMe = async (req, res) => {
  try {
    const { messageId } = req.body;
    const userId = req.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
    }

    await message.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteForEveryone = async (req, res) => {
  try {
    const { messageId } = req.body;
    const userId = req.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not allowed" });
    }

    // ✅ ONLY THIS
    message.isDeletedForEveryone = true;

    await message.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
