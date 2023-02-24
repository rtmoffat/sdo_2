var md5 = require('md5');
var sql3=require('sqlite3');
var sqlite=require('sqlite');
require('dotenv').config()
const mariadb = require('mariadb');

//Verifies username and token are valid in the database
const auth=async (req,res) => {
    console.log("authing")
    if (req.cookies.username && req.cookies.token) {
        //Query with mod status
        //select users.id as userid,users.admin,games.Mod,games.id as gid from users left join games on users.id=games.Mod where users.username='ralph';
        let q='select id,admin from users where username=(?) and apikey=(?)';
        let v=[req.cookies.username,req.cookies.token];
        var authorized=false;
        var authorized={};
        authorized['auth']=false;
        authorized['admin']=false;
        await queryDb(q,v)
            .then((value) => {
                if (value.length==1) {
                    console.log("You have been authorized");
                    authorized['auth']=true;
                    value.forEach((row) => {
                        console.log(row);
                        if (row['admin']==1) {
                            console.log("user is admin");
                            authorized['admin']=true;
                        }
                        else {
                            console.log("user is not admin");
                        }
                    })
                }
            })    
        if (authorized.auth) {
          console.log("passed auth");
        }
    }
    return authorized;
  }
/*TODO: Send the token back as the result and send it to the user in the index function*/
async function login(u,p) {
    console.log(u+' '+md5(p+process.env.SALT));
    let q='select id from users where username=(?) and password=(?)';
    let v=[u,md5(p+process.env.SALT)];
    var result;
    await queryDb(q,v)
        .then(async (value) => {
        if (value.length==0) {
            console.log("Username/password invalid");
            result={authorized:false};
            //res.send('Username/password invalid!!!');
        }
        //Set the token
        else {
            console.log('login successful!! Welcome to SDO!');
            let newToken=md5(u+process.env.SALT);
            let q='UPDATE users set apikey=(?) WHERE username=(?)';
            let v=[newToken,u];
            await queryDb(q,v)
            .then ((value) => {
            /*res
                .cookie('token',newToken,{httpOnly:true,sameSite:'lax',maxAge:9000000000,path:'/'})
                .cookie('username',u,{httpOnly:true,sameSite:'lax',maxAge:9000000000,path:'/'})
                .send('login successful!');*/
                console.log("login successful");
                //result=newToken;
                result={authorized:true,token:newToken};
            });
        }
    });
    return result;
}

const queryDb=async (q,v) => {
    let res;
    if (process.env.USE_SQLite != 1) {
        console.log("Querying maraidb with"+q);
        let conn;
        //testing
        //q="SELECT * from users;";
        try {
            conn = await pool.getConnection();
            const rows = await conn.query(q,v);
            res=rows;
        }
        catch(e) {
        console.log("Mariadb error"+type(e));
        }
        finally {
            if (conn) conn.release(); //release to pool
        }
    }
    else {
        console.log("trying");
        try {
            await sqlite.open({
                filename: 'test.db',
                driver: sql3.Database
            }).then(async function (db)
                {
                    if (q.toUpperCase().startsWith("SELECT")) {
                        console.log("querying");
                        await db.all(q,v)
                        .then((value) =>
                        {
                            console.log("value=");
                            console.log(value);
                            res=value;
                        })
                    }
                    else {
                        console.log("running "+q);
                        await db.run(q,v)
                        .then((value) =>
                        {
                            console.log("value=");
                            console.log(value);
                            res=value;
                        })
                    }
                });
        }
        catch(e) {console.log(e);}
    }
    return res;
}
const loadMenuItems=async () => {
    var items={};
    var q='select name from games;';
    var q='select games.id,games.name,feeds.id,feed_type,feeds.subject from games left join feeds on feeds.gameid = games.id order by games.id asc';
    var q='select games.id,name,subject,feed_type,feeds.id as feedId from games left join feeds on gameid=games.id;'
    //var q='select feeds.id,feeds.subject,feeds.feed_type from feeds where feeds.gameid in (select games.id from games);'
    /*
    var gq='select id from games';
    var pq='select feeds.id,feeds.subject,feeds.feed_type from feeds where feeds.gameid in (select games.id from games where games.id=1) and feeds.feed_type="post"';
    var cq='select feeds.id,feeds.subject,feeds.feed_type from feeds where feeds.gameid in (select games.id from games where games.id=1) and feeds.feed_type="chat"';
    */
    
    await queryDb(q)
        .then((value) => {
            console.log('type='+typeof(value));
            items['games']=value;
            console.log("Tstttter="+JSON.stringify(items.games))},
            //res.render('layout_final',{"username":req.cookies.username,"gameid":req.params.gameid,"res":value,"lres":value.length,"username2":req.cookies.username});console.log(value);},
            (error) => { console.log(error); });
    return items;
}
const createNewGame=async (req,res) => {
    gameCreated=false;
    //game id is hard coded for now until sqlite database game id field is converted to autoinc
    let q="insert into games (name,description,Mod) values((?),(?),(select id as myuserid from users where username=(?)));"
    let v=[req.headers.newgamename,req.headers.newgamedesc,req.cookies.username];
    //let q="insert into games (id,name,description,Mod) values(5,(?),(?),1);"
    //let v=[5,req.headers.newgamename,req.headers.newgamedesc];
    console.log(req.headers.newgamename,' ',req.headers.newgamedesc);
    await queryDb(q,v)
        .then((value) => {
            console.log('creategamevalue',value.changes);
            if (value.changes==1) {
                gameCreated=true;
            }
        },
        (error) => {console.log(error);});
    return gameCreated
}

const loadPlayers=async (gid) => {
    var players;
    var q='select players.id as "player_id",users.username from players join users on users.id=players.userid where players.gameid=(?);';
    var v=[gid];
    await queryDb(q,v)
        .then((value) => {
            players=value;
        })
    return players;
}

//Loads LINKS to feeds for a given game (chats and posts)
const loadFeeds=async(gid) => {
    var feeds;
    var q="select id,subject,feed_type from feeds where gameid=(?)";
    var v=[gid];
    await queryDb(q,v)
        .then((value) => {
            feeds=value;
        })
    return feeds;
}
const loadFeed=async(gid,fid) => {
    var comments;
    var q="select comments.userid,comments.text,comments.created_at,feeds.subject,users.username from comments join feeds on comments.feedid=feeds.id join users on comments.userid=users.id where feeds.gameid=(?) and feeds.id=(?);"
    var v=[gid,fid];
    await queryDb(q,v)
        .then((value) => {
            comments=value;
        })
    return comments;
}

exports.auth = auth;
exports.queryDb = queryDb;
exports.login=login;
exports.loadMenuItems=loadMenuItems;
exports.createNewGame=createNewGame;
exports.loadPlayers=loadPlayers;
exports.loadFeeds=loadFeeds;
exports.loadFeed=loadFeed;