





// $(document).ready(function(){
//   $("h1").click(function(){
//   $(".box").slideToggle(
//   	function()

//   		{
//   		 $('.box').animate({
// 	      // height: "150", 
// 	      width: 'toggle',
// 	      padding:"20px 0",
// 	      backgroundColor:'#000000',
// 	      opacity:.8
// 			}, 500);
//   		}
//   	);
  
//   });
// });


$(document).ready(function(){

  $('.box').hide()
  $('.bar_menu').click(function(){
  // $('.box').animate({

	 //      width: 'toggle',
	 //      backgroundColor:'#000000',
	 //      opacity:.8
		// 	}, 2500, 'linear',);
	 if($('.box').hasClass('box-opening')){
	 	$('.box').removeClass('box-opening');
	 }else{
	 	$('.box').addClass('box-opening');
	 	// $('.box').animate('bounce');
	 }
  });
});



