const fs = require('fs');
const path = require('path')

const express = require('express')
const app = express.Router();

app.get('/:hwid', (req, res) => {
    let rjson = fs.readFileSync(path.join(__dirname, '../configs/login.json'));
    let data = JSON.parse(rjson);
    
    let users = data["USERS"]

    if(users.some(user => user.hwid == req.params.hwid && user.access == true))
    {
        res.send({approved: true})
        return;
    }
    else
        res.send({approved: false})
})

module.exports = app;