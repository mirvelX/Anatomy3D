import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
import { serve } from '../scripts/serve.mjs';
import { modules } from '../src/curriculum/index.js';
const root = fileURLToPath(new URL('../',import.meta.url));
const {server,url}=await serve(()=>root);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||undefined});
const errors=[];
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);
  await page.locator('#openCurriculum').click();
  for(const m of modules){
    await page.locator(`[data-module="${m.id}"]`).click();
    assert.equal(await page.locator('[data-list] button').count(),m.entries.length);
    await page.locator('[data-list] button').last().click();
    assert.ok((await page.locator('[data-detail]').innerText()).includes(m.entries.at(-1).latin));
    await page.locator('[data-learn]').click();
    assert.ok((await page.locator('[data-progress]').innerText()).startsWith('1 /'));
    await page.locator('#curriculum [data-mode]').click();
    await page.locator('[data-choices] button').first().click();
    assert.ok((await page.locator('[data-feedback]').innerText()).length>0);
    await page.locator('#curriculum [data-mode]').click();
    console.log(`PASS v${m.version}: navigation, details, learned, quiz`);
  }
  await page.reload(); await page.locator('#openCurriculum').click();
  for(const m of modules){await page.locator(`[data-module="${m.id}"]`).click();assert.ok((await page.locator('[data-progress]').innerText()).startsWith('1 /'));}
  await page.locator('[data-search]').fill('no-matching-anatomy');
  assert.equal(await page.locator('[data-list] button').count(),0);
  await page.locator('#curriculum [data-mode]').click();assert.equal(await page.locator('[data-choices] button').count(),0);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#curriculum').isVisible(),false);
  await page.locator('[data-pilot="C1"]').click();
  await page.waitForFunction(()=>document.querySelector('#meshStatus').dataset.mode==='atlas');
  assert.equal(await page.locator('#parts button').count(),5);
  await page.locator('#openCurriculum').click();await page.locator('[data-module]').first().click();
  await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/curriculum-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'test-results/curriculum-mobile.png'});
  assert.ok(await page.locator('#curriculum').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  assert.deepEqual(errors,[]);
  console.log('PASS reload persistence, empty search, Escape, unchanged C1 mesh and mobile width');
} finally {await browser.close();await new Promise(r=>server.close(r));}

