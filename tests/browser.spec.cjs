const {test,expect}=require('@playwright/test');
function executedRanges(functions){
  const blocks=functions.flatMap(f=>f.ranges);
  const edges=[...new Set(blocks.flatMap(r=>[r.startOffset,r.endOffset]))].sort((a,b)=>a-b);
  const result=[];
  for(let i=1;i<edges.length;i++){
    const start=edges[i-1],end=edges[i];
    const inner=blocks.filter(r=>r.startOffset<=start&&r.endOffset>=end)
      .sort((a,b)=>(a.endOffset-a.startOffset)-(b.endOffset-b.startOffset))[0];
    if(inner&&inner.count>0)result.push({start,end});
  }
  return result;
}
const coverage=new Map();
test.beforeEach(async({page,browserName})=>{
  if(browserName==='chromium') await page.coverage.startJSCoverage({resetOnNavigation:false});
  await page.goto('/');
});
test.afterEach(async({page,browserName})=>{
  if(browserName!=='chromium')return;
  for(const entry of await page.coverage.stopJSCoverage()){
    const path=new URL(entry.url).pathname;
    if(!/^\/js\/[^/]+\.js$/.test(path))continue;
    if(!coverage.has(path))coverage.set(path,{length:entry.source.length,ranges:[]});
    coverage.get(path).ranges.push(...executedRanges(entry.functions));
  }
});
test.afterAll(()=>{
  for(const [path,{length,ranges}] of coverage){
    let end=0,covered=0;
    for(const r of ranges.sort((a,b)=>a.start-b.start)){
      covered+=Math.max(0,r.end-Math.max(end,r.start));
      end=Math.max(end,r.end);
    }
    console.log('JS coverage '+path+': '+(100*covered/length).toFixed(2)+'% ('+covered+'/'+length+' source characters)');
  }
});

test('startup and navigation',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.reload();
  await expect(page.locator('#stats .stat strong').first()).toHaveText('50');
  await expect(page.locator('#stats')).toBeHidden();
  await expect(page.locator('#next .big')).not.toBeEmpty();
  for(const [name,id] of [['Каталог','catalog'],['История','history'],['Подбор','picker'],['Главная','home']]){
    await page.locator('nav').getByRole('button',{name}).click();
    await expect(page.locator('#'+id)).toBeVisible();
  }
  expect(errors).toEqual([]);
});
test('catalog search and filters',async({page})=>{
  await page.locator('nav').getByRole('button',{name:'Каталог'}).click();
  await page.locator('#search').fill('DOOM Eternal');
  await expect(page.locator('#catalogList .game')).toHaveCount(1);
  await page.locator('#statusFilter').selectOption('unowned');
  await expect(page.locator('#catalogList')).toContainText('Ничего не найдено');
  await page.locator('#statusFilter').selectOption('all');
  await expect(page.locator('#catalogList .game')).toHaveCount(1);
});
test('edit and reload',async({page})=>{
  await page.locator('nav').getByRole('button',{name:'Каталог'}).click();
  await page.locator('#search').fill('DOOM Eternal');
  await page.locator('#catalogList').getByRole('button',{name:'Открыть'}).click();
  await page.locator('#editNote').fill('Browser regression test');
  await page.locator('#overlay').getByRole('button',{name:'Сохранить',exact:true}).click();
  await expect(page.locator('#overlay .modal')).toHaveCount(0);
  await page.reload();
  await page.locator('nav').getByRole('button',{name:'Каталог'}).click();
  await page.locator('#search').fill('DOOM Eternal');
  await page.locator('#catalogList').getByRole('button',{name:'Открыть'}).click();
  await expect(page.locator('#editNote')).toHaveValue('Browser regression test');
});
test('mood and randomizer',async({page})=>{
  await page.locator('nav').getByRole('button',{name:'Подбор'}).click();
  await page.locator('#moodTags').getByRole('button',{name:'Сюжет',exact:true}).click();
  await expect(page.locator('#moodTags').getByRole('button',{name:'Сюжет',exact:true})).toHaveClass(/\bon\b/);
  await page.getByRole('button',{name:'Подобрать 3 игры'}).click();
  await expect(page.locator('#pickerResult .game')).toHaveCount(3);
  await page.getByRole('button',{name:'Рандомайзер'}).click();
  await expect(page.locator('#pickerResult .game')).toHaveCount(1);
});

test('mobile layout and touch targets',async({page},info)=>{
  test.skip(info.project.name!=='webkit-mobile','Mobile layout only');
  for(const width of [320,390,402,430]){
    await page.setViewportSize({width,height:812});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    for(const button of await page.locator('nav button').all()){
      const bounds=await button.boundingBox();
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.width).toBeGreaterThanOrEqual(44);
    }
    expect(await page.locator('#search').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
  }
});
test('modal locks background and restores overflow',async({page})=>{
  const overflow=()=>page.evaluate(()=>[getComputedStyle(document.documentElement).overflowY,getComputedStyle(document.body).overflowY]);
  const initial=await overflow();
  await page.getByRole('button',{name:'Настройки'}).click();
  await expect(page.locator('#overlay .modal')).toBeVisible();
  expect(await overflow()).toEqual(['hidden','hidden']);
  expect(await page.locator('#overlay .modal').evaluate(el=>getComputedStyle(el).overscrollBehaviorY)).toBe('contain');
  await page.evaluate(()=>closeModal());
  await expect(page.locator('#overlay .modal')).toHaveCount(0);
  expect(await overflow()).toEqual(initial);
});

test('completion metadata and appearance survive migration and reload',async({page})=>{
  const result=await page.evaluate(()=>{
    const old={version:1,games:BASE,mode:'extra',quick:'all',moods:[],recent:[],historyNotes:''};
    const migrated=migrateData(old);
    const v2={...migrated,games:migrated.games.map(({actualHours,platform,...g})=>g)};
    delete v2.theme;delete v2.catalogLayout;
    const restored=migrateData(v2);
    const candidate={...restored,theme:'dark',catalogLayout:'grid',games:restored.games.map((g,i)=>i===0?{...g,progress:'completed',historyGroup:'2027',date:'2027-01-02',actualHours:12.5,platform:'steam'}:g)};
    persist(candidate);
    return {count:restored.games.length,defaults:restored.games.every(g=>g.actualHours===null&&g.platform==='unknown'),theme:restored.theme,layout:restored.catalogLayout,restoredGames:restored.games,migratedGames:migrated.games};
  });
  const {restoredGames,migratedGames,...summary}=result;
  expect(summary).toEqual({count:50,defaults:true,theme:'auto',layout:'list'});
  expect(restoredGames).toEqual(migratedGames);
  await page.reload();
  expect(await page.evaluate(()=>({theme:state.theme,layout:state.catalogLayout,hours:state.games[0].actualHours,platform:state.games[0].platform,group:state.games[0].historyGroup}))).toEqual({theme:'dark',layout:'grid',hours:12.5,platform:'steam',group:'2027'});
});
test('reject invalid completion and appearance metadata',async({page})=>{
  expect(await page.evaluate(()=>{
    const base=migrateData(state);
    const cases=[{actualHours:-1},{actualHours:'12'},{actualHours:Infinity},{platform:'invalid'},{historyGroup:'bad'}].map(p=>({...base,games:base.games.map((g,i)=>i===0?{...g,...p}:g)}));
    cases.push({...base,theme:'invalid'},{...base,catalogLayout:'invalid'});
    return cases.every(c=>{try{migrateData(c);return false}catch{return true}});
  })).toBe(true);
});

test('appearance controls persist and follow system color scheme',async({page})=>{
  const scheme=()=>page.evaluate(()=>getComputedStyle(document.documentElement).colorScheme);
  await page.emulateMedia({colorScheme:'dark'});
  await page.getByRole('button',{name:'Настройки'}).click();
  await page.getByRole('button',{name:'Светлая',exact:true}).click();
  expect(await scheme()).toBe('light');
  await expect(page.getByRole('button',{name:'Светлая',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.reload();
  expect(await scheme()).toBe('light');
  await page.getByRole('button',{name:'Настройки'}).click();
  await page.getByRole('button',{name:'Тёмная',exact:true}).click();
  await page.emulateMedia({colorScheme:'light'});
  expect(await scheme()).toBe('dark');
  await page.getByRole('button',{name:'Как в системе',exact:true}).click();
  expect(await scheme()).toBe('light');
  await page.emulateMedia({colorScheme:'dark'});
  expect(await scheme()).toBe('dark');
  await page.reload();
  expect(await page.evaluate(()=>document.documentElement.dataset.theme)).toBe('auto');
});

test('independent screens and top navigation',async({page})=>{
  for(const [name,id] of [['Каталог','catalog'],['История','history'],['Подбор','picker'],['Главная','home']]){
    const button=page.locator('nav').getByRole('button',{name});
    await button.click();
    await expect(button).toHaveAttribute('aria-current','page');
    for(const key of ['home','catalog','history','picker']){
      if(key===id)await expect(page.locator('#'+key)).toBeVisible();
      else await expect(page.locator('#'+key)).toBeHidden();
    }
  }
  await expect(page.locator('header nav')).toBeVisible();
  await expect(page.locator('nav.bottom')).toHaveCount(0);
});

test('catalog layout persists and home reflects current game',async({page})=>{
  await page.evaluate(()=>{const candidate=migrateData({...state,games:state.games.map((g,i)=>i===0?{...g,progress:'in_progress',historyGroup:null}:g)});persist(candidate);state=candidate;renderAll()});
  await expect(page.locator('#currentGame .game')).toHaveCount(1);
  await page.locator('nav').getByRole('button',{name:'Каталог'}).click();
  await page.getByRole('button',{name:'Сетка',exact:true}).click();
  await expect(page.locator('#catalogList')).toHaveClass(/catalog-grid/);
  await page.locator('#statusFilter').selectOption('in_progress');
  await expect(page.locator('#catalogList .game')).toHaveCount(1);
  await page.reload();
  await page.locator('nav').getByRole('button',{name:'Каталог'}).click();
  await expect(page.locator('#catalogList')).toHaveClass(/catalog-grid/);
  await page.getByRole('button',{name:'Список',exact:true}).click();
  await expect(page.locator('#catalogList')).not.toHaveClass(/catalog-grid/);
});
