# sdo - Social Deception Online
This is a self contained environment for creating, playing, and admining social deception games online, such as Werewolf and Blood on the Clocktower. I created this to practice using Node.js and to offer an alternative to platforms such as FB and Discord.
Technologies used:
  Nodejs, Express, WebSockets, PUG, SQLite, MariaDb, JavaScript, Jquery, Jquery-UI, HTML

To install:
Pre-requisites:
  NPM Latest
  Nodejs Latest
  A webserver (or your local machine for testing)
  Open relevant ports for remote access
1) Clone the repository
2) cd sdo
3) npm install
4) Copy env_sample file to .env and set configuration options. The .env file is in the .gitignore list and will not (and SHOULD NOT) be cloned to Github.
5) Run npm start
6) site will be available at "serverIPaddress:port" (ex: localhost:3000)
***Note*** Somne of the Jquery UI libraries may have to be downloaded into JSLib for things to show properly

This project is currently in development hell with lots TODO. Most of the back end functionality exists including:
  Login/Logout with persistent cookie
  Feed with comments
  Chat rooms
  Multi-game selection
  The main site components use the HTTP/S protocol. However, the chat system will eventually use websockets.
There is sample data contined in test.db, which is an SQLITE database. Ultimately, the idea is to use MariaDB as the backend. You can switch back and forth using the .ENV file
MVP TODO
  Vanilla werewolf game (2 wolves, 1 seer, and some villagers)

  Manual addition of user accounts with junk passwords

  Admin interface

    Create new game

      Create players with roles

    Count votes

    Add/Remove players from chats

    Modify player status (living status)

  Player interface

    Chat

      Read/send

    Feed/Day post

      Read/comment

NTH (Nice to have)

  Lock day post from further comments

    Possibly automate this based on EOD time

  User profiles

    "Preferred Names" to use in games
    
  Automatic word substitutions (kill := eliminate)
  
test
