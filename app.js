//pass-uURcwPAcfKzO5AZP (atlas)
//user-ik6141333
//db-link =mongodb+srv://ik6141333:uURcwPAcfKzO5AZP@cluster0.0hjjx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const user = require("./routes/user.js");

app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate);
app.use(methodOverride("_method"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const dbUrl = process.env.ATLASDB_URL;

main()
  .then((result) => {
    console.log("mongoose connected");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  //await mongoose.connect("mongodb://127.0.0.1:27017/airbnb");
  await mongoose.connect(dbUrl);
}

//store session to deploy through connect-mongo
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error in mongodb session store");
});
//add session id throw cookies
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, //it saves to cross scripting attack
  },
};

app.use(session(sessionOptions)); //to create session id
app.use(flash()); //to send message

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); //store user data of session
passport.deserializeUser(User.deserializeUser()); //remove

app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.get("/demo", async (req, res) => {
//   let fakeUser = new User({
//     email: "fakeUser@gmail.com",
//     username: "delta-student",
//   });

//   let registeredUser = await User.register(fakeUser, "helloword");
//   res.send(registeredUser);
// });

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", user);

// app.get("/", (req, res) => {
//   res.send("hii !!!!");
// });

//middleware err handler.
// app.use((err, req, res, next) => {
//   res.send("something went wrong");
// });

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page not found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;
  //res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("listing on port 8080");
});
