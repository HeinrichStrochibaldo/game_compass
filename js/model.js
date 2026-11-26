const BASE=[
  {
    "id": 1,
    "name": "Star Wars Jedi: Fallen Order",
    "status": "2025",
    "genre": "action",
    "hours": 17,
    "series": "jedi",
    "control": "pad",
    "screen": "monitor",
    "owned": "unknown",
    "date": "2025-01-05",
    "order": null
  },
  {
    "id": 2,
    "name": "Star Wars Jedi: Survivor",
    "status": "2025",
    "genre": "action",
    "hours": 30,
    "series": "jedi",
    "control": "pad",
    "screen": "monitor",
    "owned": "unknown",
    "date": "2025-02-02",
    "order": null
  },
  {
    "id": 3,
    "name": "Immortals Fenyx Rising",
    "status": "2025",
    "genre": "adventure",
    "hours": 42,
    "series": "",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "2025-09-25",
    "order": null
  },
  {
    "id": 4,
    "name": "Grand Theft Auto V",
    "status": "2025",
    "genre": "action",
    "hours": 50,
    "series": "",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "2025-08-19",
    "order": null
  },
  {
    "id": 5,
    "name": "Red Dead Redemption 2",
    "status": "2025",
    "genre": "adventure",
    "hours": 85,
    "series": "",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "2024-01-08",
    "order": null,
    "note": "Фактически пройдена 08.01.2024; показана в разделе 2025 для удобства."
  },
  {
    "id": 6,
    "name": "Assassin’s Creed Valhalla",
    "status": "2026",
    "genre": "rpg",
    "hours": 100,
    "series": "",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "2026-08-27",
    "order": 1
  },
  {
    "id": 7,
    "name": "Dead Space Remake",
    "status": "2026",
    "genre": "horror",
    "hours": 16,
    "series": "",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "2026-11-04",
    "order": 2
  },
  {
    "id": 8,
    "name": "Resident Evil 4 Remake",
    "status": "2026",
    "genre": "horror",
    "hours": 21,
    "series": "",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "",
    "order": 3,
    "note": "Пройдена в 2026; точная дата пока не указана."
  },
  {
    "id": 9,
    "name": "Outriders",
    "status": "2026",
    "genre": "shooter",
    "hours": 32,
    "series": "",
    "control": "kb",
    "screen": "monitor",
    "owned": "unknown",
    "date": "2026-01-03",
    "order": null
  },
  {
    "id": 10,
    "name": "Death Stranding",
    "status": "2026",
    "genre": "adventure",
    "hours": 60,
    "series": "",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "2026-04-02",
    "order": null
  },
  {
    "id": 11,
    "name": "Hellblade: Senua’s Sacrifice",
    "status": "earlier",
    "genre": "adventure",
    "hours": 9,
    "series": "hellblade",
    "control": "pad",
    "screen": "tv",
    "owned": "yes",
    "date": "",
    "order": null
  },
  {
    "id": 12,
    "name": "Cyberpunk 2077",
    "status": "earlier",
    "genre": "rpg",
    "hours": 63,
    "series": "",
    "control": "kb",
    "screen": "pc3",
    "owned": "no",
    "date": "",
    "order": null
  },
  {
    "id": 13,
    "name": "Detroit: Become Human",
    "status": "unknown",
    "genre": "adventure",
    "hours": 14,
    "series": "",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 14,
    "name": "Firewatch",
    "status": "unknown",
    "genre": "adventure",
    "hours": 5,
    "series": "",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 15,
    "name": "Senua’s Saga: Hellblade II",
    "status": "unknown",
    "genre": "adventure",
    "hours": 8,
    "series": "hellblade",
    "control": "pad",
    "screen": "oled",
    "owned": "yes",
    "date": "",
    "order": null
  },
  {
    "id": 16,
    "name": "Middle-earth: Shadow of Mordor",
    "status": "unknown",
    "genre": "action",
    "hours": 24,
    "series": "middleearth",
    "control": "pad",
    "screen": "tv",
    "owned": "yes",
    "date": "",
    "order": null
  },
  {
    "id": 17,
    "name": "Middle-earth: Shadow of War",
    "status": "unknown",
    "genre": "action",
    "hours": 35,
    "series": "middleearth",
    "control": "pad",
    "screen": "tv",
    "owned": "yes",
    "date": "",
    "order": null
  },
  {
    "id": 18,
    "name": "Wolfenstein: The New Order",
    "status": "unknown",
    "genre": "shooter",
    "hours": 14,
    "series": "wolfenstein",
    "control": "kb",
    "screen": "monitor",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 19,
    "name": "Wolfenstein II: The New Colossus",
    "status": "unknown",
    "genre": "shooter",
    "hours": 16,
    "series": "wolfenstein",
    "control": "kb",
    "screen": "monitor",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 20,
    "name": "The Witcher 3: Wild Hunt",
    "status": "unknown",
    "genre": "rpg",
    "hours": 104,
    "series": "",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 21,
    "name": "Baldur’s Gate 3",
    "status": "unknown",
    "genre": "rpg",
    "hours": 117,
    "series": "",
    "control": "kb",
    "screen": "monitor",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 22,
    "name": "Elden Ring",
    "status": "unknown",
    "genre": "rpg",
    "hours": 101,
    "series": "",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 23,
    "name": "Lords of the Fallen",
    "status": "unknown",
    "genre": "rpg",
    "hours": 40,
    "series": "",
    "control": "pad",
    "screen": "monitor",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 24,
    "name": "Oblivion Remastered",
    "status": "unknown",
    "genre": "rpg",
    "hours": 70,
    "series": "",
    "control": "pad",
    "screen": "pc3",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 25,
    "name": "Skyrim Anniversary Edition",
    "status": "unknown",
    "genre": "rpg",
    "hours": 110,
    "series": "",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 26,
    "name": "Dragon’s Dogma 2",
    "status": "unknown",
    "genre": "rpg",
    "hours": 60,
    "series": "",
    "control": "pad",
    "screen": "pc3",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 27,
    "name": "Crimson Desert",
    "status": "unknown",
    "genre": "action",
    "hours": 70,
    "series": "",
    "control": "pad",
    "screen": "pc3",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 28,
    "name": "Bloodborne",
    "status": "unknown",
    "genre": "rpg",
    "hours": 45,
    "series": "",
    "control": "pad",
    "screen": "console",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 29,
    "name": "Starfield",
    "status": "unknown",
    "genre": "rpg",
    "hours": 75,
    "series": "",
    "control": "kb",
    "screen": "pc3",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 30,
    "name": "Avowed",
    "status": "unknown",
    "genre": "rpg",
    "hours": 30,
    "series": "",
    "control": "kb",
    "screen": "monitor",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 31,
    "name": "Tainted Grail: The Fall of Avalon",
    "status": "unknown",
    "genre": "rpg",
    "hours": 65,
    "series": "",
    "control": "kb",
    "screen": "monitor",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 32,
    "name": "Brütal Legend",
    "status": "unknown",
    "genre": "action",
    "hours": 15,
    "series": "",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 33,
    "name": "Devil May Cry 5",
    "status": "unknown",
    "genre": "action",
    "hours": 16,
    "series": "",
    "control": "pad",
    "screen": "monitor",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 34,
    "name": "Jotun: Valhalla Edition",
    "status": "unknown",
    "genre": "action",
    "hours": 8,
    "series": "",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 35,
    "name": "LEGO Star Wars: The Skywalker Saga",
    "status": "unknown",
    "genre": "adventure",
    "hours": 40,
    "series": "",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 36,
    "name": "Dispatch",
    "status": "unknown",
    "genre": "adventure",
    "hours": 11,
    "series": "",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 37,
    "name": "Resident Evil Village",
    "status": "unknown",
    "genre": "horror",
    "hours": 13,
    "series": "",
    "control": "pad",
    "screen": "oled",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 38,
    "name": "Resident Evil Requiem",
    "status": "unknown",
    "genre": "horror",
    "hours": 17,
    "series": "",
    "control": "pad",
    "screen": "oled",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 39,
    "name": "The Callisto Protocol",
    "status": "unknown",
    "genre": "horror",
    "hours": 12,
    "series": "",
    "control": "pad",
    "screen": "oled",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 40,
    "name": "The Evil Within",
    "status": "unknown",
    "genre": "horror",
    "hours": 21,
    "series": "evilwithin",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 41,
    "name": "The Evil Within 2",
    "status": "unknown",
    "genre": "horror",
    "hours": 20,
    "series": "evilwithin",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 42,
    "name": "Subnautica",
    "status": "unknown",
    "genre": "survival",
    "hours": 50,
    "series": "",
    "control": "kb",
    "screen": "monitor",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 43,
    "name": "Metro Exodus",
    "status": "unknown",
    "genre": "shooter",
    "hours": 25,
    "series": "",
    "control": "kb",
    "screen": "oled",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 44,
    "name": "Forza Horizon 5",
    "status": "unknown",
    "genre": "racing",
    "hours": 47,
    "series": "",
    "control": "pad",
    "screen": "tv",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 45,
    "name": "Moonlighter",
    "status": "unknown",
    "genre": "indie",
    "hours": 22,
    "series": "moonlighter",
    "control": "pad",
    "screen": "monitor",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 46,
    "name": "Moonlighter 2",
    "status": "unknown",
    "genre": "indie",
    "hours": 0,
    "series": "moonlighter",
    "control": "pad",
    "screen": "monitor",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 47,
    "name": "The Alters",
    "status": "unknown",
    "genre": "survival",
    "hours": 31,
    "series": "",
    "control": "kb",
    "screen": "monitor",
    "owned": "unknown",
    "date": "",
    "order": null
  },
  {
    "id": 48,
    "name": "Warhammer 40,000: Space Marine 2",
    "status": "unowned",
    "genre": "shooter",
    "hours": 16,
    "series": "",
    "control": "kb",
    "screen": "monitor",
    "owned": "no",
    "date": "",
    "order": null
  },
  {
    "id": 49,
    "name": "Clair Obscur: Expedition 33",
    "status": "unowned",
    "genre": "rpg",
    "hours": 46,
    "series": "",
    "control": "pad",
    "screen": "tv",
    "owned": "no",
    "date": "",
    "order": null
  },
  {
    "id": 50,
    "name": "DOOM Eternal",
    "status": "2025",
    "date": "2024-02-18",
    "genre": "shooter",
    "hours": 22,
    "series": "doom",
    "control": "mouse",
    "screen": "monitor",
    "owned": "unknown",
    "order": null,
    "note": "Фактически пройдена 18.02.2024; показана в разделе 2025 для удобства."
  }
];
const GENRES={action:'Экшен',adventure:'Приключение',rpg:'RPG',horror:'Хоррор',shooter:'Шутер',survival:'Выживание',racing:'Гонки',indie:'Инди'};
const SCREENS={tv:'Текущий ТВ 4K/60',monitor:'Монитор 1440p',oled:'После OLED C6',pc3:'После ПК3 + OLED',console:'Консоль'};
const STATUS={2025:'Пройдена · 2025',2026:'Пройдена · 2026',earlier:'Пройдена ранее',unknown:'Не уточнён',unowned:'Не куплена'};
const MOODS=['На один вечер','Сюжет','Без напряжения','Хочу экшен','Хочу испугаться','Большой мир','Сложный вызов','Гонки','Вдвоём','Кооператив','Продолжение серии','Сменить жанр','До OLED','На месяц'];
// Validate legacy and current backups without changing the input.
const APP_VERSION='0.5.1';
const DATA_VERSION=2;
const PLATFORMS=['unknown','steam','playstation','other'];
const THEMES=['auto','light','dark'];
const CATALOG_LAYOUTS=['list','grid'];
const PROGRESS=['unknown','not_started','in_progress','completed'];
function legacyGame(g){
  if(!g||typeof g!=='object'||typeof g.status!=='string'||!Object.hasOwn(STATUS,g.status))throw new Error('Некорректное поле: status');
  const {status,...rest}=g;
  return {...rest,progress:['2025','2026','earlier'].includes(status)?'completed':'unknown',historyGroup:['2025','2026','earlier'].includes(status)?status:null,owned:g.owned,legacyUnowned:status==='unowned',kind:'unknown',parentId:null,steamAppId:null,actualHours:null,platform:'unknown'};
}
function displayStatus(g){return g.progress==='completed'?(g.historyGroup??'earlier'):g.owned==='no'||(g.owned==='unknown'&&g.legacyUnowned)?'unowned':'unknown'}
function migrateData(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Некорректный формат данных');
  const version=Object.hasOwn(raw,'version')?raw.version:0;
  if(!Number.isSafeInteger(version)||version<0||version>DATA_VERSION)throw new Error('Неподдерживаемая версия данных: '+String(version));
  let data={...raw};
  // Legacy saves without a version use the same fields as format 1.
  if(version<2){if(!Array.isArray(data.games))throw new Error('Некорректное поле: games');data={...data,version:2,games:data.games.map(legacyGame)}}
  return validateData(data);
}
function validateData(v){
  const fail=field=>{throw new Error('Некорректное поле: '+field)};
  const one=(x,values)=>values.includes(x);
  if(!v||typeof v!=='object'||Array.isArray(v))fail('данные');
  if(v.version!==DATA_VERSION)fail('version');
  if(!Array.isArray(v.games)||!v.games.length)fail('games');
  const ids=new Set();
  const games=v.games.map(g=>{
    if(!g||typeof g!=='object'||!Number.isSafeInteger(g.id)||g.id<=0||ids.has(g.id))fail('id');
    ids.add(g.id);
    if(typeof g.name!=='string'||!g.name.trim())fail('name');
    if(!PROGRESS.includes(g.progress))fail('progress');
    if(!(g.historyGroup===null||g.historyGroup==='earlier'||(typeof g.historyGroup==='string'&&/^[1-9]\d{3}$/.test(g.historyGroup))))fail('historyGroup');
    if(g.progress!=='completed'&&g.historyGroup!==null)fail('historyGroup');
    if(typeof g.legacyUnowned!=='boolean')fail('legacyUnowned');
    if(!['unknown','base','dlc','standalone'].includes(g.kind))fail('kind');
    if(g.parentId!==null&&(!Number.isSafeInteger(g.parentId)||g.parentId<=0||g.parentId===g.id))fail('parentId');
    if(g.steamAppId!==null&&(!Number.isSafeInteger(g.steamAppId)||g.steamAppId<=0))fail('steamAppId');
    if(typeof g.genre!=='string'||!Object.hasOwn(GENRES,g.genre))fail('genre');
    if(typeof g.screen!=='string'||!Object.hasOwn(SCREENS,g.screen))fail('screen');
    if(!one(g.owned,['yes','no','unknown']))fail('owned');
    if(!one(g.control,['pad','kb','mouse']))fail('control');
    if(!Number.isFinite(g.hours)||g.hours<0)fail('hours');
    if(typeof g.series!=='string')fail('series');
    if(typeof g.date!=='string'||(g.date&&(!/^\d{4}-\d{2}-\d{2}$/.test(g.date)||!Number.isFinite(Date.parse(g.date))||new Date(g.date).toISOString().slice(0,10)!==g.date)))fail('date');
    if(g.order!==null&&(!Number.isSafeInteger(g.order)||g.order<1))fail('order');
    if(g.note!==undefined&&typeof g.note!=='string')fail('note');
    if(g.parentId!==null&&g.kind!=='dlc')fail('parentId');
    if(g.actualHours!==undefined&&g.actualHours!==null&&(!Number.isFinite(g.actualHours)||g.actualHours<0))fail('actualHours');
    if(g.platform!==undefined&&!PLATFORMS.includes(g.platform))fail('platform');
    return {...g,note:g.note??'',actualHours:g.actualHours??null,platform:g.platform??'unknown'};
  });
  const byId=new Map(games.map(g=>[g.id,g]));
  const steamIds=new Set();
  for(const g of games){
    if(g.parentId!==null){const parent=byId.get(g.parentId);if(!parent||parent.kind==='dlc')fail('parentId')}
    if(g.steamAppId!==null){if(steamIds.has(g.steamAppId))fail('steamAppId');steamIds.add(g.steamAppId)}
  }
  if(!one(v.mode,['story','extra','all']))fail('mode');
  if(!one(v.quick,['all','short','switch','series','oled','pc3','cozy']))fail('quick');
  if(!Array.isArray(v.moods)||v.moods.length>5||!v.moods.every(m=>MOODS.includes(m))||new Set(v.moods).size!==v.moods.length)fail('moods');
  if(!Array.isArray(v.recent)||typeof v.historyNotes!=='string')fail('settings');
  if(v.theme!==undefined&&!THEMES.includes(v.theme))fail('theme');
  if(v.catalogLayout!==undefined&&!CATALOG_LAYOUTS.includes(v.catalogLayout))fail('catalogLayout');
  return {version:DATA_VERSION,games,theme:v.theme??'auto',catalogLayout:v.catalogLayout??'list',mode:v.mode,quick:v.quick,moods:[...v.moods],recent:[...v.recent],historyNotes:v.historyNotes};
}
// Existing records take precedence over the bundled catalog.
function mergeCatalog(games,base=BASE.map(legacyGame)){
  const ids=new Set(games.map(g=>g.id));
  return [...games,...base.filter(g=>!ids.has(g.id)).map(g=>({...g}))];
}
