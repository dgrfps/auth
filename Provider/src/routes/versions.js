const fs = require('fs');
const path = require('path')

const express = require('express')
const app = express.Router();

app.get('/:v', (req, res) => {
    let rjson = fs.readFileSync(path.join(__dirname, '../configs/version.json'));
    let versions = JSON.parse(rjson);
    
    if(versions.hasOwnProperty(req.params.v))
    {
        let isLatest = versions['latest'] == req.params.v;
        res.send({latest: isLatest})
        return;
    }
    else
        res.send({approved: false})
})

app.get('/:v/:h', (req, res) => {
    let rjson = fs.readFileSync(path.join(__dirname, '../configs/version.json'));
    let versions = JSON.parse(rjson);
    
    if(versions.hasOwnProperty(req.params.v))
    {
        let hashCheck = versions[req.params.v]["hash"] == req.params.h;
        res.send({approved: hashCheck})
        return;
    }
    else
        res.send({approved: false})
})

module.exports = app;