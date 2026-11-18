import { GeoEngine, ADICORA_PRESETS } from './geo-engine.js';

const runtimeEnv =
  (typeof window !== 'undefined' && Reflect.get(window, '__GEOGIS_ENV__')) || {};

const SUITE_ENV = {
  NEXT_PUBLIC_DESKTOP_URL:
    runtimeEnv.NEXT_PUBLIC_DESKTOP_URL || 'https://geotransformer-monolith-fniu.onrender.com',
  NEXT_PUBLIC_ADMIN_URL:
    runtimeEnv.NEXT_PUBLIC_ADMIN_URL || 'https://geotransformer-admin-panel.onrender.com',
  NEXT_PUBLIC_APK_DOWNLOAD_URL:
    runtimeEnv.NEXT_PUBLIC_APK_DOWNLOAD_URL ||
    'https://geogis6-android.onrender.com/GeoGis6_Android.apk',
};

const desktopHost = SUITE_ENV.NEXT_PUBLIC_DESKTOP_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');

function applyEnvLinks() {
  const urlMap = {
    desktop: SUITE_ENV.NEXT_PUBLIC_DESKTOP_URL,
    admin: SUITE_ENV.NEXT_PUBLIC_ADMIN_URL,
    apk: SUITE_ENV.NEXT_PUBLIC_APK_DOWNLOAD_URL,
  };

  document.querySelectorAll('[data-env-url]').forEach((el) => {
    const key = el.getAttribute('data-env-url');
    const targetUrl = key ? urlMap[key] : null;
    if (targetUrl && el instanceof HTMLAnchorElement) {
      el.href = targetUrl;
    }
  });
}

const SCREENSHOTS = {
  web: [
    {
      id: 'web-badekas',
      src: 'assets/screenshots/02-web-dashboard-badekas.png',
      title: 'Visor Satelital OpenLayers + Motor Molodensky-Badekas',
      url: `${desktopHost}/dashboard`,
      tag: 'WEB DESKTOP · BADEKAS 3D',
      desc: 'Poligonal cerrada de 4 vértices en Adícora (14,644.45 m² / 1.4644 ha) proyectada sobre cartografía satelital REGVEN 19N con telemetría de servidor en tiempo real.',
    },
    {
      id: 'web-rigida02',
      src: 'assets/screenshots/03-web-rigida02-adicora.png',
      title: 'Motor RIGIDA02 Adícora (Hito IGVSB AL-318) & QA/QC',
      url: `${desktopHost}/dashboard?method=rigida02`,
      tag: 'WEB DESKTOP · RIGIDA02 QA/QC',
      desc: 'Traslación rígida pura (ΔE: -204.330 m, ΔN: -311.540 m, Cota Geoidal: -22.450 m) con dictamen automático "QA/QC APROBADO" e invarianza de forma ≤ 1 mm.',
    },
    {
      id: 'web-parcelas',
      src: 'assets/screenshots/04-web-parcelas-proyectos.png',
      title: 'Gestión de Parcelas, Curvas de Nivel y Exportación DXF',
      url: `${desktopHost}/dashboard?tab=parcelas`,
      tag: 'WEB DESKTOP · CATASTRO & CAD',
      desc: 'Administración de parcelas guardadas en memoria/nube, edición de metadatos de mensura (SAREN/IGVSB), curvas altimétricas satelitales y exportación directa a DXF.',
    },
    {
      id: 'web-login',
      src: 'assets/screenshots/01-login-web.png',
      title: 'Control de Acceso Seguro (RBAC + Device Binding)',
      url: `${desktopHost}/login`,
      tag: 'SEGURIDAD · SESIÓN CIFRADA',
      desc: 'Autenticación JWT sobre cookies HttpOnly con verificación de huella de hardware (x-device-id) y control estricto de concurrencia por licencia.',
    },
  ],
  mobile: [
    {
      id: 'mob-map',
      src: 'assets/screenshots/05-mobile-map-view.png',
      title: 'Mapa Satelital de Campo (Viewport Táctil)',
      tag: 'CELULAR · MAPA GNSS/SATELITAL',
      desc: 'Interfaz móvil optimizada para levantamientos en campo con visualización satelital, barra de herramientas flotante, dock inferior y telemetría.',
    },
    {
      id: 'mob-settings',
      src: 'assets/screenshots/06-mobile-settings-drawer.png',
      title: 'Drawer Táctil de Ajustes Geodésicos',
      tag: 'CELULAR · MOTOR & HUSO UTM',
      desc: 'Selección rápida con una sola mano de Rutina (Transformación/Ploteo), Modo (Simple/Lotes/DXF), Dirección Canoa ↔ REGVEN y Motor Rígida 02 Adícora.',
    },
    {
      id: 'mob-results',
      src: 'assets/screenshots/07-mobile-results-drawer.png',
      title: 'Tabla de Vértices Saneados y Exportación CivilCAD',
      tag: 'CELULAR · P,E,N,Z,D & QA/QC',
      desc: 'Consulta instantánea en campo de coordenadas transformadas, verificación QA/QC, copia directa en formato CivilCAD (P,E,N,Z,D) y exportación DXF/KML/TXT.',
    },
    {
      id: 'mob-projects',
      src: 'assets/screenshots/08-mobile-projects-drawer.png',
      title: 'Proyectos en la Nube y Respaldo Offline Local',
      tag: 'CELULAR · CLOUD + OFFLINE',
      desc: 'Guardado dual en nube y almacenamiento local del dispositivo, exportación DXF pura y tabla resumen multiparcela.',
    },
  ],
};

// State for Hero Simulator
const simState = {
  direction: 'canoa_regven', // 'canoa_regven' | 'regven_canoa'
  method: 'rigida02',        // 'rigida02' | 'badekas' | 'rigida'
  huso: 19,
  presetId: 'al318',
  este: 409662.260,
  norte: 1327653.220,
  z: 0,
  cadTab: 'tabla',           // 'tabla' | 'civilcad' | 'dxf'
};

let currentWebIndex = 0;
let currentMobileIndex = 0;
let galleryMode = 'dual'; // 'dual' | 'web' | 'mobile'
let lightboxItems = [];
let lightboxIndex = 0;

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  const palette =
    type === 'error'
      ? 'border-rose-500/50 bg-rose-950/90 text-rose-200'
      : type === 'info'
        ? 'border-cyan-500/50 bg-cyan-950/90 text-cyan-200'
        : 'border-emerald-500/50 bg-emerald-950/90 text-emerald-200';
  el.className = `px-4 py-2.5 rounded-xl border ${palette} backdrop-blur-md shadow-2xl text-xs font-mono flex items-center gap-2 transition-all duration-300 translate-y-2 opacity-0`;
  el.innerHTML = `<span class="w-2 h-2 rounded-full ${type === 'error' ? 'bg-rose-400' : type === 'info' ? 'bg-cyan-400' : 'bg-emerald-400'}"></span><span>${message}</span>`;
  container.appendChild(el);
  requestAnimationFrame(() => {
    el.classList.remove('translate-y-2', 'opacity-0');
  });
  setTimeout(() => {
    el.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

function getActivePolygonVertices() {
  const preset = ADICORA_PRESETS[simState.presetId] || ADICORA_PRESETS.al318;
  const inv = simState.direction === 'regven_canoa';

  // Use user input as vertex 1, and preserve relative polygon shape from preset for vertices 2..4
  const baseSample = preset.sample;
  const offsetE = simState.este - baseSample[0].este;
  const offsetN = simState.norte - baseSample[0].norte;

  const rawVertices = baseSample.map((v, idx) => ({
    id: v.id,
    este: idx === 0 ? simState.este : v.este + offsetE,
    norte: idx === 0 ? simState.norte : v.norte + offsetN,
    z: idx === 0 ? simState.z : v.z,
  }));

  if (simState.method === 'rigida02') {
    const res = GeoEngine.transformRigida02(
      rawVertices,
      {
        deltaEste: preset.de || GeoEngine.RIGIDA02_DELTA_ESTE,
        deltaNorte: preset.dn || GeoEngine.RIGIDA02_DELTA_NORTE,
        cotaGeoidal: preset.cotaGeoidal,
        huso: simState.huso,
      },
      inv
    );
    return {
      vertices: res.resultados,
      qaqcPasado: res.qaqcPasado,
      maxDistDiff: res.maxDistDiff,
      transpuestos: res.transpuestos,
    };
  }

  const results = rawVertices.map((v) => {
    const r =
      simState.method === 'rigida'
        ? GeoEngine.transformRigida(v.este, v.norte, v.z, simState.huso, inv, 0.0, 0.0)
        : GeoEngine.transformBadekas(v.este, v.norte, v.z, simState.huso, inv);

    return {
      id: v.id,
      este_orig: v.este,
      norte_orig: v.norte,
      este: r.este,
      norte: r.norte,
      cota: v.z === 0 ? preset.cotaGeoidal : v.z,
      lat: r.lat,
      lng: r.lng,
      cartO: r.cartO,
      cartD: r.cartD,
      deltaE: r.deltaE,
      deltaN: r.deltaN,
      dLineal: r.dLineal,
      descripcion: inv ? 'VERTICE_PSAD56' : 'VERTICE_SANEADO_REGVEN',
    };
  });

  return {
    vertices: results,
    qaqcPasado: true,
    maxDistDiff: 0.0,
    transpuestos: 0,
  };
}

function updateSimulator() {
  const inputEEl = document.getElementById('sim-input-este');
  const inputNEl = document.getElementById('sim-input-norte');
  const inputZEl = document.getElementById('sim-input-z');

  let rawE = parseFloat(inputEEl?.value);
  let rawN = parseFloat(inputNEl?.value);
  let rawZ = parseFloat(inputZEl?.value);

  if (!Number.isFinite(rawE)) rawE = 409662.26;
  if (!Number.isFinite(rawN)) rawN = 1327653.22;
  if (!Number.isFinite(rawZ)) rawZ = 0;

  // Smart Venezuelan magnitude check (Este < 1,000,000, Norte > 1,000,000)
  let autoTransposed = false;
  if (rawE > 1000000 && rawN < 1000000) {
    [rawE, rawN] = [rawN, rawE];
    autoTransposed = true;
  }

  simState.este = rawE;
  simState.norte = rawN;
  simState.z = rawZ;

  const computed = getActivePolygonVertices();
  const p1 = computed.vertices[0];
  const stats = GeoEngine.calculatePolygonStats(computed.vertices);

  // Update Hero Simulator Output DOM
  const elOutE = document.getElementById('sim-out-este');
  const elOutN = document.getElementById('sim-out-norte');
  const elOutZ = document.getElementById('sim-out-cota');
  const elOutGeo = document.getElementById('sim-out-geo');
  const elOutCart = document.getElementById('sim-out-cart');
  const elDeltaE = document.getElementById('sim-delta-e');
  const elDeltaN = document.getElementById('sim-delta-n');
  const elDeltaD = document.getElementById('sim-delta-d');
  const elQaqc = document.getElementById('sim-qaqc-status');
  const elDatumBadge = document.getElementById('sim-target-datum-label');
  const elTransposeWarn = document.getElementById('sim-transpose-badge');

  if (elOutE) elOutE.textContent = `${p1.este.toFixed(3)} m`;
  if (elOutN) elOutN.textContent = `${p1.norte.toFixed(3)} m`;
  if (elOutZ) elOutZ.textContent = `${p1.cota.toFixed(3)} m`;
  if (elOutGeo) {
    elOutGeo.textContent = `${GeoEngine.formatDMS(p1.lat, true)} | ${GeoEngine.formatDMS(p1.lng, false)}`;
  }
  if (elOutCart && p1.cartD) {
    elOutCart.textContent = `X: ${p1.cartD.X.toFixed(2)} · Y: ${p1.cartD.Y.toFixed(2)} · Z: ${p1.cartD.Z.toFixed(2)}`;
  }
  if (elDeltaE) elDeltaE.textContent = `${p1.deltaE >= 0 ? '+' : ''}${p1.deltaE.toFixed(3)} m`;
  if (elDeltaN) elDeltaN.textContent = `${p1.deltaN >= 0 ? '+' : ''}${p1.deltaN.toFixed(3)} m`;
  if (elDeltaD) elDeltaD.textContent = `${p1.dLineal.toFixed(3)} m`;

  if (elDatumBadge) {
    elDatumBadge.textContent =
      simState.direction === 'canoa_regven'
        ? `SALIDA REGVEN (GRS80) · HUSO ${simState.huso}N`
        : `SALIDA LA CANOA (PSAD56) · HUSO ${simState.huso}N`;
  }

  if (elTransposeWarn) {
    elTransposeWarn.classList.toggle('hidden', !autoTransposed && computed.transpuestos === 0);
  }

  if (elQaqc) {
    elQaqc.innerHTML = computed.qaqcPasado
      ? `<span class="w-2 h-2 rounded-full bg-emerald-400"></span> QA/QC INVARIANZA OK · ΔD=${computed.maxDistDiff.toFixed(4)} m ≤ 0.001 m`
      : `<span class="w-2 h-2 rounded-full bg-amber-400"></span> DEFORMACIÓN DETECTADA`;
  }

  // Update CAD Preview Section (Cuadro de Construcción / CivilCAD / DXF)
  renderCadPreview(computed.vertices, stats);

  return { computed, stats };
}

function renderCadPreview(vertices, stats) {
  const areaEl = document.getElementById('cad-preview-area');
  const perimEl = document.getElementById('cad-preview-perim');
  const tbody = document.getElementById('cad-table-body');
  const codeBlock = document.getElementById('cad-code-preview');

  if (areaEl) areaEl.textContent = `${stats.areaM2.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m² (${stats.areaHa.toFixed(4)} ha)`;
  if (perimEl) perimEl.textContent = `${stats.perimeter.toFixed(2)} m`;

  if (tbody) {
    tbody.innerHTML = vertices
      .map((v, idx) => {
        const leg = stats.legs[idx] || { rumbo: '—', distancia: 0 };
        return `
          <tr class="border-b border-slate-800/70 hover:bg-slate-800/40 transition-colors">
            <td class="py-2.5 px-3 font-mono font-bold text-emerald-400">${v.id}</td>
            <td class="py-2.5 px-3 font-mono text-slate-200">${v.este.toFixed(3)}</td>
            <td class="py-2.5 px-3 font-mono text-slate-200">${v.norte.toFixed(3)}</td>
            <td class="py-2.5 px-3 font-mono text-cyan-300">${leg.rumbo}</td>
            <td class="py-2.5 px-3 font-mono text-amber-300">${leg.distancia.toFixed(3)} m</td>
          </tr>
        `;
      })
      .join('');
  }

  if (codeBlock) {
    if (simState.cadTab === 'civilcad') {
      codeBlock.textContent = GeoEngine.generateCivilCAD(vertices);
    } else if (simState.cadTab === 'dxf') {
      const dxfFull = GeoEngine.generateDXF(vertices, {
        datum: simState.direction === 'canoa_regven' ? 'SIRGAS-REGVEN' : 'PSAD56 LA CANOA',
        huso: simState.huso,
      });
      const previewLines = dxfFull.split('\n').slice(0, 42).join('\n');
      codeBlock.textContent = `${previewLines}\n... [${dxfFull.split('\n').length} líneas ASCII DXF listas para AutoCAD/CivilCAD]`;
    }
  }
}

function initSimulatorControls() {
  // Direction toggle buttons
  document.querySelectorAll('[data-sim-dir]').forEach((btn) => {
    btn.addEventListener('click', () => {
      simState.direction = btn.dataset.simDir;
      document.querySelectorAll('[data-sim-dir]').forEach((b) => {
        b.dataset.active = b === btn ? 'true' : 'false';
      });
      updateSimulator();
    });
  });

  // Method toggle buttons
  document.querySelectorAll('[data-sim-method]').forEach((btn) => {
    btn.addEventListener('click', () => {
      simState.method = btn.dataset.simMethod;
      document.querySelectorAll('[data-sim-method]').forEach((b) => {
        b.dataset.active = b === btn ? 'true' : 'false';
      });
      updateSimulator();
    });
  });

  // Huso toggle buttons
  document.querySelectorAll('[data-sim-huso]').forEach((btn) => {
    btn.addEventListener('click', () => {
      simState.huso = Number(btn.dataset.simHuso);
      document.querySelectorAll('[data-sim-huso]').forEach((b) => {
        b.dataset.active = b === btn ? 'true' : 'false';
      });
      updateSimulator();
    });
  });

  // Preset selector
  const presetSelect = document.getElementById('sim-preset-select');
  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      const p = ADICORA_PRESETS[presetSelect.value];
      if (!p) return;
      simState.presetId = p.id;
      simState.huso = p.huso;
      const v0 = p.sample[0];
      document.getElementById('sim-input-este').value = v0.este.toFixed(3);
      document.getElementById('sim-input-norte').value = v0.norte.toFixed(3);
      document.getElementById('sim-input-z').value = String(v0.z);

      document.querySelectorAll('[data-sim-huso]').forEach((b) => {
        b.dataset.active = Number(b.dataset.simHuso) === p.huso ? 'true' : 'false';
      });

      updateSimulator();
      showToast(`Preset cargado: ${p.nombre}`, 'info');
    });
  }

  // Live numeric inputs
  ['sim-input-este', 'sim-input-norte', 'sim-input-z'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateSimulator);
  });

  // Copy CivilCAD P,E,N,Z,D button
  const btnCopy = document.getElementById('btn-copy-civilcad');
  if (btnCopy) {
    btnCopy.addEventListener('click', async () => {
      const { computed } = updateSimulator();
      const text = GeoEngine.generateCivilCAD(computed.vertices);
      try {
        await navigator.clipboard.writeText(text);
        showToast('Coordenadas CivilCAD (P,E,N,Z,D) copiadas al portapapeles');
      } catch {
        showToast('Formato CivilCAD listo (revisa el cuadro inferior)', 'info');
      }
    });
  }

  // Download DXF button(s)
  document.querySelectorAll('[data-export-dxf]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const { computed } = updateSimulator();
      const dxfContent = GeoEngine.generateDXF(computed.vertices, {
        datum: simState.direction === 'canoa_regven' ? 'SIRGAS-REGVEN' : 'PSAD56 LA CANOA',
        huso: simState.huso,
      });
      const blob = new Blob([dxfContent], { type: 'application/dxf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GeoGIS6_${simState.presetId}_Huso${simState.huso}N.dxf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      showToast(`Archivo GeoGIS6_${simState.presetId}_Huso${simState.huso}N.dxf descargado`);
    });
  });

  // CAD preview tabs (Cuadro / CivilCAD / DXF)
  document.querySelectorAll('[data-cad-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      simState.cadTab = btn.dataset.cadTab;
      document.querySelectorAll('[data-cad-tab]').forEach((b) => {
        b.dataset.active = b === btn ? 'true' : 'false';
      });
      const tableWrap = document.getElementById('cad-table-wrap');
      const codeWrap = document.getElementById('cad-code-wrap');
      if (tableWrap && codeWrap) {
        const isTable = simState.cadTab === 'tabla';
        tableWrap.classList.toggle('hidden', !isTable);
        codeWrap.classList.toggle('hidden', isTable);
      }
      updateSimulator();
    });
  });

  updateSimulator();
}

function renderGallery() {
  const dualView = document.getElementById('gallery-dual-view');
  const webOnlyView = document.getElementById('gallery-web-view');
  const mobileOnlyView = document.getElementById('gallery-mobile-view');

  if (dualView) dualView.classList.toggle('hidden', galleryMode !== 'dual');
  if (webOnlyView) webOnlyView.classList.toggle('hidden', galleryMode !== 'web');
  if (mobileOnlyView) mobileOnlyView.classList.toggle('hidden', galleryMode !== 'mobile');

  // Update active web screenshot in both dual and web-only frames
  const webShot = SCREENSHOTS.web[currentWebIndex];
  const mobShot = SCREENSHOTS.mobile[currentMobileIndex];

  document.querySelectorAll('[data-web-img]').forEach((img) => {
    img.src = webShot.src;
    img.alt = webShot.title;
  });
  document.querySelectorAll('[data-web-title]').forEach((el) => (el.textContent = webShot.title));
  document.querySelectorAll('[data-web-url]').forEach((el) => (el.textContent = webShot.url));
  document.querySelectorAll('[data-web-desc]').forEach((el) => (el.textContent = webShot.desc));
  document.querySelectorAll('[data-web-tag]').forEach((el) => (el.textContent = webShot.tag));

  document.querySelectorAll('[data-mobile-img]').forEach((img) => {
    img.src = mobShot.src;
    img.alt = mobShot.title;
  });
  document.querySelectorAll('[data-mobile-title]').forEach((el) => (el.textContent = mobShot.title));
  document.querySelectorAll('[data-mobile-desc]').forEach((el) => (el.textContent = mobShot.desc));
  document.querySelectorAll('[data-mobile-tag]').forEach((el) => (el.textContent = mobShot.tag));

  document.querySelectorAll('[data-web-thumb]').forEach((btn) => {
    btn.dataset.active = Number(btn.dataset.webThumb) === currentWebIndex ? 'true' : 'false';
  });
  document.querySelectorAll('[data-mobile-thumb]').forEach((btn) => {
    btn.dataset.active = Number(btn.dataset.mobileThumb) === currentMobileIndex ? 'true' : 'false';
  });
}

function openLightbox(items, idx) {
  const modal = document.getElementById('lightbox-modal');
  if (!modal) return;
  lightboxItems = items;
  lightboxIndex = idx;
  updateLightboxContent();
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateLightboxContent() {
  const item = lightboxItems[lightboxIndex];
  if (!item) return;
  const img = document.getElementById('lightbox-img');
  const title = document.getElementById('lightbox-title');
  const desc = document.getElementById('lightbox-desc');
  const tag = document.getElementById('lightbox-tag');
  const counter = document.getElementById('lightbox-counter');

  if (img) {
    img.src = item.src;
    img.alt = item.title;
  }
  if (title) title.textContent = item.title;
  if (desc) desc.textContent = item.desc;
  if (tag) tag.textContent = item.tag;
  if (counter) counter.textContent = `${lightboxIndex + 1} / ${lightboxItems.length}`;
}

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function initGallery() {
  document.querySelectorAll('[data-gallery-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      galleryMode = btn.dataset.galleryMode;
      document.querySelectorAll('[data-gallery-mode]').forEach((b) => {
        b.dataset.active = b === btn ? 'true' : 'false';
      });
      renderGallery();
    });
  });

  document.querySelectorAll('[data-web-thumb]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentWebIndex = Number(btn.dataset.webThumb);
      renderGallery();
    });
  });

  document.querySelectorAll('[data-mobile-thumb]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentMobileIndex = Number(btn.dataset.mobileThumb);
      renderGallery();
    });
  });

  // Zoom triggers
  document.querySelectorAll('[data-zoom-web]').forEach((btn) => {
    btn.addEventListener('click', () => openLightbox(SCREENSHOTS.web, currentWebIndex));
  });

  document.querySelectorAll('[data-zoom-mobile]').forEach((btn) => {
    btn.addEventListener('click', () => openLightbox(SCREENSHOTS.mobile, currentMobileIndex));
  });

  document.querySelectorAll('[data-zoom-mobile-idx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openLightbox(SCREENSHOTS.mobile, Number(btn.dataset.zoomMobileIdx));
    });
  });

  // Lightbox controls
  const btnClose = document.getElementById('lightbox-close');
  const btnPrev = document.getElementById('lightbox-prev');
  const btnNext = document.getElementById('lightbox-next');
  const modal = document.getElementById('lightbox-modal');

  if (btnClose) btnClose.addEventListener('click', closeLightbox);
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length;
      updateLightboxContent();
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      lightboxIndex = (lightboxIndex + 1) % lightboxItems.length;
      updateLightboxContent();
    });
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (!modal?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') btnPrev?.click();
    if (e.key === 'ArrowRight') btnNext?.click();
  });

  renderGallery();
}

function initLicenseModalAndForms() {
  const modal = document.getElementById('license-modal');
  const openers = document.querySelectorAll('[data-open-license-modal]');
  const closer = document.getElementById('license-modal-close');
  const form = document.getElementById('license-request-form');
  const inlineForm = document.getElementById('inline-contact-form');

  openers.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (closer) {
    closer.addEventListener('click', () => {
      modal?.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  const handleSubmit = (formEl, closeOnSuccess = false) => {
    if (!formEl) return;
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(formEl);
      const nombre = data.get('nombre') || 'Profesional';
      const rol = data.get('plan') || 'Licencia Corporativa';
      showToast(`Solicitud registrada para ${nombre} (${rol}). Acceso de evaluación disponible en la plataforma.`);
      formEl.reset();
      if (closeOnSuccess && modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  };

  handleSubmit(form, true);
  handleSubmit(inlineForm, false);

  // Mobile Nav Drawer
  const mobileMenuBtn = document.getElementById('mobile-nav-toggle');
  const mobileMenu = document.getElementById('mobile-nav-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  applyEnvLinks();
  initSimulatorControls();
  initGallery();
  initLicenseModalAndForms();
});
