// Small server, no packages needed. Settings are read from environment variables (see README).
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=process.env.PORT||3000,ROOT=__dirname,DATA=path.join(ROOT,'data','data.json'),UP=path.join(ROOT,'uploads'),PRIV=path.join(ROOT,'private'),AUTH=path.join(PRIV,'auth.json');
const BASE=(process.env.BASE_URL||'http://localhost:'+PORT).replace(/\/$/,''),CB=BASE+'/auth/google/callback',SEC=BASE.startsWith('https')?'; Secure':'';
const G={id:process.env.GOOGLE_CLIENT_ID,secret:process.env.GOOGLE_CLIENT_SECRET,email:(process.env.ADMIN_EMAIL||'').trim().toLowerCase()},GOK=!!(G.id&&G.secret&&G.email);
const DEFAULT=process.env.ADMIN_PASSWORD||'changeme';
const T={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png'};
const sessions=new Map(),fails=new Map(),rand=n=>crypto.randomBytes(n).toString('hex');
const sh=(pw,salt)=>crypto.scryptSync(pw,salt,64),h256=s=>crypto.createHash('sha256').update(s).digest();
function checkPw(pw){if(typeof pw!=='string'||!pw)return false;let a=null;try{a=JSON.parse(fs.readFileSync(AUTH,'utf8'))}catch(e){}
 if(a)return crypto.timingSafeEqual(sh(pw,a.salt),Buffer.from(a.hash,'hex'));return crypto.timingSafeEqual(h256(pw),h256(DEFAULT))}
function setPw(pw){const salt=rand(16);fs.mkdirSync(PRIV,{recursive:true});fs.writeFileSync(AUTH,JSON.stringify({salt,hash:sh(pw,salt).toString('hex')}))}
const body=(req,max)=>new Promise((ok,no)=>{let c=[],n=0;req.on('data',d=>{n+=d.length;if(n>max){no(new Error('big'));req.destroy()}else c.push(d)});req.on('end',()=>ok(Buffer.concat(c)))});
const sess=req=>{const m=(req.headers.cookie||'').match(/sid=([a-f0-9]+)/);return m?sessions.get(m[1]):null};
const cookie=recovery=>{const s=rand(24);sessions.set(s,{recovery});return 'sid='+s+'; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800'+SEC};
const send=(res,code,obj,hd)=>{res.writeHead(code,Object.assign({'Content-Type':'application/json'},hd||{}));res.end(JSON.stringify(obj||{}))};
const go=(res,loc,hd)=>{res.writeHead(302,Object.assign({Location:loc},hd||{}));res.end()};
http.createServer(async(req,res)=>{try{
 const u=new URL(req.url,'http://x'),p0=u.pathname,s=sess(req);
 if(p0==='/api/config')return send(res,200,{google:GOK});
 if(p0==='/api/me')return s?send(res,200,{recovery:!!s.recovery}):send(res,401);
 if(req.method==='POST'&&p0==='/api/logout'){const m=(req.headers.cookie||'').match(/sid=([a-f0-9]+)/);if(m)sessions.delete(m[1]);return send(res,200)}
 if(req.method==='POST'&&p0==='/api/login'){
  const ip=req.socket.remoteAddress,f=fails.get(ip)||{n:0,t:Date.now()};
  if(Date.now()-f.t>9e5){f.n=0;f.t=Date.now()}
  if(f.n>=5)return send(res,429);
  const b=JSON.parse((await body(req,1e4)).toString());
  if(!checkPw(b.password)){f.n++;fails.set(ip,f);return send(res,401)}
  fails.delete(ip);return send(res,200,{ok:true},{'Set-Cookie':cookie(false)})}
 if(req.method==='POST'&&p0==='/api/password'){
  if(!s)return send(res,401);
  const b=JSON.parse((await body(req,1e4)).toString());
  if(typeof b.next!=='string'||b.next.length<8)return send(res,400);
  if(!s.recovery&&!checkPw(b.current))return send(res,401);
  setPw(b.next);s.recovery=false;return send(res,200,{ok:true})}
 if(p0==='/auth/google'){
  if(!GOK)return go(res,'/admin');
  const st=rand(16);
  return go(res,'https://accounts.google.com/o/oauth2/v2/auth?'+new URLSearchParams({client_id:G.id,redirect_uri:CB,response_type:'code',scope:'openid email',state:st,prompt:'select_account'}),{'Set-Cookie':'gstate='+st+'; HttpOnly; SameSite=Lax; Path=/; Max-Age=600'+SEC})}
 if(p0==='/auth/google/callback'){
  const ck=(req.headers.cookie||'').match(/gstate=([a-f0-9]+)/),code=u.searchParams.get('code');
  if(!GOK||!ck||ck[1]!==u.searchParams.get('state')||!code){res.writeHead(400);return res.end('Sign-in failed. Go back to /admin and try again.')}
  const tk=await(await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:G.id,client_secret:G.secret,redirect_uri:CB,grant_type:'authorization_code'})})).json();
  const info=tk.access_token?await(await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:'Bearer '+tk.access_token}})).json():{};
  if(!info.email_verified||String(info.email).toLowerCase()!==G.email){res.writeHead(403);return res.end('This Google account is not the admin account.')}
  return go(res,'/admin',{'Set-Cookie':cookie(true)})}
 if(req.method==='POST'&&p0==='/api/data'){
  if(!s)return send(res,401);
  const d=JSON.parse((await body(req,2e6)).toString());
  if(!d.site||!Array.isArray(d.listings)||!Array.isArray(d.events))return send(res,400);
  fs.writeFileSync(DATA,JSON.stringify(d,null,2));return send(res,200,{ok:true})}
 if(req.method==='POST'&&p0==='/api/upload'){
  if(!s)return send(res,401);
  const ext=String(req.headers['x-ext']||'').toLowerCase();
  if(!['jpg','png','webp'].includes(ext))return send(res,400);
  const buf=await body(req,6e6);fs.mkdirSync(UP,{recursive:true});
  const name=rand(8)+'.'+ext;fs.writeFileSync(path.join(UP,name),buf);
  return send(res,200,{path:'uploads/'+name})}
 let p=decodeURIComponent(p0);if(p==='/')p='/index.html';if(p==='/admin')p='/admin.html';
 const f=path.join(ROOT,p);
 if(!f.startsWith(ROOT+path.sep)||/^\/private(\/|$)/.test(p)||/(server\.js|package\.json|README\.md)$/.test(p)||p.split('/').some(x=>x.startsWith('.'))){res.writeHead(404);return res.end('Not found')}
 fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});res.end(d)});
}catch(e){res.writeHead(500);res.end('Error')}}).listen(PORT,()=>{console.log('Site: http://localhost:'+PORT+'   Admin: http://localhost:'+PORT+'/admin');
 if(!fs.existsSync(AUTH)&&DEFAULT==='changeme')console.log('WARNING: the admin password is "changeme". Set ADMIN_PASSWORD, or log in and change it.');
 console.log('Google recovery: '+(GOK?'on for '+G.email:'off (set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and ADMIN_EMAIL to turn on)'))});
