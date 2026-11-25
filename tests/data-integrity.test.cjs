// Run from repository root: node --test tests/data-integrity.test.cjs
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const core=script.slice(script.indexOf('const BASE='),script.indexOf('let limit='));
const save=script.slice(script.indexOf('function save()'),script.indexOf('function done('));
const importer=script.slice(script.indexOf('async function importJSON('),script.indexOf('function resetData('));
const editor=script.slice(script.indexOf('function saveGame('),script.indexOf('function closeModal('));
function boot(raw=null,{readError=false,writeError=false,accept=true,fields={}}={}){
  let stored=raw,writes=0,alerts=[],renders=0;
  const storage={getItem(){if(readError)throw Error('read');return stored},setItem(k,v){if(writeError)throw Error('quota');stored=v;writes++}};
  const app=new Function('localStorage','alert','confirm','closeModal','renderAll','$',core+save+importer+editor+'return {migrateData,mergeCatalog,save,importJSON,saveGame,get:()=>state,blocked:()=>storageBlocked}')(
    storage,x=>alerts.push(x),()=>accept,()=>{},()=>renders++,id=>({value:fields[id]??''}));
  return {...app,stored:()=>stored,writes:()=>writes,alerts,renders:()=>renders};
}
const fixture=()=>JSON.parse(JSON.stringify(boot().get()));
test('whole script parses',()=>{new Function(script)});
test('legacy migration and idempotence',()=>{const a=boot(),v=fixture();delete v.version;v.games[0].date='';v.games[0].note='test';const m=a.migrateData(v);assert.equal(m.version,1);assert.equal(m.games[0].date,'');assert.equal(m.games[0].note,'test');assert.deepEqual(a.migrateData(m),m);assert.equal(v.version,undefined)});
for(const version of [2,-1,'1',null,1.5])test('reject version '+JSON.stringify(version),()=>{const a=boot();assert.throws(()=>a.migrateData({...fixture(),version}))});
for(const [field,value] of Object.entries({id:2,date:'2026-02-30',hours:-1,owned:'bad',control:'bad',note:3,status:'bad',genre:'bad',screen:'bad',order:0}))test('reject '+field,()=>{const a=boot(),v=fixture();v.games[0][field]=value;assert.throws(()=>a.migrateData(v))});
test('catalog preserves edits and adds missing games',()=>{const a=boot(),v=fixture();v.games[0].date='';v.games[0].note='';v.games.pop();const merged=a.mergeCatalog(v.games);assert.equal(merged.length,50);assert.deepEqual(merged[0],v.games[0]);assert.deepEqual(a.mergeCatalog(merged),merged)});
for(const raw of ['{','{}'])test('protect unreadable storage '+raw,()=>{const a=boot(raw);assert.equal(a.blocked(),true);assert.equal(a.save(),false);assert.equal(a.stored(),raw);assert.equal(a.writes(),0)});
test('read denied',()=>{const a=boot(null,{readError:true});assert.equal(a.blocked(),true);assert.equal(a.save(),false)});
test('write denied',()=>{const a=boot(null,{writeError:true});assert.equal(a.save(),false);assert.equal(a.writes(),0)});
test('save and reload edits',()=>{const a=boot();a.get().games[0].date='';a.get().games[0].note='test';assert.equal(a.save(),true);assert.equal(boot(a.stored()).get().games[0].date,'');assert.equal(boot(a.stored()).get().games[0].note,'test')});
for(const scenario of ['valid','invalid','cancel','quota','malformed','recovery'])test('import '+scenario,async()=>{const a=boot(scenario==='recovery'?'{':null,{accept:scenario!=='cancel',writeError:scenario==='quota'});const before=a.get(),v=fixture();v.games[0].note='imported';const target={value:'file',files:[{text:async()=>scenario==='malformed'?'{':JSON.stringify(scenario==='invalid'?{}:v)}]};await a.importJSON({target});assert.equal(target.value,'');if(['valid','recovery'].includes(scenario)){assert.equal(a.writes(),1);assert.equal(a.get().games[0].note,'imported');assert.equal(a.blocked(),false);assert.equal(a.renders(),1)}else{assert.equal(a.get(),before);assert.equal(a.writes(),0);assert.equal(a.renders(),0)}});

for(const [field,value] of [['status',2025],['genre',['action']],['screen',['tv']]])test('strict enum '+field,()=>{const a=boot(),v=fixture();v.games[0][field]=value;assert.throws(()=>a.migrateData(v))});
for(const scenario of ['valid','invalid','quota'])test('atomic card '+scenario,()=>{const a=boot(null,{writeError:scenario==='quota',fields:{editStatus:'2025',editOwned:'yes',editDate:'',editOrder:scenario==='invalid'?'0':'2',editNote:'edited'}});const before=a.get();a.saveGame(1);if(scenario==='valid'){assert.equal(a.get().games[0].note,'edited');assert.equal(a.writes(),1);assert.equal(a.renders(),1)}else{assert.equal(a.get(),before);assert.equal(a.writes(),0);assert.equal(a.renders(),0)}});
test('partial import merges before persistence',async()=>{const a=boot(),v=fixture();v.games.pop();await a.importJSON({target:{value:'file',files:[{text:async()=>JSON.stringify(v)}]}});assert.equal(a.get().games.length,50);assert.equal(boot(a.stored()).get().games.length,50)});
test('renderAll refreshes time mode',()=>{assert.equal(script.includes('function renderAll(){renderTimeMode();'),true)});
