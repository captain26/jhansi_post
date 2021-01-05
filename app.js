const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");


var fs = require('fs'); 
var path = require('path'); 
var multer = require('multer'); 

const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');



var check = 0;

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
const mongoURI = "mongodb+srv://admin123:admin123@cluster0.2vggz.mongodb.net/admindb?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.set("useCreateIndex", true);

mongoose.set('useUnifiedTopology', true);

// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = file.originalname;
      const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
      };
      resolve(fileInfo);
    });
  }
});
const upload = multer({ storage });

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);
app.get("/admin/xyz",(req,res) => {
  if(check === 1){
    
  }
})
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/business", (req, res) => {
  res.render("business");
});

app.get("/aboutus", (req, res) => {
  res.render("aboutus");
});

app.get("/contactus", (req, res) => {
  res.render("contactus");
});

app.get("/index-inner", (req, res) => {
  res.render("index-inner");
});

app.get("/admin", (req, res) => {
    if(check === 1){
        res.redirect("/admin/dashboard");
    }else{
        res.render("admin");
    }
});

app.get("/admin/dashboard", function (req, res) {
  if (check === 1) {
    res.render("dashboard");
  } else {
    res.redirect("/admin");
  }
});


app.get("/logout", function (req, res) {
  check = 0;
  res.redirect("/admin");
});

app.post("/admin", (req, res) => {
  if(req.body.email === "admin"){
    if(req.body.password === "admin"){
      check = 1;
      res.redirect("/admin/dashboard");
    }else{
      res.redirect("/admin");
    }
  }else{
    res.redirect("/admin");
  }
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server started at port 3000.");
});