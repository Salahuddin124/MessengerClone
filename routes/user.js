const express = require("express");
const router = express.Router();
const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");

router.post("/register", async (req, res) => {
  const { email, name, password } = req.body;
  console.log(req.body)
  try {
    const user = new User({ name, email, password });
    await user.save();
    res.status(200).send({name,email,password , user});
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body)
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    res.status(200).send({ message: "Login successful", user });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/send-request", async (req, res) => {
  const { senderEmail, receiverEmail } = req.body;
  try {
    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });

    if (!receiver) {
      return res.status(404).send({ message: "Receiver not found" });
    }

    const friendRequest = new FriendRequest({
      sender: sender._id,
      receiver: receiver._id,
    });
    await friendRequest.save();
    res.status(201).send(friendRequest);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/accept-request", async (req, res) => {
  const { requestId } = req.body;
  try {
    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).send({ message: "Request not found" });
    }

    if (request.status === "accepted") {
      return res.status(400).send({ message: "Request already accepted" });
    }

    request.status = "accepted";
    await request.save();

    const sender = await User.findById(request.sender);
    const receiver = await User.findById(request.receiver);

    if (!sender.contacts.includes(receiver._id)) {
      sender.contacts.push(receiver._id);
    }
    if (!receiver.contacts.includes(sender._id)) {
      receiver.contacts.push(sender._id);
    }

    await sender.save();
    await receiver.save();

    const pendingRequestsCount = await FriendRequest.countDocuments({
      receiver: receiver._id,
      status: "pending",
    });

    res
      .status(200)
      .send({
        message: "Friend request accepted",
        sender,
        receiver,
        pendingRequestsCount,
      });
  } catch (error) {
    res.status(400).send(error);
  }
});


router.get("/:receiverEmail/received-requests", async (req, res) => {
  const { receiverEmail } = req.params;

  try {
    // Find the receiver user based on the email
    const receiver = await User.findOne({ email: receiverEmail });

    if (!receiver) {
      return res.status(404).send({ message: "Receiver not found" });
    }

    // Find pending friend requests for the receiver
    const requests = await FriendRequest.find({
      receiver: receiver._id,
      status: "pending"
    }).populate("sender", "name email");
console.log(requests)
    res.status(200).send(requests);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/:userId/pending-requests-count", async (req, res) => {
  const { userId } = req.params;
  try {
    const count = await FriendRequest.countDocuments({
      receiver: userId,
      status: "pending",
    });

    res.status(200).send({ count });
  } catch (error) {
    res.status(400).send(error);
  }
});
router.post("/friend-requests/:requestId/accept", async (req, res) => {
  const { requestId } = req.params;
  console.log(requestId)
  
  try {
    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).send({ message: "Request not found" });
    }

    if (request.status === "accepted") {
      return res.status(400).send({ message: "Request already accepted" });
    }

    request.status = "accepted";
    await request.save();

    const sender = await User.findById(request.sender);
    const receiver = await User.findById(request.receiver);

    if (!sender.contacts.includes(receiver._id)) {
      sender.contacts.push(receiver._id);
    }
    if (!receiver.contacts.includes(sender._id)) {
      receiver.contacts.push(sender._id);
    }

    await sender.save();
    await receiver.save();

    res.status(200).send({
      message: "Friend request accepted",
      sender,
      receiver,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Reject friend request
router.delete("/friend-requests/:requestId/reject", async (req, res) => {
  const { requestId } = req.params;
  console.log(requestId)

  try {
    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).send({ message: "Request not found" });
    }

    await FriendRequest.findByIdAndDelete(requestId);

    res.status(200).send({ message: "Friend request rejected" });
  } catch (error) {
    res.status(400).send(error);
  }
});
router.get("/:userEmail/contacts", async (req, res) => {
  const { userEmail } = req.params;
  
  try {
    const user = await User.findOne({ email: userEmail }).populate("contacts", "name email");

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const contacts = user.contacts.map(contact => ({
      name: contact.name,
      email: contact.email,
    }));

    res.status(200).send(contacts);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;