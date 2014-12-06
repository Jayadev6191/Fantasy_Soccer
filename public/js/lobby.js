$(function(){
    
    $.getJSON("/js/config.json", function( data ) {
        // console.log(data.lobby_count);
            var count=data.lobby_count;
            var source = $("#generateLobby").html();
            var template = Handlebars.compile(source);
            for(var i=0;i<count;i++){
                var con={
                    lobby_id:i
                };                
                var html=template(con);
                $(".container.lobby").append(html);
            };
    });
    
	var socket=io.connect(window.location.origin);
	var $message_box=$("#msg");
	var $chat=$("#chat");
	var currentUser=$.parseJSON(localStorage.getItem('currentUser')); 
	console.log(currentUser);
	if(currentUser==null){
	    window.location.href="login.html";
	}

	socket.emit('lobby_user',currentUser);
    socket.on('lobby_users',function(data){
		$("#player-list").empty();
		var source = $("#usersList").html();
		var template = Handlebars.compile(source);
		
		for(var i=0;i<data.length;i++){
			// console.log(data[i]);
			var con={
				"name":data[i]
			};
			var html = template(con);
			$("#player-list").append(html);
		};
	});
	
    
    socket.on('start_game',function(data){
       console.log(data);
       for(var i=0;i<data.length;i++){
           console.log(data[i]);
           if(currentUser.codeName==data[i]){
                alert('start game');
                window.location.href="auction.html";
           }
       }
    });
	
   $.ajax({
		type:"POST",
		url:"/lobby",
		data:"",
		success:function(res){
			socket.on('user_array',function(data){
				var source = $("#usersList").html();
				var template = Handlebars.compile(source);
				for(var i=0;i<data.length;i++){
					console.log(data[i]);
					var con={
						"name":data[i]
					};
					var html = template(con);
					$("#player-list").empty();
                    $("#player-list").append(html);
				};
			});
		}
	});


	$('#send-message').submit(function(){
		socket.emit('msg',$message_box.val());
		$message_box.val('');
		return false;
	});

	socket.on('sent',function(data){
		console.log('received data from server');
		$('#chat').append(data).append('<br>');
	});

    $('#player-list').slimScroll({
          color: '#fff',
    	  size: '10px',
    	  height: '400px',
    	  alwaysVisible: true
    });

    $('#aution-list').slimScroll({
          color: '#fff',
    	  size: '10px',
    	  height: '400px',
    	  alwaysVisible: true
    });
	
	// /*Slot selection*/
	
	
	$('.container.lobby').on('click','div.col-md-6.player div',function(){
		lobby_id=$(this).closest('.lobby').attr('lobby_id');
		var slots=$("[lobby_id="+lobby_id+"]").find('div.col-md-6.player div');
		var slot=$(this).attr('slot');
		var slot_data={
		    "lobby_id":lobby_id,
		    "slot":slot,
		    "player":currentUser.codeName
		};
		// console.log(slot_data);
		var $selected=$(slot);
		for(var i=0;i<slots.length;i++){
			if($(slots[i]).attr('player')==currentUser.codeName){
				alert("you have already selected a slot. Cannot select multiple slots");
				return false;
			}
		}
        
        currentUser['lobby_id']=lobby_id;
        console.log(currentUser);
		socket.emit('slot_number',slot_data);
	});

	socket.on('check_slot',function(data){
	    for(var lobby_id in data){
	        var len=data[lobby_id].length;
	        for(var i=0;i<len;i++){
               console.log(data[lobby_id][i]);
               var slot=data[lobby_id][i].slot;
               var player=data[lobby_id][i].player;
               $("[lobby_id="+lobby_id+"]").find('div[slot='+slot+']').removeClass('anon');
               $("[lobby_id="+lobby_id+"]").find('div[slot='+slot+']').addClass('joined');
               $("[lobby_id="+lobby_id+"]").find('div[slot='+slot+']').attr('player',player);
	        }
	    }
	});

	
	$('#logout').click(function(){
	   $.ajax({
	      type:"POST",
          url:"/logout",
          data:"",
	      success:function(res){
	          console.log(res);
	          if(res=="loggedOut"){
	              localStorage.removeItem('currentUser');
	              window.location.href="login.html";
	          }
	      },
	      error:function(){
	          
	      }
	   });
	});

});

// setTimeout(function(){clearInterval(card_counter),1000});