const {test,expect}=require('@playwright/test');
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
    coverage.get(path).ranges.push(...entry.ranges);
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
