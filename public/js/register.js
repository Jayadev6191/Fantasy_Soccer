$(document).ready(function(){	
	$('#register').submit(function(e){
		e.preventDefault();
		var realname=$('#real_name').val();
		var codename=$('#code_name').val();
		var email=$('#email').val();
		var password=$('#pass_code').val();
		var confirm_password=$('#confirm_pass_code').val();
		
		if(password==confirm_password){
			var registration={
				"realname":realname,
				"codename":codename,
				"email":email,
				"password":password
			};
		
			// var a=JSON.stringify(registration);
			// console.log(a);
	
			$.ajax({
				type:"POST",
				url:"/register",
				data:registration,
				success:function(res){
					if(res!==""){
						var res=JSON.stringify(res);
						localStorage.setItem('currentUser',res);
						var socket=io.connect(window.location.origin);
						location.href="lobby.html";
					}
				}
			});
		}
		else{
			alert("password mismatch");
		}
	});	
});

//http://iconof.com/blog/how-to-install-setup-node-js-on-amazon-aws-ec2-complete-guide/