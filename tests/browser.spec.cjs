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
