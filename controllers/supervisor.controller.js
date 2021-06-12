const admin = require("firebase-admin");

const model = require("../models/supervisor.model")

const add = async (req, res) => {
  const supervisor = new model(req.body);

  try {
    await admin.auth().setCustomUserClaims(req.body.uid, {
      role: "supervisor",
    });

    await supervisor.save();
    res.status(201).send(supervisor);
  } catch (e) {
    res.status(404).send({ error: "User not found" });
  }
};

module.exports.add = add;

const read = async (req, res) => {
  try {
    if (req.role == 'supervisor') {
      const supervisor = await model.find({ uid: req.uid })
      return res.send(supervisor)
    }
    const supervisors = await model.find({});
    res.send(supervisors);
  } catch (e) {
    res.status(500).send();
  }
};

module.exports.read = read;

const update = async (req, res) => {
  const allowedFields = ["name", "email", "phone"];
  const updates = Object.keys(req.body);
  const supervisor = await model.findOne({ uid: req.params.id });

  const validOperation = updates.every((elem) => allowedFields.includes(elem));
  if (!validOperation) {
    return res.status(400).send({ error: "Invalid operation" });
  }

  try {
    updates.forEach((elem) => (supervisor[elem] = req.body[elem]));
    await supervisor.save();
    res.send(supervisor);
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports.update = update;

const remove = async (req, res) => {
  const supervisor = await model.findOne({ uid: req.params.id });
  try {
    await supervisor.remove();
    res.send(supervisor);
  } catch (e) {
    res.status(404).send(e);
  }
};

module.exports.remove = remove;