var express = require('express');
var router = express.Router();
var md5 = require('md5');
var sql3=require('sqlite3');
var sqlite=require('sqlite');
require('dotenv').config()
var connections={};
const mariadb = require('mariadb');
const { application } = require('express');
const helper=require ('./helper');
var cookieParser = require('cookie-parser');
router.use(cookieParser());

router.get('/about',(req,res,next) => {
  res.send('SDO - Social Deception Online');
});

router.post('/login',(req,res,next) => {
  var u=req.headers.username;
  var p=req.headers.password;
  helper.login(u,p)
    .then((result) => {
      console.log("myresult=");
      console.log(result);
      if (result.authorized) {
        console.log("trying to set cookie");
        console.log(res);
        res
          .cookie('token',result.token,{httpOnly:true,sameSite:'lax',maxAge:9000000000,path:'/'})
          .cookie('username',u,{httpOnly:true,sameSite:'lax',maxAge:9000000000,path:'/'})  
          //.render('index',{loggedIn:true});
          //.redirect('back');
          .send("logged in!!!");
      }
      else {
        console.log("didn't work");
        res.render('index',{loggedIn:false});
      }
    })
})

//Handles root request to the router
router.get('/',(req, res, next) => {
  console.log('Time:', Date.now())
  helper.auth(req,res)
    .then((authorized) => {
      if (authorized.auth) {
        console.log("Passed authorization in index!");
        helper.loadMenuItems()
          .then((items) => {
            console.log("items="+items);
            res.render('index',{loggedIn:true,menuItems:items,admin:authorized.admin});
          });
      }
      else {
        res.render('index',{loggedIn:false});
      }
    })
    .catch((error) => {
      console.log("something is screwed up");
      res.render('index',{loggedIn:false});
    })
})
router.get('/game/:id',(req,res,next) => {
  helper.auth(req,res)
    .then((authorized) => {
      if (authorized.auth) {
        console.log("Passed auth for game");
        helper.loadMenuItems()
          .then((items) => {
            helper.loadPlayers(req.params.id)
              .then((players) => {
                console.log("players="+players);
                helper.loadFeeds(req.params.id)
                  .then((feeds) => {
                    res.render('index',{loggedIn:true,menuItems:items,gameId:req.params.id,admin:authorized.admin,playerList:players,feedList:feeds});
                  })
              })
          });
      }
      else {
        res.render('index',{loggedIn:false});
      }
    })
    .catch((error) => {
      console.log("something is screwed up");
      res.render('index',{loggedIn:false});
    });
});

router.get('/game/(:gid)+/feed/(:fid)+',(req,res,next) => {
  helper.auth(req,res)
    .then((authorized) => {
      if (authorized.auth) {
        console.log("Passed auth for game");
        helper.loadMenuItems()
          .then((items) => {
            helper.loadFeed(req.params.gid,req.params.fid)
              .then((comments) => {
                helper.loadPlayers(req.params.gid)
                  .then((players) => {
                    res.render('index',{loggedIn:true,menuItems:items,gameId:req.params.gid,feedId:req.params.fid,admin:authorized.admin,commentList:comments,playerList:players})
                  })
              })
          });
      }
      else {
        res.render('index',{loggedIn:false});
      }
    })    
    .catch((error) => {
      console.log("something is screwed up");
      res.render('index',{loggedIn:false});
    });
});

router.post('/createNewGame',(req,res,next) => {
  console.log("Creating new game",req.headers.newgamename);
  helper.auth(req,res)
    .then((authorized) => {
      if (authorized.auth && authorized.admin) {
        console.log('newgamename:',req.headers.newgamename);
        if (helper.createNewGame(req,res)) {
          res.send('created new game!!!!');
        }
      }
  })
    .catch((error) => {
      console.log("something is screwed up");
      //res.render('index',{loggedIn:false});
      res.send("Creation failed!");
  })
})

//Error processing
router.use((err,req,res,next) => {
  console.error(err.stack)
  res.status(500).send('Something is not right with the universe');
})



module.exports = router;
