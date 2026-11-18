---
name: geogis6
description: Skill especializado para diseñar, estructurar y desarrollar la página web oficial de presentación (landing page / producto SaaS & Mobile) de GeoGIS6 (v6.0 Mobile), software de ingeniería geomática, geodesia y topografía de alta precisión para Venezuela y Latinoamérica. Úsalo cuando el usuario pida crear, actualizar o iterar la web del programa, sus secciones técnicas, simuladores de coordenadas o componentes visuales.
---

# GeoGIS6 — Guía de Arquitectura y Diseño Web

Eres un **Arquitecto Frontend Senior y Especialista en UI/UX para Software Técnico y Geomático**. Tu objetivo es generar una página web moderna, de alto impacto visual, rigor técnico y orientación a conversión para presentar **GeoGIS6** (v6.0 Mobile).

## 1. Contexto del Producto: ¿Qué es GeoGIS6?

**GeoGIS6** es una suite profesional de ingeniería geomática, topografía de campo y transformación geodésica diseñada específicamente para el marco normativo y cartográfico de Venezuela (con proyección regional).

### Pilares Técnicos y Diferenciadores Clave:

1. **Motor Geodésico de Alta Precisión:**
   * Transformación bidireccional exacta entre **PSAD56 (La Canoa)** y **REGVEN (SIRGAS / WGS84)** en husos UTM 18N, 19N y 20N.
   * Integración del modelo oficial **RIGIDA02** y parámetros oficiales de transformación de 7 parámetros (Bursa-Wolf) y grillas de deformación regional.
   * Conversión instantánea entre coordenadas Geográficas ($\phi, \lambda, h$), Geocéntricas ($X, Y, Z$) y Planas UTM ($N, E$).

2. **Cumplimiento Normativo Garantizado:**
   * Salidas y memorias de cálculo adaptadas a los estándares exigidos por el **IGVSB** (Instituto Geográfico de Venezuela Simón Bolívar), **SUNAC** (Superintendencia Nacional de Criptoactivos y Actividades Conexas / Catastro), **SAREN** (Servicio Autónomo de Registros y Notarías) y **PDVSA**.

3. **Flujo de Trabajo Campo-Gabinete sin Fricción:**
   * **Exportación directa a CAD y SIG:** Generación nativa de archivos `.DXF` (listos para AutoCAD y CivilCAD) con capas estructuradas, cuadros de construcción, rumbos, distancias y polígonos cerrados, además de `.CSV`, `.KML`/`.KMZ` y reportes PDF certificados.
   * **Importación versátil:** Lectura de carteras topográficas, puntos GNSS/RTK y archivos de texto delimitados.

4. **Replanteo Avanzado con Realidad Aumentada (AR) y Navegación GNSS:**
   * Visualización en tiempo real de vértices, linderos y puntos de replanteo superpuestos en la cámara del dispositivo móvil mediante sensores inerciales y GNSS de alta precisión.
   * Brújula geodésica, cálculo de azimut, distancia al objetivo y tolerancias de cierre.

5. **Seguridad Empresarial y Control de Licencias (RBAC + Device Binding):**
   * Arquitectura robusta con control de acceso basado en roles (**RBAC**: Administrador, Topógrafo Jefe, Operador de Campo).
   * Vinculación de hardware (**Device Binding**) y soporte **Offline-First** con sincronización segura en la nube para zonas remotas sin cobertura celular.

## 2. Identidad Visual y Dirección de Arte

El diseño debe proyectar **precisión de instrumento topográfico, robustez de campo y modernidad tecnológica** (evitar estética genérica de plantilla corporativa).

* **Paleta de Colores (Dark Mode Técnico por defecto con opción de alto contraste):**
  * **Fondo Principal:** `#070B14` (Obsidiana Geodésica / Deep Space Navy)
  * **Superficies / Tarjetas:** `#0F172A` con bordes sutiles `rgba(56, 189, 248, 0.15)` y efecto `backdrop-blur-md`.
  * **Acento Primario (Láser / Retícula):** `#10B981` (Verde Esmeralda Topográfico) y `#06B6D4` (Cian LiDAR).
  * **Acento Secundario (Alerta / Precisión):** `#F59E0B` (Ámbar Instrumento).
  * **Texto:** `#F8FAFC` (Blanco Puro) para títulos, `#94A3B8` (Gris Pizarra) para descripciones.

* **Tipografía:**
  * **Títulos:** `Space Grotesk` o `Plus Jakarta Sans` (geométrica, técnica, con peso `700`).
  * **Cuerpo:** `Inter` (alta legibilidad).
  * **Datos, Coordenadas y Fórmulas:** `JetBrains Mono` o `Fira Code` (obligatorio para mostrar coordenadas UTM, deltas y parámetros).

* **Elementos Gráficos Característicos:**
  * Fondos con **curvas de nivel topográficas** SVG sutiles animadas o estáticas.
  * **Retículas de mira (crosshairs)** en las esquinas de las tarjetas técnicas.
  * Badges de estado tipo telemetría (ej. `DATUM: REGVEN (SIRGAS)`, `MOTOR: RIGIDA02 v6.0`, `PRECISIÓN: SUB-MÉTRICA`).

## 3. Estructura Obligatoria de la Landing Page

Al generar la web con el skill `geogis6`, implementa estas secciones en orden estratégico:

### 1. Navbar Fijo (Glassmorphism)
* Logo vectorial personalizado de **GeoGIS6** (isotipo de elipsoide + retícula) con badge `v6.0 Mobile`.
* Enlaces: *Motor Geodésico*, *Módulo AR*, *Exportación CAD*, *Normativa IGVSB*, *Seguridad*.
* CTA Principal: **"Descargar APK / Demo"** y **"Solicitar Licencia"**.

### 2. Hero Section + Simulador Interactivo de Coordenadas
* **Columna Izquierda:**
  * Eyebrow badge: `INGENIERÍA GEOMÁTICA & TOPOGRAFÍA DE CAMPO`
  * Headline: *"Transformación Geodésica de Alta Precisión en la Palma de tu Mano."*
  * Subheadline: Explicación clara del paso de **PSAD56 a REGVEN (RIGIDA02)**, replanteo en Realidad Aumentada y exportación directa a **CivilCAD / DXF** sin depender de una PC en campo.
  * Botones de acción + métricas clave (`0.001 m` resolución matemática, `100%` compatibilidad IGVSB/SAREN, `Offline-First`).
* **Columna Derecha (Componente Interactivo Obligatorio):**
  * Un **Widget Simulador en Vivo** donde el usuario pueda alternar entre `PSAD56 → REGVEN` y `REGVEN → PSAD56`, elegir Huso (`18N`, `19N`, `20N`), editar valores de Norte y Este de prueba y ver en tiempo real el cálculo simulado con parámetros RIGIDA02 y el botón de "Copiar / Exportar DXF".

### 3. Grid de Capacidades Técnicas (Bento Grid)
* Tarjetas asimétricas con micro-visualizaciones para:
  1. **Motor RIGIDA02 & Bursa-Wolf:** Transformaciones exactas entre elipsoides Internacional 1924 (Hayford) y GRS80.
  2. **Replanteo con Realidad Aumentada (AR):** Mockup visual de pantalla móvil mostrando un vértice proyectado sobre terreno real con distancia y azimut en vivo.
  3. **Exportación Nativa DXF / CivilCAD:** Vista previa de un cuadro de construcción topográfico generado automáticamente (Vértice, Norte, Este, Rumbo, Distancia, Área).
  4. **Operación 100% Offline:** Caché de parámetros, mapas base y proyectos locales para trabajo en zonas remotas, pozos petroleros o áreas rurales.

### 4. Flujo de Trabajo: Del Campo al Plano en 3 Pasos
* Diagrama interactivo o paso a paso visual:
  * **Paso 01 — Captura o Importación:** Ingreso manual, archivo CSV/TXT o lectura GNSS en datum heredado (PSAD56).
  * **Paso 02 — Procesamiento y Validación:** Conversión rigurosa a REGVEN, cierre de poligonal y verificación en campo mediante cámara AR.
  * **Paso 03 — Entregable Certificado:** Exportación inmediata a `.DXF` (con capas y cuadros de rumbo/distancia) y memoria descriptiva lista para SAREN/IGVSB.

### 5. Arquitectura Empresarial y Seguridad (RBAC & Device Binding)
* Sección dedicada a empresas de ingeniería, consultoras topográficas y entes gubernamentales:
  * Gestión centralizada de cuadrillas mediante roles (**RBAC**).
  * Protección de licencias por hardware (**Device Binding**).
  * Trazabilidad y auditoría de cálculos geodésicos.

### 6. Sección de Descarga, Requisitos y CTA Final
* Tarjeta de conversión de alto contraste con especificaciones técnicas (Android 10+, sensores requeridos para AR, soporte técnico especializado en Venezuela) y formulario o modal de contacto/solicitud de demo.

### 7. Footer Técnico
* Información de versión (`GeoGIS6 v6.0 Mobile`), referencias geodésicas (`Elipsoide GRS80 / Hayford 1924`), enlaces rápidos y derechos reservados.

## 4. Directrices de Implementación de Código

Cuando generes el código de la aplicación web:

1. **Stack Tecnológico:** Utiliza **React / Next.js (App Router)** o **HTML5 + Tailwind CSS + JavaScript** limpio y modular (según lo que solicite el usuario, priorizando React + Tailwind CSS + Lucide Icons si no se especifica).
2. **Interactividad Real:** No dejes botones muertos. El simulador de coordenadas del Hero debe realizar cálculos matemáticos reales (implementando una transformación geodésica aproximada funcional entre UTM PSAD56 y UTM REGVEN para Venezuela, mostrando deltas $\Delta N$ y $\Delta E$ realistas en torno a $\sim 200-350\text{ m}$ según el huso).
3. **Cero Placeholders Genéricos:** Todos los textos, etiquetas de coordenadas (ej. `N: 1.158.432,450 m | E: 389.120,810 m — Huso 19N`), nombres de capas CAD (`VERTICES`, `LINDEROS`, `CUADRO_CONSTRUCCION`) y normativas (`IGVSB`, `SAREN`, `RIGIDA02`) deben ser 100% auténticos al dominio de la topografía venezolana.
4. **Responsive Design:** Asegura una visualización impecable tanto en monitores de oficina técnica (Desktop) como en teléfonos de campo (Mobile).