const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "uncle",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/adminDB", {
  useNewUrlParser: true,
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/sports", (req, res) => {
  res.render("sports");
});
app.get("/Local", (req, res) => {
  res.render("local");
});
app.get("/National", (req, res) => {
  res.render("national");
});
app.get("/admin", (req, res) => {
    if(req.isAuthenticated()){
        res.redirect("/admin/dashboard");
    }else{
        res.render("admin");
    }
});

app.get("/admin/dashboard", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("dashboard");
  } else {
    res.render("register");
  }
});

app.get("/admin/register", (req, res) => {
    if(req.isAuthenticated()){
        res.redirect("/admin/dashboard");
    }else{
        res.render("register");
    }
});

app.get("/logout", function (req, res) {
  req.logout();
  req.session.destroy(function () {
    res.clearCookie("connect.sid");
    res.redirect("/admin");
  });
});

app.post("/admin", (req, res) => {
  const user = new User({
    username: req.body.email,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
      res.redirect("/admin");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/admin/dashboard");
      });
    }
  });
});
app.post("/admin/register", (req, res) => {
  User.register(
    { username: req.body.email },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/admin/dashboard");
        });
      }
    }
  );
});

app.listen(3000, function () {
  console.log("server port 3000 is working");
});
