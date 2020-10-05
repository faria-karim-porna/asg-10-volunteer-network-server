const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qs1yz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());

const port = 5000;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const homeEventsCollection = client.db("volunteerNetwork").collection("homeEvents");
  const userEventsCollection = client.db("volunteerNetwork").collection("userEvents");
  const adminEventsCollection = client.db("volunteerNetwork").collection("adminEvents");

  app.post('/addFakeData', (req, res) => {
      const homeEvents = req.body;
      homeEventsCollection.insertMany(homeEvents)
      .then(result => {
          console.log(result.insertedCount);
          res.send(result.insertedCount)
      })
  })

  app.get('/fakeData', (req, res) => {
      homeEventsCollection.find({})
      .toArray( (err, documents) => {
          res.send(documents);
      })
  })

  app.post('/userRegistration', (req, res) => {
      const newRegistration = req.body;
      userEventsCollection.insertOne(newRegistration)
      .then(result => {
          console.log(result)
      })
  })

  app.get('/personalTask',(req, res) => {
      
      userEventsCollection.find({email: req.query.email})
      .toArray((err, documents) => {
          res.send(documents);
      })
  })

  app.get('/homeData',(req, res) => {
      
     homeEventsCollection.find({activity: req.query.activity})
      .toArray((err, documents) => {
          res.send(documents);
      })
  })

  app.get('/allUsers',(req, res) => {
      
    userEventsCollection.find({})
    .toArray((err, documents) => {
        res.send(documents);
    })
})

app.delete('/deletePersonalTask/:id', (req, res) => {
    userEventsCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then(result => {
        res.send(result.deletedCount > 0);
    })
    //console.log(req.params.id)
})

app.delete('/deleteAllUsers/:id', (req, res) => {
    userEventsCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then(result => {
        res.send(result.deletedCount > 0);
    })
    //console.log(req.params.id)
})

app.post('/addEvent', (req, res) => {
    const newEvent = req.body;
    adminEventsCollection.insertOne(newEvent)
    .then(result => {
        console.log(result)
    })
})

  
  // perform actions on the collection object
  console.log("database connected")
});


app.listen(process.env.PORT || port)