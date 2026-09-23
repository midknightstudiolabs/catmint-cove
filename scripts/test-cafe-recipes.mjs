import assert from 'node:assert/strict';
await import('../ui/cafe-engine.js');
const E=globalThis.CoveCafeEngine;
assert.equal(E.recipes.length,20);assert.equal(new Set(E.recipes.map(r=>r.id)).size,20);
const g={shells:100000,homestead:{stock:{}}};E.unlock(g,0);E.lesson(g);E.init(g,0);
for(const id of ['coffee','tea','carrot_crunch'])assert(g.cafe.discovered.includes(id));
assert.equal(E.menuLimit(g.cafe),3);for(const id of ['coffee','tea','carrot_crunch'])assert(E.addToMenu(g,id));
const stock=JSON.stringify(g.homestead.stock),cash=g.shells;
assert(!E.buyRecipe(g,'midknight'));assert.equal(g.shells,cash);
g.cafe.served=20;assert(E.buyRecipe(g,'midknight'));assert.equal(g.shells,cash-200);assert.equal(JSON.stringify(g.homestead.stock),stock);
assert(!E.buyRecipe(g,'midknight'));assert(!E.addToMenu(g,'midknight'));
g.cafe.menu.pop();assert(E.addToMenu(g,'midknight'));assert(E.nameRecipe(g,'midknight','My Morning'));
const legacy=JSON.parse(JSON.stringify(g));legacy.cafe.menu=['coffee','tea','midknight','bites'];delete legacy.cafe.recipeBookVersion;legacy.cafe.recipeLevels={coffee:2};E.init(legacy,0);assert.equal(E.menuLimit(legacy.cafe),4);assert.equal(legacy.cafe.recipeNames.midknight,'My Morning');assert.equal(legacy.cafe.recipeLevels.coffee,2);
g.cafe.served=500;assert(!E.buyRecipe(g,'honey_carrots'));g.cafe.cookware=true;assert(E.buyRecipe(g,'honey_carrots'));
g.shells=0;assert(!E.buyRecipe(g,'honey_tea'));g.shells=100000;g.cafe.speed=2;
for(const r of E.recipes){if(!g.cafe.discovered.includes(r.id))assert(E.buyRecipe(g,r.id));for(const [key,n]of Object.entries(r.inputs)){assert(E.ingredients[key]);assert(n>0);}}
assert.equal(g.cafe.discovered.length,20);g.cafe.menu=['midknight_feast'];assert(E.pantryPlan(g).rows.some(r=>r.key==='carrot'&&r.target===25));
console.log('PASS: 20 unique recipes, starters, milestone/equipment/funds gates, exact one-time cost, menu limits, legacy preservation and Garden demand.');
