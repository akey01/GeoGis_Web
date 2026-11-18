/**
 * GeoEngine — Motor Geodésico de Alta Precisión para GeoGIS6 (GeoTransformer v6.0 Mobile)
 * Implementación fiel del núcleo matemático IGVSB / PATVEN-98 / RIGIDA02.
 */

export const HAYFORD = {
  nombre: 'Internacional de Hayford 1924',
  datum: 'La Canoa (PSAD-56)',
  a: 6378388.0,
  f: 1 / 297.0,
  get b() { return this.a * (1 - this.f); },
  get e2() { return 2 * this.f - this.f * this.f; },
  get ep2() { return this.e2 / (1 - this.e2); },
};

export const GRS80 = {
  nombre: 'GRS-80 (Geodetic Reference System 1980)',
  datum: 'SIRGAS-REGVEN',
  a: 6378137.0,
  f: 1 / 298.257222101,
  get b() { return this.a * (1 - this.f); },
  get e2() { return 2 * this.f - this.f * this.f; },
  get ep2() { return this.e2 / (1 - this.e2); },
};

export const PATVEN98 = {
  dx: -270.933,
  dy: 115.599,
  dz: -360.226,
  rx: -5.266,
  ry: -1.238,
  rz: 2.381,
  ds: -5.109,
  XM: 2464351.594,
  YM: -5783466.613,
  ZM: 974809.808,
};

export const ADICORA_PRESETS = {
  al318: {
    id: 'al318',
    nombre: 'Adícora AL-318 (Hito Oficial IGVSB)',
    de: -204.330,
    dn: -311.540,
    cotaGeoidal: -22.450,
    huso: 19,
    sample: [
      { id: 'P1', este: 409662.260, norte: 1327653.220, z: 0 },
      { id: 'P2', este: 409785.400, norte: 1327660.110, z: 0 },
      { id: 'P3', este: 409792.150, norte: 1327540.800, z: 0 },
      { id: 'P4', este: 409668.900, norte: 1327535.450, z: 0 },
    ],
  },
  buchuaco: {
    id: 'buchuaco',
    nombre: 'Sector Buchuaco (Ajuste Local)',
    de: -217.520,
    dn: -320.130,
    cotaGeoidal: -22.450,
    huso: 19,
    sample: [
      { id: 'V1', este: 411195.122, norte: 1320300.764, z: 0 },
      { id: 'V2', este: 411280.450, norte: 1320315.900, z: 0 },
      { id: 'V3', este: 411292.110, norte: 1320210.440, z: 0 },
      { id: 'V4', este: 411201.300, norte: 1320198.200, z: 0 },
    ],
  },
  supi: {
    id: 'supi',
    nombre: 'Sector El Supí (Calibrado)',
    de: -227.310,
    dn: -330.030,
    cotaGeoidal: -22.450,
    huso: 19,
    sample: [
      { id: 'M1', este: 414520.100, norte: 1324180.500, z: 0 },
      { id: 'M2', este: 414635.750, norte: 1324185.220, z: 0 },
      { id: 'M3', este: 414641.300, norte: 1324070.850, z: 0 },
      { id: 'M4', este: 414525.600, norte: 1324066.400, z: 0 },
    ],
  },
  caracas: {
    id: 'caracas',
    nombre: 'Caracas Este / Miranda (Huso 20N)',
    de: 0,
    dn: 0,
    cotaGeoidal: -18.200,
    huso: 20,
    sample: [
      { id: 'A1', este: 190420.550, norte: 1162340.120, z: 895.4 },
      { id: 'A2', este: 190512.800, norte: 1162348.600, z: 896.1 },
      { id: 'A3', este: 190519.100, norte: 1162254.250, z: 894.8 },
      { id: 'A4', este: 190426.400, norte: 1162245.900, z: 894.2 },
    ],
  },
};

export class GeoEngine {
  static RIGIDA02_DELTA_ESTE = -204.330;
  static RIGIDA02_DELTA_NORTE = -311.540;
  static RIGIDA02_COTA_GEOIDAL = -22.450;

  static toRad(deg) {
    return (deg * Math.PI) / 180;
  }

  static toDeg(rad) {
    return (rad * 180) / Math.PI;
  }

  static _N(latR, el) {
    const sinLat = Math.sin(latR);
    return el.a / Math.sqrt(1 - el.e2 * sinLat * sinLat);
  }

  static geoToCart(latDeg, lngDeg, h, el) {
    const lat = this.toRad(latDeg);
    const lng = this.toRad(lngDeg);
    const N = this._N(lat, el);
    return {
      X: (N + h) * Math.cos(lat) * Math.cos(lng),
      Y: (N + h) * Math.cos(lat) * Math.sin(lng),
      Z: (N * (1 - el.e2) + h) * Math.sin(lat),
    };
  }

  static cartToGeo(X, Y, Z, el) {
    const p = Math.sqrt(X * X + Y * Y);
    let lat = Math.atan2(Z, p * (1 - el.e2));
    for (let i = 0; i < 15; i++) {
      const N = this._N(lat, el);
      const newLat = Math.atan2(Z + el.e2 * N * Math.sin(lat), p);
      if (Math.abs(newLat - lat) < 1e-14) break;
      lat = newLat;
    }
    const lng = Math.atan2(Y, X);
    const N = this._N(lat, el);
    const h = Math.cos(lat) !== 0 ? p / Math.cos(lat) - N : Z / Math.sin(lat) - N * (1 - el.e2);
    return { lat: this.toDeg(lat), lng: this.toDeg(lng), h };
  }

  static geoToUTM(latDeg, lngDeg, huso, el) {
    const a = el.a;
    const e2 = el.e2;
    const ep2 = el.ep2;
    const k0 = 0.9996;
    const lon0 = huso * 6 - 183;
    const latR = this.toRad(latDeg);
    const lngR = this.toRad(lngDeg);
    const lng0R = this.toRad(lon0);

    const N = this._N(latR, el);
    const T = Math.tan(latR) ** 2;
    const C = ep2 * Math.cos(latR) ** 2;
    const A = Math.cos(latR) * (lngR - lng0R);

    const e4 = e2 * e2;
    const e6 = e4 * e2;
    const M =
      a *
      ((1 - e2 / 4 - (3 * e4) / 64 - (5 * e6) / 256) * latR -
        ((3 * e2) / 8 + (3 * e4) / 32 + (45 * e6) / 1024) * Math.sin(2 * latR) +
        ((15 * e4) / 256 + (45 * e6) / 1024) * Math.sin(4 * latR) -
        ((35 * e6) / 3072) * Math.sin(6 * latR));

    const A2 = A * A;
    const A3 = A2 * A;
    const A4 = A3 * A;
    const A5 = A4 * A;
    const A6 = A5 * A;

    const este =
      k0 *
        N *
        (A +
          ((1 - T + C) * A3) / 6 +
          ((5 - 18 * T + T * T + 72 * C - 58 * ep2) * A5) / 120) +
      500000.0;

    let norte =
      k0 *
      (M +
        N *
          Math.tan(latR) *
          (A2 / 2 +
            ((5 - T + 9 * C + 4 * C * C) * A4) / 24 +
            ((61 - 58 * T + T * T + 600 * C - 330 * ep2) * A6) / 720));

    if (latDeg < 0) norte += 10000000.0;

    return {
      este: Math.round(este * 1000) / 1000,
      norte: Math.round(norte * 1000) / 1000,
      huso,
      hemi: latDeg >= 0 ? 'N' : 'S',
    };
  }

  static utmToGeo(este, norte, huso, hemiSur, el) {
    const k0 = 0.9996;
    const a = el.a;
    const e2 = el.e2;
    const ep2 = el.ep2;
    const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
    const lon0 = this.toRad(huso * 6 - 183);

    const x = este - 500000.0;
    let y = norte;
    if (hemiSur) y -= 10000000.0;

    const e4 = e2 * e2;
    const e6 = e4 * e2;
    const M0 = y / k0;
    const mu = M0 / (a * (1 - e2 / 4 - (3 * e4) / 64 - (5 * e6) / 256));

    const e12 = e1 * e1;
    const e13 = e12 * e1;
    const e14 = e13 * e1;
    const phi1 =
      mu +
      ((3 * e1) / 2 - (27 * e13) / 32) * Math.sin(2 * mu) +
      ((21 * e12) / 16 - (55 * e14) / 32) * Math.sin(4 * mu) +
      ((151 * e13) / 96) * Math.sin(6 * mu) +
      ((1097 * e14) / 512) * Math.sin(8 * mu);

    const N1 = this._N(phi1, el);
    const T1 = Math.tan(phi1) ** 2;
    const C1 = ep2 * Math.cos(phi1) ** 2;
    const R1 = (a * (1 - e2)) / Math.pow(1 - e2 * Math.sin(phi1) ** 2, 1.5);
    const D = x / (N1 * k0);
    const D2 = D * D;
    const D3 = D2 * D;
    const D4 = D3 * D;
    const D5 = D4 * D;
    const D6 = D5 * D;

    const lat =
      phi1 -
      ((N1 * Math.tan(phi1)) / R1) *
        (D2 / 2 -
          ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ep2) * D4) / 24 +
          ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ep2 - 3 * C1 * C1) * D6) / 720);

    const lng =
      lon0 +
      (1 / Math.cos(phi1)) *
        (D -
          ((1 + 2 * T1 + C1) * D3) / 6 +
          ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ep2 + 24 * T1 * T1) * D5) / 120);

    return { lat: this.toDeg(lat), lng: this.toDeg(lng) };
  }

  static badekas(X, Y, Z, inverso) {
    const p = PATVEN98;
    const rxR = this.toRad(p.rx / 3600);
    const ryR = this.toRad(p.ry / 3600);
    const rzR = this.toRad(p.rz / 3600);
    const s = 1 + p.ds * 1e-6;

    if (!inverso) {
      const dX = X - p.XM;
      const dY = Y - p.YM;
      const dZ = Z - p.ZM;
      return {
        X: s * (dX + rzR * dY - ryR * dZ) + p.XM + p.dx,
        Y: s * (-rzR * dX + dY + rxR * dZ) + p.YM + p.dy,
        Z: s * (ryR * dX - rxR * dY + dZ) + p.ZM + p.dz,
      };
    } else {
      const dX = X - p.XM - p.dx;
      const dY = Y - p.YM - p.dy;
      const dZ = Z - p.ZM - p.dz;
      const sI = 1 / s;
      return {
        X: sI * (dX - rzR * dY + ryR * dZ) + p.XM,
        Y: sI * (rzR * dX + dY - rxR * dZ) + p.YM,
        Z: sI * (-ryR * dX + rxR * dY + dZ) + p.ZM,
      };
    }
  }

  static transformBadekas(este, norte, h, huso, inv = false) {
    const elO = inv ? GRS80 : HAYFORD;
    const elD = inv ? HAYFORD : GRS80;
    const geoO = this.utmToGeo(este, norte, huso, false, elO);
    const cartO = this.geoToCart(geoO.lat, geoO.lng, h, elO);
    const cartD = this.badekas(cartO.X, cartO.Y, cartO.Z, inv);
    const geoD = this.cartToGeo(cartD.X, cartD.Y, cartD.Z, elD);
    const utmD = this.geoToUTM(geoD.lat, geoD.lng, huso, elD);

    const deltaE = Math.round((utmD.este - este) * 1000) / 1000;
    const deltaN = Math.round((utmD.norte - norte) * 1000) / 1000;

    return {
      este: utmD.este,
      norte: utmD.norte,
      lat: geoD.lat,
      lng: geoD.lng,
      latOrigen: geoO.lat,
      lngOrigen: geoO.lng,
      cartO,
      cartD,
      huso,
      deltaE,
      deltaN,
      dLineal: Math.round(Math.hypot(deltaE, deltaN) * 1000) / 1000,
    };
  }

  static transformRigida(este, norte, h, huso, inv = false, dn = 0, de = 0) {
    const base = this.transformBadekas(este, norte, h, huso, inv);
    const dN = inv ? -dn : dn;
    const dE = inv ? -de : de;
    const finalEste = Math.round((base.este + dE) * 1000) / 1000;
    const finalNorte = Math.round((base.norte + dN) * 1000) / 1000;
    const elD = inv ? HAYFORD : GRS80;
    const finalGeo = this.utmToGeo(finalEste, finalNorte, huso, false, elD);
    const deltaE = Math.round((finalEste - este) * 1000) / 1000;
    const deltaN = Math.round((finalNorte - norte) * 1000) / 1000;

    return {
      ...base,
      este: finalEste,
      norte: finalNorte,
      lat: finalGeo.lat,
      lng: finalGeo.lng,
      deltaE,
      deltaN,
      dLineal: Math.round(Math.hypot(deltaE, deltaN) * 1000) / 1000,
    };
  }

  static transformRigida02(vertices, customDeltas = {}, inv = false) {
    if (!Array.isArray(vertices) || vertices.length === 0) {
      throw new Error('RIGIDA02: Se requiere al menos 1 vértice.');
    }

    const rawDe = Number.isFinite(customDeltas.deltaEste) ? customDeltas.deltaEste : this.RIGIDA02_DELTA_ESTE;
    const rawDn = Number.isFinite(customDeltas.deltaNorte) ? customDeltas.deltaNorte : this.RIGIDA02_DELTA_NORTE;
    const cotaGeoidal = Number.isFinite(customDeltas.cotaGeoidal) ? customDeltas.cotaGeoidal : this.RIGIDA02_COTA_GEOIDAL;
    const huso = customDeltas.huso || 19;

    const deltaEste = inv ? -rawDe : rawDe;
    const deltaNorte = inv ? -rawDn : rawDn;
    const elO = inv ? GRS80 : HAYFORD;
    const elD = inv ? HAYFORD : GRS80;

    // Fase 1: Auditoría de entrada y auto-transposición (Norte > 1,000,000 / Este < 1,000,000)
    let transpuestos = 0;
    const normalizados = vertices.map((v, idx) => {
      let n = Number(v.norte);
      let e = Number(v.este);
      if (e > n) {
        [n, e] = [e, n];
        transpuestos++;
      }
      return {
        id: v.id || `P${idx + 1}`,
        este_orig: e,
        norte_orig: n,
        z_orig: Number(v.z || 0),
      };
    });

    // Fase 2: Distancias euclidianas en sistema origen
    const distOrigen = new Map();
    for (let i = 0; i < normalizados.length; i++) {
      for (let j = i + 1; j < normalizados.length; j++) {
        const a = normalizados[i];
        const b = normalizados[j];
        distOrigen.set(`${a.id}_${b.id}`, Math.hypot(a.este_orig - b.este_orig, a.norte_orig - b.norte_orig));
      }
    }

    // Fase 3: Traslación rígida pura + inyección altimétrica
    const resultados = normalizados.map((v) => {
      const esteDest = Math.round((v.este_orig + deltaEste) * 1000) / 1000;
      const norteDest = Math.round((v.norte_orig + deltaNorte) * 1000) / 1000;
      const cotaInyectada = v.z_orig === 0;
      const cotaDest = Math.round((cotaInyectada ? cotaGeoidal : v.z_orig) * 1000) / 1000;

      const geoO = this.utmToGeo(v.este_orig, v.norte_orig, huso, false, elO);
      const geoD = this.utmToGeo(esteDest, norteDest, huso, false, elD);
      const cartO = this.geoToCart(geoO.lat, geoO.lng, cotaDest, elO);
      const cartD = this.geoToCart(geoD.lat, geoD.lng, cotaDest, elD);

      return {
        id: v.id,
        este_orig: Math.round(v.este_orig * 1000) / 1000,
        norte_orig: Math.round(v.norte_orig * 1000) / 1000,
        este: esteDest,
        norte: norteDest,
        cota: cotaDest,
        cotaInyectada,
        lat: geoD.lat,
        lng: geoD.lng,
        cartO,
        cartD,
        deltaE: Math.round(deltaEste * 1000) / 1000,
        deltaN: Math.round(deltaNorte * 1000) / 1000,
        dLineal: Math.round(Math.hypot(deltaEste, deltaNorte) * 1000) / 1000,
        descripcion: 'VERTICE_SANEADO_REGVEN',
      };
    });

    // Fase 4: QA/QC post-transformación — invarianza de forma <= 0.001 m
    let maxDistDiff = 0;
    for (let i = 0; i < resultados.length; i++) {
      for (let j = i + 1; j < resultados.length; j++) {
        const a = resultados[i];
        const b = resultados[j];
        const d0 = distOrigen.get(`${a.id}_${b.id}`);
        const d1 = Math.hypot(a.este - b.este, a.norte - b.norte);
        const diff = Math.abs(d0 - d1);
        if (diff > maxDistDiff) maxDistDiff = diff;
      }
    }

    return {
      resultados,
      qaqcPasado: maxDistDiff <= 0.001,
      maxDistDiff,
      transpuestos,
      deltaEste,
      deltaNorte,
      cotaGeoidalDefecto: cotaGeoidal,
    };
  }

  static formatDMS(degDecimal, isLat = true) {
    const abs = Math.abs(degDecimal);
    const d = Math.floor(abs);
    const mFloat = (abs - d) * 60;
    const m = Math.floor(mFloat);
    const s = ((mFloat - m) * 60).toFixed(3);
    const hemi = isLat ? (degDecimal >= 0 ? 'N' : 'S') : degDecimal >= 0 ? 'E' : 'W';
    return `${String(d).padStart(2, '0')}° ${String(m).padStart(2, '0')}' ${String(s).padStart(6, '0')}" ${hemi}`;
  }

  static formatRumbo(dE, dN) {
    const azRad = Math.atan2(dE, dN);
    let azDeg = (azRad * 180) / Math.PI;
    if (azDeg < 0) azDeg += 360;

    let ns = 'N';
    let ew = 'E';
    let rDeg = azDeg;

    if (azDeg >= 0 && azDeg <= 90) {
      ns = 'N'; ew = 'E'; rDeg = azDeg;
    } else if (azDeg > 90 && azDeg <= 180) {
      ns = 'S'; ew = 'E'; rDeg = 180 - azDeg;
    } else if (azDeg > 180 && azDeg <= 270) {
      ns = 'S'; ew = 'W'; rDeg = azDeg - 180;
    } else {
      ns = 'N'; ew = 'W'; rDeg = 360 - azDeg;
    }

    const d = Math.floor(rDeg);
    const mFloat = (rDeg - d) * 60;
    const m = Math.floor(mFloat);
    const s = Math.round((mFloat - m) * 60);
    return {
      azimut: `${azDeg.toFixed(2)}°`,
      rumbo: `${ns} ${String(d).padStart(2, '0')}°${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}" ${ew}`,
    };
  }

  static calculatePolygonStats(vertices) {
    if (!vertices || vertices.length < 2) {
      return { areaM2: 0, areaHa: 0, perimeter: 0, legs: [] };
    }
    let area = 0;
    let perimeter = 0;
    const legs = [];

    for (let i = 0; i < vertices.length; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % vertices.length];
      area += p1.este * p2.norte - p2.este * p1.norte;
      const dE = p2.este - p1.este;
      const dN = p2.norte - p1.norte;
      const dist = Math.hypot(dE, dN);
      perimeter += dist;
      const { rumbo, azimut } = this.formatRumbo(dE, dN);
      legs.push({
        from: p1.id,
        to: p2.id,
        distancia: dist,
        rumbo,
        azimut,
      });
    }

    const areaM2 = Math.abs(area) / 2;
    return {
      areaM2,
      areaHa: areaM2 / 10000,
      perimeter,
      legs,
    };
  }

  static generateCivilCAD(vertices) {
    return vertices
      .map((v, i) => {
        const id = v.id || `P${i + 1}`;
        const e = Number(v.este).toFixed(3);
        const n = Number(v.norte).toFixed(3);
        const z = Number(v.cota ?? -22.45).toFixed(3);
        const desc = v.descripcion || 'VERTICE_SANEADO_REGVEN';
        return `${id},${e},${n},${z},${desc}`;
      })
      .join('\n');
  }

  /**
   * Genera un archivo ASCII .DXF válido (R12/R2000 compatible con AutoCAD y CivilCAD)
   * con capas VERTICES, LINDEROS, TEXTO y CUADRO_CONSTRUCCION.
   */
  static generateDXF(vertices, meta = {}) {
    const datumLabel = meta.datum || 'SIRGAS-REGVEN (GRS80)';
    const huso = meta.huso || 19;
    const stats = this.calculatePolygonStats(vertices);

    const lines = [
      '0', 'SECTION',
      '2', 'HEADER',
      '9', '$ACADVER', '1', 'AC1009',
      '9', '$INSUNITS', '70', '6',
      '0', 'ENDSEC',
      '0', 'SECTION',
      '2', 'TABLES',
      '0', 'TABLE',
      '2', 'LAYER',
      '70', '4',
      // Capa LINDEROS (Verde 3)
      '0', 'LAYER', '2', 'LINDEROS', '70', '0', '62', '3', '6', 'CONTINUOUS',
      // Capa VERTICES (Cian 4)
      '0', 'LAYER', '2', 'VERTICES', '70', '0', '62', '4', '6', 'CONTINUOUS',
      // Capa TEXTO (Blanco 7)
      '0', 'LAYER', '2', 'TEXTO', '70', '0', '62', '7', '6', 'CONTINUOUS',
      // Capa CUADRO_CONSTRUCCION (Amarillo 2)
      '0', 'LAYER', '2', 'CUADRO_CONSTRUCCION', '70', '0', '62', '2', '6', 'CONTINUOUS',
      '0', 'ENDTAB',
      '0', 'ENDSEC',
      '0', 'SECTION',
      '2', 'ENTITIES',
    ];

    if (vertices.length >= 2) {
      // Polilínea cerrada en capa LINDEROS
      lines.push(
        '0', 'POLYLINE',
        '8', 'LINDEROS',
        '66', '1',
        '70', vertices.length >= 3 ? '1' : '0'
      );
      for (const v of vertices) {
        lines.push(
          '0', 'VERTEX',
          '8', 'LINDEROS',
          '10', Number(v.este).toFixed(3),
          '20', Number(v.norte).toFixed(3),
          '30', Number(v.cota ?? 0).toFixed(3)
        );
      }
      lines.push('0', 'SEQEND');
    }

    // Vértices y etiquetas
    for (const v of vertices) {
      const e = Number(v.este).toFixed(3);
      const n = Number(v.norte).toFixed(3);
      const z = Number(v.cota ?? 0).toFixed(3);

      lines.push(
        '0', 'POINT',
        '8', 'VERTICES',
        '10', e, '20', n, '30', z,
        '0', 'CIRCLE',
        '8', 'VERTICES',
        '10', e, '20', n, '30', z, '40', '1.8',
        '0', 'TEXT',
        '8', 'TEXTO',
        '10', (Number(v.este) + 2.5).toFixed(3),
        '20', (Number(v.norte) + 2.5).toFixed(3),
        '30', z,
        '40', '3.0',
        '1', String(v.id)
      );
    }

    // Metadato en capa CUADRO_CONSTRUCCION
    if (vertices.length > 0) {
      const maxE = Math.max(...vertices.map((v) => Number(v.este)));
      const maxN = Math.max(...vertices.map((v) => Number(v.norte)));
      const baseX = maxE + 25;
      let curY = maxN;

      const addCadText = (txt, y) => {
        lines.push(
          '0', 'TEXT',
          '8', 'CUADRO_CONSTRUCCION',
          '10', baseX.toFixed(3),
          '20', y.toFixed(3),
          '30', '0.000',
          '40', '2.4',
          '1', txt
        );
      };

      addCadText(`GEOGIS6 v6.0 - CUADRO DE CONSTRUCCION (${datumLabel} HUSO ${huso}N)`, curY);
      curY -= 4.5;
      addCadText(`AREA: ${stats.areaM2.toFixed(2)} m2 (${stats.areaHa.toFixed(4)} ha) | PERIMETRO: ${stats.perimeter.toFixed(2)} m`, curY);
      curY -= 5.0;

      vertices.forEach((v, idx) => {
        const leg = stats.legs[idx];
        const legTxt = leg ? ` | RUMBO: ${leg.rumbo} | DIST: ${leg.distancia.toFixed(3)} m` : '';
        addCadText(`${v.id}: E=${Number(v.este).toFixed(3)} N=${Number(v.norte).toFixed(3)}${legTxt}`, curY);
        curY -= 3.8;
      });
    }

    lines.push('0', 'ENDSEC', '0', 'EOF');
    return lines.join('\n');
  }
}
