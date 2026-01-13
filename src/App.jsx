import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronDown,
  Copy,
  GraduationCap,
  Linkedin,
  LineChart,
  Mail,
  Phone,
  Sparkles,
  Telescope,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeSymbol(title) {
  const letters = title
    .replace(/[^a-zA-Z ]/g, '')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  if (letters.length >= 3) return letters.slice(0, 4)
  const cleaned = title.replace(/[^a-zA-Z]/g, '').toUpperCase()
  return (cleaned.slice(0, 4) || 'CK').padEnd(3, 'X')
}

function formatPrice(n) {
  return n.toFixed(n >= 100 ? 2 : 3)
}

function Sparkline({ data, up }) {
  const w = 96
  const h = 28
  const pad = 2
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = Math.max(1e-9, max - min)
  const step = (w - pad * 2) / Math.max(1, data.length - 1)
  const d = data
    .map((v, i) => {
      const x = pad + i * step
      const y = pad + (h - pad * 2) * (1 - (v - min) / range)
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')

  const stroke = up ? '#34d399' : '#fb7185'
  const fill = up ? 'rgba(52,211,153,0.12)' : 'rgba(251,113,133,0.12)'

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
      <path
        d={`${d} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`}
        fill={fill}
        stroke="none"
      />
    </svg>
  )
}

function CursorGlow() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  useEffect(() => {
    const onMove = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [x, y])

  const bg = useMotionTemplate`radial-gradient(700px circle at ${x}px ${y}px, rgba(128, 0, 0, 0.22), transparent 55%)`

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ background: bg }}
    />
  )
}

function Nav({ sections, activeId, onNavigate }) {
  return (
    <div className="fixed left-0 right-0 top-0 z-50 px-4 pt-4">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-uchicago-maroon/20 bg-black/30 backdrop-blur-xl shadow-glow">
          <div className="flex items-center justify-between px-4 py-3 md:px-5">
            <button
              onClick={() => onNavigate('home')}
              className="group inline-flex items-center gap-2 rounded-xl px-2 py-1 text-sm font-semibold text-white/90 transition hover:bg-uchicago-maroon/10"
              type="button"
            >
              <span className="tracking-tight">Charvi Khandelwal</span>
            </button>

            <div className="hidden items-center gap-1 md:flex">
              {sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onNavigate(s.id)}
                  className="relative rounded-xl px-3 py-2 text-sm text-white/70 transition hover:bg-uchicago-maroon/10 hover:text-white"
                >
                  <span className="relative z-10">{s.label}</span>
                  {activeId === s.id ? (
                    <motion.span
                      layoutId="navPill"
                      className="absolute inset-0 rounded-xl bg-uchicago-maroon/25"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  ) : null}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <a
                className="inline-flex items-center gap-2 rounded-xl border border-uchicago-maroon/30 bg-uchicago-maroon/10 px-3 py-2 text-sm text-white/90 transition hover:bg-uchicago-maroon/20"
                href="#contact"
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate('contact')
                }}
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Contact</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 px-4 py-16 md:py-20">
      <motion.div
        className="mx-auto max-w-6xl"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.22 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="mb-8">
          {eyebrow ? (
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              {eyebrow}
            </div>
          ) : null}
          <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            {title}
          </h2>
        </div>
        {children}
      </motion.div>
    </section>
  )
}

function TiltCard({ children, className = '' }) {
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useMotionValue(0)
  const sy = useMotionValue(0)

  const rX = useTransform(my, [-0.5, 0.5], [10, -10])
  const rY = useTransform(mx, [-0.5, 0.5], [-12, 12])
  const rotateX = useSpring(rX, { stiffness: 220, damping: 22 })
  const rotateY = useSpring(rY, { stiffness: 220, damping: 22 })

  const shine = useMotionTemplate`radial-gradient(420px circle at ${sx}px ${sy}px, rgba(255,255,255,0.10), transparent 55%)`

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const localX = e.clientX - rect.left
        const localY = e.clientY - rect.top
        const px = localX / rect.width - 0.5
        const py = localY / rect.height - 0.5
        mx.set(clamp(px, -0.5, 0.5))
        my.set(clamp(py, -0.5, 0.5))
        sx.set(clamp(localX, 0, rect.width))
        sy.set(clamp(localY, 0, rect.height))
      }}
      onMouseLeave={() => {
        mx.set(0)
        my.set(0)
        sx.set(0)
        sy.set(0)
      }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={`relative rounded-2xl border border-uchicago-maroon/20 bg-black/30 p-5 shadow-glow transition ${className}`}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: shine }}
      />
      <div className="relative" style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>
    </motion.div>
  )
}

function Chip({ children, icon: Icon }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-uchicago-maroon/30 bg-uchicago-maroon/10 px-3 py-1 text-xs font-medium text-white/85">
      {Icon ? <Icon className="h-3.5 w-3.5 text-white/70" /> : null}
      {children}
    </span>
  )
}

function App() {
  const sections = useMemo(
    () => [
      { id: 'home', label: 'Home' },
      { id: 'about', label: 'About' },
      { id: 'experience', label: 'Experience' },
      { id: 'projects', label: 'Projects' },
      { id: 'skills', label: 'Skills' },
      { id: 'contact', label: 'Contact' },
    ],
    [],
  )

  const [activeId, setActiveId] = useState('home')
  const [expanded, setExpanded] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean)
    if (!els.length) return

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0]
        if (visible?.target?.id) setActiveId(visible.target.id)
      },
      {
        root: null,
        threshold: [0.18, 0.25, 0.35, 0.5],
        rootMargin: '-35% 0px -55% 0px',
      },
    )

    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [sections])

  const onNavigate = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const experience = useMemo(
    () => [
      {
        id: 'ma',
        title: 'Project Lead — UChicago M&A Group',
        org: 'UChicago M&A Group',
        time: 'Sep 2024 – Present',
        icon: BriefcaseBusiness,
        bullets: [
          'Leads a six-person student banking team on founder-led sell-side mandates.',
          'Owns valuation cases, buyer mapping, and CIM storytelling for weekly client touchpoints.',
        ],
        details:
          'Built diligence frameworks and metric packs that keep management teams aligned while sharpening negotiation narratives.',
      },
      {
        id: 'p33',
        title: 'Venture Capital Intern — P33 Chicago',
        org: 'P33 (Deep Tech & Quantum)',
        time: 'Jun – Aug 2025',
        icon: LineChart,
        bullets: [
          'Mapped 40+ quantum and deep tech startups across traction, capital efficiency, and IP moats.',
          'Produced partner-ready memos with thesis, competitive positioning, and catalysts.',
        ],
        details:
          'Helped the Chicago innovation ecosystem prioritize the right founders by pairing technical curiosity with disciplined investment filters.',
      },
      {
        id: 'zenith',
        title: 'PE / M&A Due Diligence Intern — Zenith Growth Partners',
        org: 'Zenith Growth Partners',
        time: 'Dec 2024 – Mar 2025',
        icon: BriefcaseBusiness,
        bullets: [
          'Sourced search-fund deals, pressure-tested operating models, and benchmarked industry multiples.',
          'Coordinated expert calls and reference workstreams to de-risk acquisition theses.',
        ],
        details:
          'Delivered crisp go / no-go recommendations by translating qualitative interviews into quantified conviction.',
      },
      {
        id: 'difc',
        title: 'Corporate Finance Intern — Dubai International Financial Center',
        org: 'DIFC',
        time: 'May – Aug 2024',
        icon: LineChart,
        bullets: [
          'Analyzed cross-border capital structures, FX exposure, and liquidity scenarios for institutional clients.',
          'Built dashboards that surfaced portfolio risk and regulatory constraints at a glance.',
        ],
        details:
          'Blended accounting rigor with market awareness to keep investment, risk, and audit teams aligned.',
      },
    ],
    [],
  )

  const projects = useMemo(
    () => [
      {
        title: 'Deep Tech Signal Deck',
        tag: 'Venture',
        desc: 'P33 landscape memo ranking quantum and advanced-compute startups by traction, IP moat, and burnway.',
      },
      {
        title: 'Sell-Side Playbook',
        tag: 'M&A',
        desc: 'UChicago M&A Group toolkit covering diligence checklists, valuation sensitivities, and buyer narratives.',
      },
      {
        title: 'Cross-Border Capital Dashboard',
        tag: 'Finance',
        desc: 'DIFC dashboard scenario-testing currency, liquidity, and regulatory risk for institutional portfolios.',
      },
    ],
    [],
  )

  const [quotes, setQuotes] = useState(() => {
    return projects.map((p, idx) => {
      const seed = hashString(`${p.title}:${idx}`)
      const rnd = mulberry32(seed)
      const base = 40 + rnd() * 110
      const series = Array.from({ length: 18 }, (_, i) => base * (1 + (rnd() - 0.5) * 0.02 * i))
      return {
        symbol: makeSymbol(p.title),
        series,
      }
    })
  })

  useEffect(() => {
    const id = window.setInterval(() => {
      setQuotes((prev) => {
        return prev.map((q) => {
          const seed = hashString(q.symbol) ^ hashString(String(Date.now() / 1000))
          const rnd = mulberry32(seed)
          const last = q.series[q.series.length - 1] ?? 100
          const drift = (rnd() - 0.5) * 0.003
          const shock = (rnd() - 0.5) * 0.012
          const next = Math.max(1, last * (1 + drift + shock))
          const nextSeries = [...q.series.slice(-17), next]
          return { ...q, series: nextSeries }
        })
      })
    }, 1100)

    return () => window.clearInterval(id)
  }, [])

  const skills = useMemo(
    () => [
      'Financial modeling & valuation',
      'Market & competitive mapping',
      'Due diligence & expert calls',
      'Investor memos & CIM writing',
      'Portfolio risk dashboards',
      'Client communication',
      'Astrophysics research methods',
      'Languages: English • Hindi • French',
    ],
    [],
  )

  return (
    <div className="relative min-h-screen">
      <CursorGlow />
      <Nav sections={sections} activeId={activeId} onNavigate={onNavigate} />

      <div className="absolute inset-x-0 top-0 -z-20 h-[720px] bg-[radial-gradient(80%_60%_at_50%_0%,rgba(128,0,0,0.22),transparent_70%),radial-gradient(65%_55%_at_80%_15%,rgba(161,27,31,0.18),transparent_70%),radial-gradient(75%_55%_at_10%_10%,rgba(118,118,118,0.14),transparent_70%)]" />

      <main className="pt-28">
        <section id="home" className="scroll-mt-24 px-4 pb-10 pt-10 md:pb-14 md:pt-16">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="inline-flex items-center gap-2 rounded-full border border-uchicago-maroon/30 bg-uchicago-maroon/10 px-3 py-1 text-xs font-semibold text-white/85"
                >
                  <GraduationCap className="h-4 w-4 text-white/70" />
                  Econ + Astrophysics @ University of Chicago
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.06 }}
                  className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl"
                >
                  Building clarity from complex systems—
                  <span className="bg-gradient-to-r from-uchicago-maroonLight to-uchicago-maroon bg-clip-text text-transparent">
                    from stars to spreadsheets.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.12 }}
                  className="mt-4 max-w-xl text-base leading-relaxed text-white/70"
                >
                  I’m Charvi—an Economics & Astrophysics student pairing quantitative reasoning with strategic
                  finance work. From venture scouting to sell-side mandates, I love uncovering insights, shaping
                  narratives, and moving fast with great teams.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.18 }}
                  className="mt-6 flex flex-wrap items-center gap-3"
                >
                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault()
                      onNavigate('contact')
                    }}
                    className="group inline-flex items-center gap-2 rounded-xl bg-uchicago-maroon px-4 py-2 text-sm font-semibold text-white transition hover:bg-uchicago-maroonLight"
                  >
                    Let’s connect
                    <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onNavigate('about')}
                    className="inline-flex items-center gap-2 rounded-xl border border-uchicago-maroon/30 bg-uchicago-maroon/10 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-uchicago-maroon/20"
                  >
                    Explore
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </motion.div>

                <div className="mt-7 flex flex-wrap gap-2">
                  <Chip icon={BriefcaseBusiness}>Finance</Chip>
                  <Chip icon={Telescope}>Astrophysics</Chip>
                  <Chip icon={Sparkles}>Storytelling</Chip>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative"
              >
                <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-br from-uchicago-maroon/25 via-uchicago-maroonLight/20 to-uchicago-gray/20 blur-xl" />
                <TiltCard className="p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <div className="text-sm font-semibold text-white/85">Focus</div>
                      <div className="mt-1 text-2xl font-semibold tracking-tight text-white">
                        Investment Banking
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-white/70">
                        I love high-ownership work, sharp narratives, and turning messy data into clear
                        decisions.
                      </div>
                    </div>
                    <div className="rounded-2xl border border-uchicago-maroon/30 bg-uchicago-maroon/10 p-3">
                      <Linkedin className="h-6 w-6 text-white/70" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-uchicago-maroon/20 bg-black/20 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                        Studies
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white/85">
                        Economics + Astrophysics
                      </div>
                      <div className="mt-1 text-sm text-white/60">University of Chicago</div>
                    </div>
                    <div className="rounded-2xl border border-uchicago-maroon/20 bg-black/20 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                        Strengths
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white/85">Analysis • Research</div>
                      <div className="mt-1 text-sm text-white/60">Fast learning, clear communication</div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-uchicago-maroon/20 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                          Portfolio
                        </div>
                        <div className="mt-2 text-sm font-semibold text-white/85">
                          {projects.length} positions
                        </div>
                      </div>
                      <div className="rounded-xl border border-uchicago-maroon/30 bg-uchicago-maroon/10 p-2">
                        <LineChart className="h-5 w-5 text-white/70" />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {quotes.map((q) => (
                        <span
                          key={q.symbol}
                          className="rounded-full border border-uchicago-maroon/30 bg-uchicago-maroon/10 px-3 py-1 text-xs font-semibold text-white/85"
                        >
                          {q.symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            </div>
          </div>
        </section>

        <Section id="about" eyebrow="About" title="A finance-forward mindset with a scientific edge">
          <div className="grid gap-6 md:grid-cols-2">
            <TiltCard>
              <div className="text-sm leading-relaxed text-white/70">
                Rising junior at the University of Chicago studying Economics & Astrophysics (Dean’s List). I
                bring mathematical modeling, research discipline, and people-focused leadership from Emory,
                SEO, and Pioneer Academics.
              </div>
              <div className="mt-4 text-sm leading-relaxed text-white/70">
                I thrive when big questions need structured thinking—breaking down diligence, market mapping,
                or storytelling into crisp deliverables that help clients decide faster.
              </div>
            </TiltCard>
            <div className="grid gap-4">
              <TiltCard>
                <div className="flex items-start gap-3">
                  <div className="rounded-xl border border-uchicago-maroon/30 bg-uchicago-maroon/10 p-2">
                    <BriefcaseBusiness className="h-5 w-5 text-white/70" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white/85">Why finance</div>
                    <div className="mt-1 text-sm text-white/70">
                      I’m drawn to fast-paced environments that reward precision, ownership, and sharp
                      thinking.
                    </div>
                  </div>
                </div>
              </TiltCard>
              <TiltCard>
                <div className="flex items-start gap-3">
                  <div className="rounded-xl border border-uchicago-maroon/30 bg-uchicago-maroon/10 p-2">
                    <Telescope className="h-5 w-5 text-white/70" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white/85">Why astrophysics</div>
                    <div className="mt-1 text-sm text-white/70">
                      It trains rigorous reasoning: modeling, validating assumptions, and staying calm in
                      uncertainty.
                    </div>
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </Section>

        <Section id="experience" eyebrow="Experience" title="Highlights">
          <div className="grid gap-4">
            {experience.map((item) => {
              const Icon = item.icon
              const isOpen = expanded === item.id
              return (
                <TiltCard key={item.id} className="p-0">
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => (v === item.id ? null : item.id))}
                    className="w-full rounded-2xl p-5 text-left"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl border border-uchicago-maroon/30 bg-uchicago-maroon/10 p-2">
                          <Icon className="h-5 w-5 text-white/70" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white/85">{item.title}</div>
                          <div className="mt-1 text-sm text-white/60">{item.org}</div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                        {item.time}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2">
                      {item.bullets.map((b) => (
                        <div key={b} className="text-sm text-white/70">
                          {b}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/70">
                      <span>{isOpen ? 'Hide details' : 'View details'}</span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="inline-flex"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.span>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 text-sm leading-relaxed text-white/70">
                          {item.details}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </TiltCard>
              )
            })}
          </div>
        </Section>

        <Section id="projects" eyebrow="Projects" title="Selected work">
          <div className="grid gap-4 md:grid-cols-3">
            {projects.map((p, idx) => {
              const q = quotes[idx]
              const series = q?.series ?? [100, 101, 99, 103]
              const price = series[series.length - 1]
              const prev = series[series.length - 2] ?? price
              const delta = price - prev
              const pct = (delta / Math.max(1e-9, prev)) * 100
              const up = delta >= 0
              const DeltaIcon = up ? TrendingUp : TrendingDown

              return (
                <TiltCard key={p.title}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white/85">{p.title}</div>
                      <div className="mt-2 text-sm text-white/70">{p.desc}</div>
                    </div>
                    <span className="rounded-full border border-uchicago-maroon/30 bg-uchicago-maroon/10 px-2 py-1 text-xs font-semibold text-white/80">
                      {p.tag}
                    </span>
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                        {q?.symbol ?? makeSymbol(p.title)}
                      </div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <motion.div
                          key={`${q?.symbol ?? p.title}:${price.toFixed(4)}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="text-xl font-semibold tracking-tight text-white"
                        >
                          ${formatPrice(price)}
                        </motion.div>
                        <div
                          className={`inline-flex items-center gap-1 text-sm font-semibold ${
                            up ? 'text-emerald-300' : 'text-rose-300'
                          }`}
                        >
                          <DeltaIcon className="h-4 w-4" />
                          <span>
                            {up ? '+' : ''}
                            {pct.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Sparkline data={series.slice(-14)} up={up} />
                    </div>
                  </div>

                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/70">
                    <span>Open position</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </TiltCard>
              )
            })}
          </div>
        </Section>

        <Section id="skills" eyebrow="Skills" title="What I bring">
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <motion.span
                key={s}
                whileHover={{ y: -2 }}
                className="rounded-full border border-uchicago-maroon/30 bg-uchicago-maroon/10 px-3 py-2 text-sm font-semibold text-white/85"
              >
                {s}
              </motion.span>
            ))}
          </div>
        </Section>

        <Section id="contact" eyebrow="Contact" title="Say hello">
          <div className="grid gap-6 md:grid-cols-2">
            <TiltCard>
              <div className="text-sm leading-relaxed text-white/70">
                For opportunities, collaborations, or a quick chat—reach out anytime.
              </div>
              <div className="mt-5 grid gap-3">
                <a
                  className="inline-flex items-center justify-between gap-3 rounded-xl border border-uchicago-maroon/30 bg-uchicago-maroon/10 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-uchicago-maroon/20"
                  href="tel:+14705549895"
                >
                  <span className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    +1 (470) 554-9895
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  className="inline-flex items-center justify-between gap-3 rounded-xl border border-uchicago-maroon/30 bg-uchicago-maroon/10 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-uchicago-maroon/20"
                  href="mailto:charvii.khandelwal@gmail.com"
                >
                  <span className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    charvii.khandelwal@gmail.com
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  className="inline-flex items-center justify-between gap-3 rounded-xl border border-uchicago-maroon/30 bg-uchicago-maroon/10 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-uchicago-maroon/20"
                  href="https://www.linkedin.com/in/charvi-khandelwal-uchicago"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="inline-flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </TiltCard>
            <TiltCard>
              <div className="text-sm font-semibold text-white/85">Quick action</div>
              <div className="mt-2 text-sm text-white/70">
                Copy email to clipboard (instant feedback).
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText('charvi.khandelwal@example.com')
                      setCopied(true)
                      window.setTimeout(() => setCopied(false), 1200)
                    } catch {
                      setCopied(false)
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-uchicago-maroon px-4 py-2 text-sm font-semibold text-white transition hover:bg-uchicago-maroonLight"
                >
                  <Copy className="h-4 w-4" />
                  Copy email
                </button>
                <AnimatePresence>
                  {copied ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="text-sm font-semibold text-white/80"
                    >
                      Copied
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
              <div className="mt-6 text-xs text-white/50">
                Swap the placeholder email/links with her real details when ready.
              </div>
            </TiltCard>
          </div>
        </Section>

        <footer className="px-4 pb-12">
          <div className="mx-auto max-w-6xl border-t border-uchicago-maroon/20 pt-6 text-sm text-white/50">
            © {new Date().getFullYear()} Charvi Khandelwal
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
