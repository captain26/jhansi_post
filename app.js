const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

var multer = require('multer'); 

const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const { Readable } = require('stream');
const { RSA_NO_PADDING } = require('constants');
const { runInNewContext } = require('vm');

var check = 0;
const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const dbname = "jhansipostdb";

let db;
MongoClient.connect('mongodb+srv://vaibhav412:v12345a@jhansipostcluster.pr2aj.mongodb.net/jhansipostdb', (err, client) => {
  if (err) {
    console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
    process.exit(1);
  }
  console.log("connected")
  db = client.db(dbname);
});

const mongoURI = "mongodb+srv://vaibhav412:v12345a@jhansipostcluster.pr2aj.mongodb.net/jhansipostdb";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: false, // Don't build indexes
  poolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

mongoose.connect(mongoURI, options);

const newsSchema = new mongoose.Schema({
  name: String,
  photo: String,
  category: String,
  title: String,
  content: String
});

const News = new mongoose.model("News", newsSchema);

app.get('/photo/:photoID', (req, res) => {
  try {
    var photoID = new ObjectID(req.params.photoID);
  } catch(err) {
    return res.status(400).json({ message: "Invalid photoID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" }); 
  }
  res.set('content-type', 'jpeg/png');
  res.set('accept-ranges', 'bytes');

  let bucket = new mongodb.GridFSBucket(db, {
    bucketName: 'photos'
  });

  let downloadStream = bucket.openDownloadStream(photoID);

  downloadStream.on('data', (chunk) => {
    res.write(chunk);
  });

  downloadStream.on('error', () => {
    res.sendStatus(404);
  });

  downloadStream.on('end', () => {
    res.end();
  });
});

app.post('/admin/addnews', (req, res) => {
  
  const storage = multer.memoryStorage()
  const upload = multer({ storage: storage});
  upload.single('photo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: "Upload Request Validation Failed" });
    } else if(!req.body.name) {
      return res.status(400).json({ message: "No photo name in request body" });
    }
  
    let photoName = req.body.name;
  
    // Covert buffer to Readable Stream
    const readableTrackStream = new Readable();
    readableTrackStream.push(req.file.buffer);
    readableTrackStream.push(null);

    let bucket = new mongodb.GridFSBucket(db, {
      bucketName: 'photos'
    });

    let uploadStream = bucket.openUploadStream(photoName);
    let id = uploadStream.id;
    readableTrackStream.pipe(uploadStream);

    uploadStream.on('error`', () => {
      return res.status(500).json({ message: "Error uploading file" });
    });

    uploadStream.on('finish', () => {
      return res.redirect("/");
    }); 

    var post = new News({ 
      name: req.body.name,
      photo: id,
      category: req.body.category,
      title: req.body.title,
      content: req.body.content
    });

    post.save(function(err, news) {
      if (err) return console.error(err);
      console.log("News inserted successfully!");
    });
  });

});

app.get("/", (req, res) => {
  News.find({}, function (err, news) {
    res.render("home" , {news: news});
  });
});

app.get("/news/:newsId", (req, res) => {
  const requestedNewsId = req.params.newsId;
  News.findOne({ _id: requestedNewsId }, function (err, news) {
    console.log(news);
    res.render("index-inner");
  });
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