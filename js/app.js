let limit=20;const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){
  try{persist(state);return true}
  catch(error){alert('Изменения не записаны. Не закрывай приложение: экспортируй JSON для резервной копии. '+error.message);return false}
}
function updateSettings(patch){
  try{const candidate=migrateData({...state,...patch});persist(candidate);state=candidate;return true}
  catch(error){alert('Не удалось сохранить настройки: '+error.message);return false}
}
function setMode(mode){if(updateSettings({mode})){renderTimeMode();renderHome();renderCatalog()}}
function setQuick(quick){if(updateSettings({quick}))renderHome()}
const {done,owned,performance}=Recommendation;
function h(g){return Recommendation.h(g,state)}
function seriesNext(g){return Recommendation.seriesNext(g,state)}
function lastPlayed(){return Recommendation.lastPlayed(state)}
function rank(g){return Recommendation.rank(g,state)}
function recList(){return Recommendation.recList(state)}
function moodScore(g){return Recommendation.moodScore(g,state)}
function badge(g){return `<span class="pill ${done(g)?'green':!owned(g)?'orange':g.screen==='oled'||g.screen==='pc3'?'blue':''}">${esc(STATUS[displayStatus(g)])}</span>`}
function renderHome(){let finished=state.games.filter(done).length,unowned=state.games.filter(g=>!owned(g)).length; $('stats').innerHTML=`<div class="stat"><strong>${state.games.length}</strong><span>в каталоге</span></div><div class="stat"><strong>${finished}</strong><span>пройдено</span></div><div class="stat"><strong>${unowned}</strong><span>точно не куплены</span></div>`;const best=recList()[0];$('next').innerHTML=best?`<div class="eyebrow">✦ Рекомендация следующей игры</div><div class="big">${esc(best.g.name)}</div><div class="desc">${esc(best.r.why.slice(0,2).join(' · ')||'Подходит под нынешнее железо и текущий бэклог')}.</div><div class="pills"><span class="pill">${esc(GENRES[best.g.genre])}</span><span class="pill">≈${h(best.g)} ч</span><span class="pill">${esc(SCREENS[best.g.screen])}</span></div><div style="margin-top:13px" class="flex"><button class="btn primary tiny" onclick="openGame(${best.g.id})">Подробнее</button><button class="btn tiny" onclick="randomize(true)">🎲 Другую</button></div>`:'';let opts=[['all','Все'],['short','На вечер'],['switch','Сменить жанр'],['series','Следующая часть'],['oled','После OLED'],['pc3','После ПК3'],['cozy','Без стресса']];$('quick').innerHTML=opts.map(([k,t])=>`<button class="chip ${state.quick===k?'on':''}" onclick="setQuick('${k}')">${t}</button>`).join('');let items=state.games.filter(g=>{if(done(g)||!owned(g))return false;if(state.quick==='short')return g.hours<=12;if(state.quick==='switch')return g.genre!==lastPlayed()[0]?.genre&&g.screen!=='pc3';if(state.quick==='series')return g.series&&state.games.some(x=>x.series===g.series&&x.id<g.id&&done(x));if(state.quick==='oled')return g.screen==='oled';if(state.quick==='pc3')return g.screen==='pc3';if(state.quick==='cozy')return ['adventure','indie','racing'].includes(g.genre)&&g.screen!=='pc3';return true}).sort((a,b)=>rank(b).score-rank(a).score).slice(0,3);$('quickResults').innerHTML=items.map(g=>gameCard(g)).join('')||'<div class="empty">Пока нет подходящих игр</div>'}
function gameCard(g){return `<div class="card game"><div class="main"><h3>${esc(g.name)}</h3><div class="meta">${esc(GENRES[g.genre])} · ≈${h(g)||'?'} ч · ${esc(SCREENS[g.screen])}</div><div class="pills">${badge(g)}<span class="pill">${g.control==='pad'?'🎮 Геймпад':'⌨️ КМ'}</span></div></div><button class="btn tiny" onclick="openGame(${g.id})">Открыть</button></div>`}
function renderCatalog(){let q=$('search').value.toLowerCase(),st=$('statusFilter').value,sc=$('screenFilter').value,ge=$('genreFilter').value,hr=$('hoursFilter').value;let filtered=state.games.filter(g=>(!q||g.name.toLowerCase().includes(q))&&(st==='all'||st==='done'&&done(g)||st==='pending'&&!done(g)||st==='unowned'&&!owned(g))&&(sc==='all'||sc==='now'&&!['oled','pc3'].includes(g.screen)||g.screen===sc)&&(ge==='all'||g.genre===ge)&&(hr==='all'||hr==='short'&&g.hours<=12||hr==='medium'&&g.hours>12&&g.hours<=35||hr==='long'&&g.hours>35));$('count').textContent=filtered.length+' игр';$('catalogList').innerHTML=filtered.slice(0,limit).map(gameCard).join('')||'<div class="empty">Ничего не найдено</div>';$('more').classList.toggle('hidden',filtered.length<=limit)}
function renderHistory(){let known=lastPlayed(),years=['2026','2025','earlier'];let out='';for(let year of years){let gs=known.filter(g=>displayStatus(g)===year);if(!gs.length)continue;gs.sort((a,b)=>(b.date||'').localeCompare(a.date||''));out+=`<h3>${year==='earlier'?'Пройдены раньше (год не уточнён)':year}</h3><div class="timeline">`+gs.map(g=>`<div class="event"><b>${esc(g.name)}</b><div class="small muted">${g.date?new Date(g.date+'T12:00:00').toLocaleDateString('ru-RU'):'Точная дата не указана'}${g.date&&g.date.slice(0,4)!==year&&year!=='earlier'?' · фактически '+g.date.slice(0,4)+' год':''}${g.order?' · порядок #'+g.order:''}</div><button class="btn tiny" style="margin-top:5px" onclick="openGame(${g.id})">Уточнить</button></div>`).join('')+'</div>'}out+=`<div class="notice hint">RDR2 и DOOM Eternal показаны в группе 2025 по твоему желанию, но их реальные даты — 2024. RE4 Remake: точная дата не указана. Даты не подменяются.</div>`;$('historyList').innerHTML=out}
function updateBudget(){$('budget').textContent=`≈${(+$('daily').value*+$('days').value).toFixed(1)} ч/неделю · ≈${Math.round(+$('daily').value*+$('days').value*4.33)} ч/месяц`}
function renderMoods(){$('moodTags').innerHTML=MOODS.map(m=>`<button class="chip ${state.moods.includes(m)?'on':''}" onclick="toggleMood('${m}')">${esc(m)}</button>`).join('')}
function toggleMood(m){const moods=state.moods.includes(m)?state.moods.filter(x=>x!==m):state.moods.length<5?[...state.moods,m]:state.moods;if(moods!==state.moods&&updateSettings({moods}))renderMoods()}
function pool(){return state.games.filter(g=>(!$('ownedOnly').checked||owned(g))&&(!$('unplayedOnly').checked||!done(g))&&($('allowFuture').checked||!['oled','pc3'].includes(g.screen)))}
function recommend(){let items=pool().sort((a,b)=>moodScore(b)-moodScore(a)).slice(0,3);$('pickerResult').innerHTML='<div class="divider"></div><h3>Три варианта</h3>'+items.map(g=>gameCard(g)).join('')+(items.length?'':'<div class="empty">Нет подходящих игр</div>')}
function randomize(fromHome=false){let items=fromHome?recList().filter(x=>!['oled','pc3'].includes(x.g.screen)).map(x=>x.g):pool();if(!items.length){alert('Нет подходящих игр. Измени фильтры.');return}let bytes=new Uint32Array(1);crypto.getRandomValues(bytes);let g=items[bytes[0]%items.length];if(fromHome){openGame(g.id)}else $('pickerResult').innerHTML='<div class="divider"></div><div class="eyebrow">🎲 Случайный выбор</div>'+gameCard(g)}
function openGame(id){let g=state.games.find(x=>x.id===id);if(!g)return;let next=seriesNext(g);$('overlay').innerHTML=`<div class="modalbg" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="row"><div class="eyebrow">Карточка игры #${g.id}</div><button class="btn tiny" onclick="closeModal()">✕ Закрыть</button></div><div class="big">${esc(g.name)}</div><div class="pills">${badge(g)}<span class="pill">${esc(GENRES[g.genre])}</span><span class="pill blue">${esc(SCREENS[g.screen])}</span></div><div class="grid3" style="margin-top:12px"><div class="stat"><strong>${g.hours?Math.round(g.hours*.65):'?'}</strong><span>Сюжет · ч</span></div><div class="stat"><strong>${g.hours||'?'}</strong><span>С допами · ч</span></div><div class="stat"><strong>${g.hours?Math.round(g.hours*1.8):'?'}</strong><span>100% · ч</span></div></div><p class="hint">Часы ориентировочные, не верифицированы по каждой игре. 100% — приблизительная оценка, не гарантия получения всех достижений.</p><div class="divider"></div><b>ПК1 · Ryzen 5600X / RTX 3080</b><p class="desc">${performance(g)}</p><b>Экран и управление</b><p class="desc">${esc(SCREENS[g.screen])} · ${g.control==='pad'?'DualShock 4 (альтернатива Xbox Elite Series 2)':'Клавиатура + мышь; для дивана можно Xbox Elite Series 2'}.</p>${next?`<p class="hint">Следующая часть: <b>${esc(next.name)}</b>.</p>`:''}<div class="divider"></div><div class="grid2"><div><label class="label">Прохождение</label><select class="input" id="editStatus"><option value="unknown">Не уточнён</option><option value="2025">Пройдена в 2025</option><option value="2026">Пройдена в 2026</option><option value="earlier">Пройдена ранее</option><option value="not_started">Не начата</option><option value="in_progress">В процессе</option></select></div><div><label class="label">Владение</label><select class="input" id="editOwned"><option value="unknown">Не проверено</option><option value="yes">Куплена / есть доступ</option><option value="no">Не куплена</option></select></div></div><label class="label">Фактическая дата завершения (может отличаться от группы)</label><input class="input" id="editDate" type="date" value="${esc(g.date)}"><label class="label">Порядок прохождения (число, если дата неизвестна)</label><input class="input" id="editOrder" type="number" min="1" placeholder="Например: 12" value="${g.order??''}"><label class="label">Заметка</label><input class="input" id="editNote" placeholder="Например: хочу перепройти на OLED" value="${esc(g.note||'')}"><div class="flex" style="margin-top:13px"><button class="btn primary" onclick="saveGame(${g.id})">Сохранить</button><button class="btn" onclick="closeModal()">Отмена</button></div></div></div>`;$('editStatus').value=g.progress==='completed'?(g.historyGroup??'earlier'):g.progress;$('editOwned').value=g.owned}
function saveGame(id){
  const g=state.games.find(x=>x.id===id);
  if(!g)return;
  const selected=$('editStatus').value;
  if(!['unknown','not_started','in_progress','2025','2026','earlier'].includes(selected)){alert('Некорректный статус');return}
  const completed=['2025','2026','earlier'].includes(selected);
  const edited={...g,progress:completed?'completed':selected,historyGroup:completed?selected:null,legacyUnowned:$('editOwned').value==='unknown'&&g.owned==='unknown'&&g.legacyUnowned,owned:$('editOwned').value,date:$('editDate').value,order:$('editOrder').value?Number($('editOrder').value):null,note:$('editNote').value};
  try{
    const candidate=migrateData({...state,games:state.games.map(x=>x.id===id?edited:x)});
    persist(candidate);
    state=candidate;
  }catch(error){alert('Не удалось сохранить карточку: '+error.message);return}
  closeModal();renderAll();
}
function closeModal(){$('overlay').innerHTML=''}
function openSettings(){$('overlay').innerHTML=`<div class="modalbg" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="row"><h2>Настройки и данные</h2><span class="pill">v${APP_VERSION}</span><button class="btn tiny" onclick="closeModal()">✕</button></div><p class="hint">Сохранение работает локально в браузере этого iPhone. В приватном режиме или после очистки данных оно может исчезнуть. Экспортируй JSON для резервной копии.</p><div class="flex"><button class="btn primary" onclick="exportJSON()">⬇ Экспорт JSON</button><button class="btn" onclick="$('importFile').click()">⬆ Импорт JSON</button><input id="importFile" type="file" accept="application/json,.json" style="display:none" onchange="importJSON(event)"></div><div class="divider"></div><div class="check"><input type="checkbox" id="confirmReset"><label for="confirmReset">Подтверждаю сброс своих правок</label></div><button class="btn" onclick="resetData()">Сбросить к исходному каталогу</button><div class="divider"></div><p class="hint">Это автономная HTML-версия. Она не синхронизируется со Steam, не обновляет FPS автоматически и пока не имеет облачной синхронизации.</p></div></div>`}
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
function go(id,btn){document.getElementById(id).scrollIntoView({behavior:'smooth',block:'start'});document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));btn.classList.add('active')}
function renderAll(){renderTimeMode();renderHome();renderCatalog();renderHistory();renderMoods();updateBudget()}
$('genreFilter').innerHTML+='<option value="all">Все жанры</option>';for(let [k,v] of Object.entries(GENRES))$('genreFilter').innerHTML+=`<option value="${k}">${v}</option>`;$('genreFilter').remove(1);
function renderTimeMode(){$('timeMode').innerHTML=[['story','Сюжет'],['extra','С допами'],['all','100%']].map(([k,v])=>`<button class="${state.mode===k?'on':''}" onclick="setMode('${k}')">${v}</button>`).join('')}
renderAll();
