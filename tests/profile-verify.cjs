const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const main=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].at(-1)[1];
for(const old of ['sshpass','ssh-copy-id','sshPassInput','allCmd','btnCopyAll','cardVerify','连接命令','BatchMode=yes']) assert(!html.includes(old),`removed ${old}`);
assert(html.includes('服务器安装公钥'));
class Element {
 constructor(tag){this.style={};this.tag=tag;this.children=[];this.value='';this.disabled=false;this.className='';this.classList={toggle:(name,force)=>{const s=new Set(this.className.split(' ').filter(Boolean));const on=force===undefined?!s.has(name):force;on?s.add(name):s.delete(name);this.className=[...s].join(' ');return on;},contains:name=>this.className.split(' ').includes(name)};}
 appendChild(e){this.children.push(e);return e;} focus(){this.focused=true;}
}
const list=new Element('ul'),empty=new Element('p');
let copied=[],stored=0;
const profiles=[{name:'<img onerror=evil>',keyName:'a\"/><svg onload=evil>',host:'example.com',port:22,user:'root'}, {name:'jp',keyName:'jp',host:'23.249.25.61',port:20058,user:'root'}];
const c=vm.createContext({document:{createElement:tag=>new Element(tag)},$:id=>id==='profileList'?list:empty,loadProfiles:()=>profiles,updateStats:()=>{},copyText:(cmd)=>copied.push(cmd),toast:()=>{},saveStore:()=>{stored++;}});
for(const n of ['shellQuote','escapeHtml','buildVerifyCommand','renderProfiles']) vm.runInContext(main.match(new RegExp('function '+n+'\\([^]*?\\n\\}'))[0],c);
c.renderProfiles();assert.equal(list.children.length,2);
for(const li of list.children){
 assert.deepEqual(li.children.filter(e=>e.tag==='button').map(e=>e.textContent),['验证登录','导出文档','删除']);
 const [verify,,,panel]=li.children;
 assert(panel.classList.contains('hidden'));verify.onclick();assert(!panel.classList.contains('hidden'));
 const [label,note,copy]=panel.children,input=label.children[0];assert(input.focused);assert.equal(input.value,'');assert(copy.disabled);assert(note.textContent.includes('iOS Files/iCloud'));assert(!copied.length);
 input.value='  ';input.oninput();assert(copy.disabled);
 input.value="/terminal/real key's $(id)";input.oninput();assert(!copy.disabled);copy.onclick();
 assert(copied.at(-1).includes(c.shellQuote(input.value)));input.value='';input.oninput();assert(copy.disabled);
 copied=[];
}
assert(!list.children[0].innerHTML.includes('<img'));assert(list.children[0].innerHTML.includes('&lt;img'));assert.equal(stored,0);
const cmd=c.buildVerifyCommand('23.249.25.61',20058,'root','~/.ssh/jp');
for(const flag of ['-F /dev/null','-p 20058',"-l 'root'",'IdentitiesOnly=yes','IdentityAgent=none','PreferredAuthentications=publickey','PubkeyAuthentication=yes','PasswordAuthentication=no','KbdInteractiveAuthentication=no','StrictHostKeyChecking=ask']) assert(cmd.includes(flag),flag);
assert(cmd.includes('"$HOME"/\'.ssh/jp\''));assert(cmd.includes("'23.249.25.61'"));assert(!cmd.includes('authorized_keys'));cp.execFileSync('sh',['-n'],{input:cmd});
const quoted=c.buildVerifyCommand('example.com',22,'test',"./a'b $(id)");cp.execFileSync('sh',['-n'],{input:quoted});assert(quoted.includes(c.shellQuote("./a'b $(id)")));
for(const args of [['-oProxyCommand=evil',22,'root','a'],['example.com','22oops','root','a'],['example.com',0,'root','a'],['example.com',65536,'root','a'],['example.com',22,'root;id','a'],['example.com',22,'root','a\nb'],['example.com',22,'root',''],['example.com',22,'root','   ']]) assert.throws(()=>c.buildVerifyCommand(...args));
console.log('PASS: offline DOM per-record verify/export/delete, initially empty editable real path, disabled copy until input, no storage writes, safe rendering/quoting, endpoint/port, publickey-only authentication and first-host confirmation.');
