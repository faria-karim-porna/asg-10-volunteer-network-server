const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
require("dotenv").config();

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qs1yz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.qs1yz.mongodb.net:27017,cluster0-shard-00-01.qs1yz.mongodb.net:27017,cluster0-shard-00-02.qs1yz.mongodb.net:27017/?ssl=true&replicaSet=atlas-6yqhwu-shard-0&authSource=admin&retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());

const port = 5000;

app.get("/", (req, res) => {
  res.send("hello from db it's working working");
});

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client
  .connect()
  .then((res) => {
    const homeEventsCollection = client.db("volunteerNetwork").collection("homeEvents");
    const userEventsCollection = client.db("volunteerNetwork").collection("userEvents");

    app.post("/addFakeData", (req, res) => {
      const homeEvents = req.body;
      homeEventsCollection.insertMany(homeEvents).then((result) => {
        console.log(result.insertedCount);
        res.send(result.insertedCount);
      });
    });

    app.get("/fakeData", (req, res) => {
      homeEventsCollection.find({}).toArray((err, documents) => {
        res.send(documents);
      });
    });

    app.post("/userRegistration", (req, res) => {
      const newRegistration = req.body;
      userEventsCollection.insertOne(newRegistration).then((result) => {
        res.send(result.insertedCount > 0);
      });
    });

    app.get("/personalTask", (req, res) => {
      userEventsCollection.find({ email: req.query.email }).toArray((err, documents) => {
        res.send(documents);
      });
    });

    app.get("/homeData", (req, res) => {
      homeEventsCollection.find({ activity: req.query.activity }).toArray((err, documents) => {
        res.send(documents);
      });
    });

    app.get("/allUsers", (req, res) => {
      userEventsCollection.find({}).toArray((err, documents) => {
        res.send(documents);
      });
    });

    app.delete("/deletePersonalTask/:id", (req, res) => {
      console.log(req.params.id);
      userEventsCollection.deleteOne({ _id: ObjectId(req.params.id) }).then((result) => {
        res.send(result.deletedCount > 0);
      });
      //console.log(req.params.id)
    });

    app.delete("/deleteAllUsers/:id", (req, res) => {
      userEventsCollection.deleteOne({ _id: ObjectId(req.params.id) }).then((result) => {
        res.send(result.deletedCount > 0);
      });
      //console.log(req.params.id)
    });

    app.post("/addEvent", (req, res) => {
      const newEvent = req.body;
      homeEventsCollection.insertOne(newEvent).then((result) => {
        res.send(result.insertedCount > 0);
      });
    });

    // perform actions on the collection object
    console.log("database connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(process.env.PORT || port);
