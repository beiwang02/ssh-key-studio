// HTTP crypto fallback regression: no crypto.subtle in this VM.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict'),cp=require('node:child_process'),os=require('node:os');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const c={Uint8Array,Uint32Array,Float64Array,ArrayBuffer,DataView,TextEncoder,TextDecoder,navigator:{appName:'Netscape'},setTimeout,clearTimeout,crypto:{getRandomValues:b=>crypto.webcrypto.getRandomValues(b)},btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary')};
c.window=c;c.self=c;vm.createContext(c);vm.runInContext(scripts[0],c);vm.runInContext(scripts[2],c);
const main=scripts.at(-1);
for(const name of ['bytesToB64','b64ToBytes','bytesToB64NoPad','uint32be','concatBytes','sshString']){
 const m=main.match(new RegExp('function '+name+'\\([^]*?\\n\\}'))||main.match(new RegExp('function '+name+'[^\\n]+'));
 assert(m,`missing ${name}`);vm.runInContext(m[0],c);
}
vm.runInContext(main.slice(main.indexOf('function secureRandomBytes'),main.indexOf('/* ---------- 导入 ---------- */')),c);
(async()=>{
 for(const text of ['', 'abc', 'a'.repeat(80), '中文']) assert.equal(Buffer.from(await c.digestSha256(new TextEncoder().encode(text))).toString('hex'),crypto.createHash('sha256').update(text).digest('hex'));
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ssh-http-'));
 try{
  for(const [name,type,kp] of [['ed','ssh-ed25519',await c.generateEd25519Pair('http@test')],['rsa','ssh-rsa',await c.generateKeyPair(2048)]]){
   const file=path.join(dir,name);fs.writeFileSync(file,kp.privateKey,{mode:0o600});
   const pub=cp.execFileSync('ssh-keygen',['-y','-f',file],{encoding:'utf8'}).trim().split(/\s+/);
   assert.equal(pub[0],type);assert.equal(pub[1].replace(/=+$/,''),kp.publicKey);
   const fp=cp.execFileSync('ssh-keygen',['-lf',file],{encoding:'utf8'}).trim().split(/\s+/)[1];assert.equal(fp,kp.fingerprint);
  }
  c.crypto.getRandomValues=undefined;assert.throws(()=>c.secureRandomBytes(32),/安全随机源/);
  console.log('PASS: HTTP-mode SHA-256 known vectors, Ed25519/RSA-2048 OpenSSH key/fingerprint consistency, absent secure RNG rejected.');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1});
