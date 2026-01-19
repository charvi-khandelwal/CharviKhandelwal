import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronDown,
  Copy,
  GraduationCap,
  Linkedin,
  LineChart,
  Mail,
  Moon,
  Phone,
  Sparkles,
  Sun,
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

function CursorGlow({ theme }) {
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

  const accent = theme === 'light' ? 'rgba(128, 0, 0, 0.16)' : 'rgba(128, 0, 0, 0.22)'
  const bg = useMotionTemplate`radial-gradient(700px circle at ${x}px ${y}px, ${accent}, transparent 55%)`

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ background: bg }}
    />
  )
}

function Nav({ sections, activeId, onNavigate, theme, onToggleTheme }) {
  return (
    <div className="fixed left-0 right-0 top-0 z-50 px-4 pt-4">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border glass-panel shadow-glow backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3 md:px-5">
            <button
              onClick={() => onNavigate('home')}
              className="group inline-flex items-center gap-2 rounded-xl px-2 py-1 text-sm font-semibold text-theme-secondary transition hover:bg-accent-pill"
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
                  className="relative rounded-xl px-3 py-2 text-sm text-theme-muted transition hover:bg-accent-pill hover:text-theme-primary"
                >
                  <span className="relative z-10">{s.label}</span>
                  {activeId === s.id ? (
                    <motion.span
                      layoutId="navPill"
                      className="absolute inset-0 rounded-xl bg-accent-pill-strong"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  ) : null}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('/projects')}
                className="inline-flex items-center gap-2 rounded-xl border tinted-button px-3 py-2 text-sm font-semibold text-theme-secondary transition"
              >
                Projects
              </button>
              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex items-center gap-2 rounded-xl border tinted-button px-3 py-2 text-xs font-semibold transition"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 icon-muted" />
                ) : (
                  <Moon className="h-4 w-4 icon-muted" />
                )}
                <span className="hidden sm:inline">
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </span>
              </button>
              <a
                className="inline-flex items-center gap-2 rounded-xl border tinted-button px-3 py-2 text-sm font-semibold text-theme-secondary transition"
                href="#contact"
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate('contact')
                }}
              >
                <Mail className="h-4 w-4 icon-muted" />
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
        initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.22 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
      >
        <div className="mb-8">
          {eyebrow ? (
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-theme-subtle">
              {eyebrow}
            </div>
          ) : null}
          <h2 className="text-2xl font-semibold tracking-tight text-theme-primary md:text-3xl">
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
      className={`relative rounded-2xl border border-theme-soft bg-panel p-5 text-theme-primary shadow-glow transition ${className}`}
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

function Chip({ children, icon: Icon, className = '' }) {
  return (
    <span
      className={`chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${className}`}
    >
      {Icon ? <Icon className="h-3.5 w-3.5 icon-muted" /> : null}
      {children}
    </span>
  )
}

function ProjectsPage({ projects }) {
  return (
    <main className="pt-28">
      <Section id="projects" eyebrow="Projects" title="Let me Finance your interest">
        <div className="grid auto-rows-[1fr] gap-4 md:grid-cols-6">
          {projects.map((p, idx) => {
            const span = idx === 0 ? 'md:col-span-4' : 'md:col-span-3'
            return (
              <TiltCard key={p.title} className={`h-full ${span}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-theme-secondary">{p.title}</div>
                    <div className="mt-2 text-sm text-theme-muted">{p.desc}</div>
                  </div>
                  <Chip className="px-2 py-1 text-xs font-semibold">{p.tag}</Chip>
                </div>

                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-theme-muted">
                  <span>Explore</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </TiltCard>
            )
          })}
        </div>
      </Section>
    </main>
  )
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/' || location.pathname === ''

  const sections = useMemo(
    () => [
      { id: 'home', label: 'Home' },
      { id: 'about', label: 'About' },
      { id: 'experience', label: 'Experience' },
      { id: 'poetry', label: 'Poetry' },
      { id: 'skills', label: 'Skills' },
      { id: 'contact', label: 'Contact' },
    ],
    [],
  )

  const [activeId, setActiveId] = useState('home')
  const [expanded, setExpanded] = useState(null)
  const [copied, setCopied] = useState(false)
  const appliedTheme = useRef('dark')
  const hydrateTheme = useCallback(() => {
    if (typeof document === 'undefined') return 'dark'
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
  }, [])
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = window.localStorage?.getItem('ck-theme')
    if (stored === 'dark' || stored === 'light') return stored
    const hour = new Date().getHours()
    return hour >= 19 || hour < 6 ? 'dark' : 'light'
  })
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.theme = theme
    window.localStorage?.setItem('ck-theme', theme)
    appliedTheme.current = theme
  }, [theme])

  useEffect(() => {
    appliedTheme.current = hydrateTheme()
  }, [hydrateTheme])

  useEffect(() => {
    if (!isHome) return
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
  }, [isHome, sections])

  const onNavigate = (id) => {
    if (typeof id === 'string' && id.startsWith('/')) {
      navigate(id)
      return
    }

    if (!isHome) {
      navigate('/')
      window.setTimeout(() => {
        const el = document.getElementById(id)
        if (!el) return
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
      return
    }

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

  const poetryBooks = useMemo(
    () => [
      {
        title: 'Fluttering Freedoms',
        coverSrc: `${import.meta.env.BASE_URL}book_cover1.jpg`,
        url: 'https://www.amazon.com/Fluttering-Freedoms-Charvi-Amit-Khandelwal/dp/B0CTGMTCCM',
        description:
          'The media shows us. We believe. The internet reports verified data. We trust. Politicians purposefully incite us. We become polarised, divided. We are the puppets played on strings. We must arise to be better than this. Fluttering Freedoms will be a breath of fresh air from the polluting influences of today’s world. I encourage you to think. To analyze. To mentally debate. Before you blindly believe anything. Ever again.',
      },
      {
        title: 'Metamorphosis: Stars of hope in the dark night',
        coverSrc: `${import.meta.env.BASE_URL}book_cover2.jpg`,
        url: 'https://www.amazon.com/gp/product/B09QNCY3B7?ref_=dbs_m_mng_rwt_calw_tpbk_0&storeType=ebooks',
        description:
          'A fourteen-year-old, struggles against her parents infringing her right to education. Another teenager fights his battles against body image. A girl voices against her comparative lack of freedom. And I face my bout against a judgemental, traditional society. Will we come out of the dark? Will we metamorphose? How will we escape the sea of sharks waiting to snark us at every turn?',
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
      <CursorGlow theme={theme} />
      <Nav
        sections={sections}
        activeId={isHome ? activeId : null}
        onNavigate={onNavigate}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="absolute inset-x-0 top-0 -z-20 h-[720px] bg-[radial-gradient(80%_60%_at_50%_0%,rgba(128,0,0,0.22),transparent_70%),radial-gradient(65%_55%_at_80%_15%,rgba(161,27,31,0.18),transparent_70%),radial-gradient(75%_55%_at_10%_10%,rgba(118,118,118,0.14),transparent_70%)]" />

      {isHome ? (
        <main className="pt-28">
        <section id="home" className="scroll-mt-24 px-4 pb-10 pt-10 md:pb-14 md:pt-16">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                >
                  <GraduationCap className="h-4 w-4 icon-muted" />
                  Econ + Astrophysics @ University of Chicago
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.06 }}
                  className="mt-5 text-4xl font-semibold tracking-tight text-theme-primary sm:text-5xl"
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
                  className="mt-4 max-w-xl text-base leading-relaxed text-theme-muted"
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
                    className="primary-button group inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
                  >
                    Let’s connect
                    <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onNavigate('about')}
                    className="tinted-button inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold"
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
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="absolute -inset-2 -z-10 rounded-full bg-gradient-to-br from-uchicago-maroon/25 via-uchicago-maroonLight/20 to-uchicago-gray/20 blur-xl" />
                    <div className="rounded-full border border-theme-soft bg-panel p-1 shadow-glow">
                      <img
                        src={`${import.meta.env.BASE_URL}headshot.jpg`}
                        alt="Headshot"
                        className="h-40 w-40 rounded-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                  <TiltCard className="w-full p-4">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <div className="text-sm font-semibold text-theme-secondary">Focus</div>
                        <div className="mt-1 text-xl font-semibold tracking-tight text-theme-primary">
                          Investment Banking
                        </div>
                        <div className="mt-1.5 text-sm leading-relaxed text-theme-muted">
                          I love high-ownership work, sharp narratives, and turning messy data into clear
                          decisions.
                        </div>
                      </div>
                      <div className="rounded-2xl border border-theme-soft bg-panel p-3">
                        <Linkedin className="h-6 w-6 icon-muted" />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-theme-soft bg-layer p-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-subtle">
                          Studies
                        </div>
                        <div className="mt-2 text-sm font-semibold text-theme-secondary">
                          Economics + Astrophysics
                        </div>
                        <div className="mt-1 text-sm text-theme-muted">University of Chicago</div>
                      </div>
                      <div className="rounded-2xl border border-theme-soft bg-layer p-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-subtle">
                          Strengths
                        </div>
                        <div className="mt-2 text-sm font-semibold text-theme-secondary">Analysis • Research</div>
                        <div className="mt-1 text-sm text-theme-muted">Fast learning, clear communication</div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl border border-theme-soft bg-layer p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-subtle">
                            Portfolio
                          </div>
                          <div className="mt-2 text-sm font-semibold text-theme-secondary">
                            {projects.length} positions
                          </div>
                        </div>
                        <div className="rounded-xl border border-theme-soft bg-panel p-2">
                          <LineChart className="h-5 w-5 icon-muted" />
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <Section id="about" eyebrow="About" title="A finance-forward mindset with a scientific edge">
          <div className="grid gap-6 md:grid-cols-2">
            <TiltCard>
              <div className="text-sm leading-relaxed text-theme-muted">
                Rising junior at the University of Chicago studying Economics & Astrophysics (Dean’s List). I
                bring mathematical modeling, research discipline, and people-focused leadership from Emory,
                SEO, and Pioneer Academics.
              </div>
              <div className="mt-4 text-sm leading-relaxed text-theme-muted">
                I thrive when big questions need structured thinking—breaking down diligence, market mapping,
                or storytelling into crisp deliverables that help clients decide faster.
              </div>
            </TiltCard>
            <div className="grid gap-4">
              <TiltCard>
                <div className="flex items-start gap-3">
                  <div className="rounded-xl border border-theme-soft bg-panel p-2">
                    <BriefcaseBusiness className="h-5 w-5 icon-muted" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-theme-secondary">Why finance</div>
                    <div className="mt-1 text-sm text-theme-muted">
                      I’m drawn to fast-paced environments that reward precision, ownership, and sharp
                      thinking.
                    </div>
                  </div>
                </div>
              </TiltCard>
              <TiltCard>
                <div className="flex items-start gap-3">
                  <div className="rounded-xl border border-theme-soft bg-panel p-2">
                    <Telescope className="h-5 w-5 icon-muted" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-theme-secondary">Why astrophysics</div>
                    <div className="mt-1 text-sm text-theme-muted">
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
                        <div className="rounded-xl border tinted-button p-2">
                          <Icon className="h-5 w-5 icon-muted" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-theme-secondary">{item.title}</div>
                          <div className="mt-1 text-sm text-theme-subtle">{item.org}</div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-subtle">
                        {item.time}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2">
                      {item.bullets.map((b) => (
                        <div key={b} className="text-sm text-theme-muted">
                          {b}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-theme-muted">
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
                        <div className="px-5 pb-5 text-sm leading-relaxed text-theme-muted">
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

        <Section id="poetry" eyebrow="Poetry" title="Books I’ve written">
          <div className="grid gap-6 md:grid-cols-2">
            {poetryBooks.map((book) => (
              <TiltCard key={book.title} className="p-0">
                <a
                  href={book.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl p-5"
                >
                  <div className="grid gap-5 sm:grid-cols-[180px_1fr] sm:items-start">
                    <div className="rounded-2xl border border-theme-soft bg-layer p-2">
                      <img
                        src={book.coverSrc}
                        alt={`${book.title} book cover`}
                        className="aspect-[2/3] w-full rounded-xl object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    <div>
                      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-theme-subtle">
                        Poetry
                      </div>
                      <div className="mt-2 text-2xl font-semibold tracking-tight text-theme-primary">
                        {book.title}
                      </div>
                      <div className="mt-3 text-sm leading-relaxed text-theme-muted">{book.description}</div>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-theme-muted">
                        <span>View on Amazon</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </a>
              </TiltCard>
            ))}
          </div>
        </Section>

        <Section id="skills" eyebrow="Skills" title="What I bring">
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <motion.span
                key={s}
                whileHover={{ y: -2 }}
                className="chip inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold"
              >
                {s}
              </motion.span>
            ))}
          </div>
        </Section>

        <Section id="contact" eyebrow="Contact" title="Say hello">
          <div className="grid gap-6 md:grid-cols-2">
            <TiltCard>
              <div className="text-sm leading-relaxed text-theme-muted">
                For opportunities, collaborations, or a quick chat—reach out anytime.
              </div>
              <div className="mt-5 grid gap-3">
                <a
                  className="inline-flex items-center justify-between gap-3 rounded-xl border tinted-button px-4 py-3 text-sm font-semibold transition"
                  href="tel:+14705549895"
                >
                  <span className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    +1 (470) 554-9895
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  className="inline-flex items-center justify-between gap-3 rounded-xl border tinted-button px-4 py-3 text-sm font-semibold transition"
                  href="mailto:charvii.khandelwal@gmail.com"
                >
                  <span className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    charvii.khandelwal@gmail.com
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  className="inline-flex items-center justify-between gap-3 rounded-xl border tinted-button px-4 py-3 text-sm font-semibold transition"
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
              <div className="text-sm font-semibold text-theme-secondary">Quick action</div>
              <div className="mt-2 text-sm text-theme-muted">
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
                  className="primary-button inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
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
                      className="text-sm font-semibold text-theme-secondary"
                    >
                      Copied
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
              <div className="mt-6 text-xs text-theme-subtle">
                Swap the placeholder email/links with her real details when ready.
              </div>
            </TiltCard>
          </div>
        </Section>

        <footer className="px-4 pb-12">
          <div className="mx-auto max-w-6xl border-t border-theme-soft pt-6 text-sm text-theme-subtle">
            © {new Date().getFullYear()} Charvi Khandelwal
          </div>
        </footer>
        </main>
      ) : (
        <ProjectsPage projects={projects} />
      )}
    </div>
  )
}

export default App
