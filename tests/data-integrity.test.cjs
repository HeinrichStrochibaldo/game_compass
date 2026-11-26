// Run from repository root: node --test tests/data-integrity.test.cjs
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const paths=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]);
const script=paths.map(p=>fs.readFileSync(require('node:path').join(__dirname,'..',p),'utf8')).join('\n');
const core=script.slice(script.indexOf('const BASE='),script.indexOf('const Recommendation='));
const save=script.slice(script.indexOf('function save()'),script.indexOf('const {done,owned,performance}'));
const importer=script.slice(script.indexOf('async function importJSON('),script.indexOf('function resetData('));
const editor=script.slice(script.indexOf('function saveGame('),script.indexOf('function closeModal('));
const mood=script.slice(script.indexOf('function toggleMood('),script.indexOf('function pool('));
function boot(raw=null,{readError=false,writeError=false,accept=true,fields={}}={}){
  let stored=raw,writes=0,alerts=[],renders=0;
  const storage={getItem(){if(readError)throw Error('read');return stored},setItem(k,v){if(writeError)throw Error('quota');stored=v;writes++}};
  const app=new Function('localStorage','alert','confirm','closeModal','renderAll','$','renderTimeMode','renderHome','renderCatalog','renderMoods',core+save+importer+editor+mood+'return {migrateData,mergeCatalog,save,importJSON,saveGame,setMode,setQuick,toggleMood,firstMood:MOODS[0],get:()=>state,blocked:()=>storageBlocked}')(
    storage,x=>alerts.push(x),()=>accept,()=>{},()=>renders++,id=>({value:fields[id]??''}),...Array(4).fill(()=>renders++));
  return {...app,stored:()=>stored,writes:()=>writes,alerts,renders:()=>renders};
}
const fixture=()=>JSON.parse(JSON.stringify(boot().get()));
const legacy=()=>{const v=fixture();v.version=1;v.games=v.games.map(({progress,historyGroup,legacyUnowned,kind,parentId,steamAppId,...g})=>({...g,status:progress==='completed'?historyGroup:legacyUnowned?'unowned':'unknown'}));return v};
test('whole script parses',()=>{new Function(script)});
test('legacy migration and idempotence',()=>{const a=boot(),v=legacy();delete v.version;v.games[0].date='';v.games[0].note='test';const m=a.migrateData(v);assert.equal(m.version,2);assert.equal(m.games[0].date,'');assert.equal(m.games[0].note,'test');assert.deepEqual(a.migrateData(m),m);assert.equal(v.version,undefined)});
for(const version of [3,-1,'1',null,1.5])test('reject version '+JSON.stringify(version),()=>{const a=boot();assert.throws(()=>a.migrateData({...fixture(),version}))});
for(const [field,value] of Object.entries({id:2,date:'2026-02-30',hours:-1,owned:'bad',control:'bad',note:3,progress:'bad',genre:'bad',screen:'bad',order:0}))test('reject '+field,()=>{const a=boot(),v=fixture();v.games[0][field]=value;assert.throws(()=>a.migrateData(v))});
test('catalog preserves edits and adds missing games',()=>{const a=boot(),v=fixture();v.games[0].date='';v.games[0].note='';v.games.pop();const merged=a.mergeCatalog(v.games);assert.equal(merged.length,50);assert.deepEqual(merged[0],v.games[0]);assert.deepEqual(a.mergeCatalog(merged),merged)});
for(const raw of ['{','{}'])test('protect unreadable storage '+raw,()=>{const a=boot(raw);assert.equal(a.blocked(),true);assert.equal(a.save(),false);assert.equal(a.stored(),raw);assert.equal(a.writes(),0)});
test('read denied',()=>{const a=boot(null,{readError:true});assert.equal(a.blocked(),true);assert.equal(a.save(),false)});
test('write denied',()=>{const a=boot(null,{writeError:true});assert.equal(a.save(),false);assert.equal(a.writes(),0)});
test('save and reload edits',()=>{const a=boot();a.get().games[0].date='';a.get().games[0].note='test';assert.equal(a.save(),true);assert.equal(boot(a.stored()).get().games[0].date,'');assert.equal(boot(a.stored()).get().games[0].note,'test')});
for(const scenario of ['valid','invalid','cancel','quota','malformed','recovery'])test('import '+scenario,async()=>{const a=boot(scenario==='recovery'?'{':null,{accept:scenario!=='cancel',writeError:scenario==='quota'});const before=a.get(),v=fixture();v.games[0].note='imported';const target={value:'file',files:[{text:async()=>scenario==='malformed'?'{':JSON.stringify(scenario==='invalid'?{}:v)}]};await a.importJSON({target});assert.equal(target.value,'');if(['valid','recovery'].includes(scenario)){assert.equal(a.writes(),1);assert.equal(a.get().games[0].note,'imported');assert.equal(a.blocked(),false);assert.equal(a.renders(),1)}else{assert.equal(a.get(),before);assert.equal(a.writes(),0);assert.equal(a.renders(),0)}});

for(const [field,value] of [['progress',2025],['genre',['action']],['screen',['tv']]])test('strict enum '+field,()=>{const a=boot(),v=fixture();v.games[0][field]=value;assert.throws(()=>a.migrateData(v))});
for(const scenario of ['valid','invalid','quota'])test('atomic card '+scenario,()=>{const a=boot(null,{writeError:scenario==='quota',fields:{editStatus:'2025',editOwned:'yes',editDate:'',editOrder:scenario==='invalid'?'0':'2',editNote:'edited'}});const before=a.get();a.saveGame(1);if(scenario==='valid'){assert.equal(a.get().games[0].note,'edited');assert.equal(a.writes(),1);assert.equal(a.renders(),1)}else{assert.equal(a.get(),before);assert.equal(a.writes(),0);assert.equal(a.renders(),0)}});
test('partial import merges before persistence',async()=>{const a=boot(),v=fixture();v.games.pop();await a.importJSON({target:{value:'file',files:[{text:async()=>JSON.stringify(v)}]}});assert.equal(a.get().games.length,50);assert.equal(boot(a.stored()).get().games.length,50)});
test('renderAll refreshes time mode',()=>{assert.equal(script.includes('function renderAll(){renderTimeMode();'),true)});

for(const field of ['mode','quick','moods'])for(const fail of [false,true])test('atomic settings '+field+' '+(fail?'quota':'valid'),()=>{const a=boot(null,{writeError:fail}),before=a.get(),value=field==='mode'?'story':field==='quick'?'short':[a.firstMood];if(field==='mode')a.setMode(value);else if(field==='quick')a.setQuick(value);else a.toggleMood(a.firstMood);if(fail){assert.equal(a.get(),before);assert.equal(a.writes(),0);assert.equal(a.renders(),0);assert.equal(a.alerts.length,1)}else{assert.deepEqual(a.get()[field],value);assert.deepEqual(boot(a.stored()).get()[field],value);assert.equal(a.writes(),1);assert.equal(a.renders(),field==='mode'?3:1)}});

for(const [field,value] of Object.entries({historyGroup:'bad',kind:'bad',parentId:1,steamAppId:0,legacyUnowned:'yes'}))test('reject v2 '+field,()=>{const a=boot(),v=fixture();v.games[0][field]=value;assert.throws(()=>a.migrateData(v))});
test('legacy v1 migration preserves independent date and group',()=>{const a=boot(),v=legacy();v.games[0].date='2024-02-18';const m=a.migrateData(v);assert.equal(m.games[0].date,'2024-02-18');assert.equal(m.games[0].historyGroup,'2025');assert.equal(m.games[0].progress,'completed');assert.equal(m.games[0].steamAppId,null);assert.equal(m.games[0].status,undefined)});

for(const progress of ['not_started','in_progress'])test('independent progress '+progress,()=>{const a=boot(null,{fields:{editStatus:progress,editOwned:'no',editDate:'',editOrder:'',editNote:'test'}});a.saveGame(1);assert.equal(a.get().games[0].progress,progress);assert.equal(a.get().games[0].owned,'no');assert.equal(a.writes(),1)});
for(const scenario of ['missing','dlc-parent','duplicate-steam','valid'])test('references '+scenario,()=>{const a=boot(),v=fixture();v.games[0].kind='dlc';v.games[0].parentId=scenario==='missing'?9999:2;v.games[1].kind=scenario==='dlc-parent'?'dlc':'base';if(scenario==='duplicate-steam')v.games[0].steamAppId=v.games[1].steamAppId=123;if(scenario==='valid')assert.equal(a.migrateData(v).games[0].parentId,2);else assert.throws(()=>a.migrateData(v))});
test('v2 storage key preserves legacy snapshot',()=>{const keys=new Map([['gamecompass-v1',JSON.stringify(legacy())]]);const original=keys.get('gamecompass-v1');const a=new Function('localStorage','alert',core+'persist(state);return state')({getItem:k=>keys.get(k)??null,setItem:(k,v)=>keys.set(k,v)},()=>{});assert.equal(a.version,2);assert.equal(keys.get('gamecompass-v1'),original);assert.equal(JSON.parse(keys.get('gamecompass-v2')).version,2)});

const R=new Function(fs.readFileSync(require('node:path').join(__dirname,'..','js/recommendations.js'),'utf8')+'\nreturn Recommendation')();
const game=(over={})=>({id:1,name:'Example',progress:'unknown',owned:'yes',legacyUnowned:false,hours:20,genre:'action',screen:'tv',series:'',date:'',order:null,...over});
const context=(games=[],over={})=>({games,mode:'extra',moods:[],...over});
for(const [mode,expected] of [['story',13],['extra',20],['all',36]])test('recommendation duration '+mode,()=>assert.equal(R.h(game(),context([],{mode})),expected));
test('recommendation excludes completed and unowned',()=>{const a=game(),b=game({id:2,progress:'completed'}),c=game({id:3,owned:'no'});assert.deepEqual(R.recList(context([a,b,c])).map(x=>x.g.id),[1])});
test('legacy ownership fallback',()=>{assert.equal(R.owned(game({owned:'unknown',legacyUnowned:true})),false);assert.equal(R.owned(game({owned:'yes',legacyUnowned:true})),true)});
test('series successor sorted by id',()=>{const a=game({series:'S'}),b=game({id:2,series:'S'}),c=game({id:3,series:'S'});assert.equal(R.seriesNext(a,context([c,a,b])),b)});
test('history prioritizes actual dates',()=>{const a=game({progress:'completed',date:'2025-01-01'}),b=game({id:2,progress:'completed',date:'2026-01-01'}),c=game({id:3,progress:'completed',order:99});assert.deepEqual(R.lastPlayed(context([a,c,b])).map(x=>x.id),[2,1,3])});
test('mood adds short session bonus',()=>{const a=game({hours:8});assert.equal(R.moodScore(a,context([a],{moods:['На один вечер']})),R.rank(a,context([a])).score+8)});
test('recommendation does not mutate context',()=>{const c=context([game(),game({id:2,progress:'completed'})]);const before=JSON.stringify(c);R.recList(c);R.lastPlayed(c);assert.equal(JSON.stringify(c),before)});

test('empty recommendation context',()=>{assert.deepEqual(R.recList(context()),[]);assert.deepEqual(R.lastPlayed(context()),[])});
test('all candidates excluded',()=>assert.deepEqual(R.recList(context([game({progress:'completed'}),game({id:2,owned:'no'})])),[]));
test('zero duration stays zero',()=>assert.equal(R.h(game({hours:0}),context()),0));
test('independent recommendation contexts',()=>{const a=game();assert.equal(R.h(a,context([],{mode:'story'})),13);assert.equal(R.h(a,context([],{mode:'all'})),36);assert.equal(R.h(a,context([],{mode:'story'})),13)});
test('conflicting moods combine independently',()=>{const a=game({hours:8,genre:'action'});assert.equal(R.moodScore(a,context([a],{moods:['На один вечер','Без напряжения','Хочу экшен']})),R.rank(a,context([a])).score+8-2+7)});
test('series completion bonus',()=>{const a=game({series:'S',progress:'completed'}),b=game({id:2,series:'S'});assert.equal(R.rank(b,context([a,b])).score,R.rank({...b,series:''},context([a,b])).score+8)});
test('unfinished predecessor penalty',()=>{const a=game({series:'S'}),b=game({id:2,series:'S'});assert.equal(R.rank(b,context([a,b])).score,R.rank({...b,series:''},context([a,b])).score-12)});
for(const [name,change] of [
 ['empty catalog',v=>v.games=[]],
 ['duplicate id',v=>v.games[1].id=v.games[0].id],
 ['blank name',v=>v.games[0].name=' '],
 ['self parent',v=>{v.games[0].kind='dlc';v.games[0].parentId=v.games[0].id}],
 ['non DLC parent link',v=>{v.games[0].kind='base';v.games[0].parentId=v.games[1].id}],
 ['inconsistent history',v=>{v.games[0].progress='in_progress';v.games[0].historyGroup='2025'}],
 ['duplicate moods',v=>v.moods=['Сюжет','Сюжет']],
 ['too many moods',v=>v.moods=['Сюжет','Гонки','Вдвоём','Кооператив','До OLED','На месяц']],
 ['invalid mode',v=>v.mode='bad'],
 ['invalid quick filter',v=>v.quick='bad'],
 ['invalid recent',v=>v.recent=null],
 ['invalid history notes',v=>v.historyNotes=42]
])test('reject '+name,()=>{const a=boot(),v=fixture();change(v);const before=JSON.stringify(v);assert.throws(()=>a.migrateData(v));assert.equal(JSON.stringify(v),before)});
test('invalid import preserves existing saved data',async()=>{const raw=JSON.stringify(fixture()),a=boot(raw),v=fixture();v.games=[];await a.importJSON({target:{value:'file',files:[{text:async()=>JSON.stringify(v)}]}});assert.equal(a.stored(),raw);assert.equal(a.writes(),0)});

test('excluded mood score is finite with or without moods',()=>{for(const g of [game({owned:'no'}),game({progress:'completed'})])for(const moods of [[],['Хочу экшен']])assert.equal(R.moodScore(g,context([g],{moods})),-999)});
test('series rank independent of catalog order',()=>{const a=game({series:'S',progress:'completed'}),b=game({id:2,series:'S'}),c=game({id:3,series:'S'});assert.deepEqual(R.rank(c,context([a,b,c])),R.rank(c,context([b,a,c])))});
