const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat
} = require('docx');
const fs = require('fs');

const C = {
  purple:     '7C3AED',
  purpleLight:'EDE9FE',
  purpleMid:  'A78BFA',
  dark:       '1E1B4B',
  darkGray:   '374151',
  midGray:    '6B7280',
  lightGray:  'F3F4F6',
  border:     'E5E7EB',
  white:      'FFFFFF',
  green:      '059669',
  greenLight: 'D1FAE5',
  blue:       '2563EB',
  blueLight:  'DBEAFE',
  orange:     'D97706',
  orangeLight:'FEF3C7',
  red:        'DC2626',
  redLight:   'FEE2E2',
  teal:       '0D9488',
  tealLight:  'CCFBF1',
};

const bdr = (color = C.border, sz = 4) => ({ style: BorderStyle.SINGLE, size: sz, color });
const allBorders = (color = C.border) => ({ top: bdr(color), bottom: bdr(color), left: bdr(color), right: bdr(color) });
const noBorder = { style: BorderStyle.NIL };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function cell(children, { width = 3120, bg = C.white, bold = false, color = C.darkGray, align = AlignmentType.LEFT, vAlign = VerticalAlign.CENTER } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: allBorders(),
    shading: { fill: bg, type: ShadingType.CLEAR },
    verticalAlign: vAlign,
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    children: Array.isArray(children) ? children : [
      new Paragraph({
        alignment: align,
        children: [new TextRun({ text: String(children), bold, color, size: 20, font: 'Arial' })]
      })
    ]
  });
}

function headerCell(text, width = 3120, bg = C.dark) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: allBorders(C.dark),
    shading: { fill: bg, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, color: C.white, size: 20, font: 'Arial' })]
    })]
  });
}

function p(text, { bold = false, size = 22, color = C.darkGray, spacing = { before: 0, after: 160 }, align = AlignmentType.LEFT, italic = false } = {}) {
  return new Paragraph({
    alignment: align,
    spacing,
    children: [new TextRun({ text: String(text), bold, size, color, italics: italic, font: 'Arial' })]
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.purple, space: 1 } },
    children: [new TextRun({ text, bold: true, size: 36, color: C.dark, font: 'Arial' })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 160 },
    children: [new TextRun({ text, bold: true, size: 28, color: C.purple, font: 'Arial' })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, color: C.dark, font: 'Arial' })]
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { before: 40, after: 80 },
    children: [new TextRun({ text, size: 22, color: C.darkGray, font: 'Arial' })]
  });
}

function numbered(text) {
  return new Paragraph({
    numbering: { reference: 'numbers', level: 0 },
    spacing: { before: 40, after: 80 },
    children: [new TextRun({ text, size: 22, color: C.darkGray, font: 'Arial' })]
  });
}

function spacer(sz = 200) {
  return new Paragraph({ spacing: { before: sz, after: 0 }, children: [new TextRun('')] });
}

function divider() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.border, space: 1 } },
    spacing: { before: 200, after: 200 },
    children: [new TextRun('')]
  });
}

function infoBox(text, bg = C.blueLight, color = C.blue) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({ children: [new TableCell({
      width: { size: 9360, type: WidthType.DXA },
      borders: { top: bdr(color, 8), bottom: bdr(color), left: bdr(color, 16), right: bdr(color) },
      shading: { fill: bg, type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      children: [new Paragraph({ children: [new TextRun({ text, size: 21, color: C.darkGray, font: 'Arial', italics: true })] })]
    })] })]
  });
}

function table2col(rows, widths = [3120, 6240]) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map(([a, b], i) => new TableRow({
      children: [
        cell(a, { width: widths[0], bg: i === 0 ? C.dark : (i % 2 === 0 ? C.lightGray : C.white), bold: i === 0, color: i === 0 ? C.white : C.darkGray }),
        cell(b, { width: widths[1], bg: i === 0 ? C.dark : (i % 2 === 0 ? C.lightGray : C.white), bold: i === 0, color: i === 0 ? C.white : C.darkGray }),
      ]
    }))
  });
}

function table3col(rows, widths = [2500, 3500, 3360]) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map(([a, b, c], i) => new TableRow({
      children: [
        cell(a, { width: widths[0], bg: i === 0 ? C.dark : (i % 2 === 0 ? C.lightGray : C.white), bold: i === 0, color: i === 0 ? C.white : C.darkGray }),
        cell(b, { width: widths[1], bg: i === 0 ? C.dark : (i % 2 === 0 ? C.lightGray : C.white), bold: i === 0, color: i === 0 ? C.white : C.darkGray }),
        cell(c, { width: widths[2], bg: i === 0 ? C.dark : (i % 2 === 0 ? C.lightGray : C.white), bold: i === 0, color: i === 0 ? C.white : C.darkGray }),
      ]
    }))
  });
}

function table4col(rows, widths = [2340, 2340, 2340, 2340]) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map(([a, b, c, d], i) => new TableRow({
      children: [
        cell(a, { width: widths[0], bg: i === 0 ? C.dark : (i % 2 === 0 ? C.lightGray : C.white), bold: i === 0, color: i === 0 ? C.white : C.darkGray }),
        cell(b, { width: widths[1], bg: i === 0 ? C.dark : (i % 2 === 0 ? C.lightGray : C.white), bold: i === 0, color: i === 0 ? C.white : C.darkGray }),
        cell(c, { width: widths[2], bg: i === 0 ? C.dark : (i % 2 === 0 ? C.lightGray : C.white), bold: i === 0, color: i === 0 ? C.white : C.darkGray }),
        cell(d, { width: widths[3], bg: i === 0 ? C.dark : (i % 2 === 0 ? C.lightGray : C.white), bold: i === 0, color: i === 0 ? C.white : C.darkGray }),
      ]
    }))
  });
}

function makeCoverPage() {
  return [
    spacer(1200),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: '♪', size: 96, color: C.purple, font: 'Arial' })]
    }),
    spacer(200),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'POSITIVESPACE', bold: true, size: 72, color: C.dark, font: 'Arial' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'AI-Powered Music Generation Platform', size: 36, color: C.purple, font: 'Arial', italics: true })]
    }),
    spacer(400),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: bdr(C.purpleMid, 4), bottom: bdr(C.purpleMid, 4) },
      spacing: { before: 120, after: 120 },
      children: [new TextRun({ text: 'PRODUCT REQUIREMENTS DOCUMENT  ·  TECHNICAL SPECIFICATION  ·  DEVELOPMENT ROADMAP', size: 20, color: C.midGray, font: 'Arial', bold: true })]
    }),
    spacer(400),
    new Table({
      width: { size: 6000, type: WidthType.DXA },
      columnWidths: [3000, 3000],
      rows: [
        new TableRow({ children: [
          cell('Document Version', { width: 3000, bg: C.lightGray, bold: true, color: C.darkGray }),
          cell('v1.0.0 — Initial Release', { width: 3000 }),
        ]}),
        new TableRow({ children: [
          cell('Date', { width: 3000, bg: C.lightGray, bold: true, color: C.darkGray }),
          cell('April 2026', { width: 3000 }),
        ]}),
        new TableRow({ children: [
          cell('Status', { width: 3000, bg: C.lightGray, bold: true, color: C.darkGray }),
          cell('DRAFT — Development Phase', { width: 3000, bg: C.orangeLight, color: C.orange, bold: true }),
        ]}),
        new TableRow({ children: [
          cell('Target Market', { width: 3000, bg: C.lightGray, bold: true, color: C.darkGray }),
          cell('Global — B2C & B2B', { width: 3000 }),
        ]}),
        new TableRow({ children: [
          cell('Primary AI Stack', { width: 3000, bg: C.lightGray, bold: true, color: C.darkGray }),
          cell('YuE + MusicGen (Meta) + ACE-Step', { width: 3000 }),
        ]}),
      ]
    }),
    spacer(600),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'CONFIDENTIAL — INTERNAL USE ONLY', size: 18, color: C.midGray, font: 'Arial', bold: true })]
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

const children = [
  ...makeCoverPage(),

  h1('1. Executive Summary'),
  infoBox('PositiveSpace adalah platform generasi musik berbasis kecerdasan buatan yang memungkinkan siapa saja — dari kreator konten hingga musisi profesional — menciptakan musik berkualitas studio hanya dari deskripsi teks atau lirik, dalam hitungan detik.', C.purpleLight, C.purple),
  spacer(160),
  p('PositiveSpace dibangun untuk menjadi pemimpin pasar dalam kategori AI music generation yang tumbuh pesat. Terinspirasi oleh kesuksesan Suno.ai, platform ini hadir dengan diferensiasi kuat: dukungan lirik berbahasa Indonesia, model AI open-source premium, ekosistem kreator terintegrasi, dan monetisasi B2B yang robust.'),
  spacer(120),

  h2('1.1 Visi & Misi'),
  table2col([
    ['Kategori', 'Deskripsi'],
    ['🎯 Visi', 'Menjadi platform AI musik #1 di Asia Tenggara pada 2027, dengan basis pengguna 5 juta dan revenue ARR $10M+'],
    ['🚀 Misi', 'Demokratisasi pembuatan musik — setiap orang berhak mengekspresikan kreativitas lewat musik tanpa barrier teknis'],
    ['💡 Proposisi Nilai', 'Generasi musik full-song berkualitas studio dari teks/lirik, dalam < 30 detik, dengan dukungan Bahasa Indonesia penuh'],
    ['🌏 Target Pasar', 'Asia Tenggara (Prioritas: Indonesia, Malaysia, Thailand) + Global English market'],
  ], [2800, 6560]),
  spacer(160),

  h2('1.2 Masalah yang Diselesaikan'),
  bullet('Biaya produksi musik profesional sangat mahal ($500–$5.000/lagu)'),
  bullet('Kurva belajar instrumen/DAW membutuhkan bertahun-tahun'),
  bullet('Kreator konten (YouTuber, podcaster, game dev) kesulitan mendapatkan musik bebas royalti berkualitas tinggi'),
  bullet('Musisi independen tidak punya akses ke arranger dan produser profesional'),
  bullet('Platform AI musik global tidak mendukung bahasa dan budaya lokal Asia'),
  spacer(160),

  h2('1.3 Solusi PositiveSpace'),
  bullet('Text-to-music dan lyrics-to-full-song dalam Bahasa Indonesia & Inggris'),
  bullet('Generasi lengkap: melodi, harmoni, ritme, vokal, dan mixing otomatis'),
  bullet('Kontrol kreatif penuh: genre, mood, tempo, instrumen, durasi, gaya vokal'),
  bullet('Kolaborasi real-time dan ekosistem komunitas kreator'),
  bullet('Lisensi komersial tersedia via plan Premium & Enterprise'),
  new Paragraph({ children: [new PageBreak()] }),

  h1('2. AI Model Stack — Free untuk Development'),
  infoBox('Semua model di bawah ini tersedia gratis untuk tahap development. Pilihan model didasarkan pada lisensi open-source, kualitas output, komunitas aktif, dan kemudahan integrasi.', C.greenLight, C.green),
  spacer(160),

  h2('2.1 Primary Music Generation Models'),
  spacer(80),

  h3('Model 1: YuE (HKUST/M-A-P) — Rekomendasi Utama'),
  infoBox('YuE adalah model paling mirip Suno.ai yang tersedia secara open-source. Mampu menghasilkan lagu penuh hingga 5 menit dengan vokal dan instrumental dari lirik. Lisensi Apache 2.0 — bebas komersial.', C.greenLight, C.green),
  table3col([
    ['Parameter', 'Detail', 'Catatan'],
    ['GitHub', 'github.com/multimodal-art-projection/YuE', 'Stars: 12K+'],
    ['Lisensi', 'Apache 2.0', '✅ Bebas komersial'],
    ['Input', 'Lirik teks + genre tag + mood tag', 'Bahasa Inggris & Mandarin'],
    ['Output', 'Audio WAV/MP3 hingga 5 menit', 'Full song dengan vokal'],
    ['Kualitas', 'Production-grade, mirip Suno v3', 'State of the art 2025'],
    ['VRAM', 'Min 8GB (quantized) / 24GB (full)', 'Bisa pakai Google Colab T4'],
    ['Keunggulan', 'Vokal + instrumental sekaligus, multi-genre', 'Terbaik untuk full song'],
    ['Kelemahan', 'Belum support Bahasa Indonesia native', 'Perlu fine-tuning'],
  ], [2200, 4360, 2800]),
  spacer(160),

  h3('Model 2: Meta MusicGen (AudioCraft) — Fallback & Instrumental'),
  table3col([
    ['Parameter', 'Detail', 'Catatan'],
    ['GitHub', 'github.com/facebookresearch/audiocraft', 'Stars: 22K+'],
    ['Lisensi', 'MIT (code) + CC BY-NC 4.0 (weights)', '⚠️ Non-commercial default'],
    ['Versi', 'musicgen-small (300M), medium (1.5B), large (3.3B)', 'Large untuk kualitas terbaik'],
    ['Input', 'Text description + optional melody', 'Bahasa Inggris'],
    ['Output', 'Audio WAV 32kHz, mono/stereo', 'Tanpa vokal'],
    ['VRAM', '8GB (small), 16GB (medium/large)', 'GPU required'],
    ['Keunggulan', 'Dokumentasi lengkap, komunitas besar, stabil', 'Terbaik untuk instrumental'],
    ['Kelemahan', 'Tidak generate vokal, lisensi non-komersial', 'Perlu custom weights'],
  ], [2200, 4360, 2800]),
  spacer(160),

  h3('Model 3: ACE-Step — Tercepat (20 detik per 4 menit lagu)'),
  table3col([
    ['Parameter', 'Detail', 'Catatan'],
    ['GitHub', 'github.com/ace-step/ACE-Step', 'Baru — 2025'],
    ['Lisensi', 'Apache 2.0', '✅ Bebas komersial'],
    ['Arsitektur', 'Diffusion + Linear Transformer + AutoEncoder', 'Novel architecture'],
    ['Kecepatan', '4 menit lagu dalam ~20 detik', 'Jauh lebih cepat dari YuE'],
    ['Output', 'Audio berkualitas tinggi dengan struktur musik koheren', 'Full instrumental'],
    ['VRAM', '16GB recommended', 'Lebih efisien dari alternatives'],
    ['Use case', 'High-volume generation, real-time preview', 'Untuk burst traffic'],
  ], [2200, 4360, 2800]),
  spacer(160),

  h3('Model 4: DiffRhythm — Vocal + Instrumental Terbaru'),
  table3col([
    ['Parameter', 'Detail', 'Catatan'],
    ['Kelebihan', 'Generate full song dengan lirik multi-bahasa', 'Support bahasa Asia'],
    ['Lisensi', 'Open source', 'Cek repo untuk detail lisensi'],
    ['Use case', 'Konten Asia Tenggara dengan lirik lokal', 'Sangat relevan untuk ID market'],
  ], [2200, 4360, 2800]),
  spacer(160),

  h2('2.2 Supporting AI Models'),
  table3col([
    ['Model', 'Fungsi', 'Sumber'],
    ['Demucs (Meta)', 'Audio source separation — pisahkan vokal/instrumen', 'github.com/facebookresearch/demucs — MIT'],
    ['Whisper (OpenAI)', 'Speech-to-text untuk analisis lirik & transkripsi', 'github.com/openai/whisper — MIT'],
    ['EnCodec (Meta)', 'Neural audio codec untuk kompresi audio berkualitas', 'Bagian AudioCraft — CC-BY-NC'],
    ['CLAP (LAION)', 'Audio-text embedding untuk search & recommendation', 'github.com/LAION-AI/CLAP — CC-BY 4.0'],
    ['Spleeter (Deezer)', 'Stem separation alternatif (lebih ringan dari Demucs)', 'github.com/deezer/spleeter — MIT'],
    ['Basic Pitch (Spotify)', 'Audio-to-MIDI conversion untuk analisis melodi', 'github.com/spotify/basic-pitch — Apache 2.0'],
  ], [2500, 4000, 2860]),
  spacer(160),

  h2('2.3 Strategi Fine-tuning untuk Bahasa Indonesia'),
  p('Untuk mendukung lirik dan budaya Indonesia secara native, roadmap fine-tuning diperlukan:'),
  bullet('Dataset: Kumpulkan 5.000–10.000 lagu Indonesia berlisensi dari platform lokal'),
  bullet('Fine-tune YuE dengan LoRA (Low-Rank Adaptation) — jauh lebih hemat VRAM dan waktu'),
  bullet('Gunakan Hugging Face PEFT library untuk efisiensi fine-tuning'),
  bullet('Target: Model PositiveSpace-ID-v1 yang memahami tangga nada pentatonik & dangdut/pop Melayu'),
  bullet('Estimasi waktu fine-tuning: 2–4 minggu dengan 1x A100 80GB (Google Colab Pro+ ~$50/bulan)'),
  new Paragraph({ children: [new PageBreak()] }),

  h1('3. Tech Stack — 100% Free untuk Development'),
  infoBox('Seluruh stack di bawah memiliki free tier yang cukup untuk development dan MVP. Migrasi ke paid tier hanya diperlukan saat traffic mulai signifikan (>1.000 user aktif).', C.blueLight, C.blue),
  spacer(160),

  h2('3.1 Frontend Stack'),
  table3col([
    ['Teknologi', 'Versi / Free Tier', 'Alasan Pilihan'],
    ['Next.js 15 (React)', 'MIT License — 100% gratis', 'SSR, App Router, Streaming, SEO optimal. Framework standar industri.'],
    ['TypeScript', '100% gratis', 'Type safety wajib untuk tim besar, mengurangi bug 30–40%'],
    ['Tailwind CSS v4', '100% gratis', 'Utility-first, build size kecil, developer experience terbaik'],
    ['Shadcn/UI', '100% gratis', 'Komponen UI siap pakai, fully customizable, tidak ada vendor lock-in'],
    ['Zustand', '100% gratis', 'State management ringan dan simple, pengganti Redux'],
    ['React Query (TanStack)', '100% gratis', 'Server state management, caching otomatis, optimistic updates'],
    ['Wavesurfer.js', 'BSD License — gratis', 'Audio waveform visualization, player controls profesional'],
    ['Framer Motion', 'MIT — gratis', 'Animasi UI premium, gesture support, layout animations'],
    ['Zod', 'MIT — gratis', 'Schema validation untuk form dan API response'],
    ['Uploadthing', 'Free: 2GB storage', 'File upload untuk audio/cover art, SDK Next.js official'],
  ], [2300, 2600, 4460]),
  spacer(160),

  h2('3.2 Backend Stack'),
  table3col([
    ['Teknologi', 'Versi / Free Tier', 'Alasan Pilihan'],
    ['FastAPI (Python)', 'MIT License — gratis', 'Async, performance tinggi, auto OpenAPI docs, ideal untuk AI workloads'],
    ['Python 3.11+', '100% gratis', 'Ekosistem AI/ML terlengkap, semua model AI support Python'],
    ['Celery + Redis', 'Free (self-hosted)', 'Task queue untuk proses generasi musik async yang bisa 30–60 detik'],
    ['SQLAlchemy', 'MIT — gratis', 'ORM Python terpopuler, support PostgreSQL & SQLite'],
    ['Alembic', 'MIT — gratis', 'Database migration tool untuk SQLAlchemy'],
    ['Pydantic v2', 'MIT — gratis', 'Data validation, serialization — dipakai FastAPI native'],
    ['JWT (python-jose)', 'MIT — gratis', 'Authentication token — stateless, scalable'],
    ['Passlib + Bcrypt', 'MIT — gratis', 'Password hashing yang aman'],
    ['Httpx', 'BSD — gratis', 'Async HTTP client untuk komunikasi antar service'],
    ['Pytest', 'MIT — gratis', 'Testing framework Python terpopuler'],
  ], [2300, 2600, 4460]),
  spacer(160),

  h2('3.3 Database & Storage'),
  table3col([
    ['Teknologi', 'Free Tier', 'Alasan Pilihan'],
    ['Supabase (PostgreSQL)', 'Free: 500MB DB, 1GB storage, 50MB/day bandwidth', 'PostgreSQL managed, realtime subscription, built-in auth — all-in-one'],
    ['Redis (Upstash)', 'Free: 10.000 req/hari, 256MB', 'Rate limiting, session cache, Celery broker, pub/sub'],
    ['Cloudflare R2', 'Free: 10GB storage, 1M operasi/bulan', 'Penyimpanan file audio — ZERO egress fee, S3-compatible API'],
    ['Meilisearch', 'Cloud free tier / self-hosted', 'Full-text search untuk discovery musik, autocomplete prompt'],
    ['Pinecone', 'Free: 1 index, 100K vectors', 'Vector DB untuk music similarity search & recommendation'],
  ], [2400, 3200, 3760]),
  spacer(160),

  h2('3.4 AI/ML Infrastructure'),
  table3col([
    ['Teknologi', 'Free Tier', 'Alasan Pilihan'],
    ['Hugging Face Hub', 'Free model hosting & inference API (rate-limited)', 'Source model YuE, MusicGen, dll. Inference gratis untuk dev'],
    ['Google Colab', 'Free T4 GPU (16GB), Pro+ $50/bulan', 'Fine-tuning dan eksperimen model. T4 cukup untuk YuE quantized'],
    ['Vast.ai', 'Pay-per-hour, mulai $0.2/jam (A100)', 'GPU on-demand untuk production inference — lebih murah dari AWS'],
    ['Modal.com', 'Free $30 credit/bulan', 'Serverless GPU inference — auto-scale, bayar per detik'],
    ['Replicate.com', 'Free credit untuk dev, $0.01–0.05/run', 'Run MusicGen/YuE via API tanpa setup GPU sendiri'],
    ['PyTorch', 'BSD — gratis', 'Framework deep learning untuk semua model AI yang dipilih'],
    ['Transformers (HF)', 'Apache 2.0 — gratis', 'Library untuk load dan run model YuE, MusicGen, Whisper'],
    ['PEFT (HF)', 'Apache 2.0 — gratis', 'LoRA fine-tuning — efisien, bisa di GPU kecil'],
  ], [2400, 2800, 4160]),
  spacer(160),

  h2('3.5 DevOps & Infrastructure'),
  table3col([
    ['Teknologi', 'Free Tier', 'Alasan Pilihan'],
    ['Vercel', 'Free: 100GB bandwidth, unlimited deploys', 'Deploy Next.js frontend — zero config, edge network global'],
    ['Railway.app', 'Free: $5 credit/bulan, 512MB RAM', 'Deploy FastAPI backend, PostgreSQL, Redis — developer friendly'],
    ['Docker + Docker Compose', '100% gratis', 'Containerization — konsisten dev/prod, isolasi environment'],
    ['GitHub Actions', 'Free: 2.000 menit/bulan', 'CI/CD pipeline — auto test, deploy on push'],
    ['Cloudflare', 'Free tier sangat generous', 'CDN, DDoS protection, DNS, Workers (edge functions)'],
    ['BetterStack (Logtail)', 'Free: 1GB log/bulan', 'Log management dan monitoring'],
    ['Sentry', 'Free: 5K error events/bulan', 'Error tracking dan performance monitoring'],
  ], [2400, 2800, 4160]),
  spacer(160),

  h2('3.6 Authentication & Payments'),
  table3col([
    ['Teknologi', 'Free Tier', 'Alasan Pilihan'],
    ['Clerk.dev', 'Free: 10.000 MAU', 'Auth siap pakai — social login, MFA, user management dashboard'],
    ['Stripe', 'Free sandbox, 2.9% + 30c per transaksi live', 'Pembayaran global, subscription management, invoicing'],
    ['Midtrans', 'Free sandbox, 2%–3% per transaksi', 'Payment gateway Indonesia — GoPay, OVO, DANA, Transfer Bank'],
    ['Xendit', 'Free sandbox', 'Alternatif Midtrans — coverage lebih luas di SEA'],
  ], [2400, 2800, 4160]),
  spacer(160),

  h2('3.7 Communication & Notification'),
  table3col([
    ['Teknologi', 'Free Tier', 'Alasan Pilihan'],
    ['Resend', 'Free: 3.000 email/bulan', 'Email transaksional modern — React Email support'],
    ['Novu', 'Free: 30.000 notif/bulan', 'Unified notification — email, push, in-app, SMS'],
    ['OneSignal', 'Free: unlimited push notif', 'Web & mobile push notification'],
    ['Discord Bot', '100% gratis', 'Community notifikasi, webhook alert untuk tim dev'],
  ], [2400, 2800, 4160]),
  new Paragraph({ children: [new PageBreak()] }),

  h1('4. Product Requirements Document (PRD)'),

  h2('4.1 Target Pengguna (User Personas)'),
  spacer(80),

  h3('Persona 1: Kreator Konten Digital'),
  table2col([
    ['Atribut', 'Detail'],
    ['Nama', 'Dinda, 24 tahun — Bandung'],
    ['Profesi', 'YouTuber lifestyle, 150K subscriber'],
    ['Pain Point', 'Butuh musik background untuk video, tapi takut DMCA. BGM gratis kualitasnya buruk.'],
    ['Goal', 'Musik unik, bebas royalti, sesuai mood video, bisa generate cepat'],
    ['Frekuensi', '3–5 lagu baru per minggu'],
    ['Willingness to Pay', 'Rp 150.000–300.000/bulan'],
  ], [2800, 6560]),
  spacer(120),

  h3('Persona 2: Musisi Independen'),
  table2col([
    ['Atribut', 'Detail'],
    ['Nama', 'Rizky, 28 tahun — Jakarta'],
    ['Profesi', 'Musisi indie, aktif di SoundCloud & Spotify'],
    ['Pain Point', 'Punya lirik dan melodi di kepala tapi tidak bisa bayar produser. Studio mahal.'],
    ['Goal', 'Produksi demo lagu dari lirik sendiri, jadikan reference untuk produser'],
    ['Frekuensi', '2–4 lagu per bulan'],
    ['Willingness to Pay', 'Rp 300.000–600.000/bulan'],
  ], [2800, 6560]),
  spacer(120),

  h3('Persona 3: Game & App Developer'),
  table2col([
    ['Atribut', 'Detail'],
    ['Nama', 'Bagas, 32 tahun — Yogyakarta'],
    ['Profesi', 'Indie game developer, tim 3 orang'],
    ['Pain Point', 'Budget audio game sangat terbatas. Composer profesional sangat mahal ($200+/track).'],
    ['Goal', 'Generate musik adaptive untuk berbagai scene game dengan cepat dan murah'],
    ['Frekuensi', '10–30 track per game project'],
    ['Willingness to Pay', '$30–100/bulan (B2B invoice)'],
  ], [2800, 6560]),
  spacer(120),

  h3('Persona 4: Brand & Marketing Agency'),
  table2col([
    ['Atribut', 'Detail'],
    ['Nama', 'Agency X — Jakarta, 20 karyawan'],
    ['Pain Point', 'Klien sering butuh jingle iklan dadakan. Licensing musik existing mahal & ribet.'],
    ['Goal', 'Generate jingle unik untuk tiap klien, dengan white-label rights penuh'],
    ['Frekuensi', '20–50 lagu per bulan'],
    ['Willingness to Pay', '$200–500/bulan (Enterprise plan)'],
  ], [2800, 6560]),
  spacer(160),

  h2('4.2 Feature Requirements'),
  spacer(80),

  h3('Core Features — MVP (Phase 1)'),
  table4col([
    ['ID', 'Feature', 'Prioritas', 'Status'],
    ['F-001', 'Text-to-Music Generation (instrumental)', 'P0 Critical', 'TODO'],
    ['F-002', 'Lyrics-to-Full-Song (dengan vokal AI)', 'P0 Critical', 'TODO'],
    ['F-003', 'Genre, mood, tempo, instrument selector', 'P0 Critical', 'TODO'],
    ['F-004', 'Duration selector (15s, 30s, 1m, 2m, 4m)', 'P0 Critical', 'TODO'],
    ['F-005', 'Audio player dengan waveform visualization', 'P0 Critical', 'TODO'],
    ['F-006', 'Download hasil dalam format MP3/WAV', 'P0 Critical', 'TODO'],
    ['F-007', 'User authentication (email + Google login)', 'P0 Critical', 'TODO'],
    ['F-008', 'Credit system — generasi menggunakan kredit', 'P0 Critical', 'TODO'],
    ['F-009', 'Personal library — simpan & kelola lagu', 'P1 High', 'TODO'],
    ['F-010', 'Subscription plan (Free/Pro/Premium)', 'P1 High', 'TODO'],
    ['F-011', 'Generasi 2 variasi per prompt (pilih terbaik)', 'P1 High', 'TODO'],
    ['F-012', 'Continue/extend song yang sudah dibuat', 'P1 High', 'TODO'],
    ['F-013', 'Custom song title dan metadata', 'P1 High', 'TODO'],
    ['F-014', 'Share ke media sosial dengan player embed', 'P2 Medium', 'TODO'],
    ['F-015', 'Public/private toggle untuk lagu', 'P2 Medium', 'TODO'],
  ], [1200, 4000, 2200, 1960]),
  spacer(160),

  h3('Advanced Features — Phase 2'),
  table4col([
    ['ID', 'Feature', 'Prioritas', 'Target'],
    ['F-016', 'Custom vocal style (upload reference audio)', 'P1', 'Q3 2026'],
    ['F-017', 'Style transfer dari lagu referensi', 'P1', 'Q3 2026'],
    ['F-018', 'Stem download (vokal, drum, bass, melody terpisah)', 'P1', 'Q3 2026'],
    ['F-019', 'Remix & mashup mode', 'P2', 'Q4 2026'],
    ['F-020', 'Collaboration — invite co-creator', 'P2', 'Q4 2026'],
    ['F-021', 'Explore feed & trending songs', 'P2', 'Q3 2026'],
    ['F-022', 'Follow creator & activity feed', 'P2', 'Q4 2026'],
    ['F-023', 'In-platform marketplace untuk jual/beli lisensi', 'P3', 'Q1 2027'],
    ['F-024', 'API access untuk developer (B2B)', 'P1', 'Q3 2026'],
    ['F-025', 'White-label solution untuk agency', 'P2', 'Q4 2026'],
    ['F-026', 'Bahasa Indonesia native support (model fine-tuned)', 'P1', 'Q4 2026'],
    ['F-027', 'AI music video generator (SORA integration)', 'P3', 'Q2 2027'],
  ], [1200, 4000, 2000, 2160]),
  spacer(160),

  h2('4.3 User Stories'),
  spacer(80),
  p('Format: Sebagai [user type], saya ingin [action], sehingga [benefit].', { italic: true, color: C.midGray }),
  spacer(80),
  numbered('Sebagai kreator konten, saya ingin mengetik deskripsi "upbeat summer pop untuk video pantai, 60 BPM" dan mendapat 2 variasi audio dalam < 45 detik, sehingga saya bisa pilih yang paling cocok dengan vibe video saya.'),
  numbered('Sebagai musisi, saya ingin paste lirik lagu saya dan pilih genre "pop melayu", sehingga saya mendapat demo rekaman penuh dengan vokal AI yang menyanyikan lirik saya.'),
  numbered('Sebagai developer game, saya ingin akses API dengan rate limit tinggi dan webhook notifikasi saat audio selesai generate, sehingga saya bisa integrasi PositiveSpace ke pipeline produksi game saya.'),
  numbered('Sebagai pengguna gratis, saya ingin mendapat 10 kredit gratis per hari, sehingga saya bisa mencoba platform tanpa perlu memasukkan kartu kredit.'),
  numbered('Sebagai pengguna Pro, saya ingin download stem audio (vokal + instrumen terpisah), sehingga saya bisa re-arrange dan mixing lebih lanjut di DAW saya.'),
  numbered('Sebagai pengguna premium, saya ingin lagu saya otomatis mendapat lisensi komersial, sehingga saya bisa gunakan di konten monetized dan produk komersial.'),
  new Paragraph({ children: [new PageBreak()] }),

  h1('5. System Architecture'),

  h2('5.1 High-Level Architecture'),
  infoBox('Platform menggunakan arsitektur microservices ringan dengan tiga domain utama: Web Layer (Next.js), API Layer (FastAPI), dan AI Worker Layer (Celery + GPU). Semua terhubung via message queue untuk handle async music generation.', C.blueLight, C.blue),
  spacer(160),

  h3('Architecture Components'),
  table3col([
    ['Layer', 'Komponen', 'Teknologi'],
    ['Client Layer', 'Web App (Browser / Mobile PWA)', 'Next.js 15 + TypeScript + Tailwind'],
    ['CDN & Edge', 'Static assets, edge caching, DDoS protection', 'Cloudflare + Vercel Edge'],
    ['API Gateway', 'Rate limiting, auth validation, routing', 'FastAPI + Nginx'],
    ['Application API', 'Business logic, user management, credit system', 'FastAPI (Python 3.11)'],
    ['Task Queue', 'Async job dispatch untuk AI generation', 'Celery + Redis'],
    ['AI Worker Pool', 'GPU workers yang jalankan model YuE/MusicGen', 'Python + PyTorch + GPU'],
    ['Primary Database', 'User data, songs, subscriptions, transactions', 'Supabase (PostgreSQL 15)'],
    ['Cache Layer', 'Session, rate limit, job status', 'Redis (Upstash)'],
    ['File Storage', 'Audio files WAV/MP3, cover art, user uploads', 'Cloudflare R2'],
    ['Search Engine', 'Full-text search songs dan discovery', 'Meilisearch'],
    ['Vector DB', 'Music similarity & recommendation engine', 'Pinecone'],
    ['Monitoring', 'Logs, errors, performance metrics', 'Sentry + BetterStack'],
  ], [2400, 3400, 3560]),
  spacer(160),

  h2('5.2 Music Generation Flow'),
  p('Alur kerja end-to-end dari user input hingga audio output:'),
  spacer(80),
  numbered('User submit prompt di frontend → Frontend kirim POST /api/v1/generate ke API'),
  numbered('API Layer: validasi auth token (JWT), cek dan kurangi kredit user, buat job record di DB'),
  numbered('API dispatch job ke Celery queue dengan payload: {prompt, genre, mood, duration, user_id, job_id}'),
  numbered('AI Worker Pool ambil job dari queue → load model YuE/MusicGen ke VRAM'),
  numbered('Model generate audio (durasi ~20–60 detik tergantung model dan panjang lagu)'),
  numbered('Audio file di-upload ke Cloudflare R2 → URL disimpan di database'),
  numbered('Worker update job status → Redis pub/sub broadcast ke API'),
  numbered('API push notifikasi ke client via WebSocket atau Server-Sent Events'),
  numbered('Frontend refresh player dengan audio baru → User bisa dengar, download, save'),
  spacer(160),

  h2('5.3 Database Schema (Core Tables)'),
  spacer(80),

  h3('Table: users'),
  table3col([
    ['Column', 'Type', 'Keterangan'],
    ['id', 'UUID (PK)', 'Primary key, auto-generated'],
    ['email', 'VARCHAR(255) UNIQUE', 'Email pengguna'],
    ['username', 'VARCHAR(50) UNIQUE', 'Username untuk public profile'],
    ['full_name', 'VARCHAR(100)', 'Nama lengkap'],
    ['avatar_url', 'TEXT', 'URL foto profil dari R2'],
    ['plan', "ENUM('free','pro','premium','enterprise')", 'Subscription plan aktif'],
    ['credits', 'INTEGER DEFAULT 0', 'Kredit generasi tersisa'],
    ['credits_reset_at', 'TIMESTAMP', 'Waktu reset kredit bulanan'],
    ['stripe_customer_id', 'VARCHAR(100)', 'ID customer Stripe'],
    ['is_verified', 'BOOLEAN DEFAULT false', 'Email verified'],
    ['created_at', 'TIMESTAMP', 'Waktu registrasi'],
  ], [2200, 3000, 4160]),
  spacer(120),

  h3('Table: songs'),
  table3col([
    ['Column', 'Type', 'Keterangan'],
    ['id', 'UUID (PK)', 'Primary key'],
    ['user_id', 'UUID (FK → users)', 'Pemilik lagu'],
    ['title', 'VARCHAR(200)', 'Judul lagu (user-defined atau auto)'],
    ['prompt', 'TEXT', 'Prompt asli yang digunakan user'],
    ['lyrics', 'TEXT', 'Lirik (jika ada)'],
    ['genre', 'VARCHAR(50)', 'Genre dipilih'],
    ['mood', 'VARCHAR(50)', 'Mood dipilih'],
    ['tempo', 'INTEGER', 'BPM'],
    ['duration', 'INTEGER', 'Durasi dalam detik'],
    ['audio_url', 'TEXT', 'URL audio di Cloudflare R2'],
    ['stems_url', 'JSONB', 'URLs untuk stem files {vocals, drums, bass, melody}'],
    ['cover_url', 'TEXT', 'URL cover art'],
    ['model_used', 'VARCHAR(50)', 'Model AI yang digunakan'],
    ['is_public', 'BOOLEAN DEFAULT false', 'Visible di explore feed'],
    ['play_count', 'INTEGER DEFAULT 0', 'Jumlah diputar'],
    ['like_count', 'INTEGER DEFAULT 0', 'Jumlah likes'],
    ['license_type', "ENUM('personal','commercial')", 'Jenis lisensi'],
    ['status', "ENUM('pending','generating','done','failed')", 'Status generasi'],
    ['created_at', 'TIMESTAMP', 'Waktu dibuat'],
  ], [2200, 3000, 4160]),
  spacer(120),

  h3('Table: generation_jobs'),
  table3col([
    ['Column', 'Type', 'Keterangan'],
    ['id', 'UUID (PK)', 'Job ID'],
    ['user_id', 'UUID (FK)', 'User yang request'],
    ['song_id', 'UUID (FK → songs)', 'Song yang dihasilkan'],
    ['celery_task_id', 'VARCHAR(100)', 'ID task di Celery'],
    ['model', 'VARCHAR(50)', 'Model yang digunakan'],
    ['credits_used', 'INTEGER', 'Kredit yang dikurangi'],
    ['processing_time_ms', 'INTEGER', 'Waktu proses dalam ms'],
    ['gpu_type', 'VARCHAR(50)', 'Jenis GPU yang dipakai'],
    ['error_message', 'TEXT', 'Pesan error jika gagal'],
    ['status', "ENUM('queued','running','done','failed')", 'Status job'],
    ['created_at', 'TIMESTAMP', 'Waktu dibuat'],
    ['completed_at', 'TIMESTAMP', 'Waktu selesai'],
  ], [2200, 3000, 4160]),
  new Paragraph({ children: [new PageBreak()] }),

  h1('6. API Specification'),

  h2('6.1 Authentication'),
  table3col([
    ['Endpoint', 'Method', 'Deskripsi'],
    ['POST /api/v1/auth/register', 'POST', 'Registrasi user baru dengan email & password'],
    ['POST /api/v1/auth/login', 'POST', 'Login → kembalikan access_token & refresh_token (JWT)'],
    ['POST /api/v1/auth/refresh', 'POST', 'Perbarui access_token menggunakan refresh_token'],
    ['POST /api/v1/auth/logout', 'POST', 'Invalidate refresh_token'],
    ['POST /api/v1/auth/google', 'POST', 'OAuth2 Google login'],
    ['POST /api/v1/auth/verify-email', 'POST', 'Verifikasi email dengan OTP code'],
    ['POST /api/v1/auth/forgot-password', 'POST', 'Kirim reset password link ke email'],
  ], [3200, 1500, 4660]),
  spacer(160),

  h2('6.2 Music Generation'),
  table3col([
    ['Endpoint', 'Method', 'Deskripsi'],
    ['POST /api/v1/generate', 'POST', 'Submit job generasi musik baru'],
    ['GET /api/v1/generate/{job_id}/status', 'GET', 'Cek status job generasi (polling fallback)'],
    ['WS /api/v1/ws/{user_id}', 'WebSocket', 'Real-time status update untuk job generasi'],
    ['POST /api/v1/generate/extend', 'POST', 'Perpanjang/continue lagu yang sudah ada'],
    ['POST /api/v1/generate/remix', 'POST', 'Buat variasi baru dari lagu existing'],
    ['POST /api/v1/generate/stems', 'POST', 'Extract stems dari lagu (vokal, drums, dll)'],
    ['POST /api/v1/generate/cover-art', 'POST', 'Generate cover art AI untuk lagu'],
  ], [3200, 1500, 4660]),
  spacer(80),

  h3('POST /api/v1/generate — Request Body'),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2400, 1800, 1600, 3560],
    rows: [
      new TableRow({ children: [headerCell('Field', 2400), headerCell('Type', 1800), headerCell('Required', 1600), headerCell('Keterangan', 3560)] }),
      ...([
        ['prompt', 'string', '✅ Ya', 'Deskripsi musik max 500 karakter. Contoh: "upbeat summer pop with guitar"'],
        ['lyrics', 'string', '❌ Opsional', 'Lirik lengkap jika mode lyrics-to-song. Max 2000 karakter.'],
        ['genre', 'string', '❌ Opsional', 'Pop, Rock, Jazz, R&B, Electronic, Classical, Hip-hop, Dangdut, dll'],
        ['mood', 'string', '❌ Opsional', 'Happy, Sad, Energetic, Calm, Dark, Romantic, Epic, dll'],
        ['tempo', 'integer', '❌ Opsional', 'BPM 40–200. Default: model decides'],
        ['duration', 'integer', '❌ Opsional', 'Detik: 15, 30, 60, 120, 240. Default: 60'],
        ['model', 'string', '❌ Opsional', '"yue" (default) | "musicgen" | "ace-step"'],
        ['variations', 'integer', '❌ Opsional', 'Jumlah variasi: 1–4. Default: 2. Menggunakan kredit × variasi'],
        ['instrumental_only', 'boolean', '❌ Opsional', 'True = tanpa vokal. Default: false jika ada lyrics'],
        ['reference_song_id', 'UUID', '❌ Opsional', 'ID lagu referensi untuk style transfer'],
      ].map(([a, b, c, d]) => new TableRow({ children: [
        cell(a, { width: 2400, bg: C.lightGray, bold: true }),
        cell(b, { width: 1800 }),
        cell(c, { width: 1600, bg: c.includes('Ya') ? C.greenLight : C.white, color: c.includes('Ya') ? C.green : C.darkGray }),
        cell(d, { width: 3560 }),
      ]})))
    ]
  }),
  spacer(160),

  h2('6.3 Songs & Library'),
  table3col([
    ['Endpoint', 'Method', 'Deskripsi'],
    ['GET /api/v1/songs', 'GET', 'List lagu user (paginated, sortable, filterable)'],
    ['GET /api/v1/songs/{id}', 'GET', 'Detail satu lagu termasuk metadata dan URL audio'],
    ['PATCH /api/v1/songs/{id}', 'PATCH', 'Update judul, deskripsi, visibility, tags'],
    ['DELETE /api/v1/songs/{id}', 'DELETE', 'Hapus lagu (soft delete)'],
    ['POST /api/v1/songs/{id}/like', 'POST', 'Toggle like/unlike lagu'],
    ['POST /api/v1/songs/{id}/play', 'POST', 'Increment play count (dipanggil setiap play)'],
    ['GET /api/v1/songs/{id}/download', 'GET', 'Generate presigned URL untuk download audio'],
    ['GET /api/v1/explore', 'GET', 'Explore feed — public songs, trending, new'],
    ['GET /api/v1/search', 'GET', 'Full-text search songs dan creators'],
  ], [3200, 1500, 4660]),
  spacer(160),

  h2('6.4 Credits & Subscriptions'),
  table3col([
    ['Endpoint', 'Method', 'Deskripsi'],
    ['GET /api/v1/credits/balance', 'GET', 'Saldo kredit user saat ini + reset date'],
    ['GET /api/v1/credits/history', 'GET', 'Riwayat penggunaan kredit (paginated)'],
    ['POST /api/v1/credits/purchase', 'POST', 'Beli kredit tambahan (one-time purchase)'],
    ['GET /api/v1/subscription/plans', 'GET', 'List semua plan dengan harga dan fitur'],
    ['POST /api/v1/subscription/subscribe', 'POST', 'Berlangganan plan baru via Stripe/Midtrans'],
    ['POST /api/v1/subscription/cancel', 'POST', 'Batalkan subscription (effective end of period)'],
    ['POST /api/v1/webhooks/stripe', 'POST', 'Stripe webhook handler'],
    ['POST /api/v1/webhooks/midtrans', 'POST', 'Midtrans webhook handler'],
  ], [3200, 1500, 4660]),
  new Paragraph({ children: [new PageBreak()] }),

  h1('7. Monetization Strategy'),

  h2('7.1 Subscription Plans'),
  table4col([
    ['Fitur', 'Free', 'Pro', 'Premium'],
    ['Harga (IDR/bulan)', 'Gratis', 'Rp 79.000', 'Rp 199.000'],
    ['Harga (USD/bulan)', 'Free', '$5', '$13'],
    ['Kredit/bulan', '50 kredit', '500 kredit', '2.000 kredit'],
    ['Kredit/hari reset', '10/hari', 'Tidak reset', 'Tidak reset'],
    ['Durasi maks/lagu', '60 detik', '4 menit', '4 menit'],
    ['Variasi per generate', '2 variasi', '4 variasi', '4 variasi'],
    ['Download kualitas', 'MP3 128kbps', 'MP3 320kbps', 'WAV lossless'],
    ['Stem download', 'Tidak', 'Tidak', 'Ya'],
    ['Lisensi komersial', 'Tidak', 'Terbatas (3 lagu/bulan)', 'Penuh'],
    ['Tanpa watermark', 'Tidak', 'Ya', 'Ya'],
    ['Priority queue', 'Standar', 'Prioritas', 'Ultra priority'],
    ['Style transfer', 'Tidak', 'Ya', 'Ya'],
    ['API access', 'Tidak', 'Tidak', '1.000 req/bulan'],
    ['Penyimpanan cloud', '1GB', '5GB', '50GB'],
  ], [3120, 2080, 2080, 2080]),
  spacer(160),

  h2('7.2 Enterprise Plan (B2B)'),
  table2col([
    ['Parameter', 'Detail'],
    ['Target', 'Agency, game studio, media company, SaaS developer'],
    ['Harga', 'Custom — mulai $200/bulan atau Rp 3.000.000/bulan'],
    ['Kredit', '10.000+ kredit/bulan (custom negotiation)'],
    ['API Rate Limit', 'Hingga 10.000 req/bulan, webhook support'],
    ['White-label', 'Custom domain, remove PositiveSpace branding'],
    ['SLA', '99.5% uptime guarantee, priority support'],
    ['Lisensi', 'Full commercial — termasuk hak distribusi'],
    ['Onboarding', 'Dedicated account manager, custom training session'],
    ['Integrasi', 'SSO, custom API endpoint, Zapier integration'],
    ['Pembayaran', 'Invoice NET-30, transfer bank, kartu kredit'],
  ], [2800, 6560]),
  spacer(160),

  h2('7.3 Credit System'),
  table3col([
    ['Aksi', 'Kredit Terpakai', 'Keterangan'],
    ['Generate 15 detik (instrumental)', '2 kredit', 'Mode cepat'],
    ['Generate 30 detik (instrumental)', '3 kredit', 'Standard mode'],
    ['Generate 60 detik (instrumental)', '5 kredit', 'Standard mode'],
    ['Generate 60 detik (dengan vokal/YuE)', '8 kredit', 'Butuh model lebih besar'],
    ['Generate 4 menit (full song)', '15 kredit', 'Full production'],
    ['Generate 4 menit (vokal + lirik)', '20 kredit', 'Mirip Suno output'],
    ['Extend/continue lagu', '5 kredit', 'Per 30 detik tambahan'],
    ['Stem extraction', '10 kredit', 'Pisahkan 4 stem'],
    ['Style transfer', '8 kredit', 'Per generasi'],
    ['Cover art AI generation', '3 kredit', 'Per gambar'],
    ['Remix variasi', '10 kredit', 'Buat variasi baru'],
  ], [3200, 2160, 4000]),
  spacer(160),

  h2('7.4 Revenue Projection (Conservative)'),
  table4col([
    ['Bulan', 'Total User', 'Paying User', 'MRR Est.'],
    ['Bulan 1–2', '500', '25 (5%)', 'Rp 3.5 juta'],
    ['Bulan 3–4', '2.000', '100 (5%)', 'Rp 15 juta'],
    ['Bulan 5–6', '5.000', '300 (6%)', 'Rp 45 juta'],
    ['Bulan 7–9', '15.000', '1.000 (6.7%)', 'Rp 150 juta'],
    ['Bulan 10–12', '40.000', '3.000 (7.5%)', 'Rp 450 juta'],
    ['Tahun 2 Target', '200.000', '15.000', 'Rp 2.25 miliar/bulan'],
  ], [2340, 2340, 2340, 2340]),
  new Paragraph({ children: [new PageBreak()] }),

  h1('8. UX & Design Requirements'),

  h2('8.1 Design System'),
  table2col([
    ['Elemen', 'Spesifikasi'],
    ['Tema Warna', 'Dark-first UI: Background #0A0A0F, Surface #12121A, Accent Purple #7C3AED, Secondary Teal #14B8A6'],
    ['Typography', 'Heading: Playfair Display (serif, elegant). Body: Space Grotesk (clean, modern, readable)'],
    ['Radius', 'Components: 8px. Cards: 12px. Modals: 16px. Pills/badges: 20px'],
    ['Spacing System', '4px base grid — semua spacing kelipatan 4: 4, 8, 12, 16, 24, 32, 48, 64px'],
    ['Motion', 'Framer Motion. Duration: fast 150ms, normal 300ms, slow 500ms. Easing: ease-out'],
    ['Iconography', 'Lucide React — konsisten, outline style'],
    ['Shadow', 'Glow-based (purple/teal ambient glow) — tidak ada box shadow tradisional'],
  ], [2400, 6960]),
  spacer(160),

  h2('8.2 Core Screens / Pages'),
  table3col([
    ['Screen', 'URL', 'Deskripsi'],
    ['Landing Page', '/', 'Hero section + demo interaktif + pricing + testimonial + CTA'],
    ['Create (Dashboard)', '/create', 'Generator utama — prompt input, options, generate button, real-time progress'],
    ['Library', '/library', 'Grid lagu yang pernah dibuat, filter, sort, search'],
    ['Song Detail', '/song/[id]', 'Player full, waveform, metadata, download, share, like, extend'],
    ['Explore', '/explore', 'Discover public songs — trending, new, by genre, by mood'],
    ['Profile', '/profile/[username]', 'Public profile — lagu published, bio, stats, follow button'],
    ['Settings', '/settings', 'Profile edit, notification pref, security, billing'],
    ['Billing', '/billing', 'Plan aktif, usage stats, upgrade, payment history'],
    ['API Dashboard', '/developer', 'API keys, usage stats, documentation, webhook config'],
    ['Admin Panel', '/admin', 'Internal tool — user management, moderation, analytics'],
  ], [2200, 2600, 4560]),
  spacer(160),

  h2('8.3 Performance Requirements'),
  table2col([
    ['Metric', 'Target'],
    ['Lighthouse Score', '> 90 (Performance, Accessibility, SEO, Best Practice)'],
    ['First Contentful Paint (FCP)', '< 1.5 detik'],
    ['Largest Contentful Paint (LCP)', '< 2.5 detik'],
    ['Time to Interactive (TTI)', '< 3 detik'],
    ['Cumulative Layout Shift (CLS)', '< 0.1'],
    ['Music Generation Time', '< 45 detik untuk 60 detik audio (P95)'],
    ['API Response Time', '< 200ms untuk non-generation endpoints (P95)'],
    ['Audio Streaming Start', '< 1 detik setelah generation selesai'],
    ['Uptime SLA (Free Tier)', '99% (< 7.2 jam downtime/bulan)'],
    ['Uptime SLA (Paid Tiers)', '99.5% (< 3.6 jam downtime/bulan)'],
  ], [3000, 6360]),
  new Paragraph({ children: [new PageBreak()] }),

  h1('9. Security & Compliance'),

  h2('9.1 Security Checklist'),
  table3col([
    ['Area', 'Implementasi', 'Status'],
    ['Authentication', 'JWT dengan RS256, refresh token rotation, session blacklist', 'Required — Phase 1'],
    ['Authorization', 'Role-based access control (RBAC): user/admin/moderator', 'Required — Phase 1'],
    ['Password', 'Bcrypt hashing (cost factor 12+), min length 8, breach check via HaveIBeenPwned', 'Required — Phase 1'],
    ['API Security', 'Rate limiting per IP dan per user, API key hashing, CORS strict', 'Required — Phase 1'],
    ['Input Validation', 'Pydantic v2 semua endpoint, SQL injection prevention via ORM', 'Required — Phase 1'],
    ['File Upload', 'Mime type validation, file size limit (100MB), antivirus scan', 'Required — Phase 1'],
    ['Content Moderation', 'Filter prompt berbahaya (hate speech, NSFW, copyright infringement)', 'Required — Phase 1'],
    ['Data Encryption', 'TLS 1.3 in transit, AES-256 at rest untuk file sensitif', 'Required — Phase 1'],
    ['Secret Management', 'Environment variables via Vercel/Railway secrets, tidak ada hardcode', 'Required — Phase 1'],
    ['Audit Log', 'Log semua aksi sensitif: login, generate, purchase, delete', 'Phase 2'],
    ['Penetration Testing', 'Quarterly pentest oleh third-party', 'Phase 2'],
    ['GDPR/UU PDP Compliance', 'Data export, deletion request, consent management', 'Phase 2'],
  ], [2400, 4000, 2960]),
  spacer(160),

  h2('9.2 Content Safety'),
  bullet('Prompt filtering: blocklist kata kunci berbahaya, hate speech, NSFW content'),
  bullet('Output scanning: audio classification untuk deteksi konten tidak sesuai'),
  bullet('Copyright protection: fingerprinting audio untuk deteksi plagiat/similarity berlebihan'),
  bullet('User reporting: sistem lapor konten dengan review queue moderator'),
  bullet('AI watermarking: embed watermark tersembunyi di semua audio yang dihasilkan'),
  bullet('DMCA compliance: takedown process yang jelas dan cepat (< 24 jam respons)'),
  new Paragraph({ children: [new PageBreak()] }),

  h1('10. Development Roadmap'),

  h2('10.1 Phase 0 — Foundation (Minggu 1–2)'),
  infoBox('Setup environment, tooling, dan proof-of-concept AI integration. Target: Bisa generate musik dari command line lokal.', C.purpleLight, C.purple),
  spacer(80),
  table3col([
    ['Task', 'Assignee', 'Durasi'],
    ['Setup monorepo (Next.js + FastAPI) dengan Docker Compose', 'Frontend Dev + Backend Dev', '2 hari'],
    ['Setup GitHub repository, branch strategy (main/dev/feature/*)', 'Tech Lead', '1 hari'],
    ['Configure CI/CD: GitHub Actions → Vercel + Railway', 'DevOps', '2 hari'],
    ['Setup Supabase project — schema awal, RLS policies', 'Backend Dev', '2 hari'],
    ['Install dan test YuE model lokal (Python script)', 'AI Engineer', '3 hari'],
    ['Install dan test MusicGen (HuggingFace transformers)', 'AI Engineer', '2 hari'],
    ['Setup Cloudflare R2 bucket + access key', 'Backend Dev', '1 hari'],
    ['Setup Redis (Upstash) untuk Celery broker', 'Backend Dev', '1 hari'],
    ['POC: FastAPI endpoint → Celery task → YuE → upload R2', 'AI Engineer + Backend', '3 hari'],
  ], [4000, 3000, 2360]),
  spacer(160),

  h2('10.2 Phase 1 — MVP (Minggu 3–8)'),
  infoBox('Aplikasi web fungsional dengan generasi musik, auth, credit system, dan pembayaran. Target: 100 beta user pertama.', C.blueLight, C.blue),
  spacer(80),
  table3col([
    ['Task', 'Komponen', 'Sprint'],
    ['User authentication (email + Google OAuth)', 'Backend + Frontend', 'Sprint 1'],
    ['Credit system logic + database schema lengkap', 'Backend', 'Sprint 1'],
    ['UI layout: sidebar, topbar, responsive grid', 'Frontend', 'Sprint 1'],
    ['Music generator UI: prompt, options, generate button', 'Frontend', 'Sprint 2'],
    ['Real-time job status via WebSocket/SSE', 'Backend + Frontend', 'Sprint 2'],
    ['Audio player: waveform, controls, progress bar', 'Frontend', 'Sprint 2'],
    ['Personal library: list, filter, sort, delete', 'Backend + Frontend', 'Sprint 3'],
    ['Download endpoint dengan presigned URL R2', 'Backend', 'Sprint 3'],
    ['Stripe + Midtrans integration + webhook handler', 'Backend', 'Sprint 3'],
    ['Subscription plan UI + upgrade flow', 'Frontend', 'Sprint 3'],
    ['Email: welcome, receipt, generation complete', 'Backend', 'Sprint 4'],
    ['Admin panel dasar: user list, song list, job monitor', 'Backend + Frontend', 'Sprint 4'],
    ['Beta testing dengan 50–100 pengguna internal', 'QA + Product', 'Sprint 4'],
    ['Bug fixing + performance tuning', 'Semua', 'Sprint 4'],
  ], [4200, 2000, 3160]),
  spacer(160),

  h2('10.3 Phase 2 — Growth (Bulan 3–4)'),
  infoBox('Social features, advanced AI capabilities, API access. Target: 5.000 registered user, 300 paying.', C.greenLight, C.green),
  spacer(80),
  table3col([
    ['Task', 'Komponen', 'Estimasi'],
    ['Explore feed: trending, new, genre-based', 'Backend + Frontend', '1 minggu'],
    ['Public profile halaman + follow system', 'Backend + Frontend', '1 minggu'],
    ['Song extend/continue feature', 'AI + Backend + Frontend', '1.5 minggu'],
    ['Stem extraction dengan Demucs integration', 'AI + Backend', '1 minggu'],
    ['Style transfer dari referensi lagu', 'AI + Backend + Frontend', '2 minggu'],
    ['API access dashboard + key management', 'Backend + Frontend', '1.5 minggu'],
    ['Full-text search dengan Meilisearch', 'Backend + Frontend', '1 minggu'],
    ['Recommendation engine dengan Pinecone', 'AI + Backend', '2 minggu'],
    ['Mobile PWA optimization', 'Frontend', '1 minggu'],
    ['Analytics dashboard untuk user', 'Frontend', '1 minggu'],
    ['SEO optimization + sitemap + meta tags', 'Frontend', '3 hari'],
    ['Performance audit + optimization', 'Frontend + Backend', '1 minggu'],
  ], [4200, 2000, 3160]),
  spacer(160),

  h2('10.4 Phase 3 — Scale (Bulan 5–8)'),
  infoBox('Enterprise features, Bahasa Indonesia model, marketplace. Target: Rp 150 juta MRR.', C.orangeLight, C.orange),
  spacer(80),
  bullet('Fine-tune YuE untuk Bahasa Indonesia (LoRA training — 4 minggu)'),
  bullet('Enterprise plan + white-label solution launch'),
  bullet('In-platform marketplace untuk jual/beli lisensi musik'),
  bullet('Mobile app (React Native) untuk iOS dan Android'),
  bullet('Partnership dengan platform konten lokal (Vidio, Bigo Live, TikTok Indonesia)'),
  bullet('Integrasi dengan DAW populer (Ableton, FL Studio) via plugin'),
  bullet('Kolaborasi real-time — multiple user satu session'),
  bullet('Public API dengan dokumentasi lengkap + developer community'),
  spacer(160),

  h2('10.5 Team Structure Rekomendasi'),
  table3col([
    ['Role', 'Jumlah', 'Tanggung Jawab Utama'],
    ['Tech Lead / Full-stack', '1 orang', 'Arsitektur sistem, code review, technical decision'],
    ['Frontend Developer', '1–2 orang', 'Next.js UI, audio player, animations, responsif'],
    ['Backend Developer', '1–2 orang', 'FastAPI, database, API design, Celery workers'],
    ['AI/ML Engineer', '1 orang', 'Model integration, fine-tuning, GPU infra, optimization'],
    ['DevOps Engineer', '1 orang (part-time)', 'CI/CD, monitoring, infrastructure, security'],
    ['Product Designer', '1 orang', 'UI/UX design, user research, prototype'],
    ['Product Manager', '1 orang', 'Roadmap, prioritas, stakeholder communication'],
    ['QA Engineer', '1 orang (phase 2)', 'Testing, bug tracking, quality assurance'],
    ['Content Moderator', '1 orang (phase 2)', 'Review flagged content, DMCA handling'],
  ], [2600, 1500, 5260]),
  new Paragraph({ children: [new PageBreak()] }),

  h1('11. Risk Analysis & Mitigation'),
  table4col([
    ['Risiko', 'Dampak', 'Probabilitas', 'Mitigasi'],
    ['Model AI kualitas kurang memuaskan user', 'Tinggi', 'Medium', 'A/B test multi-model, kumpulkan feedback early, iterasi cepat. Gunakan YuE + MusicGen sebagai ensemble.'],
    ['Biaya GPU inference membengkak', 'Tinggi', 'Tinggi', 'Gunakan Vast.ai/Modal on-demand. Batasi durasi free tier. Cache hasil populer. Optimize model quantization.'],
    ['Masalah lisensi/copyright audio output', 'Sangat Tinggi', 'Medium', 'Gunakan model trained on licensed data. Konsultasi lawyer IP. Implementasikan audio watermarking. Clear ToS.'],
    ['Kompetisi dari Suno, Udio scale-up', 'Medium', 'Tinggi', 'Fokus differensiasi: market lokal Indonesia, harga IDR, dukungan Bahasa Indonesia, B2B enterprise.'],
    ['Model bias atau output tidak pantas', 'Tinggi', 'Low', 'Prompt filtering ketat, output moderation, user reporting system, human review queue.'],
    ['Skalabilitas — traffic spike saat viral', 'Medium', 'Medium', 'Auto-scaling GPU workers via Modal, queue management Celery, CDN Cloudflare untuk asset statis.'],
    ['Keamanan data user breach', 'Sangat Tinggi', 'Low', 'Enkripsi end-to-end, regular security audit, principle of least privilege, tidak simpan data kartu kredit.'],
    ['Regulasi baru tentang AI konten', 'Medium', 'Medium', 'Pantau regulasi Kominfo/UU ITE, watermarking mandatory, comply GDPR dan UU PDP Indonesia.'],
  ], [2200, 1500, 1500, 4160]),
  new Paragraph({ children: [new PageBreak()] }),

  h1('12. Success Metrics & KPIs'),

  h2('12.1 Product KPIs'),
  table3col([
    ['Metric', 'Target (Bulan 6)', 'Target (Bulan 12)'],
    ['Monthly Active Users (MAU)', '5.000', '50.000'],
    ['Daily Active Users (DAU)', '800', '8.000'],
    ['Songs generated per day', '2.000', '20.000'],
    ['Conversion rate (Free → Paid)', '5%', '7%'],
    ['Monthly Recurring Revenue (MRR)', 'Rp 45 juta', 'Rp 450 juta'],
    ['Average Revenue Per User (ARPU)', 'Rp 9.000/bulan', 'Rp 9.000/bulan'],
    ['Churn rate (monthly)', '< 8%', '< 5%'],
    ['Net Promoter Score (NPS)', '> 40', '> 55'],
    ['Generation success rate', '> 95%', '> 98%'],
    ['Average generation time', '< 45 detik', '< 30 detik'],
    ['User-rated output quality (1–5)', '> 3.8', '> 4.2'],
  ], [3200, 3080, 3080]),
  spacer(160),

  h2('12.2 Technical KPIs'),
  table3col([
    ['Metric', 'Target', 'Monitoring Tool'],
    ['API Uptime', '> 99.5%', 'BetterStack'],
    ['P95 API Response Time', '< 200ms', 'Sentry Performance'],
    ['Error rate per endpoint', '< 0.1%', 'Sentry'],
    ['GPU utilization', '60–80% (cost optimal)', 'GPU provider dashboard'],
    ['Queue wait time P95', '< 60 detik', 'Celery Flower'],
    ['Storage cost per song', '< Rp 50 per lagu', 'Cloudflare R2 dashboard'],
    ['CDN cache hit rate', '> 85%', 'Cloudflare Analytics'],
    ['Database query time P95', '< 50ms', 'Supabase dashboard'],
  ], [3000, 3500, 2860]),
  spacer(160),

  h2('12.3 Growth Metrics'),
  table2col([
    ['Metric', 'Cara Ukur'],
    ['Virality coefficient (K-factor)', 'Jumlah signup yang berasal dari share user yang ada. Target > 0.3'],
    ['Content virality', 'Jumlah plays dari share di medsos vs plays di platform. Pantau via UTM'],
    ['Activation rate', '% user yang generate musik pertama dalam 24 jam setelah signup. Target > 60%'],
    ['Day-30 retention', '% user yang masih aktif 30 hari setelah signup. Target > 25%'],
    ['Feature adoption', '% user yang coba fitur baru dalam 7 hari setelah launch. Target > 40%'],
    ['Support ticket volume', 'Jumlah tiket per 1.000 MAU. Target < 20 tiket (platform intuitif)'],
  ], [3200, 6160]),
  new Paragraph({ children: [new PageBreak()] }),

  h1('13. Appendix — Referensi & Resources'),

  h2('13.1 AI Model Resources'),
  table2col([
    ['Resource', 'URL'],
    ['YuE GitHub Repository', 'github.com/multimodal-art-projection/YuE'],
    ['Meta AudioCraft / MusicGen', 'github.com/facebookresearch/audiocraft'],
    ['ACE-Step Music Generator', 'github.com/ace-step/ACE-Step'],
    ['DiffRhythm Model', 'Cari di HuggingFace: diffrhythm'],
    ['HuggingFace MusicGen Model Card', 'huggingface.co/facebook/musicgen-large'],
    ['Demucs Source Separation', 'github.com/facebookresearch/demucs'],
    ['OpenAI Whisper', 'github.com/openai/whisper'],
    ['LAION CLAP Audio Embedding', 'github.com/LAION-AI/CLAP'],
    ['Spotify Basic Pitch', 'github.com/spotify/basic-pitch'],
  ], [3000, 6360]),
  spacer(160),

  h2('13.2 Free Infrastructure Resources'),
  table2col([
    ['Service', 'Free Tier URL'],
    ['Supabase (Database + Auth)', 'supabase.com — 500MB free'],
    ['Vercel (Frontend Deploy)', 'vercel.com — unlimited deploys'],
    ['Railway (Backend Deploy)', 'railway.app — $5 credit/bulan'],
    ['Cloudflare R2 (Storage)', 'cloudflare.com/r2 — 10GB gratis'],
    ['Upstash Redis (Cache/Queue)', 'upstash.com — 10K req/hari gratis'],
    ['Modal.com (GPU Inference)', 'modal.com — $30 credit/bulan'],
    ['Replicate (Model API)', 'replicate.com — free credit untuk dev'],
    ['Clerk (Auth)', 'clerk.com — 10K MAU gratis'],
    ['Resend (Email)', 'resend.com — 3K email/bulan gratis'],
    ['Sentry (Error Monitoring)', 'sentry.io — 5K events gratis'],
    ['GitHub Actions (CI/CD)', 'github.com — 2K menit/bulan gratis'],
    ['Meilisearch Cloud', 'meilisearch.com — free tier tersedia'],
    ['Pinecone (Vector DB)', 'pinecone.io — 1 free index'],
  ], [3000, 6360]),
  spacer(160),

  h2('13.3 Competitive Analysis'),
  table4col([
    ['Platform', 'Harga', 'Keunggulan', 'Kelemahan vs PositiveSpace'],
    ['Suno.ai', '$10–30/bulan', 'Kualitas vokal terbaik, brand recognition', 'Tidak support Bahasa Indonesia, tidak ada B2B, mahal untuk volume tinggi'],
    ['Udio', '$10–30/bulan', 'High fidelity output, variety style', 'UI kompleks, tidak ada pasar Asia, harga USD'],
    ['Soundraw', '$16.99/bulan', 'Royalty-free, editor musik', 'Preset-based bukan AI generative, kualitas lebih rendah'],
    ['Mubert', '$14/bulan', 'API-first, real-time streaming', 'Electronic-focused, tidak ada vokal, terbatas genre'],
    ['PositiveSpace', 'Rp 79.000+', 'Bahasa Indonesia, harga IDR, B2B enterprise, lokal SEA', 'New entrant — perlu bangun kepercayaan brand'],
  ], [1800, 1800, 3000, 2760]),
  spacer(200),

  divider(),
  spacer(120),
  p('Dokumen ini disiapkan sebagai panduan lengkap pengembangan platform PositiveSpace. Semua spesifikasi bersifat hidup dan akan diupdate seiring development berlanjut.', { color: C.midGray, size: 20, italic: true }),
  spacer(80),
  p(`Document Version: 1.0.0  ·  Last Updated: April 2026  ·  Status: DRAFT`, { color: C.midGray, size: 18, align: AlignmentType.CENTER }),
];

const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: 'numbers',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
    ]
  },
  styles: {
    default: {
      document: { run: { font: 'Arial', size: 22 } }
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: C.dark },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 }
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: C.purple },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 1 }
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial', color: C.dark },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 }
      },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.border, space: 4 } },
            spacing: { before: 0, after: 160 },
            children: [
              new TextRun({ text: 'POSITIVESPACE  ·  Product Requirements Document  ·  v1.0.0', size: 18, color: C.midGray, font: 'Arial' }),
            ]
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.border, space: 4 } },
            spacing: { before: 120, after: 0 },
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: 'Halaman ', size: 18, color: C.midGray, font: 'Arial' }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, color: C.midGray, font: 'Arial' }),
              new TextRun({ text: ' dari ', size: 18, color: C.midGray, font: 'Arial' }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: C.midGray, font: 'Arial' }),
            ]
          })
        ]
      })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/home/wildibyrug/positivespace/outputs/PositiveSpace_PRD.docx', buf);
  console.log('Done! File created: PositiveSpace_PRD.docx');
}).catch(console.error);
