var sessions = {};
var session_key = 'freemind_session';
var EXPIRES = 20 * 60 * 1000;

//生成session的代码
var generate = function(){
	var session = {};
	session.id = (new Date()).getTime() + Math.random();
	session.cookie = {
		expires: (new Date()).getTime() + EXPIRES
	};
	sessions[session.id] = session;
	return session;
};

//请求到来时检查cookie的口令和服务端数据，如果过期，就重新生成，这部分只管服务端
exports.session =  function(req, res, next){
	var id = req.cookies[session_key];
	if(!id){
		req.session = generate();
	}
	else{
		var session = sessions[id];
		if(session){
			if(session.cookie.expires > (new Date()).getTime()){
				//更新超时时间
				session.cookie.expires = (new Date()).getTime() + EXPIRES;
				req.session = session;
			}
			else{
				//超时了，删除旧的数据，并重新生成
				delete sessions[id];
				req.session = generate();
			}
		}
		else{
			//如果session过期或者口令不对，重新生成session
			req.session = generate();
		}
	}
	var session = serialize(session_key, req.session.id, {path : '/'});
	res.setHeader('Set-Cookie', session);

	next();
};

function serialize(name, val, opt){
	var pairs = [name + '=' + val];
	opt = opt || {};
	if(opt.maxAge) pairs.push('Max-Age=' + opt.maxAge);
	if(opt.domain) pairs.push('Domain=' + opt.domain);
	if(opt.path) pairs.push('Path=' + opt.path);
	if(opt.expires) pairs.push('Expires=' + opt.expires.toUTCString());
	if(opt.httpOnly) pairs.push('HttpOnly');
	if(opt.secure) pairs.push('Secure');

	return pairs.join(';');
}