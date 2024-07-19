const { pool } = require("../db.js");
require("dotenv").config();

module.exports.getUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const [result] = await pool.query(
      "SELECT username, email, id FROM users WHERE id NOT IN (?)",
      [userId]
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

module.exports.getUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId.length) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const query = "SELECT id, username, email, image FROM users WHERE id = ?";
    const [response] = await pool.query(query, [userId]);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error", error);
    res.status(500).json({ error: "Failed to retrieve user" });
  }
};

module.exports.getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    if (!senderId || !receiverId) {
      return res.status(400).json({ error: "Missing senderId or receiverId" });
    }

    const query = `
      SELECT * FROM messages
      WHERE (sender_id = ? AND receiver_id = ?)
      OR (sender_id = ? AND receiver_id = ?)
    `;
    const queryParams = [senderId, receiverId, receiverId, senderId];

    const [messages] = await pool.query(query, queryParams);
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error", error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
};

module.exports.getUsersMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const query = `
        SELECT * FROM messages
        WHERE (sender_id = ? OR receiver_id = ?)
      `;
    const queryParams = [userId, userId];

    const [messages] = await pool.query(query, queryParams);

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error", error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
};

module.exports.sendMessage = async (io, userSocketMap, { senderId, receiverId, message }) => {
  try {
      const [newMessage] = await pool.query(
          "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
          [senderId, receiverId, message]
      );

      const messageId = newMessage.insertId;

      console.log("new message id", messageId);

      const [insertedMessage] = await pool.query(
          "SELECT * FROM messages WHERE id = ?",
          [messageId]
      );

      if (!insertedMessage.length) {
          console.error("Failed to retrieve sent message");
          return;
      }

      console.log("Inserted Message:", insertedMessage[0]); // Debugging log
      // console.log("userSocketMap: ", userSocketMap);
      const receiverSocketId = userSocketMap[receiverId];
      console.log("receiverSocketId:", receiverSocketId);
      
      if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", insertedMessage[0]);
      }

      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
          io.to(senderSocketId).emit("newMessage", insertedMessage[0]);
      }
  } catch (error) {
      console.error("ERROR", error);
  }
};





module.exports.messagesReceived = async (io, userSocketMap, { data }) => {
  console.log(`Messages received: ${JSON.stringify(data)}`);
  const sentMessages = data?.filter((message) => message.status == "sent")?.map((message) => message.id);

  if (sentMessages?.length === 0) return;

  const query = "UPDATE messages SET status = 'delivered' WHERE id IN (?)";

  try {
    await pool.query(query, [sentMessages]);
  } catch (error) {
    console.error(`Error updating message status: ${error.message}`);
  }
};

module.exports.messagesSeen = async (io, userSocketMap, { data }) => {
  console.log(`Messages seen: ${JSON.stringify(data)}`);
  const seenMessages = data?.filter((message) => message.status == "delivered")?.map((message) => message.id);

  if (seenMessages.length == 0) {
    console.log("seenMessages have no elements");
    return;
  }

  const query = "UPDATE messages SET status = 'seen' WHERE id IN (?)";

  try {
    await pool.query(query, [seenMessages]);
    console.log(`Updated ${seenMessages.length} messages to 'seen' status`);

    // Emit the update back to the sender
    io.to(userSocketMap[data[0].sender_id]).emit("messages-seen", seenMessages);
  } catch (error) {
    console.error(`Error updating message status: ${error.message}`);
  }
};

module.exports.newMessageSeen = async (io, userSocketMap, { messageId }) => {
  console.log(`New message id: ${messageId}`);

  const query = "UPDATE messages SET status = 'seen' WHERE id = ?";

  try {
    const [result] = await pool.query(query, [messageId]);

    if (result.affectedRows === 0) {
      console.error(`No message found with id: ${messageId}`);
      return;
    }

    console.log(`Updated new message id ${messageId} status to 'seen'`);

    // Find the sender id to emit the event
    const [message] = await pool.query("SELECT sender_id FROM messages WHERE id = ?", [messageId]);

    if (message.length > 0) {
      const senderSocketId = userSocketMap[message[0].sender_id];
      if (senderSocketId) {
        io.to(senderSocketId).emit("new-message-seen", messageId);
      }
    }
  } catch (error) {
    console.error(`Error updating new message status: ${error.message}`);
  }
};

module.exports.newMessageDelivered = async (io, userSocketMap, { messageId }) => {
  console.log(`New message id: ${messageId}`);

  const query = "UPDATE messages SET status = 'delivered' WHERE id = ? AND status = ?";

  try {
    const [result] = await pool.query(query, [messageId, 'sent']);

    if (result.affectedRows === 0) {
      console.error(`No message found with id: ${messageId}`);
      return;
    }

    console.log(`Updated new message id ${messageId} status to 'delivered'`);

    // Find the sender id to emit the event
    const [message] = await pool.query("SELECT sender_id FROM messages WHERE id = ?", [messageId]);

    if (message.length > 0) {
      const senderSocketId = userSocketMap[message[0].sender_id];
      if (senderSocketId) {
        io.to(senderSocketId).emit("new-message-delivered", messageId);
      }
    }
  } catch (error) {
    console.error(`Error updating new message status to delivered: ${error.message}`);
  }
};
