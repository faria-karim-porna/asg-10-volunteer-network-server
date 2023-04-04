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

app.get("/", (req: any, res: any) => {
  res.send("hello from db it's working working");
});

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client
  .connect()
  .then((res: any) => {
    const homeEventsCollection = client.db("volunteerNetwork").collection("homeEvents");
    const userEventsCollection = client.db("volunteerNetwork").collection("userEvents");

    app.post("/addFakeData", (req: any, res: any) => {
      const homeEvents = req.body;
      homeEventsCollection.insertMany(homeEvents).then((result: any) => {
        console.log(result.insertedCount);
        res.send(result.insertedCount);
      });
    });

    app.get("/fakeData", (req: any, res: any) => {
      homeEventsCollection.find({}).toArray((err: any, documents: any) => {
        res.send(documents);
      });
    });

    app.post("/userRegistration", (req: any, res: any) => {
      const newRegistration = req.body;
      userEventsCollection.insertOne(newRegistration).then((result: any) => {
        res.send(result.insertedCount > 0);
      });
    });

    app.get("/personalTask", (req: any, res: any) => {
      userEventsCollection.find({ email: req.query.email }).toArray((err: any, documents: any) => {
        res.send(documents);
      });
    });

    app.get("/homeData", (req: any, res: any) => {
      homeEventsCollection.find({ activity: req.query.activity }).toArray((err: any, documents: any) => {
        res.send(documents);
      });
    });

    app.get("/allUsers", (req: any, res: any) => {
      userEventsCollection.find({}).toArray((err: any, documents: any) => {
        res.send(documents);
      });
    });

    app.delete("/deletePersonalTask/:id", (req: any, res: any) => {
      console.log(req.params.id);
      userEventsCollection.deleteOne({ _id: ObjectId(req.params.id) }).then((result: any) => {
        res.send(result.deletedCount > 0);
      });
      //console.log(req.params.id)
    });

    app.delete("/deleteAllUsers/:id", (req: any, res: any) => {
      userEventsCollection.deleteOne({ _id: ObjectId(req.params.id) }).then((result: any) => {
        res.send(result.deletedCount > 0);
      });
      //console.log(req.params.id)
    });

    app.post("/addEvent", (req: any, res: any) => {
      const newEvent = req.body;
      homeEventsCollection.insertOne(newEvent).then((result: any) => {
        res.send(result.insertedCount > 0);
      });
    });

    // perform actions on the collection object
    console.log("database connected");
  })
  .catch((err: any) => {
    console.log(err);
  });

app.listen(process.env.PORT || port);
