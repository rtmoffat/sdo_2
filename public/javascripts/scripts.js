function addComment() {
    document.getElementById('feed').innerHTML='hithere222'+document.getElementById('feed').innerHTML;
    }
function login() {
    var $username=$('#username')[0].value;
    var $password=$('#password')[0].value;
    //alert($username);
    var requestOptions = {
        method: 'POST',
        redirect: 'follow',
        headers:{'username':$username,'password':$password}
        };
        
        fetch("./login", requestOptions)
            .then(response => response.text())
            .then(result => console.log('hi'+result))
            .then(function () {
                setTimeout(2000);
                window.location.replace('./');
            })
            .catch(error => console.log('error', error));
    $("#dialog").html($username);
    $( "#dialog" ).dialog();
}

function createGame() {
    $("#newGame").show();
}
function newGame() {
    var $newGameName=$('#newGameName')[0].value;
    var $newGameDesc=$('#newGameDesc')[0].value;
    var requestOptions = {
        method: 'POST',
        redirect:'follow',
        headers:{'newgamename':$newGameName,'newgamedesc':$newGameDesc}
    };
    fetch("./createNewGame",requestOptions)
        .then(response => response.text())
        .then(result=>
            {
                console.log(result);
                $('#newGame').html('<h2>Game created!</h2>');
            })
        .catch(error => console.log('error',error));
}
$( "#menu" ).menu();

$( function() {
    $( document ).tooltip();
  } );

