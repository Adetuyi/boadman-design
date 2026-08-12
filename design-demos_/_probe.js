const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewportSize: { width: 1440, height: 900 } });
  await p.goto('file://c:/Users/seyis/Documents/Programming/Jobs/codebase/Boadman/design-alternatives/design-demos/B-benchmark.html', { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => Array.from(document.images).map(i => ({
    src: i.currentSrc.split('/').pop(), complete: i.complete, w: i.naturalWidth, h: i.naturalHeight,
    box: Math.round(i.getBoundingClientRect().width) + 'x' + Math.round(i.getBoundingClientRect().height)
  })));
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
