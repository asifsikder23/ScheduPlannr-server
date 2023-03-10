const express = require("express");
const app = express();
require("dotenv").config();
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  ObjectID,
} = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4p5kw6q.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// JWT Token
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (er, decoded) {
    if (er) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    // membership collection
    const membershipCollection = client
      .db("ScheduPlannr")
      .collection("membership");
    const notesCollection = client.db("ScheduPlannr").collection("notes");

    const blogsCollection = client.db("ScheduPlannr").collection("blogs");

    // User
    const userCollection = client.db("ScheduPlannr").collection("users");

    //time slots collection
    const fifteenMinsAmCollection = client
      .db("ScheduPlannr")
      .collection("fifteenMinsAM");
    const fifteenMinsPmCollection = client
      .db("ScheduPlannr")
      .collection("fifteenMinsPM");
    const thirtyMinsAmCollection = client
      .db("ScheduPlannr")
      .collection("thirtyMinsAM");
    const thirtyMinsPmCollection = client
      .db("ScheduPlannr")
      .collection("thirtyMinsPM");
    const sixtyMinsAMCollection = client
      .db("ScheduPlannr")
      .collection("sixtyMinsAM");
    const sixtyMinsPmCollection = client
      .db("ScheduPlannr")
      .collection("sixtyMinsPM");
    //Create Schedule
    const createSchedulee = client
      .db("ScheduPlannr")
      .collection("scheduleCreate");

    // Team
    const teamCollection = client.db("ScheduPlannr").collection("team");

    const availability = client.db("ScheduPlannr").collection("availability");


    // const checkBox = client.db("ScheduPlannr").collection("checkBox");

    // Users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const email = user.email;
      const query = { email: email };
      const isExist = await userCollection.findOne(query);
      if (!isExist) {
        const result = await userCollection.insertOne(user);
        res.send(result);
      }
      res.send({ message: "This user already exist!" });
    });



    // JWT Token
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      console.log(user);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1d",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

    app.get("/users", async (req, res) => {
      const query = {};
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/user", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = userCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/user/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectID(id) };
      const result = await userCollection.findOne(query);
      res.send(result);
    });
    app.patch("/user/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const user = req.body;
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          name: user.name,
          lastName: user.lastName,
          image: user.image,
          birthDate: user.birthDate,
          contactNumber: user.contactNumber,
          currentAddress: user.currentAddress,
          permanentAddress: user.permanentAddress,
          gender: user.gender,
          profession: user.profession,
          about: user.about,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, option);
      res.send(result);
    });
    app.put("/user/admin/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // admin
    app.get("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });
    // Delete users
    app.delete("/user/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // Membership
    app.get("/membership", async (req, res) => {
      const query = {};
      const result = await membershipCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/membership/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      console.log(query);
      const membership = await membershipCollection.findOne(query);
      console.log(membership);
      res.send(membership);
    });

    // Add notes
    app.post("/notes", async (req, res) => {
      const query = req.body;
      const result = await notesCollection.insertOne(query);
      res.send(result);
    });

    // get notes
    app.get("/notes", async (req, res) => {
      const query = {};
      const cursor = await notesCollection
        .find(query)
        .sort({ $natural: -1 })
        .toArray();
      res.send(cursor);
    });

    app.get("/notes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = await notesCollection.findOne(query);
      res.send(cursor);
    });

    // delete note
    app.delete("/notes/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await notesCollection.deleteOne(query);
      res.send(result);
    });

    // get 15mins time slots AM
    app.get("/fifteenMinsAM", async (req, res) => {
      const query = {};
      const cursor = await fifteenMinsAmCollection.find(query).toArray();
      res.send(cursor);
    });

    // get 15mins time slots PM
    app.get("/fifteenMinsPM", async (req, res) => {
      const query = {};
      const cursor = await fifteenMinsPmCollection.find(query).toArray();
      res.send(cursor);
    });

    // get 30mins time slots AM
    app.get("/thirtyMinsAM", async (req, res) => {
      const query = {};
      const cursor = await thirtyMinsAmCollection.find(query).toArray();
      res.send(cursor);
    });

    // get 30mins time slots PM
    app.get("/thirtyMinsPM", async (req, res) => {
      const query = {};
      const cursor = await thirtyMinsPmCollection.find(query).toArray();
      res.send(cursor);
    });

    // get 60mins time slots AM
    app.get("/sixtyMinsAM", async (req, res) => {
      const query = {};
      const cursor = await sixtyMinsAMCollection.find(query).toArray();
      res.send(cursor);
    });

    // get 60mins time slots PM
    app.get("/sixtyMinsPM", async (req, res) => {
      const query = {};
      const cursor = await sixtyMinsPmCollection.find(query).toArray();
      res.send(cursor);
    });

    //create schedule
    // app.post("/createSchedule", async (req, res) => {
    //   const schedule = req.body;
    //   const query = {
    //     email: schedule.email,
    //     // slot: schedule.slot,
    //     // slotPm: schedule.slotPm,
    //   };
    //   const alreadyBooked = await createSchedule.find(query).toArray();
    //   // if (alreadyBooked.length) {
    //   //   const message = `You have already booked on ${schedule.slot || schedule.slotPm
    //   //     }`;
    //   //   return res.send({ acknowledged: false, message });
    //   // }
    //   const result = await createSchedule.insertOne(schedule);
    //   res.send(result);
    // });

    app.post("/createSchedulee", async (req, res) => {
      const schedule = req.body;
      const result = await createSchedulee.insertOne(schedule);
      res.send(result);
    })

    // update schedule
    app.put("/createSchedulee/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {
        _id: ObjectId(id),
      };
      const schedule = req.body;
      const option = { upsert: true };
      const updateSchedule = {
        $set: {
          name: schedule.name,
          email: schedule.email,
          description: schedule.description,
          link: schedule.link,
          location: schedule.location,
          title: schedule.title,
          organization: schedule.organization,
          phone: schedule.phone,
        },
      };
      const result = await createSchedulee.updateOne(
        filter,
        updateSchedule,
        option
      );
      res.send(result);
    });

    // delete schedule
    app.delete("/createSchedulee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await createSchedulee.deleteOne(query);
      res.send(result);
    });

    //my Schedule
    app.get("/mySchedule", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const mySchedule = await createSchedulee.find(query).toArray();
      res.send(mySchedule);
    });

    // team
    app.post("/team", async (req, res) => {
      const user = req.body;
      const result = await teamCollection.insertOne(user);
      res.send(result);
    });

    app.get("/team", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await teamCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/team/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await teamCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/team/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const filter = {
        _id: ObjectId(id),
      };
      const team = req.body;
      const option = { upsert: true };
      const updateTeam = {
        $set: {
          name: team.name,
          email: team.email,
          name1: team.name1,
          email1: team.email1,
          name2: team.name2,
          email2: team.email,
          name3: team.name,
          email3: team.email,
          name4: team.name,
          email4: team.email,
        },
      };
      const result = await teamCollection.updateOne(filter, updateTeam, option);
      res.send(result);
    });

    // payment
    app.post("/create-payment-intent", async (req, res) => {
      const price = req.body?.cost;
      const amount = Number(price * 100);
      if (amount) {
        const paymentIntent = await stripe.paymentIntents.create({
          currency: "usd",
          amount: amount,
          payment_method_types: ["card"],
        });
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      }
    });
    // add blog
    app.post("/blogs", verifyJWT, async (req, res) => {
      const query = req.body;
      const result = await blogsCollection.insertOne(query);
      res.send(result);
    });
    app.get("/blogs", async (req, res) => {
      const query = {};
      const result = await blogsCollection.find(query).toArray();
      res.send(result);
    });

    //user delete
    app.delete("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await blogsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/blogPost/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = await blogsCollection.findOne(query);
      res.send(cursor);
    });

    //post schedule from schedule availability
    app.post("/availability", async (req, res) => {
      const query = req.body;
      const result = await availability.insertOne(query);
      res.send(result);
    });

    app.get("/weeklySchedule", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await availability.find(query).toArray();
      res.send(result);
    })

    app.get("/weeklySchedule/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = await availability.findOne(query);
      res.send(cursor);
    })

    //Yeasin Arafat
    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "syntaxterminators7@gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    // Endpoint for processing orders
    app.post("/scheduleCreate", (req, res) => {
      console.log(req.body);
      const { name, email, organization, link, slot, value } = req.body;

      // Send email notification
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Schedule Confirmation",
        text:
          `Hi ${name},
        Your organization name is ${organization}. It will be start on ${value
            ?.toString()
            .slice(0, 15)} at ${slot} and 
          Your Meeting Link is ${link}`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).send("Error sending email");
        } else {
          console.log("Email sent: " + info.response);
          res.send("Order confirmation email sent");
        }
      });
    });
    //payment
    app.post("/paymentMessage", (req, res) => {
      const { paymentIntent, name, email } = req.body;
      console.log(paymentIntent, email);
      const { amount } = paymentIntent;
      // Send email notification
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Payment Confirmation",
        text:
          `Hi
        ${name}, 
        Your payment of $${amount / 100} has been successful.
        Visit Our Website : https://schedu-plannr.web.app/

        Thank You for purchasing plan.
        
        ScheduPlannr`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).send("Error sending email");
        } else {
          console.log("Email sent: " + info.response);
          res.send("Payment confirmation email sent");
        }
      });
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
// io.listen(portIo, () => { })