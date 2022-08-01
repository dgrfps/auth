const wsocket = require('./socket.js')
const path = require('path')

const express = require('express')
const app = express.Router();

var AUTH_MIDDLEWARE = function(req, res, next) {
    if (req.session && req.session.admin)
      return next();
    else
      return res.redirect('/')
};

module.exports = function(io)
{
    wsocket.parse(io);

    app.get('/logout', function (req, res) {
        if(req.session)
            req.session.destroy();

        res.redirect('/')
    });

    app.get('/dashboard', AUTH_MIDDLEWARE, function (req, res) {
        res.sendFile(path.join(__dirname + '/public/dashboard.html'));
    });

    app.post('/admin', (req, res) => { 
        if (!req.body.voidlogin || !req.body.voidpass) 
        {
            res.redirect('/')
            return;
        }

        let rjson = fs.readFileSync(path.join(__dirname, '../configs/login.json'));
        let data = JSON.parse(rjson);
        
        let users = data["USERS"]
    
        if(users.some(user => user.name == req.body.voidlogin && user.pass == req.body.voidpass && user.admin))
        {
            req.session.user = req.body.voidlogin;
            req.session.admin = true;
            
            res.redirect('/dashboard')
            return;
        }

        res.redirect('/')
    })

    app.post('/register', AUTH_MIDDLEWARE, (req, res) => { 
        if (!req.body.username || !req.body.hwid) 
        {
            res.redirect('/dashboard')
            return;
        }

        let rjson = fs.readFileSync(path.join(__dirname, '../configs/login.json'));
        let data = JSON.parse(rjson);
        
        let users = data["USERS"]
        users.push({
           "hwid": req.body.hwid,
           "name": req.body.username,
           "access":true,
        });
        data["USERS"] = users;

        fs.writeFile(path.join(__dirname, '../configs/login.json'), JSON.stringify(data), () => { });

        res.redirect('/dashboard')
    })

    return app;
}
