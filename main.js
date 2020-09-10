//require안의 파라미터들은 node.js의 module들
var http = require('http');
var url = require('url'); //url의 query string을 parse하기 위해 
//url모듈을 변수에 담음.
var fs = require('fs');
var qs = require('querystring');

//브라우저로부터 어떤 요청이 들어올 때마다 http.createServer에 인자로 넘겨준 콜백함수를 탄다.
var app = http.createServer(function(request, response) { //요청에 대한 정보는 request라는 인자로 받는다.
	var _url = request.url;
	var queryData = url.parse(_url, true).query; //url에서 쿼리 데이터를 가져옴.
	var pathname = url.parse(_url, true).pathname;
	var template = require('./lib/template.js') //모듈화
	var path = require('path');
	var sanitizeHtml = require('sanitize-html'); //node_modueles라는 '약속된 폴더'에서 sanitize-html을 찾아온다.

	if (pathname === '/') { //root로 들어왔다
		fs.readdir('./data', function(err, filelist) {
			var filteredId = queryData.id ? path.parse(queryData.id).base : ''; //여기가 좀 문제임. 강의에서 queryData.id === undefined 조건에 따라 분기한 부분을 
			// 난 합쳐서 쓰다보니 문제가 생겼음.. 추후 수정 요망.
			fs.readFile(`data/${filteredId}`, 'utf8', function (err, data) { //path.parse(..).base를 사용하게되면 경로를 숨길 수 있음. 통신보안!
			// fs.readFile(`data/${queryData.id}`, 'utf8', function (err, data) { //query string에 따라 파일명이 생성됨.
				if (queryData.id === undefined) { //home
					var title = "welcome";
					var description = 'Hello, Node.js';
					var additionalLink = '';
				} else {
					var title = sanitizeHtml(filteredId);
            		var description = sanitizeHtml(data, {
						allowedTags : ['h1']
					});
					// var title = queryData.id;
					// var description = data;
					var additionalLink = `<a href="/update?id=${title}">update</a>
					<form action="delete_process" method="post">
						<input type="hidden" name="id" value="${title}"">
						<input type="submit" value="delete"">
					</form>
					`;
				}
				var list = template.list(filelist);
				var html = template.html(title, list, 
					`<h2>${title}</h2>${description}`, //body의 내용은 달라질 수 있으니
					`<a href="/create">create</a> ${additionalLink}`,
				); 
				response.writeHead(200);
				response.end(html);
			})
		});
	} else if(pathname === '/create') {
		fs.readdir('./data', function(err, filelist) {
			var title = "WEB-create";
			var list = template.list(filelist);
			// submit하면 create_process로 정보가 전송된다. 그럼 process_create에서에서 정보를 받을 수 있어야 한다.
			var html = template.html(title, list, `
			<form action="/create_process" method="post">
				<p><input type=" " name="title" id="" placeholder="title"></p>
				<p>
					<textarea name="description" id="" cols="30" rows="10"></textarea>
				</p>
				<p>
					<input type="submit">
				</p>
			</form>
			 `, '');
			response.writeHead(200);
			response.end(html);
		})
	} else if(pathname === '/create_process') {
		var body = '';
		request.on('data', function(data){ //서버가 데이터를 수신할 때마다 콜백함수가 실행되며, 수신한 data를 파라미터로 가진다.?
			body += data;
		}); //조각조각 들어오는 정보가 더이상 없으면
		request.on('end', function(){ //end다음의 콜백함수를 호출하도록 되어있다. (스탠다드)
			var post = qs.parse(body); //querystring모듈의 parse함수에 지금까지 저장한 body를 파라미터로 주면 포스트정보를 객체로 가져올 수 있음.
			var title = post.title;
			var description = post.description;
			fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
				if(err) throw err;
				console.log("success");
				response.writeHead(302, {Location: `/?id=${title}`}); //302 = page를 다른 곳으로 redirection(강제 이동)시킴
				response.end();
			})
		});
	} else if(pathname === '/update') {
		fs.readdir('./data', function(error, filelist){
			var filteredId = path.parse(queryData.id).base;
			fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
			  var title = queryData.id;
			  var list = template.list(filelist);
			  // 수정되지 않은 제목을 넘겨주기 위해서 hidden타입의 인풋을 하나 만들어서 name='id'로 보낸다.
			  var html = template.html(title, list,
				`
				<form action="/update_process" method="post">
				  <input type="hidden" name="id" value="${title}">
				  <p><input type="text" name="title" placeholder="title" value="${title}"></p>
				  <p>
					<textarea name="description" placeholder="description">${description}</textarea>
				  </p>
				  <p>
					<input type="submit">
				  </p>
				</form>
				`,
				`<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
			  );
			  response.writeHead(200);
			  response.end(html);
			});
		  });
	} else if(pathname ==='/update_process') {
		var body = '';
		request.on('data', function(data){
			body += data;
		}); 
		request.on('end', function(){ 
			var post = qs.parse(body); 
			var id = post.id; // hidden input의 id값을 받아옴.
			var title = post.title;
			var description = post.description;
			console.log(post.id);
			fs.rename(`data/${id}`, `data/${title}`, function(err) { //(기존파일명, 바꿀파일명, 콜백)
				fs.writeFile(`data/${title}`, description, 'utf8', function(err) { //파일 내용도 바꿈
					if(err) throw err;
					console.log("success");
					response.writeHead(302, {Location: `/?id=${title}`}); //302 = page를 다른 곳으로 redirection(강제 이동)시킴
					response.end();
				})
			})
		});
	} else if(pathname === '/delete_process'){
		var body = '';
		request.on('data', function(data){
			body = body + data;
		});
		request.on('end', function(){
			var post = qs.parse(body);
			var id = post.id;
			var filteredId = path.parse(id).base;
			fs.unlink(`data/${filteredId}`, function(error){
			  response.writeHead(302, {Location: `/`});
			  response.end();
			})
		});
	  } else {
		response.writeHead(404);
		response.end('Not found');
	  }

});
app.listen(3000); //3000번 포트를 주시하고 있다가, 웹브라우저로부터 요청이 들어올 때 3000번 포트에서 
// 요청이 왔다면, 이 애플리케이션이 응답하여 동작한다.
// 기본값은 80임. 그래서 브라우저 주소창에 포트에 80을 빼먹어도 
// 자동으로 80번 포트 웹서버에 접속한다.