const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4p5kw6q.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {

  const usersCollection = client.db("ScheduPlannr").collection("users");
  app.post("/users", async (req, res) => {
    const user = req.body;
    const result = await usersCollection.insertOne(user);
    res.send(result);
  });
app.get('/users', async(req, res)=>{
  const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
})
  try {
    // const usersCollection = client.db("lens-lab").collection("users");
  } finally {
  try {
    const membershipCollection = client.db("ScheduPlannr").collection("membership");
    const notesCollection = client.db("ScheduPlannr").collection("notes");
    //time slots collection
    const fifteenMinsAmCollection = client.db("ScheduPlannr").collection("fifteenMinsAM");
    const fifteenMinsPmCollection = client.db("ScheduPlannr").collection("fifteenMinsPM");
    const thirtyMinsAmCollection = client.db("ScheduPlannr").collection("thirtyMinsAM");
    const thirtyMinsPmCollection = client.db("ScheduPlannr").collection("thirtyMinsPM");
    const sixtyMinsAMCollection = client.db("ScheduPlannr").collection("sixtyMinsAM");
    const sixtyMinsPmCollection = client.db("ScheduPlannr").collection("sixtyMinsPM");


    app.get('/membership', async (req, res) => {
      const query = {}
      const result = await membershipCollection.find(query).toArray();
      res.send(result)
    })

    // Add notes
    app.post('/notes', async (req, res) => {
      const query = req.body;
      const result = await notesCollection.insertOne(query);
      res.send(result);
    })

    // get notes
    app.get('/notes', async (req, res) => {
      const query = {};
      const cursor = notesCollection.find(query);
      const notes = await cursor.toArray();
      res.send(notes)
    })

    // get 15mins time slots AM
    app.get('/fifteenMinsAM', async (req, res) => {
      const query = {};
      const cursor = await fifteenMinsAmCollection.find(query).toArray();
      res.send(cursor);
    })

    // get 15mins time slots PM
    app.get('/fifteenMinsPM', async (req, res) => {
      const query = {};
      const cursor = await fifteenMinsPmCollection.find(query).toArray();
      res.send(cursor);
    })

    // get 30mins time slots AM
    app.get('/thirtyMinsAM', async (req, res) => {
      const query = {};
      const cursor = await thirtyMinsAmCollection.find(query).toArray();
      res.send(cursor);
    })

    // get 30mins time slots PM
    app.get('/thirtyMinsPM', async (req, res) => {
      const query = {};
      const cursor = await thirtyMinsPmCollection.find(query).toArray();
      res.send(cursor);
    })

    // get 60mins time slots AM
    app.get('/sixtyMinsAM', async (req, res) => {
      const query = {};
      const cursor = await sixtyMinsAMCollection.find(query).toArray();
      res.send(cursor);
    })

    // get 60mins time slots PM
    app.get('/sixtyMinsPM', async (req, res) => {
      const query = {};
      const cursor = await sixtyMinsPmCollection.find(query).toArray();
      res.send(cursor);
    })
  }
  finally {

>>>>>>> 4c8c63c9373cfdffeb6022b9d4a172f3f3
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
