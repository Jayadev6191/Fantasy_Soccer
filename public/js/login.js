$(document).ready(function(){	
	$('#login').submit(function(e){
		e.preventDefault();
		var email=$('#email').val();
		var password=$('#pass_code').val();
		
		var login={
			"email":email,
			"password":password
		};
	   
	      var details=JSON.stringify(login);
	      console.log(details);
		$.ajax({
			type:"POST",
			url:"/login",
			data:login,
			success:function(res){
					console.log(res);
					if(res!==""){
						var res=JSON.stringify(res);
						localStorage.setItem('currentUser',res);
						var currentUser=$.parseJSON(localStorage.getItem('currentUser'));
						var socket=io.connect(window.location.origin);
						socket.emit('lobby_user',currentUser.codename);
						location.href="/lobby.html";
					}
			  }
		});		
	});
	
});