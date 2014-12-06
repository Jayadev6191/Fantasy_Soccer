$(document).ready(function(){
	var socket=io.connect(window.location.origin);
	var global={
		popup_message:'',
		// current_position:'QB'
	};
	
	var flag;
	var user_current_card;
	
	var card={
	   card_id:'',
	   current_highest_bid:'',
	   displayName:'',
	   isPressed:'false',
	   prospective_owner:'',
	   confirmed_owner:'',
	   drafted:''
	};
	
	var bidded_card={};
	
	var current_card_id="";
	var current_card_obj="";
	
	var user_bids={};
	user_bids['drafted']=false;
	
	
	var card_array=[];
	
	socket.emit('check','');
	socket.on('checked',function(data){
	    if(data=="true"){
	        $('#freeze_timer').hide();
            $('#auction').css('pointer-events','');
	    }
	});
	
	// /*Popup Counter*/
    socket.on('popup_counter',function(count){
      //Do code for showing the number of seconds here
      $('#auction').css('pointer-events','none');
      var count="0"+count;
      document.getElementById('freeze_timer').innerHTML = count;
      if(count==0){
          global.popup_message="finished";
          $('#freeze_timer').hide();
          setTimeout(function(){
              $('#auction').css('pointer-events','');
          },2000);
      }
      else{
          $('#auction').css('pointer-events','none');
          $('#freeze_timer').show();
          count=30;
          $('#current_sec').html(count);
        }
    });
    
    /*Main Counter */
    socket.on('main_counter',function(count){
      //Do code for showing the number of seconds here
      // document.getElementById('current_sec').innerHTML = count;
      $('#current_sec').html(count);
      if(count==0){
          $('#auction').css('pointer-events','none');
      }
    });
    
    socket.on('card_bid',function(data){
      $('div[card_id='+data.card_id+']').children().find('.amt').html(data.current_highest_bid);
      $('div[card_id='+data.card_id+']').removeClass('no-bid');
      $('div[card_id='+data.card_id+']').children().removeClass('in-active');
      $('div[card_id='+data.card_id+']').addClass('five-sec');
    });
	
	
	var currentUser=$.parseJSON(localStorage.getItem('currentUser')); 
	socket.emit('auction_user',currentUser);
	socket.on('auction_user',function(data){
		console.log(data);
		$('#auction-list').empty();
		
		/*Auction users list*/
		var source = $("#usersList").html();
		var template = Handlebars.compile(source);
		
		for(var i=0;i<data.length;i++){	
			var con={
				"name":data[i].codeName,
				"token":i+1
			};
			var html=template(con);
			$('#auction-list').append(html);
		}
	});
	
	var current_bid;
	var r = $('#R').slider();
	r.on('slide',function(){
		current_bid=$('#R').data('slider').getValue();
		$('#current-bid').html(current_bid);
		$('div[card_id='+current_card_id+']').children().find('.my-bid > span').html(current_bid);
	});
	current_bid=$('.span2').attr('data-slider-value');
	$('#current-bid').html(current_bid);
	
    /*Loading Cards from moback on load*/
	
    $.ajax({
 		type:"POST",
 		url:"/auction",
 		data:{"position":"GK"},
 		success:function(res){
			var source = $("#auctionByPosition").html();
			var template = Handlebars.compile(source);
			for(var i=0;i<res.length;i++){
				var con={
					"player_name":res[i].player_name,
					"card_id":i+1
				};
				var html = template(con);
				$("#card-frame").append(html);
			};
 		}
 	});

	var current_card_bid=$('.col-md-2').find('.amt').html();
	
	       var current_card;
	       
	       /*Individual Card Bidding */
        	var card_counter;
        	$('#card-frame').on('click','div[type=card]',function(e){        	   
        	    var newcard=jQuery.extend(true, {}, card);
        	    newcard.card_id=$(this).attr('card_id');
        	    current_card_id=$(this).attr('card_id');
        	    current_card_obj=newcard;
        	    $('div[card_id='+current_card_obj.card_id+']').css('border','3px solid #BCA126');
        	    
        	    if(newcard.current_highest_bid=="00"){
        	        newcard.current_highest_bid=0;
        	    }
        	    
        	    var selected_player=$(this).find('.fantasy_player').html();
        	    newcard.displayName=selected_player;
        	    
        	    $("#R").slider('setValue',newcard.current_highest_bid);
                 
        		// if($(this).attr('class')=="no-bid"){
        			// $(this).removeClass('no-bid');
        			// $(this).children().removeClass('in-active');
        			// $(this).addClass('five-sec');
        		// }
        		
        		$('#player-name').html(selected_player);
        		e.stopPropagation();
        	});
	
            /*Higher Bid*/ 	
	   
            $(document).keypress(function(event){
               var keycode = (event.keyCode ? event.keyCode : event.which);
                if(keycode == '70' || keycode == '102'){
                       var r = $('#R').slider();
                       // console.log(current_card_obj);
                       var current_highest_bid=$('div[card_id='+current_card_id+']').children().find('.amt').html();
                       // console.log(current_card_obj.isPressed);
                       if(current_card_obj.isPressed=="false"){
                           current_card_obj.current_highest_bid=0;
                           current_card_obj.isPressed="true";
                       }
                       
                       if(current_card_obj.current_highest_bid<192){
                           current_card_obj.current_highest_bid=parseInt(current_card_obj.current_highest_bid)+1;    
                       }
                       
                       // console.log(current_card_obj.current_highest_bid);
                       $("#R").slider('setValue',current_card_obj.current_highest_bid);
                       $('#current-bid').html(current_card_obj.current_highest_bid);
                       $('div[card_id='+current_card_id+']').children().find('.my-bid > span').html(current_card_obj.current_highest_bid);                   
                    }
            });
            
             /*Lower Bid*/
            
            $(document).keypress(function(event){
                var keycode = (event.keyCode ? event.keyCode : event.which);
                if(keycode == '83' || keycode == '115'){                    
                    var r = $('#R').slider();
                    console.log(current_card_obj.current_highest_bid);
                    if(current_card_obj.current_highest_bid>0){
                        current_card_obj.current_highest_bid=parseInt(current_card_obj.current_highest_bid)-1;    
                    }
                    
                    $("#R").slider('setValue',current_card_obj.current_highest_bid);
                    $('#current-bid').html(current_card_obj.current_highest_bid);
                    $('div[card_id='+current_card_id+']').children().find('.my-bid > span').html(current_card_obj.current_highest_bid);
                }
            });
            
             /*High Bid*/
            
            $(document).keypress(function(event){
                var keycode = (event.keyCode ? event.keyCode : event.which);
                if(keycode == '32'){                    
                    var r = $('#R').slider();
                    
                    var latest_bid=$('div[card_id='+current_card_id+']').children().find('.amt').html();
                    if(latest_bid=='00'){
                        latest_bid=1;
                        console.log(latest_bid);
                    }else{
                        current_card_obj.current_highest_bid=parseInt(latest_bid)+1;    
                        $("#R").slider('setValue',current_card_obj.current_highest_bid);
                        $('#current-bid').html(current_card_obj.current_highest_bid);
                        $('div[card_id='+current_card_id+']').children().find('.my-bid > span').html(current_card_obj.current_highest_bid); 
                    } 
                }
            });
            
            /*Confirm Bid*/
           
            $(document).keypress(function(e){
                // if(flag==0){
                 if(e.which == 13){
                   var current_card_bid=$('div[card_id='+current_card_id+']').children().find('.amt').html();
                   current_card_obj.prospective_owner=currentUser.email;
                   var my_bid=$('#current-bid').html();
                   $('div[card_id='+current_card_id+']').find('.my-bid > span').html(my_bid);
                   if(current_card_bid=="00"){
                       current_card_bid=0;
                   }
                   
                   if(my_bid>current_card_bid){
                       $('div[card_id='+current_card_id+']').find('#temp').remove();
                       $('div[card_id='+card_id+']').addClass('high-bid');
                       socket.emit('bid',current_card_obj);
                       var card_id=current_card_obj.card_id;
                       var card_name=current_card_obj.displayName;
                       // user_bids[card_id].email=currentUser.email;
                       user_bids[card_id]=card_id;
                       user_bids['confirmed']=true;
                       user_bids['owner']=currentUser.email;
                   }
                 }
                 e.stopPropagation();
                 return false;   
                // }
            });
            
            $('#confirm').click(function(){
                $(this).find('img').toggle();
                var current_card_bid=$('div[card_id='+current_card_id+']').children().find('.amt').html();
                   current_card_obj.prospective_owner=currentUser.email;
                   var my_bid=$('#current-bid').html();
                   if(current_card_bid=="00"){
                       current_card_bid=0;
                   }
                   
                   console.log(current_card_obj);
                   console.log(my_bid);
                   if(my_bid>current_card_bid){
                       $('div[card_id='+card_id+']').addClass('high-bid');
                       socket.emit('bid',current_card_obj);
                       // console.log(current_card_obj);
                       console.log(currentUser);
                       var card_id=current_card_obj.card_id;
                       var card_name=current_card_obj.displayName;
                       // user_bids[card_id]=current_card_bid;
                       // console.log(user_bids);
                       console.log(card_array);
                   }
              });
	
			
	socket.on('card_counter',function(card_details){
	    if(user_bids.confirmed==true){
	        console.log(currentUser.email);
	        console.log('elepahantish');
	    }
	    
	    if(card_details.drafted==true){
	        
	    }
	    
	    // console.log(card_details);
	    // alert(card_details.drafted);
		var card_count=card_details.card_count;
		var card_id=card_details.card_id;
		$('div[card_id='+card_id+']').find('#temp').remove();
		
		
		if(currentUser.email==card_details.prospective_owner){
		    // $('.col-md-2.col-lg-2').css('pointer-events','none');
		    //set flag which doesn't allow user to confirm further bids on anyother cards other than the current one
		    // console.log(card_details.card_id);
		    user_current_card=card_details.card_id;
		    // flag=1;
		}
		
		
		$('div[card_id='+card_id+']').removeClass('no-bid');
		$('div[card_id='+card_id+']').children().removeClass('in-active');
		if(currentUser.email==card_details.prospective_owner){
		     $('div[card_id='+card_id+']').removeClass('five-sec');
             $('div[card_id='+card_id+']').addClass('high-bid');
        }else{
             if(card_count>3){
                $('div[card_id='+card_id+']').removeClass('two-sec');
                $('div[card_id='+card_id+']').addClass('five-sec');
             }
             if(card_count==2){
                $('div[card_id='+card_id+']').removeClass('five-sec');
                $('div[card_id='+card_id+']').addClass('two-sec');
             }   
        }
        
		$('div[card_id='+card_id+']').children().find('.amt').html(card_details.current_highest_bid);

		if(card_count==0){
			$('div[card_id='+card_id+']').find('.card-counter > span').html(card_count);
			$('div[card_id='+card_id+']').removeClass('two-sec');
			$('div[card_id='+card_id+']').children().addClass('in-active');
			$('div[card_id='+card_id+']').addClass('drafted').html('<div class="drafted_block">'+'<p class="drafted_player">'+card_details.displayName+'</p>'+
			'<p class="drafted_amount">'+
			'$'+card_details.current_highest_bid+'</p>'+
			'<p class="drafted_text">'+'Drafted'+'</p>'+'</div>');			
			// user_bids[''];
		}else{
			$('div[card_id='+card_id+']').find('.card-counter > span').html(card_count);
		}
	});
	
	
	socket.on('drafted',function(card_details){
	    alert(card_details.drafted);
	    // console.log(card_details);
	    // if(currentUser.email==card_details.confirmed_owner){
	        // $('.col-md-2.col-lg-2').css('pointer-events','none');
	    // }else{
	        // flag=0;
	    // }
	});
	
	socket.on('card_bids',function(card_bids){
        var key=currentUser.email;
        console.log(card_bids);
        
        user_bids

        
        // if(card_bids[key] != undefined){
            // console.log('true');
            // $('.col-md-2.col-lg-2').css('pointer-events','none');
        // }else{
            // console.log('not drafted yet');
        // } 
    });
	
	// socket.on('close_round',function(data){
	    // console.log('End of round');
	    // $('#auction').css('pointer-events','none');
	    // console.log('current position is '+data);
	    // if(data=="end"){
	        // // alert('end of game');
	        // // location.href="results.html";
	    // }else{
	        // $('#pos').html(data);	
	        // $("#card-frame").empty();        
            // $.ajax({
                // type:"POST",
                // url:"/auction",
                // data:{"position":data},
                // success:function(res){
                    // console.log(res);
                    // var source = $("#auctionByPosition").html();
                    // var template = Handlebars.compile(source);
                    // for(var i=0;i<res.length;i++){
                        // var con={
                            // "player_name":res[i].displayName,
                            // "card_id":i+1
                        // };
                        // var html = template(con);
                        // $("#card-frame").append(html);                
                        // $('#player-position > #pos').html(global.current_position);
                        // $('#auction').css('pointer-events','');
                    // };
                // }
            // });   
	    // }
	// });
});
