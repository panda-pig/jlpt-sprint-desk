const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  
  await page.goto('http://localhost:5173/#/setup');
  await page.waitForTimeout(2000);
  
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(500);
  
  const input = await page.locator('#targetScore');
  await input.click();
  await input.fill('');
  await page.waitForTimeout(300);
  
  await input.type('120');
  await page.waitForTimeout(500);
  
  const value = await input.inputValue();
  console.log('VALUE_AFTER_TYPE_120:', value);
  
  if (value === '120') {
    console.log('PASS: 输入120成功');
  } else {
    console.log('FAIL: 输入被修改成:', value);
  }
  
  await input.fill('');
  await page.waitForTimeout(300);
  const emptyValue = await input.inputValue();
  console.log('VALUE_AFTER_CLEAR:', JSON.stringify(emptyValue));
  
  if (emptyValue === '') {
    console.log('PASS: 清空成功');
  } else {
    console.log('FAIL: 无法清空:', emptyValue);
  }
  
  await page.screenshot({ path: '/tmp/test-targetscore-interaction.png' });
  
  await browser.close();
})();
