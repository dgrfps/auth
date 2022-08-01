const fs = require('fs');
const path = require('path')

let scrtcfg = JSON.parse(fs.readFileSync(path.join(__dirname, './configs/config.json')));
let scrt = scrtcfg["secret"];
let PORT = { api: scrtcfg["port"] }

var express = require('express');           //CREATE EXPRESS AND SOCKET IO ON THE SAME SERVER PORT
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);    //CREATE EXPRESS AND SOCKET IO ON THE SAME SERVER PORT

const session = require('express-session'); //SESSION TO SAVE LOGIN INFO... ADMIN, NAME ETC
const middleware = session({secret: scrt, resave: true, saveUninitialized: true }) 
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next); //PASS SESSION TO SOCKET.IO
app.use(middleware);
io.use(wrap(middleware));

const bodyParser = require('body-parser');  //BODY PARSER FOR JSON INPUT FORM
app.use(bodyParser.urlencoded({ extended: true }));

//ROUTERS
const versions = require('./routes/versions')
const login = require('./routes/login')
const web = require('./web/server')(io);

app.use('/api/version', versions)
app.use('/api/login', login)
app.use('/', web);

//UNKNOW API - DENY REQUEST
app.get('/api/*', (req, res) => { res.send({approved: false}) })
app.post('/api/*', (req, res) => { res.send({approved: false}) })

//UNKNOW ROUTES - 404 PAGE
app.get('*', (req, res) => { res.redirect('/') })
app.post('*', (req, res) => { res.redirect('/')})


server.listen(PORT.api, ()=> { console.log("[SERVER] Listening on http://0.0.0.0:" + PORT.api) });