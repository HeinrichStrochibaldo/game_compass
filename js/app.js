let limit=20;const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){
  try{persist(state);return true}
  catch(error){alert('Изменения не записаны. Не закрывай приложение: экспортируй JSON для резервной копии. '+error.message);return false}
}
function updateSettings(patch){
  try{const candidate=migrateData({...state,...patch});persist(candidate);state=candidate;return true}
  catch(error){alert('Не удалось сохранить настройки: '+error.message);return false}
}
function applyTheme(){document.documentElement.dataset.theme=state.theme||'auto'}
function setTheme(theme){if(updateSettings({theme})){applyTheme();openSettings()}}
function setMode(mode){if(updateSettings({mode})){renderTimeMode();renderHome();renderCatalog()}}
function setQuick(quick){if(updateSettings({quick}))renderHome()}
const {done,owned,performance}=Recommendation;
function h(g){return Recommendation.h(g,state)}
function seriesNext(g){return Recommendation.seriesNext(g,state)}
function lastPlayed(){return Recommendation.lastPlayed(state)}
function rank(g){return Recommendation.rank(g,state)}
function recList(){return Recommendation.recList(state)}
function moodScore(g){return Recommendation.moodScore(g,state)}
function badge(g){return `<span class="pill ${done(g)?'green':!owned(g)?'orange':g.screen==='oled'||g.screen==='pc3'?'blue':''}">${esc(STATUS[displayStatus(g)]??(done(g)?`Пройдена · ${g.historyGroup??"ранее"}`:displayStatus(g)))}</span>`}
function renderHome(){let finished=state.games.filter(done).length,unowned=state.games.filter(g=>!owned(g)).length; $('stats').innerHTML=`<div class="stat"><strong>${state.games.length}</strong><span>в каталоге</span></div><div class="stat"><strong>${finished}</strong><span>пройдено</span></div><div class="stat"><strong>${unowned}</strong><span>точно не куплены</span></div>`;const playing=state.games.filter(g=>g.progress==='in_progress');const latest=lastPlayed()[0];$('currentGame').innerHTML=playing.length?'<h2 class="title">Сейчас играю</h2>'+playing.map(gameCard).join(''):'<h2 class="title">Игровой компас</h2>'; $('latestGame').innerHTML=latest?'<h2 class="title">Последнее прохождение</h2>'+gameCard(latest):'';const best=recList()[0];$('next').innerHTML=best?`<div class="eyebrow">✦ Рекомендация следующей игры</div><div class="big">${esc(best.g.name)}</div><div class="desc">${esc(best.r.why.slice(0,2).join(' · ')||'Подходит под нынешнее железо и текущий бэклог')}.</div><div class="pills"><span class="pill">${esc(GENRES[best.g.genre])}</span><span class="pill">≈${h(best.g)} ч</span><span class="pill">${esc(SCREENS[best.g.screen])}</span></div><div style="margin-top:13px" class="flex"><button class="btn primary tiny" onclick="openGame(${best.g.id})">Подробнее</button><button class="btn tiny" onclick="randomize(true)">🎲 Другую</button></div>`:'';if(!best)$('next').innerHTML='<div class="empty">Нет подходящих рекомендаций</div><button class="btn" onclick="go(\'picker\')">Подобрать игру</button>';let opts=[['all','Все'],['short','На вечер'],['switch','Сменить жанр'],['series','Следующая часть'],['oled','После OLED'],['pc3','После ПК3'],['cozy','Без стресса']];$('quick').innerHTML=opts.map(([k,t])=>`<button class="chip ${state.quick===k?'on':''}" onclick="setQuick('${k}')">${t}</button>`).join('');let items=state.games.filter(g=>{if(done(g)||!owned(g))return false;if(state.quick==='short')return g.hours<=12;if(state.quick==='switch')return g.genre!==lastPlayed()[0]?.genre&&g.screen!=='pc3';if(state.quick==='series')return g.series&&state.games.some(x=>x.series===g.series&&x.id<g.id&&done(x));if(state.quick==='oled')return g.screen==='oled';if(state.quick==='pc3')return g.screen==='pc3';if(state.quick==='cozy')return ['adventure','indie','racing'].includes(g.genre)&&g.screen!=='pc3';return true}).sort((a,b)=>rank(b).score-rank(a).score).slice(0,3);$('quickResults').innerHTML=items.map(g=>gameCard(g)).join('')||'<div class="empty">Пока нет подходящих игр</div>'}
function gameCard(g){return `<button class="card game game-link" onclick="openGame(${g.id})"><span class="main"><strong class="game-name">${esc(g.name)}</strong><span class="meta">${esc(GENRES[g.genre])} · ≈${h(g)||'?'} ч · ${esc(SCREENS[g.screen])}</span><span class="pills">${badge(g)}<span class="pill">${g.control==='pad'?'🎮 Геймпад':'⌨️ КМ'}</span></span></span><span aria-hidden="true">›</span></button>`}
function setCatalogLayout(layout){if(updateSettings({catalogLayout:layout}))renderCatalog()}
function renderCatalog(){$('catalogLayout').innerHTML=[['list','Список'],['grid','Сетка']].map(([key,label])=>`<button class="${state.catalogLayout===key?'on':''}" aria-pressed="${state.catalogLayout===key}" onclick="setCatalogLayout('${key}')">${label}</button>`).join('');$('catalogList').classList.toggle('catalog-grid',state.catalogLayout==='grid');let q=$('search').value.toLowerCase(),st=$('statusFilter').value,sc=$('screenFilter').value,ge=$('genreFilter').value,hr=$('hoursFilter').value;let filtered=state.games.filter(g=>(!q||g.name.toLowerCase().includes(q))&&(st==='all'||st==='in_progress'&&g.progress==='in_progress'||st==='not_started'&&g.progress==='not_started'||st==='done'&&done(g)||st==='pending'&&!done(g)||st==='unowned'&&!owned(g))&&(sc==='all'||sc==='now'&&!['oled','pc3'].includes(g.screen)||g.screen===sc)&&(ge==='all'||g.genre===ge)&&(hr==='all'||hr==='short'&&g.hours<=12||hr==='medium'&&g.hours>12&&g.hours<=35||hr==='long'&&g.hours>35));$('count').textContent=filtered.length+' игр';$('catalogList').innerHTML=filtered.slice(0,limit).map(gameCard).join('')||'<div class="empty">Ничего не найдено</div>';$('more').classList.toggle('hidden',filtered.length<=limit)}
function renderHistory(){
 const known=lastPlayed(),group=g=>g.historyGroup||'earlier';
 const years=[...new Set(known.map(group))].sort((a,b)=>a==='earlier'?1:b==='earlier'?-1:b.localeCompare(a));
 const filter=$('historyYear'),previous=filter.value;
 filter.innerHTML='<option value="all">Все годы</option>'+years.map(y=>`<option value="${esc(y)}">${y==='earlier'?'Ранее':esc(y)}</option>`).join('');
 filter.value=years.includes(previous)?previous:'all';
 const now=new Date(),year=String(now.getFullYear()),month=year+'-'+String(now.getMonth()+1).padStart(2,'0');
 const hours=games=>{const measured=games.filter(g=>g.actualHours!==null);return measured.length?new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(measured.reduce((sum,g)=>sum+g.actualHours,0))+' ч':'—'};
 $('historyHours').innerHTML='<h3>Фактические часы</h3><div class="stats">'+[['За месяц',known.filter(g=>g.date?.startsWith(month))],['За год',known.filter(g=>g.date?.startsWith(year+'-'))],['Всего',known]].map(([label,games])=>`<div class="stat"><strong>${hours(games)}</strong><span>${label}</span></div>`).join('')+'</div><p class="hint">По дате завершения, не по игровым сессиям. Известны часы у '+known.filter(g=>g.actualHours!==null).length+' из '+known.length+' игр.</p>';
 const platform={steam:'Steam',playstation:'PlayStation',other:'Другая платформа',unknown:'Платформа не указана'};
 const entry=g=>`<button class="history-entry" onclick="openGame(${g.id})"><strong>${esc(g.name)}</strong><span class="small muted">${g.date?new Date(g.date+'T12:00:00').toLocaleDateString('ru-RU'):'Дата не уточнена'} · ${g.actualHours===null?'Часы не указаны':esc(g.actualHours)+' ч'} · ${esc(platform[g.platform])}</span></button>`;
 const visible=known.filter(g=>filter.value==='all'||group(g)===filter.value);
 let out=visible.length?'<h3>Последнее прохождение</h3><div class="card hero">'+entry(visible[0])+'</div>':'<div class="empty">Нет завершённых игр</div>';
 for(const y of years){if(filter.value!=='all'&&filter.value!==y)continue;const games=visible.filter(g=>group(g)===y&&g!==visible[0]);if(games.length)out+=`<h3>${y==='earlier'?'Ранее':esc(y)}</h3><div class="timeline">${games.map(g=>'<div class="event">'+entry(g)+'</div>').join('')}</div>`}
 $('historyList').innerHTML=out;
}
function updateBudget(){$('budget').textContent=`≈${(+$('daily').value*+$('days').value).toFixed(1)} ч/неделю · ≈${Math.round(+$('daily').value*+$('days').value*4.33)} ч/месяц`}
function renderMoods(){$('moodTags').innerHTML=MOODS.map(m=>`<button class="chip ${state.moods.includes(m)?'on':''}" onclick="toggleMood('${m}')">${esc(m)}</button>`).join('')}
function toggleMood(m){const moods=state.moods.includes(m)?state.moods.filter(x=>x!==m):state.moods.length<5?[...state.moods,m]:state.moods;if(moods!==state.moods&&updateSettings({moods}))renderMoods()}
function pool(){const duration=$('pickerDuration').value;return state.games.filter(g=>(duration==='all'||h(g)>0&&(duration==='evening'&&h(g)<=4||duration==='weekend'&&h(g)<=12||duration==='long'&&h(g)>12))&&(!$('ownedOnly').checked||owned(g))&&(!$('unplayedOnly').checked||!done(g))&&($('allowFuture').checked||!['oled','pc3'].includes(g.screen)))}
let pickerSeen=new Set();
function recommend(another=false){
 if(!another)pickerSeen.clear();
 const items=pool().sort((a,b)=>moodScore(b)-moodScore(a));
 let g=items.find(x=>!pickerSeen.has(x.id));
 if(!g&&items.length){pickerSeen.clear();g=items[0]}
 if(!g){$('pickerResult').innerHTML='<div class="empty">Нет подходящих игр. Измени фильтры.</div>';return}
 pickerSeen.add(g.id);
 $('pickerResult').innerHTML='<div class="divider"></div><h3>Твой следующий вариант</h3>'+gameCard(g)+(items.length>1?'<button class="btn" onclick="recommend(true)">Другой вариант</button>':'');
}
function randomize(fromHome=false){let items=fromHome?recList().filter(x=>!['oled','pc3'].includes(x.g.screen)).map(x=>x.g):pool();if(!items.length){alert('Нет подходящих игр. Измени фильтры.');return}let bytes=new Uint32Array(1);crypto.getRandomValues(bytes);let g=items[bytes[0]%items.length];if(fromHome){openGame(g.id)}else $('pickerResult').innerHTML='<div class="divider"></div><div class="eyebrow">🎲 Случайный выбор</div>'+gameCard(g)}
let draftSnapshot=null;
function draftValues(){return JSON.stringify([...$('overlay').querySelectorAll('input,select,textarea')].map(el=>el.value))}
function watchDraft(){draftSnapshot=draftValues()}
function openGame(id){
 draftSnapshot=null;
 const g=state.games.find(x=>x.id===id);if(!g)return;
 $('overlay').innerHTML=`<div class="modalbg" onclick="if(event.target===this)closeModal()"><div class="modal" role="dialog" aria-label="Карточка игры"><div class="grabber"></div><div class="row"><span class="eyebrow">${esc(GENRES[g.genre])}</span><button class="btn tiny" onclick="closeModal()" aria-label="Закрыть">✕</button></div><div class="big">${esc(g.name)}</div><div class="pills">${badge(g)}<span class="pill">${esc(SCREENS[g.screen])}</span></div><p class="desc">Оценка времени: ≈${h(g)||'?'} ч</p><p class="desc">Фактическое время: ${g.actualHours===null?'не указано':g.actualHours+' ч'}</p><p class="desc">${esc(performance(g))}</p><p class="desc">${esc(g.note||'Нет заметок')}</p><button class="btn primary" onclick="editGame(${id})">Редактировать</button>${!done(g)?`<button class="btn" onclick="startGame(${id})">Начать игру</button><button class="btn" onclick="completeGame(${id})">Завершить игру</button>`:''}</div></div>`;
}
function startGame(id){if(updateSettings({games:state.games.map(g=>g.id===id&&!done(g)?{...g,progress:'in_progress',historyGroup:null}:g)})){renderAll();openGame(id)}}
function completeGame(id){
 const g=state.games.find(x=>x.id===id);if(!g)return;
 const now=new Date(),today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
 $('overlay').innerHTML=`<div class="modalbg" onclick="if(event.target===this)closeModal()"><div class="modal" role="dialog" aria-label="Завершение игры"><div class="grabber"></div><div class="row"><h2>Завершение игры</h2><button class="btn" onclick="closeModal()">✕</button></div><div class="big">${esc(g.name)}</div><label class="label" for="finishDate">Дата</label><input class="input" id="finishDate" type="date" value="${today}"><label class="label" for="finishHours">Фактические часы (необязательно)</label><input class="input" id="finishHours" type="number" min="0" step="any" value="${g.actualHours??''}"><label class="label" for="finishPlatform">Платформа</label><select class="input" id="finishPlatform"><option value="unknown">Не указана</option><option value="steam">Steam</option><option value="playstation">PlayStation</option><option value="other">Другая</option></select><label class="label" for="finishNote">Впечатления / заметка</label><textarea class="input" id="finishNote">${esc(g.note)}</textarea><button class="btn primary" onclick="saveCompletion(${id})">Сохранить завершение</button></div></div>`;
 $('finishPlatform').value=g.platform;watchDraft();
}
function saveCompletion(id){const date=$('finishDate').value,hours=$('finishHours');if(!date||!hours.validity.valid){alert('Проверь дату и часы');return}const games=state.games.map(g=>g.id===id?{...g,progress:'completed',historyGroup:date.slice(0,4),date,actualHours:hours.value===''?null:Number(hours.value),platform:$('finishPlatform').value,note:$('finishNote').value}:g);if(updateSettings({games})){draftSnapshot=null;closeModal();renderAll()}}
let sheetTouch=null;
$('overlay').addEventListener('touchstart',e=>{sheetTouch=e.touches.length===1&&e.target.closest('.grabber')?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});
$('overlay').addEventListener('touchcancel',()=>{sheetTouch=null},{passive:true});
$('overlay').addEventListener('touchend',e=>{const start=sheetTouch;sheetTouch=null;if(!start||e.touches.length||e.changedTouches.length!==1)return;const t=e.changedTouches[0],dy=t.clientY-start.y;if(dy>65&&dy>Math.abs(t.clientX-start.x)*1.5)closeModal()},{passive:true});
function editGame(id){let g=state.games.find(x=>x.id===id);if(!g)return;let next=seriesNext(g);$('overlay').innerHTML=`<div class="modalbg" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="grabber"></div><div class="row"><div class="eyebrow">Карточка игры #${g.id}</div><button class="btn tiny" onclick="closeModal()">✕ Закрыть</button></div><div class="big">${esc(g.name)}</div><div class="pills">${badge(g)}<span class="pill">${esc(GENRES[g.genre])}</span><span class="pill blue">${esc(SCREENS[g.screen])}</span></div><div class="grid3" style="margin-top:12px"><div class="stat"><strong>${g.hours?Math.round(g.hours*.65):'?'}</strong><span>Сюжет · ч</span></div><div class="stat"><strong>${g.hours||'?'}</strong><span>С допами · ч</span></div><div class="stat"><strong>${g.hours?Math.round(g.hours*1.8):'?'}</strong><span>100% · ч</span></div></div><p class="hint">Часы ориентировочные, не верифицированы по каждой игре. 100% — приблизительная оценка, не гарантия получения всех достижений.</p><div class="divider"></div><b>ПК1 · Ryzen 5600X / RTX 3080</b><p class="desc">${performance(g)}</p><b>Экран и управление</b><p class="desc">${esc(SCREENS[g.screen])} · ${g.control==='pad'?'DualShock 4 (альтернатива Xbox Elite Series 2)':'Клавиатура + мышь; для дивана можно Xbox Elite Series 2'}.</p>${next?`<p class="hint">Следующая часть: <b>${esc(next.name)}</b>.</p>`:''}<div class="divider"></div><div class="grid2"><div><label class="label">Прохождение</label><select class="input" id="editStatus"><option value="unknown">Не уточнён</option><option value="2025">Пройдена в 2025</option><option value="2026">Пройдена в 2026</option><option value="earlier">Пройдена ранее</option><option value="not_started">Не начата</option><option value="in_progress">В процессе</option></select></div><div><label class="label">Владение</label><select class="input" id="editOwned"><option value="unknown">Не проверено</option><option value="yes">Куплена / есть доступ</option><option value="no">Не куплена</option></select></div></div><label class="label">Фактическая дата завершения (может отличаться от группы)</label><input class="input" id="editDate" type="date" value="${esc(g.date)}"><label class="label">Порядок прохождения (число, если дата неизвестна)</label><input class="input" id="editOrder" type="number" min="1" placeholder="Например: 12" value="${g.order??''}"><label class="label">Заметка</label><input class="input" id="editNote" placeholder="Например: хочу перепройти на OLED" value="${esc(g.note||'')}"><div class="flex" style="margin-top:13px"><button class="btn primary" onclick="saveGame(${g.id})">Сохранить</button><button class="btn" onclick="closeModal()">Отмена</button></div></div></div>`;if(g.historyGroup&&/^[1-9]\d{3}$/.test(g.historyGroup)&&!['2025','2026'].includes(g.historyGroup))$('editStatus').add(new Option('Пройдена в '+g.historyGroup,g.historyGroup));$('editStatus').value=g.progress==='completed'?(g.historyGroup??'earlier'):g.progress;$('editOwned').value=g.owned;watchDraft()}
function saveGame(id){
  const g=state.games.find(x=>x.id===id);
  if(!g)return;
  const selected=$('editStatus').value;
  if(!['unknown','not_started','in_progress','earlier'].includes(selected)&&! /^[1-9]\d{3}$/.test(selected)){alert('Некорректный статус');return}
  const completed=selected==='earlier'||/^[1-9]\d{3}$/.test(selected);
  const edited={...g,progress:completed?'completed':selected,historyGroup:completed?selected:null,legacyUnowned:$('editOwned').value==='unknown'&&g.owned==='unknown'&&g.legacyUnowned,owned:$('editOwned').value,date:$('editDate').value,order:$('editOrder').value?Number($('editOrder').value):null,note:$('editNote').value};
  try{
    const candidate=migrateData({...state,games:state.games.map(x=>x.id===id?edited:x)});
    persist(candidate);
    state=candidate;
  }catch(error){alert('Не удалось сохранить карточку: '+error.message);return}
  draftSnapshot=null;closeModal();renderAll();
}
function closeModal(){if(draftSnapshot!==null&&draftSnapshot!==draftValues()&&!confirm('Отменить несохранённые изменения?'))return;draftSnapshot=null;$('overlay').innerHTML=''}
function openSettings(){draftSnapshot=null;$('overlay').innerHTML=`<div class="modalbg" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="row"><h2>Настройки и данные</h2><span class="pill">v${APP_VERSION}</span><button class="btn tiny" onclick="closeModal()">✕</button></div><h3>Оформление</h3><div class="seg" role="group" aria-label="Тема оформления">${[['auto','Как в системе'],['light','Светлая'],['dark','Тёмная']].map(([key,label])=>`<button class="${state.theme===key?'on':''}" aria-pressed="${state.theme===key}" onclick="setTheme('${key}')">${label}</button>`).join('')}</div><div class="divider"></div><p class="hint">Сохранение работает локально в браузере этого iPhone. В приватном режиме или после очистки данных оно может исчезнуть. Экспортируй JSON для резервной копии.</p><div class="flex"><button class="btn primary" onclick="exportJSON()">⬇ Экспорт JSON</button><button class="btn" onclick="$('importFile').click()">⬆ Импорт JSON</button><input id="importFile" type="file" accept="application/json,.json" style="display:none" onchange="importJSON(event)"></div><div class="divider"></div><div class="check"><input type="checkbox" id="confirmReset"><label for="confirmReset">Подтверждаю сброс своих правок</label></div><button class="btn" onclick="resetData()">Сбросить к исходному каталогу</button><div class="divider"></div><p class="hint">Это автономная HTML-версия. Она не синхронизируется со Steam, не обновляет FPS автоматически и пока не имеет облачной синхронизации.</p></div></div>`}
function exportJSON(){let blob=new Blob([JSON.stringify({...state,version:DATA_VERSION,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='game-compass-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500)}
async function importJSON(e){
  const f=e.target.files?.[0];
  if(!f)return;
  try{
    const imported=migrateData(JSON.parse(await f.text()));
    const candidate=migrateData({...imported,games:mergeCatalog(imported.games)});
    if(!confirm(storageBlocked?'Заменить недоступное сохранение проверенной резервной копией?':'Заменить текущие данные импортированными?'))return;
    // Commit to storage before replacing the active library.
    persist(candidate,true);
    state=candidate;
  }catch(error){
    alert('Не удалось импортировать: '+error.message);
    return;
  }finally{
    e.target.value='';
  }
  closeModal();
  renderAll();
}
function resetData(){if(!$('confirmReset').checked)return alert('Сначала подтверди сброс');if(!confirm('Удалить все изменения?'))return;try{localStorage.removeItem(LEGACY_STORAGE_KEY);localStorage.removeItem(STORAGE_KEY)}catch(error){alert('Не удалось сбросить данные: '+error.message);return}location.reload()}
const screens=['home','catalog','history','picker'];let activeScreen='home';const screenScroll=new Map();
function go(id){
  if(!screens.includes(id)||id===activeScreen)return;
  screenScroll.set(activeScreen,window.scrollY);
  activeScreen=id;
  screens.forEach(key=>{$(key).hidden=key!==id});
  $('dataNotice').hidden=id!=='home';
  document.querySelectorAll('.nav button').forEach((button,i)=>{const selected=screens[i]===id;button.classList.toggle('active',selected);if(selected)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')});
  window.scrollTo({top:screenScroll.get(id)||0,behavior:'instant'});
}
let swipeStart=null;
const screenArea=document.querySelector('main');
screenArea.addEventListener('touchstart',event=>{
  swipeStart=null;
  if(event.touches.length!==1||event.target.closest('button,input,select,textarea,a,.chips,.seg,.check')||$('overlay').children.length)return;
  const t=event.touches[0];swipeStart={x:t.clientX,y:t.clientY};
},{passive:true});
screenArea.addEventListener('touchcancel',()=>{swipeStart=null},{passive:true});
screenArea.addEventListener('touchend',event=>{
  const start=swipeStart;swipeStart=null;
  if(!start||event.touches.length||event.changedTouches.length!==1)return;
  const t=event.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;
  if(Math.abs(dx)<65||Math.abs(dx)<Math.abs(dy)*1.5)return;
  const id=screens[screens.indexOf(activeScreen)+(dx<0?1:-1)];if(id)go(id);
},{passive:true});
function renderAll(){applyTheme();renderTimeMode();renderHome();renderCatalog();renderHistory();renderMoods();updateBudget()}
$('genreFilter').innerHTML+='<option value="all">Все жанры</option>';for(let [k,v] of Object.entries(GENRES))$('genreFilter').innerHTML+=`<option value="${k}">${v}</option>`;$('genreFilter').remove(1);
function renderTimeMode(){$('timeMode').innerHTML=[['story','Сюжет'],['extra','С допами'],['all','100%']].map(([k,v])=>`<button class="${state.mode===k?'on':''}" onclick="setMode('${k}')">${v}</button>`).join('')}
renderAll();
