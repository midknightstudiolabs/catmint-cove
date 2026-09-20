(function(root){
  'use strict';
  const ingredients={carrot:{name:'Carrots',import:2,cost:2,seconds:60,yield:3},coffee:{name:'Coffee beans',import:5,cost:10,seconds:900,yield:10},catmint:{name:'Catmint',import:3,cost:6,seconds:300,yield:8},honey:{name:'Honey',import:8,cost:12,seconds:1500,yield:8}};
  const recipes=[{id:'coffee',name:'Coastal Coffee',note:'A warm welcome in a little cup.',price:12,inputs:{coffee:1}},{id:'tea',name:'Catmint Cloud',note:'Soft, fragrant and wonderfully unhurried.',price:8,inputs:{catmint:1}},{id:'midknight',name:'Midknight Morning',note:'Coffee, honey, and a very serious purr.',price:30,inputs:{coffee:2,honey:1}}];
  recipes.push({id:'bites',name:'Honey Garden Bites',note:'Little carrot treats with a touch of honey.',price:18,inputs:{carrot:2,honey:1}});
  const interval=s=>[240000,210000,180000][s.speed];
  const finishes={sage:{name:'Catmint Sage',cost:0,body:'#9eaf85',shade:'#6f865f',dark:'#395a45',light:'#e6ecd2'},butter:{name:'Buttercup',cost:2500,body:'#dfcb76',shade:'#b5a35b',dark:'#69653b',light:'#fff0b9'},blue:{name:'Coastal Blue',cost:2500,body:'#91b2bd',shade:'#608793',dark:'#365864',light:'#dae9e6'},rose:{name:'Rosewater',cost:5000,body:'#c6a094',shade:'#a07870',dark:'#70554e',light:'#f0ddd0'},cream:{name:'Oatmilk',cost:5000,body:'#d6c8a8',shade:'#ae9f7e',dark:'#655d49',light:'#f7eedb'}};
  function buyFinish(g,key){const s=init(g,Date.now()),f=finishes[key];if(!s.unlocked||!f)return false;s.finishesOwned ||= ['sage'];if(!s.finishesOwned.includes(key)){if(g.shells<f.cost)return false;g.shells-=f.cost;s.finishesOwned.push(key);}s.finish=key;return true;}
  const shops=[{name:'Little Kiosk',cost:0,description:'A compact timber serving window with two warm lamps.'},{name:'Garden Café',cost:50000,description:'A wider shop with a striped awning, hanging plants and flower boxes.'},{name:'Seaside Café',cost:100000,description:'A full façade with arched glowing windows, a raised sign and canopy lights.'}];
  // Outdoor décor: bought once, drawn in the outside view. Deliberately not cheap (a shop finish is 2,500+, a full new shop 50,000+).
  const decor={
    flowerbox:{name:'Window flower boxes',cost:1200,note:'Spilling blooms beneath the serving window.'},
    chalkboard:{name:'Chalkboard sign',cost:1800,note:'An A-frame board that chalks up today’s special.'},
    parasol:{name:'Parasol & bistro table',cost:3500,note:'A striped parasol over a little table for two.'},
    lights:{name:'String lights',cost:5500,note:'Warm bulbs along the roofline that glow after dark.'},
    statue:{name:'Midknight statue',cost:8000,note:'A stone cat keeping watch by the path.'},
    fountain:{name:'Garden fountain',cost:12000,note:'A little stone basin with water that never stops.'}
  };
  function buyDecor(g,id){const s=init(g,Date.now()),d=decor[id];if(!s.unlocked||!d)return false;s.decor||={};if(s.decor[id]||g.shells<d.cost)return false;g.shells-=d.cost;s.decor[id]=true;return true;}
  function cafeName(s){const n=String((s&&s.name)||'').trim();return n||'Catmint Café';}
  function renameCafe(g,name){const s=init(g,Date.now());if(!s.unlocked)return false;const clean=String(name||'').replace(/[\u0000-\u001f<>]/g,'').replace(/\s+/g,' ').trim().slice(0,22);if(!clean)return false;s.name=clean===('Catmint Café')?'':clean;return true;}
  // Average guest rating (3–5 stars) from the counts we already keep.
  function rating(s){const r=s&&s.customerReport;if(!r||!r.total)return null;const four=Math.max(0,r.happy-r.delighted),three=Math.max(0,r.total-r.happy);return Math.round((3*three+4*four+5*r.delighted)/r.total*10)/10;}
  // The next thing worth saving for — a visible goal beats a hidden shop.
  function nextGoal(g){const s=init(g,Date.now()),out=[];if(!s.unlocked)return null;
    if(s.speed<2)out.push({id:'speed',label:['Twin brewer','Cove brewer'][s.speed],cost:(s.speed+1)*300});
    if(!s.seats)out.push({id:'seat',label:'A table by the sea',cost:150});
    if(!s.cookware)out.push({id:'cookware',label:'Copper cookware',cost:180});
    for(const [id,d] of Object.entries(decor))if(!(s.decor&&s.decor[id]))out.push({id:'decor:'+id,label:d.name,cost:d.cost});
    const next=shops[(s.shopTier||0)+1];if(next)out.push({id:'shop',label:next.name,cost:next.cost});
    out.sort((a,b)=>a.cost-b.cost);return out[0]||null;}
  function upgradeShop(g,now){const s=init(g,now),tier=s.shopTier||0,next=shops[tier+1];if(!s.unlocked||!next||g.shells<next.cost)return false;settle(g,now);g.shells-=next.cost;s.shopTier=tier+1;return true;}
  function init(g,now){
    const h=g.homestead;
    if(!g.cafe){g.cafe={version:2,unlocked:false,open:false,cursor:now,sequence:0,speed:0,seats:0,menu:[],discovered:[],served:0,revenue:0,cost:0,sales:{},basis:{},pending:null};}
    if(!g.cafe.discovered)g.cafe.discovered=[...g.cafe.menu];
    if(!g.cafe.menu.length)g.cafe.open=false;
    return g.cafe;
  }
  function available(s,stock){return recipes.filter(r=>s.menu.includes(r.id)&&Object.entries(r.inputs).every(([k,n])=>(stock[k]||0)>=n));}
  function acquire(g,key,n,cost){const s=init(g,Date.now()),stock=g.homestead.stock,old=stock[key]||0; s.basis[key]=((s.basis[key]||0)*old+cost)/(old+n);stock[key]=old+n;}
  function settle(g,now){
    const s=init(g,now);if(!s.unlocked)return 0;
    if(now<s.cursor)return 0;
    const start=Math.max(s.cursor,now-43200000);let t=start,earned=0;
    if(s.cursor<start)s.cursor=start;
    for(let steps=0;steps<600;steps++){
      if(s.pending){if(s.pending.at>now)break;const p=s.pending;s.pending=null;g.shells+=p.price;earned+=p.price;s.served++;s.revenue+=p.price;s.cost+=p.cost;s.sales[p.id]=(s.sales[p.id]||0)+1;const response=feedback(s,p);s.lastCompleted={id:p.id,at:p.at,price:p.price,response};s.customerReport||={total:0,happy:0,delighted:0};s.customerReport.total++;if(response.rating>=4)s.customerReport.happy++;if(response.rating===5)s.customerReport.delighted++;s.feedbackLog||=[];s.feedbackLog.unshift({id:p.id,at:p.at,price:p.price,...response});s.feedbackLog.length=Math.min(10,s.feedbackLog.length);t=Math.max(t,p.at);}
      if(!s.open){s.cursor=now;break;}
      const options=available(s,g.homestead.stock);if(!options.length){s.open=false;s.closedReason='ingredients';s.cursor=now;break;}
      const due=s.cursor+interval(s);if(due>now)break;
      const r=options[s.sequence++%options.length];let cost=0;
      for(const[k,n]of Object.entries(r.inputs)){g.homestead.stock[k]-=n;cost+=(s.basis[k]||0)*n;}
      s.cursor=due;s.pending={id:r.id,price:price(s,r),cost,at:due+30000};
    }
    return earned;
  }
  function setOpen(g,open,now=Date.now()){
    settle(g,now);const s=init(g,now);
    if(!open){s.open=false;s.closedReason=null;return true;}
    if(!s.unlocked||!available(s,g.homestead.stock).length){s.open=false;s.closedReason=s.menu.length?'ingredients':null;return false;}
    s.open=true;s.closedReason=null;
    // First welcome starts promptly. Reopening never resets the earning cadence.
    if(!s.sequence&&!s.pending)s.cursor=now-interval(s);
    settle(g,now);return true;
  }
  function unlock(g,now){const s=init(g,now);if(s.unlocked||g.shells<120)return false;g.shells-=120;s.unlocked=true;s.cursor=now-210000;
    // Retain all legacy prepared stock, jobs, furniture and earnings without rewriting them.
    // A one-time carry-over credits their value; old settlement is disabled by the adapter.
    const h=g.homestead;s.legacyCarryover={earned:h.earned||0,servings:h.counter||0,credited:true};
    const yields={carrot:4,pumpkin:8,berry:12};
    s.legacyCarryover.prepared=(h.stoves||[h.batch]).filter(Boolean).reduce((n,j)=>n+(yields[j.key]||0),0);
    g.shells+=s.legacyCarryover.earned+(s.legacyCarryover.servings+s.legacyCarryover.prepared)*2;
    s.speed=Math.min(2,Math.max(0,(h.stoves?.length||2)-2));s.seats=h.tables>3?1:0;
    acquire(g,'coffee',6,0);acquire(g,'catmint',6,0);acquire(g,'honey',2,0);return true;}
  function experiment(g,mix){const s=init(g,Date.now()),stock=g.homestead.stock;
    if(!s.unlocked||Object.keys(mix).some(k=>!Object.hasOwn(ingredients,k))||Object.values(mix).some(n=>!Number.isInteger(n)||n<0||n>3)||!Object.values(mix).some(n=>n>0))return {error:'Choose ingredients for your tasting cup.'};
    if(Object.entries(mix).some(([k,n])=>(stock[k]||0)<n))return {error:'Not enough ingredients. Visit the Garden or Pantry.'};
    for(const [k,n]of Object.entries(mix)){stock[k]=(stock[k]||0)-n;s.experimentCost=(s.experimentCost||0)+(s.basis[k]||0)*n;}
    const found=recipes.find(r=>Object.keys(ingredients).every(k=>(r.inputs[k]||0)===(mix[k]||0)));
    if(found){if(!s.discovered.includes(found.id))s.discovered.push(found.id);return {id:found.id,message:'Success! '+found.name+'. Add it to your menu when you are ready.'};}
    return {message:mix.honey>1?'Too sweet! Try less honey.':mix.coffee&&mix.catmint?'Those flavors compete. Try a simpler base.':mix.coffee>1&&!mix.honey?'Too strong. Try less coffee, or a little honey.':'Not quite a drink yet. Start with one coffee bean or one catmint.'};
  }
  function feedback(s,p){const level=s.recipeLevels?.[p.id]||0,rating=Math.min(5,3+(s.served%5?1:0)+level),food=p.id==='bites';
    const lines=rating===5?(food?['Every crumb was worth it.','Saving my last bite. Maybe.','Five purrs for the chef!']:['That deserves a very long purr.','My new favorite cozy cup.','I would queue again for this.']):rating===4?(food?['A lovely little garden snack.','Crumbs on my whiskers. No regrets.','Just right after a seaside stroll.']:['Warm paws. Happy heart.','A lovely cup by the sea.','I came for coffee. I stayed for company.']):(food?['A nice start. A little more refinement?']:['Cozy, but the flavor could be a little smoother.']);
    return {rating,text:lines[s.served%lines.length]};
  }
  function displayName(s,r){return s.recipeNames?.[r.id]||r.name;}
  function price(s,r){return r.price+(s.recipeLevels?.[r.id]||0)*2;}
  function nameRecipe(g,id,name){const s=init(g,Date.now());if(!s.discovered.includes(id))return false;const clean=String(name||'').trim().replace(/\s+/g,' ').slice(0,24);if(!clean)return false;(s.recipeNames||={})[id]=clean;return true;}
  function lesson(g){const s=init(g,Date.now());if(!s.unlocked||s.lessonComplete)return {error:'Your free lesson is already complete.'};s.lessonComplete=true;if(!s.discovered.includes('coffee'))s.discovered.push('coffee');return {id:'coffee',message:'A balanced first cup! Give it your own name.'};}
  function improve(g,id){const s=init(g,Date.now()),level=s.recipeLevels?.[id]||0;if(!s.discovered.includes(id)||level>=2||(s.sales[id]||0)<(level+1)*10||g.shells<(level+1)*50)return false;g.shells-=(level+1)*50;(s.recipeLevels||={})[id]=level+1;return true;}
  function pantryPlan(g){const s=init(g,Date.now()),stock=g.homestead?.stock||{},selected=recipes.filter(r=>s.menu.includes(r.id)),needs={};
    for(const r of selected)for(const [key,n]of Object.entries(r.inputs))needs[key]=(needs[key]||0)+n*5;
    const rows=Object.entries(ingredients).map(([key,item])=>{const plots=(g.homestead?.plots||[]).filter(p=>p?.key===key),growing=plots.length*item.yield,ready=plots.filter(p=>p.ready<=Date.now()).length*item.yield,target=needs[key]||0,have=stock[key]||0,short=Math.max(0,target-have),plant=Math.max(0,short-growing);return {key,...item,have,target,short,growing,ready,plant,patches:Math.ceil(plant/item.yield),usedBy:selected.filter(r=>r.inputs[key]).map(r=>displayName(s,r))};});
    return {rows:rows.sort((a,b)=>Number(b.target>0)-Number(a.target>0)||b.plant-a.plant),selected:selected.map(r=>({id:r.id,name:displayName(s,r),orders:Math.min(...Object.entries(r.inputs).map(([k,n])=>Math.floor((stock[k]||0)/n)))}))};
  }
  function plantingPlan(g){const free=(g.homestead?.plots||[]).flatMap((p,i)=>p?[]:[i]),rows=pantryPlan(g).rows.filter(r=>r.patches>0).map(r=>({...r})),jobs=[];let cost=0;while(free.length&&rows.some(r=>r.patches>0)){for(const r of rows){if(!free.length)break;if(r.patches>0){jobs.push({slot:free.shift(),key:r.key});cost+=r.cost;r.patches--;}}}return {jobs,cost};}
  function plantSuggested(g,quote,now=Date.now()){const current=plantingPlan(g);if(!current.jobs.length||JSON.stringify(current)!==JSON.stringify(quote)||g.shells<current.cost)return false;for(const job of current.jobs){const crop=ingredients[job.key];g.homestead.plots[job.slot]={key:job.key,ready:now+crop.seconds*1000};}g.shells-=current.cost;return true;}
  root.CoveCafeEngine={ingredients,recipes,shops,finishes,decor,buyDecor,cafeName,renameCafe,rating,nextGoal,buyFinish,upgradeShop,interval,init,setOpen,available,acquire,settle,unlock,experiment,displayName,price,nameRecipe,lesson,improve,pantryPlan,plantingPlan,plantSuggested};
})(globalThis);
