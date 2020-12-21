const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


app.get("/",(req,res) =>{
    res.render("home");
})

app.get("/sports",(req,res) => {
    res.render("sports");
})
app.get("/Local",(req,res) => {
    res.render("local");
})
app.get("/National",(req,res) => {
    res.render("national");
})



app.listen(3000, function() {
    console.log("server port 3000 is working");
})