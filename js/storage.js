const STORAGE_KEY='gamecompass-v2';
const LEGACY_STORAGE_KEY='gamecompass-v1';
let state={version:DATA_VERSION,games:BASE.map(legacyGame),theme:'auto',catalogLayout:'list',mode:'extra',moods:[],quick:'all',recent:[],historyNotes:''};
let storageBlocked=false;
function loadSaved(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY)??localStorage.getItem(LEGACY_STORAGE_KEY);
    if(raw===null)return;
    const saved=migrateData(JSON.parse(raw));
    state={...saved,games:mergeCatalog(saved.games)};
  }catch(error){
    storageBlocked=true;
    alert('Не удалось загрузить сохранение. Показан исходный каталог. Автосохранение заблокировано; прежние данные не перезаписаны. Восстанови проверенную резервную копию или выполни подтверждённый сброс.');
  }
}
loadSaved();
function persist(candidate,replace=false){
  if(storageBlocked&&!replace)throw new Error('Сохранение заблокировано после ошибки загрузки');
  localStorage.setItem(STORAGE_KEY,JSON.stringify(migrateData(candidate)));
  storageBlocked=false;
}
