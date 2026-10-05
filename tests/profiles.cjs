'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const readme=fs.readFileSync(path.join(__dirname,'../README.md'),'utf8');
const main=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].at(-1)[1];
for(const old of ['sshpass','ssh-copy-id','sshPassInput','allCmd','btnCopyAll','cardVerify','连接命令','BatchMode=yes','buildVerifyCommand','验证登录','复制验证命令','真实私钥路径','私钥登录验证','iOS Files/iCloud','StrictHostKeyChecking=ask']) {
 assert(!html.includes(old),`removed from page: ${old}`);
 assert(!readme.includes(old),`removed from README: ${old}`);
}
assert(html.includes('服务器安装公钥'));assert(main.includes('authorized_keys'));
class Element {
 constructor(tag){this.style={};this.tag=tag;this.children=[];this.classList={toggle:()=>{}};}
 set innerHTML(value){this.markup=value;this.children=[];} get innerHTML(){return this.markup;}
 appendChild(e){this.children.push(e);return e;}
}
const list=new Element('ul'),empty=new Element('p');
let stored=0,exported=[],confirmed=false;
const profiles=[{name:'<img onerror=evil>',keyName:'a"/><svg onload=evil>',host:'example.com',port:22,user:'root'}, {name:'second',keyName:'key2',host:'example.org',port:2222,user:'user'}];
const c=vm.createContext({document:{createElement:tag=>new Element(tag)},$:id=>id==='profileList'?list:empty,loadProfiles:()=>profiles,updateStats:()=>{},exportProfile:i=>exported.push(i),confirm:()=>confirmed,PF_STORE:'profiles',saveStore:(key,value)=>{assert.equal(key,'profiles');assert.equal(value,profiles);stored++;}});
for(const n of ['escapeHtml','renderProfiles']) vm.runInContext(main.match(new RegExp('function '+n+'\\([^]*?\\n\\}'))[0],c);
c.renderProfiles();assert.equal(list.children.length,2);
for(const [i,li] of list.children.entries()){
 assert.deepEqual(li.children.map(e=>e.tag),['button','button'],'no path inputs or expandable panels');
 assert.deepEqual(li.children.map(e=>e.textContent),['导出文档','删除']);
 li.children[0].onclick();assert.equal(exported.at(-1),i);
}
assert(!list.children[0].innerHTML.includes('<img'));assert(list.children[0].innerHTML.includes('&lt;img'));assert.equal(stored,0);
list.children[1].children[1].onclick();assert.equal(profiles.length,2);assert.equal(stored,0);
confirmed=true;list.children[1].children[1].onclick();assert.equal(profiles.length,1);assert.equal(stored,1);assert.equal(list.children.length,1);
assert(main.includes('$("btnSaveProfile").addEventListener'));assert(main.includes('host=${p.host}\\nport=${p.port}\\nuser=${p.user}\\nprivate_key=\\n'));
console.log('PASS: no login verification, real-path UI or legacy connection commands; authorized_keys retained; per-record export/delete, delete confirmation, safe rendering, save/export format unchanged.');
