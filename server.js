'use strict';
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const server = express();
server.use(cors());
const PORT = process.env.PORT;
let Data = require('./data.json');
server.use(express.json());
const mongoose = require('mongoose');


main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/Jobs');
}


server.listen(PORT, () => {

    console.log('Listening on port 3001');

})


//Routes
server.get('/jobresults', Jobhandler);
server.post('/jobbookmarks', bookmarksHandler);
server.delete('/jobbookmarks/:id', bookmarksRemoveHandler);


//Handlers
function Jobhandler(req, res) {
    let Searchedqueries = req.query;
    // console.log(Searchedqueries);
    // console.log(Data.jobs_results[0]);
    res.send(Data.jobs_results.map(item => {
        return new JobHandler(item.title, item.company_name, item.description, item.via, item.detected_extensions.posted_at)
    }))
}


async function bookmarksHandler  (req, res) {
    // console.log('body', req.body);
    let newBookmark = new Bookmark({ title: req.body.title, company_name: req.body.company_name, description: req.body.description, via: req.body.via, post_date: req.body.post_date, bookmark: req.body.bookmark })
    await newBookmark.save();

    Bookmark.find({}, (error, bookmarks) => {
        if (error) {
            console.log('error in finding bookmarks');
        } else {
            res.send(bookmarks);
        }
    });

};

function bookmarksRemoveHandler(req, res) {
    console.log('body', req.params);

    Bookmark.deleteOne({_id:req.params.id}, (error, deletedBookmark) => {
        if(error){
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






//Schemas
const bookmarkSchema = new mongoose.Schema({
    title: String,
    company_name: String,
    description: String,
    via: String,
    post_date: String,
    bookmark: Boolean,
});

//Models
const Bookmark = mongoose.model('Bookmark', bookmarkSchema);


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

    bookMarkinit.save();
}
// seedDB();
