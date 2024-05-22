const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/testdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// Check if the connection is successful
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", async function () {
  console.log("Connected to MongoDB");

  // Check if the 'persons' collection exists, if not create it with mock data
  const collections = await mongoose.connection.db.listCollections().toArray();
  const personCollection = collections.find((c) => c.name === "persons");

  if (!personCollection) {
    const Person = mongoose.model("Person", personSchema);
    await Person.insertMany([
      { name: "John Doe", age: 30, email: "john.doe@example.com" },
      { name: "Jane Smith", age: 25, email: "jane.smith@example.com" },
      { name: "Bob Johnson", age: 40, email: "bob.johnson@example.com" },
    ]);
    console.log("Mock data inserted into persons collection");
  }
});

// Person Schema and Model
const personSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String,
});

const Person = mongoose.model("Person", personSchema);

// Routes
// List all persons
app.get("/persons", async (req, res) => {
  try {
    const persons = await Person.find();
    res.json(persons);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get person by ID
app.get("/persons/:id", async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) return res.status(404).send("Person not found");
    res.json(person);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Create a new person
app.post("/persons", async (req, res) => {
  try {
    const newPerson = new Person(req.body);
    const savedPerson = await newPerson.save();
    res.status(201).json(savedPerson);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update a person
app.put("/persons/:id", async (req, res) => {
  try {
    const updatedPerson = await Person.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPerson) return res.status(404).send("Person not found");
    res.json(updatedPerson);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a person
app.delete("/persons/:id", async (req, res) => {
  try {
    const deletedPerson = await Person.findByIdAndDelete(req.params.id);
    if (!deletedPerson) return res.status(404).send("Person not found");
    res.json(deletedPerson);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
