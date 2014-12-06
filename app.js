var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

var Client = require('node-rest-client').Client;
var client=new Client();
var bodyParser = require('body-parser');
var http = require('http');
var app = express();
var server=http.createServer(app);
var io = require('socket.io').listen(server);
var Array = require('node-array');


var APP_ID = '';
var JS_KEY = '';

GLOBAL.Parse = require('parse').Parse;
Parse.initialize(APP_ID,JS_KEY);

var Users = Parse.Object.extend("User");
var query = new Parse.Query(Users);

query.find({
   success:function(res){
       for (var i = 0; i < res.length; i++){
            console.log(res[i].attributes.realname);   
       }
   },error:function(err){
       
   }
});


var user_hash={};
var lobby_hash={};
var connection={};
var card_hash={};
var auction_hash={};
var card_bids={};

var auction_array=new Array();

// var subset=new Array();
    var header={
    "X-Moback-Application-Key":"YmNmZDJjMDUtYzJhNS00MTA3LTkwNjgtNDM1MzI2ZWNlNzA4",
    "X-Moback-Environment-Key":"MDI0NDQ5ODktYTAwNy00ZjhhLWFlMDktMmY4ODMzNDdhODgw",
    "X-Moback-SessionToken-Key":"dWRheW4rMUByZWxpYWJsZWNvZGVycy5jb20jLTEjMTQxMTYzNDQ1NTAwMDg2NDAwMDAw",
    "Content-Type": "application/json"
    };

    var global={
        gameStarted:'',
        popUpTimeStarted:'',
        popUpTimeFinished:'',
        positionChanged:'',
        current_position:'QB'
    };

    var bidCounters = [];
    
    io.sockets.on('connection',function(socket){
	
	console.log('socket connected');
    //lobby slots logic
	socket.on('slot_number',function(data){
	    var slot_list=[];
        
        var player_slot={
            'player':data.player,
            'slot':data.slot
        };
        
		if(lobby_hash[data.lobby_id]){
		    lobby_hash[data.lobby_id].push(player_slot);
		    //check if the lobby is full
		    if(lobby_hash[data.lobby_id].length==2){
		        var user_list=[];
		        console.log(data.lobby_id+' is full');
		        for(var i=0;i<lobby_hash[data.lobby_id].length;i++){
		            user_list.push(lobby_hash[data.lobby_id][i].player);
		        }
		        console.log(user_list);
		        io.sockets.emit('start_game',user_list);
		    }
		}
		else{
		    slot_list.push(player_slot);
		    lobby_hash[data.lobby_id]=slot_list;
		}
		
		io.sockets.emit('check_slot',lobby_hash);
	});
	
	
	
	socket.on('main_counter',function(data){
		io.sockets.emit('current_counter',data);
	});

	
	// /*Player Join lobby*/
	socket.on('lobby_user',function(data){
	    var latest_array=[];
	    connection[socket.id]=data.codeName;
	    console.log(connection[socket.id]);
	    console.log(connection);
	    for(var key in connection){
	        latest_array.push(connection[key]);
	    }
	    io.sockets.emit('lobby_users',latest_array);
	});

	
	var auction_user_exists=0;
	socket.on('auction_user',function(data){
		if(data.email!==undefined){
		  var user_email=data.email;
        for(var i=0;i<auction_array.length;i++){
            if(auction_array[i].email==user_email){
                auction_user_exists=auction_user_exists+1;
            }
        }
        if(auction_user_exists==0){
            auction_array.push(data);
        }
            console.log(auction_array);
           io.sockets.emit('auction_user',auction_array);   
		}
	});
	
	socket.on('check', function (data){ 
	    io.sockets.emit('checked',global.popUpTimeFinished);
	});
	
	socket.on('bid', function(data){
	   console.log(data);
	   var card_counter;   
        card_hash[data.card_id]=data;        
        
        var card_id=data.card_id;
        var card_count=6;
        
           function card_timer(card_id){
               // console.log(card_hash[data.card_id]);
                card_count="0"+(card_count-1);
                if(card_count>-1){
                    
                    if(card_hash[data.card_id].card_count==undefined)
                    {
                        card_hash[data.card_id].card_count=card_count;
                    }
                    else{
                        if(card_hash[data.card_id].card_count-card_count > 1){
                            console.log('outbid');
                            clearInterval(card_counter);
                        } else{
                            card_hash[data.card_id].card_count=card_count;
                        }
                    }
                    
                    io.sockets.emit('card_counter',card_hash[data.card_id]);
                }
                else{
                    //counter ended, do something here
                    clearInterval(card_counter);
                    card_hash[data.card_id].drafted="true";
                    card_hash[data.card_id].confirmed_owner=data.prospective_owner;
                    console.log(card_hash[data.card_id]);
                    io.sockets.emit('card_counter',card_hash[data.card_id]);
                    
                    // card_bids[data.card_id]=card_hash[data.card_id];
                    // // card_bids[data.card_id].drafted=true;
                    // io.sockets.emit('card_bids',card_bids);
                }
            }
            
            card_counter=setInterval(function(){card_timer(card_id);},1000);   
    });
	
	socket.on('disconnect', function (data) { 
	    console.log(socket.id +' disconnected');
	    delete connection[socket.id];
	    console.log(connection);
	     var latest_array=[];
	    for(var key in connection){
            latest_array.push(connection[key]);
            console.log(latest_array);
        }
        io.sockets.emit('lobby_users',latest_array);
    });
  
    app.post('/lobby',function(req,res){
         console.log('in the lobby');
         io.sockets.emit('check_slot',lobby_hash);
    });
	
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// var routes = require('./routes/index');
// var users = require('./routes/users');
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
// app.use('/', routes);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

    app.post('/register',function(req,res){
	// console.log(a);
    	var data=JSON.stringify(req.body);
    	var user_data=JSON.parse(data);
    	
    	var user = new Parse.User();
    	
    	user.set("username",user_data.email);
        user.set("password",user_data.password);
        user.set("email",user_data.email);
        user.set("codeName",user_data.codename);
        user.set("realName",user_data.realname);
    	
    	user.signUp(null,{
          success: function(user) {
            // Hooray! Let them use the app now.
            var currentUser = Parse.User.current();
            res.send(currentUser.attributes);
            
          },
          error: function(user, error) {
            // Show the error message somewhere and let the user try again.
            console.log("Error: " + error.code + " " + error.message);
          }
        });	
    });


 /*login*/
   
   app.post('/login',function(req,res){
        var credentials=JSON.stringify(req.body);
        var login_data=JSON.parse(credentials);
        console.log(login_data.email);
        console.log(login_data.password);
        
        Parse.User.logIn(login_data.email,login_data.password,{
            success: function(user){
            // Do stuff after successful login.
            var currentUser = Parse.User.current();
            res.send(currentUser.attributes);
            },
            error: function(user, error){
            // The login failed. Check error to see why.
            }
        });
    });

    app.post('/logout',function(req,res){
        Parse.User.logOut();
        console.log(Parse.User.current());
        if(Parse.User.current()==null){
            res.send('loggedOut');
            console.log('logged out');
        }
    });


 // var position_Array=[];
 var popup_counter;
 
  app.post('/auction',function(req,res){
     var position=req.body.position;
     console.log(position);
    if(global.popUpTimeStarted==""){
        global.popUpTimeStarted="true";
        console.log('pop up set');
        var pop_count=6;
        popup_counter=setInterval(popup_timer, 1000); //1000 will  run it every 1 second
        function popup_timer()
         {
            pop_count=pop_count-1;
            console.log(pop_count);
            io.sockets.emit('popup_counter',pop_count);
            if (pop_count == 0)
              {
                 io.sockets.emit('popup_message','finished');
                 global.popUpTimeFinished="true";
                 
                 clearInterval(popup_counter);
                 //counter ended, do something here
                    if(global.gameStarted==""){
                        global.gameStarted="true";
                        console.log('just set');
                        var count=31;
                        var counter=setInterval(timer, 1000); //1000 will  run it every 1 second
                        function timer()
                        {
                          count=count-1;
                          io.sockets.emit('main_counter',count);
                          // socket.on('current_counter',function(count){
                            if (count == 0)
                              {
                                  console.log(Object.keys(card_hash).length);
                                  for(var i=0;i<Object.keys(card_hash).length;i++){
                                    console.log(card_hash[Object.keys(card_hash).length]);
                                  }
                                    
                             setTimeout(function(){
                                     // //positions
                                 switch (global.current_position) {
                                    
                                 } 
                              },3000);
                             
                             global.popUpTimeStarted="";
                             global.gameStarted="";
                             clearInterval(counter);
                             //counter ended, do something here
                             return;
                            }                
                         }
                    }
                    else{
                        console.log('gameAlreadyStarted');
                    }
                }
            }    
        }
     // auction starts from here
     
     
    var auction={
          data:{
              "table":"fantasy_data",
              "data":"",
              "order":{"Name":1},
              "criteria":{"position":position},
              "skip":0,
              "limit":"20"
          },
          headers:header
     };

    //parse call to fantasy_data based on position
    
    var fantasy = Parse.Object.extend("fantasy_data");
    var query = new Parse.Query(fantasy);
    
    query.limit(15);    
    query.descending("player_ratings");
    query.equalTo("player_position","GK");
    query.find({
       success:function(result){
           var position_array=[];
           for (var i = 0; i < result.length; i++){
                position_array.push(result[i].attributes);
           }
           auction_hash['data']=position_array;
           res.send(auction_hash['data']);
           
       },error:function(err){
           
       }
    });

    
});
    
// catch 404 and forward to error handler

server.listen(3300);
module.exports = app;