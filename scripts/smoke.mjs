import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
const root = fileURLToPath(new URL('../', import.meta.url));
dotenv.config({path:resolve(root,'.env'),quiet:true});
const basePort=Number(process.env.COMPONENT_PORT||5283);
const output = resolve(root, 'artifacts/smoke');
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const [library, port] of [['antdx',basePort],['materialx',basePort+1],['elementx',basePort+2]]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle' });
      await page.waitForFunction('window.__ci4a__?.exportSchema().length > 0');
      const schema = await page.evaluate('window.__ci4a__.exportSchema()');
      const input = page.locator('input').first();
      const inputId = await input.evaluate(el => el.closest('[data-cid]')?.getAttribute('data-cid'));
      assert(inputId, 'Name input has a CI4A identifier');
      const inputSchema = schema.find(c => c.componentId === inputId);
      const setter = inputSchema.actions.find(a => ['setValue','setInputValue'].includes(a.name));
      assert(setter, 'Name input exposes a semantic setter');
      const changed = await page.evaluate(async ({id,action}) => window.__ci4a__.call(id,action,{value:'CI4A smoke'}), {id:inputId,action:setter.name});
      assert.equal(changed.success,true,JSON.stringify(changed));
      await page.waitForFunction(() => document.querySelector('input').value === 'CI4A smoke');
      const saveId = await page.getByRole('button',{name:'Save',exact:true}).evaluate(el=>el.closest('[data-cid]')?.getAttribute('data-cid'));
      const saved = await page.evaluate(id=>window.__ci4a__.call(id,'clickButton'),saveId);
      assert.equal(saved.success,true,JSON.stringify(saved));
      await page.waitForFunction(()=>document.querySelector('[data-testid="saved"]').textContent.includes('CI4A smoke'));
      const disabledId = await page.getByRole('button',{name:'Disabled',exact:true}).evaluate(el=>el.closest('[data-cid]')?.getAttribute('data-cid'));
      const rejected = await page.evaluate(id=>window.__ci4a__.call(id,'clickButton'),disabledId);
      assert.equal(rejected.success,false,'Disabled component rejects semantic execution');
      assert.equal(rejected.error.code,'COMPONENT_DISABLED');
      const missing = await page.evaluate(()=>window.__ci4a__.call('__not_registered__','clickButton'));
      assert.equal(missing.success,false);
      assert.equal(missing.error.code,'COMPONENT_NOT_FOUND');
      assert.deepEqual(errors,[],'No uncaught page JavaScript exceptions');
      await page.screenshot({path:resolve(output,`${library}.png`),fullPage:true});
      results.push({library,passed:true,registered_components:schema.length,checks:['registration','semantic input setter','semantic save','disabled guard','invalid identifier','page exceptions']});
      console.log(`PASS ${library}: ${schema.length} registered components; semantic input/save/guards verified`);
    } catch(error) {
      results.push({library,passed:false,error:String(error),page_errors:errors});
      console.error(`FAIL ${library}:`,error);
      process.exitCode=1;
    } finally { await page.close(); }
  }
} finally {
  await browser.close();
  writeFileSync(resolve(output,'results.json'),JSON.stringify(results,null,2)+'\n');
}
