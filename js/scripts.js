// Empty JS for your own code to be here
var isAjaxInProcess = false;
var token;
var timeoutvar;

url = "https://catello.herokuapp.com";
// url = "http://localhost:3000";

function SyncTimer()
{
	if(timeoutvar)
		clearTimeout(timeoutvar);
	timeoutvar = setTimeout(sync,10000);
}
 

function AjaxInProgress(arg)
{
	if(arg)
		$('.loadingcat').removeClass('hide');
	else
		$('.loadingcat').addClass('hide');
}

function newTask (title,description)
{
	return ('<div class="task">'+
					'<div class="task-title"><label>'+ title + '</label>' +
						'<button type="button" class="btn btn-info btn-xs editTaskButton pull-right glyphicon glyphicon-pencil" data-toggle="modal" data-target="#taskeditModal">'+
						'</button>'+
					'</div>'+
					'<div class="task-description">'+ description +
					'</div>'+
				'</div>');
}

function newCat (categoryName, taskList) 
{
	var nc = '<div class="categoryDiv">'+
				'<div class="categoryTitle"><label>'+ categoryName + '</label>' +
						'<button type="button" class="btn btn-info btn-xs editCategoryButton pull-right glyphicon glyphicon-pencil" data-toggle="modal" data-target="#categoryeditModal">'+
						'</button>'+
				'</div>'+
				'<div class="connectedSortable">';
	for(var i of taskList)
	{
		nc += newTask(i.title, i.description);
	}
	nc += '</div>'+
					'<button type="button" class="btn btn-info btn-lg addTaskButton" >'+
					'Add Task'+
					'</button>'+
				'</div>';
	return (nc);
}
				
var boardDetails = [
	{
		categoryName: "cat name",
		taskList:[{title:"title1",description:"description1"}, {title:"title2",description:"description2"}, {title:"title3",description:"description3"}]
	},
	{
		categoryName: "puppy name",
		taskList:[{title:"puppy1",description:"doggo1"}, {title:"title2",description:"description2"}, {title:"title3",description:"description3"}]
	}
];
				
$('body').on('click', '#addCategoryButton', function() {
	$( newCat("New Category",[]) ).insertBefore( '#addCategoryButton' );
	enableDragDrop();
});

$('body').on('click', '.addTaskButton', function() { 
	 $(this).siblings('.connectedSortable').append($( newTask("","") ));
	 enableDragDrop();
});

function generateCats()
{
	var html='';
	for(var i of boardDetails)
	{
		html += newCat(i.categoryName,i.taskList);
	}
	html += 	'<button type="button" class="btn btn-info btn-lg" id="addCategoryButton">'+
				'Add Category'+
				'</button>';
	$('#categoryWrapper').html($(html));
	enableDragDrop();
}

generateCats();

function parseCats() {
	var catStruct = [];
	var categories = $("#categoryWrapper .categoryDiv");
	categories.each( function(index,value) { 
		var tempcat = {
			categoryName: $(value).find(".categoryTitle").text(),
			taskList:[]
		};
		var taskList = $(value).find(".task");
		taskList.each( function(index1,value1) { 
			tempcat.taskList.push({title:$(value1).find(".task-title").text(), description:$(value1).find(".task-description").text()});
		});
		catStruct.push(tempcat);
	})
	return catStruct;
}

function enableDragDrop()
{
    $( ".connectedSortable" ).sortable(
	{
		stop: function( event, ui ) { SyncTimer(); },
		connectWith: ".connectedSortable"
    })
	.disableSelection();
	console.log("enabling drag and drop");
}

//task modal stuff

var t;

$('#taskeditModal').on('show.bs.modal', function (event) {
    t = $(event.relatedTarget).closest('.task');
	console.log(t.find('.task-title').text());
	console.log(t.find('.task-description').text());
	$(this).find('#editTitle').val(t.find('.task-title').text());
	$(this).find('#editDescription').val(t.find('.task-description').text());
});

$('#taskeditModal').on('hide.bs.modal', function (event) {
	t.find('.task-title label').html($(this).find('#editTitle').val())
	t.find('.task-description').html($(this).find('#editDescription').val())
	SyncTimer();
});

//taskdelete

$('#taskdeleteButton').on('click',function(e){
	t.remove();
	$('#taskeditModal').modal('hide');
	SyncTimer();
})

//category stuff
var c;

$('#categoryeditModal').on('show.bs.modal', function (event) {
    c = $(event.relatedTarget).closest('.categoryDiv');
	$(this).find('#editCategory').val(c.find('.categoryTitle').text());
});

$('#categoryeditModal').on('hide.bs.modal', function (event) {
	c.find('.categoryTitle label').html($(this).find('#editCategory').val())
	SyncTimer();

});

$('#categorydeleteButton').on('click',function(e){
	c.remove();
	$('#categoryeditModal').modal('hide');
	SyncTimer();
})

//login request

$('#submitLogin').on('click', function(){
	if(isAjaxInProcess){
		console.log("request already in progress.")
		return;
	}
	var settings = {
		"async": true,
		"crossDomain": true,
		"url": url+"/login",
		"method": "POST",
		"headers": {
		"content-type": "application/x-www-form-urlencoded"
		},
		"data": { "username":$('#loginUsername').val(),"password": md5($('#loginPassword').val()) }
	}
	
	isAjaxInProcess = true;
	AjaxInProgress(isAjaxInProcess);

	$.ajax(settings).done(function (response) {
		console.log(response);
		if(response.token)
		{
			token = response.token;
			localStorage.setItem('token', token);
			boardDetails = response.user.board;
			generateCats();
			$('#usernameDisplay').html(response.user.username);
			$('#login-page').addClass("hide");
			$('#loginModal').modal('hide');
			
			$('#board-page').removeClass("hide");
		}
	}).fail(function(response){
		console.log(response);
		alert("Bad kitty! The server refused to authenticate you.");
	}).always(function(){
		isAjaxInProcess = false;
		AjaxInProgress(isAjaxInProcess);
	});
})

//sign up

$('#submitSignup').on('click', function(){
	if(isAjaxInProcess){
		console.log("request already in progress.")
		return;
	}
	var settings = {
		"async": true,
		"crossDomain": true,
		"url": url+"/create",
		"method": "POST",
		"headers": {
		"content-type": "application/x-www-form-urlencoded"
		},
		"data": { "username":$('#signupUsername').val(),"password": md5($('#signupPassword').val()) }
	}
	
	isAjaxInProcess = true;
	AjaxInProgress(isAjaxInProcess);

	$.ajax(settings).done(function (response) {
		console.log(response);
		if(response==true)
		{
			$('#signupModal').modal('hide')
			alert("Successfully created user. Please log in to continue.")
		}
	}).fail(function(response){
		console.log(response);
	}).always(function(){
		isAjaxInProcess = false;
		AjaxInProgress(isAjaxInProcess);
	});
})

//retrieve all

function retrieveAll()
{
	if(isAjaxInProcess){
		console.log("request already in progress.")
		return;
	}
	var settings = {
		"async": true,
		"crossDomain": true,
		"url": url+"/retrieveall",
		"method": "POST",
		"headers": { 
		"Authorization":"Bearer "+token, 
		"content-type": "application/x-www-form-urlencoded"
		}
	}
	
	isAjaxInProcess = true;
	AjaxInProgress(isAjaxInProcess);

	$.ajax(settings).done(function (response) {
		console.log(response);
		if(response)
		{
			boardDetails = response.board;
			generateCats();
			$('#usernameDisplay').html(response.username);
			$('#login-page').addClass("hide");
			$('#board-page').removeClass("hide");
		}
	}).fail(function(response){
		console.log(response);
	}).always(function(){
		isAjaxInProcess = false;
		AjaxInProgress(isAjaxInProcess);
	});
}

//logout
function logout()
{
	token=null;
	localStorage.setItem('token', token);
	$('#login-page').removeClass("hide");
	$('#board-page').addClass("hide");
}

$('#logoutButton').on('click',logout);

//sync request

function sync()
{
	if(isAjaxInProcess){
		console.log("request already in progress.")
		return;
	}
	var pc = parseCats();
	console.log(pc)
	var settings = {
		"async": true,
		"crossDomain": true,
		"url": url+"/updateall",
		"method": "POST",
		"headers": { 
		"Authorization":"Bearer "+token, 
		"content-type": "application/x-www-form-urlencoded"
		},
		"data": { "board": JSON.stringify(pc) }
	}
	
	isAjaxInProcess = true;
	AjaxInProgress(isAjaxInProcess);

	$.ajax(settings).done(function (response) {
		console.log(response);
		if(response==true)
		{
			console.log("synced.")
		}
	}).fail(function(response){
		console.log(response);
	}).always(function(){
		isAjaxInProcess = false;
		AjaxInProgress(isAjaxInProcess);
	});
}

$('#syncbutton').on('click',sync);


$(document).ready(function(){
	token = localStorage.getItem('token');
	retrieveAll();
})

console.log(parseCats());