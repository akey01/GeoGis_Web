import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const WORKSPACE_DIR = 'c:\\Users\\akey02\\Desktop\\IA-PROJECTS\\geogis6 web';
const SCRATCH_DIR = 'C:\\Users\\akey02\\.gemini\\antigravity\\brain\\9425e94d-0591-440f-b6fd-15ee7a2474a8\\scratch';
const FRAMES_DIR = path.join(SCRATCH_DIR, 'reel_frames');
const AUDIO_WAV = path.join(SCRATCH_DIR, 'reel_audio.wav');
const AUDIO_PY = path.join(SCRATCH_DIR, 'gen_audio.py');
const VIDEO_DIR = path.join(WORKSPACE_DIR, 'assets', 'video');
const OUTPUT_MP4 = path.join(VIDEO_DIR, 'geogis6_tiktok_reel.mp4');
const PLAYWRIGHT_ENTRY =
  'C:\\Users\\akey02\\Desktop\\IA-PROJECTS\\geotransv6.0-mobile - copia\\node_modules\\playwright\\index.mjs';

const FPS = 24;
const DURATION_SEC = 21.0;
const TOTAL_FRAMES = Math.round(FPS * DURATION_SEC); // 504 frames

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function startStaticServer(rootDir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
      const rel = reqPath === '/' ? 'index.html' : reqPath.replace(/^\/+/, '');
      const fullPath = path.join(rootDir, rel);
      if (!fullPath.startsWith(rootDir) || !fs.existsSync(fullPath)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(fullPath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(fullPath).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

function generateAudioWav() {
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });
  const pyCode = `
import math, struct, wave, random

SR = 44100
DUR = ${DURATION_SEC}
N = int(SR * DUR)

scene_cuts = [0.0, 3.2, 7.0, 11.2, 15.2, 18.0]
chords = [
    (110.0, 164.81, 220.0, 261.63), # Am
    (87.31, 130.81, 174.61, 220.0), # F
    (130.81, 196.00, 261.63, 329.63), # C
    (98.00, 146.83, 196.00, 246.94), # G
]
arp_notes = [220.0, 261.63, 329.63, 392.0, 440.0, 392.0, 329.63, 261.63]

random.seed(42)

with wave.open(r"${AUDIO_WAV}", "w") as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    buf = bytearray()

    for i in range(N):
        t = i / SR
        beat_pos = (t * 2.0) % 1.0 # 120 BPM (0.5s beat)
        step_idx = int(t * 4.0)     # 16th/8th feel

        # Kick drum on every beat
        kick = 0.0
        if beat_pos < 0.18:
            freq = 125.0 * math.exp(-beat_pos * 26.0) + 45.0
            kick = math.sin(2 * math.pi * freq * beat_pos) * math.exp(-beat_pos * 18.0) * 0.42

        # Crisp off-beat hi-hat tick
        hat = 0.0
        off_pos = ((t + 0.25) * 2.0) % 1.0
        if off_pos < 0.045:
            hat = (random.random() * 2 - 1) * math.exp(-off_pos * 90.0) * 0.09

        # Warm synth pad progression
        chord = chords[int(t / 4.0) % len(chords)]
        pad = sum(math.sin(2 * math.pi * f * t) for f in chord) * 0.045

        # Subtle tech arp pulse
        arp_t = (t * 4.0) % 1.0
        arp_f = arp_notes[step_idx % len(arp_notes)]
        arp = math.sin(2 * math.pi * arp_f * t) * math.exp(-arp_t * 6.5) * 0.075

        # Sonar ping on scene cuts
        ping = 0.0
        for cut in scene_cuts:
            dt = t - cut
            if 0.0 <= dt < 0.45:
                ping += math.sin(2 * math.pi * 880.0 * dt) * math.exp(-dt * 10.0) * 0.18
                ping += math.sin(2 * math.pi * 1320.0 * dt) * math.exp(-dt * 14.0) * 0.10

        # QA/QC double confirmation chime at 8.85s
        qa_dt = t - 8.85
        if 0.0 <= qa_dt < 0.55:
            f_qa = 1046.5 if qa_dt < 0.12 else 1567.98
            env = math.exp(-(qa_dt if qa_dt < 0.12 else qa_dt - 0.12) * 10.0)
            ping += math.sin(2 * math.pi * f_qa * qa_dt) * env * 0.22

        # Master envelope fade in/out
        env_master = 1.0
        if t < 0.2:
            env_master = t / 0.2
        elif t > DUR - 0.8:
            env_master = max(0.0, (DUR - t) / 0.8)

        mono_center = (kick + pad + ping) * env_master
        left = max(-0.92, min(0.92, mono_center + arp * 0.85 * env_master + hat * 0.7))
        right = max(-0.92, min(0.92, mono_center + arp * 1.15 * env_master + hat * 1.2))

        buf.extend(struct.pack("<hh", int(left * 32767), int(right * 32767)))

    wf.writeframes(buf)
print("Audio WAV generado:", r"${AUDIO_WAV}")
`;
  fs.writeFileSync(AUDIO_PY, pyCode, 'utf8');
  execFileSync('python', [AUDIO_PY], { stdio: 'inherit' });
}

async function renderFrames(url) {
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  const { chromium } = await import(pathToFileURL(PLAYWRIGHT_ENTRY).href);
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1080, height: 1920 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const imgs = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        imgs.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((res) => {
                img.onload = res;
                img.onerror = res;
              })
        )
      );
    });

    console.log(`Renderizando ${TOTAL_FRAMES} fotogramas (1080x1920 @ ${FPS}fps)...`);
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const t = i / FPS;
      await page.evaluate((timeVal) => window.setReelTime(timeVal), t);
      const framePath = path.join(FRAMES_DIR, `frame_${String(i).padStart(4, '0')}.jpg`);
      await page.screenshot({ path: framePath, type: 'jpeg', quality: 92 });
      if ((i + 1) % 72 === 0 || i === TOTAL_FRAMES - 1) {
        console.log(`  Progreso: ${i + 1} / ${TOTAL_FRAMES} frames`);
      }
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });

  console.log('1. Generando pista de audio técnico sintetizado...');
  generateAudioWav();

  console.log('2. Iniciando servidor temporal para renderizado...');
  const { server, port } = await startStaticServer(WORKSPACE_DIR);

  try {
    await renderFrames(`http://127.0.0.1:${port}/reel.html?render=1`);
  } finally {
    server.close();
  }

  console.log('3. Codificando MP4 vertical TikTok con FFmpeg (1080x1920 H.264 + AAC)...');
  const ffmpegExe = execFileSync(
    'python',
    ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'],
    { encoding: 'utf8' }
  ).trim();
  execFileSync(
    ffmpegExe,
    [
      '-y',
      '-framerate',
      String(FPS),
      '-i',
      path.join(FRAMES_DIR, 'frame_%04d.jpg'),
      '-i',
      AUDIO_WAV,
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-preset',
      'fast',
      '-crf',
      '18',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-shortest',
      '-movflags',
      '+faststart',
      OUTPUT_MP4,
    ],
    { stdio: 'inherit' }
  );

  // Clean up temporary frame directory
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });

  const stats = fs.statSync(OUTPUT_MP4);
  console.log(`¡Video TikTok generado con éxito! -> ${OUTPUT_MP4} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
}

main().catch((err) => {
  console.error('Error generando Reel de TikTok:', err);
  process.exit(1);
});
