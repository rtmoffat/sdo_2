var express = require('express');
var router = express.Router();
var md5 = require('md5');
var sql3=require('sqlite3');
var sqlite=require('sqlite');
require('dotenv').config()
var connections={};
const mariadb = require('mariadb');

function auth(req,res,next) {
  console.log("authing")

  let x=true
  if (x) {
    console.log("nexting");
    next()
  }
}

router.use(auth)


router.get('/', auth, function(req, res, next) {
  console.log('getting')
  if (req.cookies.username && req.cookies.token)
    res.render('index',{loggedIn:true})
  else {
    console.log('testing')
  }
})


router.post("/login",(req, res, next) => {
  var u=req.headers.username;
  var p=req.headers.password;
  login(u,p)
    .then(async (result) => {
      if (result) {
        //res.send("login successful!!RTM");
        console.log('login successful!! Welcome to SDO!');
        let newToken=md5(u);
        let q='UPDATE users set apikey=(?) WHERE username=(?)';
        let v=[newToken,u];
        await queryDb(q,v)
          .then ((value) => {
          res
            .cookie('token',newToken,{httpOnly:true,sameSite:'lax',maxAge:9000000000,path:'/'})
            .cookie('username',u,{httpOnly:true,sameSite:'lax',maxAge:9000000000,path:'/'})
            .send('login successful!');
            console.log("login successful!! sent cookie!!!");
            result=true;
          });
      }
      else {
        res.send("login failed!!!RTM");
      }
    })
});

//helper functions
async function login(u,p) {
  console.log(u+' '+md5(p+process.env.SALT));
  let q='select id from users where username=(?) and password=(?)';
  let v=[u,md5(p+process.env.SALT)];
  var result=false;
  await queryDb(q,v)
    .then(async (value) => {
      if (value.length==0) {
        console.log("Username/password invalid");
        //res.send('Username/password invalid!!!');
      }
      //Set the token
      else {
        console.log('login successful!! Welcome to SDO!');
        let newToken=md5(u);
        let q='UPDATE users set apikey=(?) WHERE username=(?)';
        let v=[newToken,u];
        await queryDb(q,v)
          .then ((value) => {
          /*res
            .cookie('token',newToken,{httpOnly:true,sameSite:'lax',maxAge:9000000000,path:'/'})
            .cookie('username',u,{httpOnly:true,sameSite:'lax',maxAge:9000000000,path:'/'})
            .send('login successful!');*/
            console.log("login successful");
            result=true;
          });
    }
  });
return result;
}
async function queryDb(q,v) {
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
          await db.all(q,v)
            .then((value) =>
              {
                console.log("value=");
                console.log(value);
                res=value;
              })
        });
    }
    catch(e) {console.log(e);}
  }
  return res;
}
module.exports = router;
