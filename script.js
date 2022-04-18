const express = require('express');
const bodyParser = require('body-parser');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new jsdom.JSDOM("")

// const popup = require('popups');

const mongoose = require('mongoose');
const ejs = require('ejs');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/flightsDB");

let userName = '';
var travels = [];
var logFlag = 'Login';

// Travel details schema and class 
const travelSchema = {
    tripPreference: String,
    from: String,
    to: String,
    departingDate: String,
    returningDate: String,
    noOfAdults: Number,
    noOfChildren: Number,
    classPreference: String
}
const Travel = mongoose.model('Travel', travelSchema);

// User details and class
const userSchema = {
    name: String,
    travelDetails: travels
}

const User = mongoose.model('User', userSchema);

app.get('/', function(req, res) {
    
    res.render("index", {userName: userName, logFlag: logFlag});
});

app.get('/login', function(req, res){
    res.render("login");
});

app.get('/bookings', function(req, res){
    User.findOne({name: userName}, function(err, foundList){
        if(foundList == null){
            console.log('bruh');
        }
        else{
            const userTravels = foundList.travelDetails;
            res.render('bookings', {userName: userName, userTravels: userTravels, logFlag: logFlag}); 
        }
    })
    
})

app.post('/', function(req, res){
    const travel = new Travel({
        tripPreference: req.body.tripPreference,
        from: req.body.from,
        to: req.body.to,
        departingDate: req.body.departingDate,
        returningDate: req.body.returningDate,
        noOfAdults: req.body.noOfAdults,
        noOfChildren: req.body.noOfChildren,
        classPreference: req.body.classPreference
    })

    userName = req.body.userName.trim();

    User.findOne({name: userName}, function(err, foundUser1){
        if(foundUser1 == null){
            travels.push(travel);
            
            const user = new User({
                name: userName,
                travelDetails: travels
            })

            user.save();

            travels = [];
        }
        else{
            foundUser1.travelDetails.push(travel);
            foundUser1.save();
        }
    })

    res.render('success', {userName: userName, logFlag: logFlag});
})

app.post('/login', function(req, res){
    userName = req.body.userName;
    if(userName != null){
        logFlag = 'Logout';
    }
    res.redirect('/');
})

app.post('/success', function(req, res){
    res.redirect('/');
})

app.listen(3000, function(){
    console.log("Server running on Port 3000...");
});