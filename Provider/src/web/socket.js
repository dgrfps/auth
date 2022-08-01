const fs = require('fs');
const path = require('path')

module.exports.parse = function(io)
{
    io.on('connection', (socket) => {
        const session = socket.request.session;
        if(session.admin)
            socket.emit('logedin');
        
        socket.on('getinfo', ()=> {
            if(!session.admin) return;


            let rjson = fs.readFileSync(path.join(__dirname, '../configs/version.json'));
            let versions = JSON.parse(rjson);
            
            let rjson2 = fs.readFileSync(path.join(__dirname, '../configs/login.json'));
            let users = JSON.parse(rjson2);

            let info = {
                latest: versions['latest'],
                users: users["USERS"].length
            };

            socket.emit('getinfo', info);
        })

        socket.on('listusers', ()=> {
            if(!session.admin) return;
            let rjson2 = fs.readFileSync(path.join(__dirname, '../configs/login.json'));
            let users = JSON.parse(rjson2);
            
            let info = []

            users["USERS"].map(user => {
                info.push({ name: user.name, hwid: user.hwid, access: user.access });
            });

            socket.emit('listusers', info);
        })

        socket.on('removeuser', (hwid)=> {
            if(!session.admin) return;
            let rjson = fs.readFileSync(path.join(__dirname, '../configs/login.json'));
            let data = JSON.parse(rjson);
        
            let users = data["USERS"]
        
            users.map(user => {
                if(user.hwid == hwid)
                {
                    user.access = false;
                    data["USERS"] = users;
                    fs.writeFile(path.join(__dirname, '../configs/login.json'), JSON.stringify(data), () => { });
                    socket.emit('update');
                }
            })
        })

        socket.on('adduser', (hwid)=> {
            if(!session.admin) return;
            let rjson = fs.readFileSync(path.join(__dirname, '../configs/login.json'));
            let data = JSON.parse(rjson);

            let users = data["USERS"]
        
            users.map(user => {
                if(user.hwid == hwid)
                {
                    user.access = true;

                    data["USERS"] = users;
                    fs.writeFile(path.join(__dirname, '../configs/login.json'), JSON.stringify(data), () => { });

                    socket.emit('update');
                }
            })
        })
    });

}