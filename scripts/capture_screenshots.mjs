import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const WORKSPACE_DIR = 'c:\\Users\\akey02\\Desktop\\IA-PROJECTS\\geogis6 web';
const SCREENSHOTS_DIR = path.join(WORKSPACE_DIR, 'assets', 'screenshots');
const PLAYWRIGHT_ENTRY =
  'C:\\Users\\akey02\\Desktop\\IA-PROJECTS\\geotransv6.0-mobile - copia\\node_modules\\playwright\\index.mjs';
const BASE_URL = 'https://geotransformer-monolith-fniu.onrender.com';

const ADICORA_VERTICES = [
  { e: '409662.260', n: '1327653.220' },
  { e: '409785.400', n: '1327660.110' },
  { e: '409792.150', n: '1327540.800' },
  { e: '409668.900', n: '1327535.450' },
];

async function fillVertices(page) {
  const inputE = page.locator('input[placeholder="409662.260"]').first();
  const inputN = page.locator('input[placeholder="1327653.220"]').first();

  await inputE.waitFor({ state: 'visible', timeout: 15000 });

  for (let i = 0; i < ADICORA_VERTICES.length; i++) {
    const v = ADICORA_VERTICES[i];
    await inputE.fill(v.e);
    await inputN.fill(v.n);
    if (i === 0) {
      const calcBtn = page.locator('button:has-text("Calcular Punto"), button:has-text("Plotear Punto")').first();
      await calcBtn.click();
    } else {
      const addBtn = page.locator(`button:has-text("Vértice P${i + 1}")`).first();
      await addBtn.click();
    }
    await page.waitForTimeout(350);
  }
}

async function run() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const { chromium } = await import(pathToFileURL(PLAYWRIGHT_ENTRY).href);

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  try {
    console.log('1. Navegando a /login en Render...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.locator('input[name="email"]').waitFor({ state: 'visible', timeout: 120000 });
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-login-web.png') });
    console.log('   -> Capturado 01-login-web.png');

    console.log('2. Iniciando sesión con usuario web...');
    await page.fill('input[name="email"]', 'web');
    await page.fill('input[name="password"]', 'web60128892');
    await page.click('button[type="submit"]');

    // Esperar redirección a /dashboard o posible alerta de error
    const navResult = await Promise.race([
      page.waitForURL('**/dashboard**', { timeout: 60000 }).then(() => 'dashboard'),
      page.locator('.text-red-400').first().waitFor({ state: 'visible', timeout: 60000 }).then(() => 'error'),
    ]);

    if (navResult === 'error') {
      const errText = await page.locator('.text-red-400').first().innerText();
      throw new Error(`Login fallido: ${errText}`);
    }

    console.log('   -> Login exitoso, esperando carga de OpenLayers y mapa satelital...');
    await page.locator('.ol-viewport').first().waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(5000);

    // Verificar estado de Huso 19 y clasificación cerrada
    const huso19Btn = page.locator('button:has-text("Huso 19")').first();
    if (await huso19Btn.isVisible()) {
      await huso19Btn.click();
    }
    const cerradaBtn = page.locator('button:has-text("cerrada")').first();
    if (await cerradaBtn.isVisible()) {
      await cerradaBtn.click();
    }

    console.log('3. Cargando polígono real de Adícora (4 vértices) con Badekas...');
    await fillVertices(page);
    await page.waitForTimeout(4000);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-web-dashboard-badekas.png') });
    console.log('   -> Capturado 02-web-dashboard-badekas.png');

    console.log('4. Cambiando a método RIGIDA02 Adícora...');
    const rigida02Btn = page.locator('button:has-text("02 Adícora")').first();
    await rigida02Btn.click();
    await page.waitForTimeout(800);

    // Re-cargar los 4 vértices bajo RIGIDA02 para mostrar tabla + mapa + panel Adícora
    await fillVertices(page);
    await page.waitForTimeout(3000);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-web-rigida02-adicora.png') });
    console.log('   -> Capturado 03-web-rigida02-adicora.png');

    console.log('5. Guardando parcela y capturando vista de Parcelas...');
    const saveParcelBtn = page.locator('button:has-text("Guardar Parcela en Proyecto")').first();
    if (await saveParcelBtn.isVisible()) {
      await saveParcelBtn.click();
      await page.waitForTimeout(800);
    }

    const parcelasTab = page.locator('aside button:has-text("Parcelas")').first();
    await parcelasTab.click();
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-web-parcelas-proyectos.png') });
    console.log('   -> Capturado 04-web-parcelas-proyectos.png');

    // Volver a pestaña Resultados y recargar los 4 vértices activos para que tanto Mapa como Resultados móvil muestren la tabla y cálculos completos
    const resultadosTab = page.locator('aside button:has-text("Resultados")').first();
    if (await resultadosTab.isVisible()) {
      await resultadosTab.click();
      await page.waitForTimeout(500);
    }
    await fillVertices(page);
    await page.waitForTimeout(1500);

    console.log('6. Redimensionando a Modo Celular (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-mobile-map-view.png') });
    console.log('   -> Capturado 05-mobile-map-view.png');

    console.log('7. Capturando drawers táctiles móviles (Ajustes, Resultados, Proyectos)...');
    await page.locator('nav button:has-text("Ajustes")').first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-mobile-settings-drawer.png') });
    console.log('   -> Capturado 06-mobile-settings-drawer.png');

    await page.locator('nav button:has-text("Resultados")').first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-mobile-results-drawer.png') });
    console.log('   -> Capturado 07-mobile-results-drawer.png');

    await page.locator('nav button:has-text("Proyectos")').first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-mobile-projects-drawer.png') });
    console.log('   -> Capturado 08-mobile-projects-drawer.png');

    console.log('8. Cerrando sesión limpiamente para liberar Device Binding...');
    await page.evaluate(async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch {}
    });

    console.log('¡Todas las capturas completadas exitosamente!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Error en captura de pantallas:', err);
  process.exit(1);
});
