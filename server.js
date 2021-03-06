'use strict';
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const server = express();
server.use(cors());
const PORT = process.env.PORT;
const mongoLink = process.env.MONGO_LINK;
server.use(express.json());
const mongoose = require('mongoose');
const { query } = require('express');


main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(mongoLink);
}


server.listen(PORT, () => {

    console.log('Listening on port 3001');

})


//Routes
server.get('/jobresults', Jobhandler);
server.post('/jobbookmarks', bookmarksHandler);
server.delete('/jobbookmarks/:id', bookmarksRemoveHandler);
server.post('/applications', addApplicationsHandler);
server.put('/applications', putApplicationsHandler);

server.post('/profileForm',insertProfileDAta)
server.get('/retrieveApplications',retrieveApplications)
server.get('/retrieveBookmarks',retrieveBookmarks)
server.get('/retrieveProfile',retrieveProfile)
server.put('/retrieveProfile',retrieveUpdatedProfile)


//Handlers
async function Jobhandler(req, res) {
    let Searchedqueries = req.query;
    let JobsData= await axios.get(`https://serpapi.com/search?engine=google_jobs&q=${req.query.jobtitle}&location=${req.query.location}&api_key=${process.env.API_KEY}`)
    // console.log(Searchedqueries);
    // console.log(Data.jobs_results[0]);

    res.send(JobsData.data.jobs_results.map(item => {
        return new JobHandler(item.title, item.company_name, item.description, item.via, item.detected_extensions.posted_at)
    }))
}


async function bookmarksHandler(req, res) {
    console.log('body', req.body);
    let newBookmark = new Bookmark({ user: req.body.user, title: req.body.bookmarked.title, company_name: req.body.bookmarked.company_name, description: req.body.bookmarked.description, via: req.body.bookmarked.via, post_date: req.body.bookmarked.post_date, bookmark: req.body.bookmarked.bookmark })
    await newBookmark.save();

    Bookmark.find({ user: req.body.user }, (error, bookmarks) => {
        if (error) {
            console.log('error in finding bookmarks');
        } else {
            res.send(bookmarks);
        }
    });

};

function bookmarksRemoveHandler(req, res) {
    console.log('body', req.params);

    Bookmark.deleteOne({ _id: req.params.id }, (error, deletedBookmark) => {
        if (error) {
            console.log('error in deleting bookmark');
        } else {
            Bookmark.find({}, (error, bookmarks) => {
                if (error) {
                    console.log('error in finding bookmarks');
                } else {
                    res.send(bookmarks);
                }
            });
        }
    })
}


async function addApplicationsHandler(req, res) {
    // let newApplication = new Application({
    // userName: req.body.username,
    // email: req.body.email,
    // userPhone: req.body.userPhone,
    // adress: req.body.adress,
    // major: req.body.major,
    // bio: req.body.bio,
    // })
    await Application.create({
        jobTitle: req.body.jobTitle,
        userName: req.body.userName,
        email: req.body.email,
        userPhone: req.body.userPhone,
        address: req.body.address,
        major: req.body.major,
        bio: req.body.bio,
        active: true,
    })
    Application.find({ email: req.body.email }, (error, applications) => {
        if (error) {
            console.log('error in saving applications');
        } else {
            res.send(applications);
        }
    });
}

async function putApplicationsHandler(req, res) {
        // for whatwever
    console.log('dwdwddw', req.body)
    await Application.findOneAndUpdate({ _id: req.body._id }, { active: req.body.active }, { new: true }, (error) => {
        if (error) {
            console.log('error in saving applications');
        } else {
            Application.find({ email: req.body.email }, (error, applications) => {
                if (error) {
                    console.log('error in saving applications');
                } else {
                    // console.log('1w2w2w2',applications)
                    res.send(applications);
                }
            });
        }
    });
}

async function insertProfileDAta(request,response){
    await Profile.create(request.body)

    Profile.find({user:request.body.user},function(error,data){
        if(error){
            console.log(error);
        }else{
            response.send(data)
        }
    })
}

async function retrieveApplications(request,response){
    let email=request.query.email
    console.log(email);
    Application.find({ email:email },(error, applications) => {
        if (error) {
            console.log('error in saving applications');
        } else {
            // console.log(applications);
            response.send(applications)
                }
    });


}
async function retrieveBookmarks(request,response){
    let email=request.query.email
    console.log(email);
    Bookmark.find({ user:email },(error, bookMarks) => {
        if (error) {
            console.log('error in saving applications');
        } else {
            // console.log(bookMarks);
            response.send(bookMarks);
            }
    });


}
async function retrieveProfile(request,response){
    let email=request.query.email
    console.log(email);
    Profile.find({ user:email },(error, profileData) => {
        if (error) {
            console.log('error in saving applications');
        } else {
            // console.log(profileData);
            response.send(profileData);
            }
    });


}

async function retrieveUpdatedProfile(req, res) {

// console.log('req.body', req.body)
// console.log('req.body.user', req.body.user)

await Profile.findOneAndUpdate({ user: req.body.user },req.body, { new: true }, (error) => {
    
        Profile.find({ user: req.body.user }, (error, retriveProfileUpdate) => {
            
                console.log('retriveProfileUpdate',retriveProfileUpdate)
                res.send(retriveProfileUpdate);
            
        });
    
});
}






//Schemas
const bookmarkSchema = new mongoose.Schema({
    user: String,
    title: String,
    company_name: String,
    description: String,
    via: String,
    post_date: String,
    bookmark: Boolean,
});

const applicationSchema = new mongoose.Schema({
    jobTitle: String,
    userName: String,
    email: String,
    userPhone: Number,
    address: String,
    major: String,
    bio: String,
    active: Boolean,
});

const profileSchema=new mongoose.Schema({
    phoneNumber:Number,
    address:String,
    major:String,
    skills:String,
    experience:String,
    bio:String,
    user:String
})
//Models
const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

const Application = mongoose.model('Application', applicationSchema);

const Profile=mongoose.model('Profile',profileSchema)
//Class Constructor
class JobHandler {
    constructor(title, company_name, description, via, post_date, bookmark) {
        this.title = title;
        this.company_name = company_name;
        this.description = description;
        this.via = via;
        this.post_date = post_date;
        this.bookmark = false;
    }
}


//Seeding
function seedDB() {
    let bookMarkinit = new Bookmark({ title: 'Init Title', company_name: 'Init Company', description: 'Init Des', via: 'Init Via', post_date: 'Init Post', bookmark: true })

    // await bookMarkinit.save();
}
// seedDB();


