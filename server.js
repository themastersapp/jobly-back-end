'use strict';
const express=require('express');
const axios =require('axios');
const cors=require('cors');
require('dotenv').config();
const server=express();
server.use(cors());
const PORT=process.env.PORT;
let Data=require('./data.json');

server.listen(PORT,()=>{

    console.log('Listening on port 3001');

})

server.get('/jobresults',Jobhandler)

function Jobhandler(req,res){
    let Searchedqueries=req.query;
    console.log(Searchedqueries);
    // console.log(Data.jobs_results[0]);
    res.send(Data.jobs_results.map(item=>{
        return new JobHandler(item.title,item.company_name,item.description,item.via,item.detected_extensions.posted_at)
    }))
}

class JobHandler {
 constructor(title,company_name,decription,via,post_date){
     this.title=title;
     this.company_name=company_name;
     this.decription=decription;
     this.via=via;
     this.post_date=post_date;
 }
}