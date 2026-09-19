(function(root){
  'use strict';
  const ingredients={coffee:{name:'Coffee beans',import:5,cost:10,seconds:900,yield:10},catmint:{name:'Catmint',import:3,cost:6,seconds:300,yield:8},honey:{name:'Honey',import:8,cost:12,seconds:1500,yield:8}};
  const recipes=[{id:'coffee',name:'Coastal Coffee',note:'A warm welcome in a little cup.',price:12,inputs:{coffee:1}},{id:'tea',name:'Catmint Cloud',note:'Soft, fragrant and wonderfully unhurried.',price:8,inputs:{catmint:1}},{id:'midknight',name:'Midknight Morning',note:'Coffee, honey, and a very serious purr.',price:30,inputs:{coffee:2,honey:1}}];
  const interval=s=>[240000,210000,180000][s.speed];
  const finishes={sage:{name:'Catmint Sage',cost:0,body:'#9eaf85',shade:'#6f865f',dark:'#395a45',light:'#e6ecd2'},butter:{name:'Buttercup',cost:2500,body:'#dfcb76',shade:'#b5a35b',dark:'#69653b',light:'#fff0b9'},blue:{name:'Coastal Blue',cost:2500,body:'#91b2bd',shade:'#608793',dark:'#365864',light:'#dae9e6'},rose:{name:'Rosewater',cost:5000,body:'#c6a094',shade:'#a07870',dark:'#70554e',light:'#f0ddd0'},cream:{name:'Oatmilk',cost:5000,body:'#d6c8a8',shade:'#ae9f7e',dark:'#655d49',light:'#f7eedb'}};
  function buyFinish(g,key){const s=init(g,Date.now()),f=finishes[key];if(!s.unlocked||!f)return false;s.finishesOwned ||= ['sage'];if(!s.finishesOwned.includes(key)){if(g.shells<f.cost)return false;g.shells-=f.cost;s.finishesOwned.push(key);}s.finish=key;return true;}
  const shops=[{name:'Little Kiosk',cost:0,description:'Your original seaside serving window.'},{name:'Garden Café',cost:50000,description:'A wider storefront, timber porch and planted windows.'},{name:'Seaside Café',cost:100000,description:'A full coastal café with cream columns, canopy lights and warm lanterns.'}];
  function upgradeShop(g,now){const s=init(g,now),tier=s.shopTier||0,next=shops[tier+1];if(!s.unlocked||!next||g.shells<next.cost)return false;settle(g,now);g.shells-=next.cost;s.shopTier=tier+1;return true;}
  function init(g,now){
    const h=g.homestead;
    if(!g.cafe){g.cafe={version:1,unlocked:false,open:true,cursor:now,sequence:0,speed:0,seats:0,menu:recipes.map(r=>r.id),served:0,revenue:0,cost:0,sales:{},basis:{},pending:null};}
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
      if(s.pending){if(s.pending.at>now)break;const p=s.pending;s.pending=null;g.shells+=p.price;earned+=p.price;s.served++;s.revenue+=p.price;s.cost+=p.cost;s.sales[p.id]=(s.sales[p.id]||0)+1;s.lastCompleted={id:p.id,at:p.at};t=Math.max(t,p.at);}
      if(!s.open){s.cursor=now;break;}
      const options=available(s,g.homestead.stock);if(!options.length){s.cursor=now;break;}
      const due=s.cursor+interval(s);if(due>now)break;
      const r=options[s.sequence++%options.length];let cost=0;
      for(const[k,n]of Object.entries(r.inputs)){g.homestead.stock[k]-=n;cost+=(s.basis[k]||0)*n;}
      s.cursor=due;s.pending={id:r.id,price:r.price,cost,at:due+30000};
    }
    return earned;
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
  root.CoveCafeEngine={ingredients,recipes,shops,finishes,buyFinish,upgradeShop,interval,init,available,acquire,settle,unlock};
})(globalThis);
