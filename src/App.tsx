import { useState, useEffect, useRef } from "react";

const NAVY = "#14253D";
const NAVY2 = "#263B58";
const CREAM = "#F4F0E6";
const MUTED = "#667080";

// ── Data ──────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "About",    href: "#about" },
  { label: "Work",     href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "Fine Art", href: "#art" },
  { label: "Contact",  href: "#contact" },
];

const FEATURED = [
  {
    num: "01", category: "Product Design", title: "Interaction Systems",
    desc: "User-centered design exploring the boundary between digital interfaces and physical form. Research-driven prototyping across mobile, web, and tangible media.",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=420&fit=crop&auto=format",
    alt: "Abstract product design prototype", href: "design.html",
  },
  {
    num: "02", category: "Fine Art", title: "Studio Practice",
    desc: "Traditional and experimental works spanning drawing, painting, and mixed media. A sustained inquiry into observation, memory, and material resistance.",
    img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=420&fit=crop&auto=format",
    alt: "Fine art studio works", href: "art-portfolio.html",
  },
  {
    num: "03", category: "Research", title: "Manufacturing + Making",
    desc: "Interdisciplinary research bridging mathematics, engineering, and craft. Presented at university symposia on computational thinking and physical fabrication.",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=420&fit=crop&auto=format",
    alt: "Research presentation on manufacturing", href: "research.html",
  },
];

// ── Custom Cursor ─────────────────────────────────────────────────────────────

function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
        }
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={ref} className="xp-cursor" aria-hidden="true">
      <span className="xp-cursor-shadow" />
      <span className="xp-cursor-fill" />
    </div>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const handler = () => {
      const scrollY = window.scrollY + 100;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) current = id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, [ids]);
  return active;
}

// ── Snake Path ────────────────────────────────────────────────────────────────
// r=9 → pitch=18px. Straight segments: 28px wide (x: 14→42).
// Perfect semicircular arcs, tightly packed, flush right.

const SNAKE_R = 9;
const SNAKE_PITCH = SNAKE_R * 2;
const SNAKE_LX = 14;
const SNAKE_RX = 42;
const SNAKE_LOOPS = 22;

const SNAKE_D = (() => {
  let d = `M ${SNAKE_RX} 8 L ${SNAKE_LX} 8`;
  let y = 8;
  for (let i = 0; i < SNAKE_LOOPS; i++) {
    if (i % 2 === 0) {
      d += ` A ${SNAKE_R} ${SNAKE_R} 0 0 0 ${SNAKE_LX} ${y + SNAKE_PITCH}`;
      d += ` L ${SNAKE_RX} ${y + SNAKE_PITCH}`;
    } else {
      d += ` A ${SNAKE_R} ${SNAKE_R} 0 0 1 ${SNAKE_RX} ${y + SNAKE_PITCH}`;
      d += ` L ${SNAKE_LX} ${y + SNAKE_PITCH}`;
    }
    y += SNAKE_PITCH;
  }
  return d;
})();

function SnakePath() {
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const ghostRef = useRef<SVGPathElement>(null);
  const lenRef = useRef(0);

  useEffect(() => {
    if (pathRef.current) lenRef.current = pathRef.current.getTotalLength();
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      const len = lenRef.current;
      if (len > 0 && pathRef.current && dotRef.current) {
        const drawn = len * progress;
        pathRef.current.style.strokeDashoffset = String(len - drawn);
        const pt = pathRef.current.getPointAtLength(Math.min(drawn, len - 0.5));
        dotRef.current.setAttribute("cx", String(pt.x));
        dotRef.current.setAttribute("cy", String(pt.y));
        dotRef.current.style.opacity = progress > 0.005 ? "1" : "0";
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  const totalHeight = 8 + SNAKE_LOOPS * SNAKE_PITCH + 2;

  return (
    <div
      className="fixed top-0 right-0 z-40 pointer-events-none"
      style={{ width: 52, height: "100vh", overflow: "hidden" }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 52 ${totalHeight}`}
        preserveAspectRatio="xMidYMin meet"
        style={{ width: "100%", height: "100%" }}
      >
        {/* Ghost */}
        <path
          ref={ghostRef}
          d={SNAKE_D}
          fill="none"
          stroke={`${NAVY2}30`}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Filled */}
        <path
          ref={pathRef}
          d={SNAKE_D}
          fill="none"
          stroke={NAVY2}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={lenRef.current || 9999}
          strokeDashoffset={lenRef.current || 9999}
        />
        {/* Glowing dot */}
        <circle
          ref={dotRef}
          r="5"
          fill="white"
          opacity="0"
          style={{ filter: `drop-shadow(0 0 4px ${NAVY2}) drop-shadow(0 0 8px ${NAVY2}80)` }}
        />
      </svg>
    </div>
  );
}

// ── Logo ──────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: 34, height: 34,
        background: NAVY,
        border: `1px solid ${NAVY}`,
      }}
    >
      <span className="font-display italic text-[11px] leading-none" style={{ color: CREAM }}>JS</span>
    </div>
  );
}

// ── Aero Bubble Nav ───────────────────────────────────────────────────────────

function NavBubble({ item, isActive }: { item: typeof NAV_ITEMS[0]; isActive: boolean }) {
  const [hovered, setHovered] = useState(false);
  const active = isActive || hovered;

  return (
    <a
      href={item.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center justify-center font-medium tracking-wide select-none"
      style={{
        padding: hovered ? "8px 18px" : "7px 16px",
        borderRadius: 4,
        fontSize: 13,
        color: active ? CREAM : NAVY,
        background: active ? NAVY : "rgba(255,255,255,0.72)",
        border: `1px solid ${active ? NAVY : "#D8D3C8"}`,
        boxShadow: hovered ? "0 5px 14px rgba(20,37,61,0.12)" : "0 1px 3px rgba(20,37,61,0.05)",
        transform: hovered ? "translateY(-1px)" : "none",
        zIndex: hovered ? 10 : 1,
        transition: "all 0.18s ease",
      }}
    >
      <span className="relative z-10">{item.label}</span>
    </a>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function Nav({ scrolled, activeSection }: { scrolled: boolean; activeSection: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(244,240,230,0.96)" : "transparent",
        
        borderBottom: scrolled ? "1px solid #D8D3C8" : "none",
        boxShadow: scrolled ? "0 2px 14px rgba(20,37,61,0.08)" : "none",
      }}
    >
      <nav className="max-w-6xl mx-auto px-6 lg:px-10 flex items-center h-16">
        {/* Wordmark */}
        <a href="#about" className="flex items-center gap-2.5 mr-auto shrink-0">
          <Logo />
          <span
            className="font-display text-lg tracking-wide transition-colors duration-200"
            style={{ color: NAVY }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = NAVY2; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#14253D"; }}
          >
            Jianna Shao
          </span>
        </a>

        {/* Bubble nav — pushed right with overflow visible so scaling bubbles don't clip */}
        <ul className="hidden md:flex items-center gap-2 ml-auto" style={{ overflow: "visible" }}>
          {NAV_ITEMS.map((item) => (
            <li key={item.label} style={{ overflow: "visible" }}>
              <NavBubble item={item} isActive={activeSection === item.href.replace("#", "")} />
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1 ml-auto"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-px transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} style={{ background: "#14253D" }} />
          <span className={`block w-5 h-px transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} style={{ background: "#14253D" }} />
          <span className={`block w-5 h-px transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} style={{ background: "#14253D" }} />
        </button>
      </nav>

      {menuOpen && (
        <div
          className="md:hidden px-6 py-6 flex flex-col gap-4"
          style={{ background: CREAM, borderTop: `1px solid #D8D3C8` }}
        >
          {NAV_ITEMS.map((item) => (
            <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}
              className="text-sm font-medium tracking-wide" style={{ color: NAVY }}>
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  const [hovered, setHovered] = useState(false);
  return (
    <section id="about" className="min-h-screen flex flex-col justify-end pt-16">
      <div
        className="relative flex-1 flex flex-col justify-center items-start overflow-hidden min-h-[70vh]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1400&h=900&fit=crop&auto=format"
          alt="Jianna Shao"
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-[2s]"
          style={{ opacity: 0.18, transform: hovered ? "scale(1.04)" : "scale(1)" }}
        />
        {/* Aero glass gradient overlay */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, rgba(244,240,230,0) 0%, rgba(244,240,230,0.35) 55%, rgba(244,240,230,0.96) 100%)"
        }} />

        <div className="relative max-w-6xl mx-auto w-full px-6 lg:px-10 pb-16 pt-32">
          <p className="text-xs tracking-[0.2em] uppercase font-medium mb-6" style={{ color: NAVY2 }}>
            Wesleyan University — Class of 2028
          </p>
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-8 max-w-4xl" style={{ color: NAVY }}>
            Jianna
            <br />
            <span className="italic" style={{ color: NAVY2 }}>Shao</span>
          </h1>
          <p className="text-base md:text-lg leading-relaxed font-light max-w-md" style={{ color: MUTED }}>
            Artist, designer, researcher, and creative technologist. Pursuing mathematics, art studio, and integrative design at Wesleyan.
          </p>
          <div className="mt-12 flex items-center gap-6">
            <a
              href="#work"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-200"
              style={{
                background: NAVY,
                color: CREAM, border: `1px solid ${NAVY}`,
                boxShadow: "none",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              View Work
            </a>
            <a href="#contact" className="text-sm font-medium transition-colors" style={{ color: MUTED }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = NAVY2; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = MUTED; }}>
              Contact →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Work Cards ────────────────────────────────────────────────────────────────

function WorkCard({ item, index }: { item: typeof FEATURED[0]; index: number }) {
  const { ref, visible } = useFadeIn();
  const [hovered, setHovered] = useState(false);
  return (
    <article
      ref={ref}
      className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${index % 2 === 1 ? "md:[direction:rtl]" : ""}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <a
        href={item.href}
        className="block overflow-hidden group relative rounded-2xl"
        style={{ direction: "ltr", boxShadow: hovered ? "0 20px 48px rgba(38,59,88,0.25), 0 4px 16px rgba(38,59,88,0.15)" : "0 4px 20px rgba(38,59,88,0.1)" , transition: "box-shadow 0.3s ease" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img src={item.img} alt={item.alt} className="w-full h-72 md:h-80 object-cover transition-transform duration-700 group-hover:scale-105" />
        {/* Glass overlay */}
        <div className="absolute inset-0 transition-opacity duration-300 rounded-2xl"
          style={{ background: `linear-gradient(to top, rgba(20,37,61,0.5) 0%, transparent 60%), ${hovered ? `${NAVY2}18` : "transparent"}` }} />
        <div
          className="absolute bottom-4 right-4 text-xs tracking-widest uppercase font-medium px-3 py-1.5 rounded-full transition-all duration-300"
          style={{
            background: NAVY,
            color: CREAM, border: `1px solid ${NAVY}`,
            boxShadow: "none",
            opacity: hovered ? 1 : 0, transform: hovered ? "translateY(0)" : "translateY(6px)",
          }}
        >
          Explore →
        </div>
      </a>
      <div style={{ direction: "ltr" }}>
        <div className="flex items-baseline gap-4 mb-4">
          <span className="font-display italic text-5xl leading-none" style={{ color: `${NAVY2}55` }}>{item.num}</span>
          <span className="text-xs tracking-[0.15em] uppercase font-medium" style={{ color: NAVY2 }}>{item.category}</span>
        </div>
        <h3 className="font-display text-3xl md:text-4xl mb-4" style={{ color: NAVY }}>{item.title}</h3>
        <p className="leading-relaxed text-sm md:text-base mb-6 font-light" style={{ color: MUTED }}>{item.desc}</p>
        <a href={item.href}
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase font-medium border-b pb-0.5 transition-all duration-200"
          style={{ color: NAVY, borderColor: `${NAVY2}55` }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = NAVY2; el.style.borderColor = NAVY2; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = "#14253D"; el.style.borderColor = `${NAVY2}55`; }}
        >
          Explore →
        </a>
      </div>
    </article>
  );
}

function Work() {
  const { ref, visible } = useFadeIn();
  return (
    <section id="work" className="max-w-6xl mx-auto px-6 lg:px-10 py-24 md:py-36">
      <div ref={ref} className={`flex items-end justify-between mb-16 pb-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        style={{ borderBottom: `1px solid ${NAVY2}30` }}>
        <div>
          <p className="text-xs tracking-[0.2em] uppercase font-medium mb-2" style={{ color: NAVY2 }}>Selected Work</p>
          <h2 className="font-display text-4xl md:text-5xl" style={{ color: NAVY }}>Featured Projects</h2>
        </div>
        <span className="hidden md:block text-xs tracking-widest uppercase" style={{ color: MUTED }}>2024 – 2026</span>
      </div>
      <div className="flex flex-col gap-20">
        {FEATURED.map((item, i) => <WorkCard key={item.num} item={item} index={i} />)}
      </div>
    </section>
  );
}

// ── Research ──────────────────────────────────────────────────────────────────

function Research() {
  const { ref, visible } = useFadeIn();
  const projects = [
    {
      number: "01",
      type: "Research",
      title: "WAAM Curvature Study",
      text: "Investigating how toolpath curvature affects bead geometry in robotic wire arc additive manufacturing.",
      href: "research.html",
    },
    {
      number: "02",
      type: "Creative Coding",
      title: "Interactive Aquarium",
      text: "A hand-drawn, interactive web environment combining animation, illustration, and playful interface design.",
      href: "aquarium.html",
    },
    {
      number: "03",
      type: "3D + Art",
      title: "Virtual Art Gallery",
      text: "A navigable Three.js gallery translating a physical studio practice into an interactive digital space.",
      href: "art.html",
    },
    {
      number: "04",
      type: "Mathematics + CS",
      title: "Computational Modeling",
      text: "Projects exploring mathematical structure through code, visualization, and computational problem solving.",
      href: "#work",
    },
  ];

  return (
    <section id="projects" className="max-w-6xl mx-auto px-6 lg:px-10 py-24 md:py-36">
      <div ref={ref} className={`mb-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <p className="text-xs tracking-[0.2em] uppercase font-medium mb-2" style={{ color: NAVY2 }}>Selected Projects</p>
        <h2 className="font-display text-4xl md:text-5xl mb-4" style={{ color: NAVY }}>Projects Across Disciplines</h2>
        <p className="max-w-2xl font-light leading-relaxed" style={{ color: MUTED }}>
          A selection of work spanning research, design, art, creative technology, and mathematics.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {projects.map((project, index) => (
          <a
            key={project.number}
            href={project.href}
            className="project-box group block p-7 md:p-8"
            style={{ transitionDelay: `${index * 70}ms` }}
          >
            <div className="flex items-start justify-between gap-4 mb-10">
              <span className="font-display italic text-4xl leading-none" style={{ color: NAVY2 }}>{project.number}</span>
              <span className="text-[10px] tracking-[0.18em] uppercase font-medium" style={{ color: MUTED }}>{project.type}</span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl mb-3" style={{ color: NAVY }}>{project.title}</h3>
            <p className="text-sm leading-relaxed font-light max-w-md" style={{ color: MUTED }}>{project.text}</p>
            <span className="inline-flex mt-7 text-xs tracking-widest uppercase font-medium" style={{ color: NAVY }}>View Project →</span>
          </a>
        ))}
      </div>
    </section>
  );
}

// ── Art ───────────────────────────────────────────────────────────────────────

function Art() {
  const { ref, visible } = useFadeIn();
  return (
    <section id="art" className="max-w-6xl mx-auto px-6 lg:px-10 py-24 md:py-36">
      <div ref={ref} className={`mb-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <p className="text-xs tracking-[0.2em] uppercase font-medium mb-2" style={{ color: NAVY2 }}>Fine Art</p>
        <h2 className="font-display text-4xl md:text-5xl mb-4" style={{ color: NAVY }}>Studio & Gallery</h2>
        <p className="max-w-xl font-light leading-relaxed" style={{ color: MUTED }}>
          A dual practice: traditional media rooted in sustained observation, and a 3D gallery exploring form in virtual space.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {[
          { href: "art-portfolio.html", img: "https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=700&h=500&fit=crop&auto=format", alt: "Traditional portfolio", sub: "Traditional", title: "Portfolio" },
          { href: "art.html", img: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=700&h=500&fit=crop&auto=format", alt: "3D Gallery", sub: "Digital", title: "3D Gallery" },
        ].map((card) => (
          <a
            key={card.title} href={card.href}
            className="group relative overflow-hidden h-96 block"
            style={{ borderRadius: 20, boxShadow: "0 4px 20px rgba(38,59,88,0.12)", transition: "box-shadow 0.3s, transform 0.3s" }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 20px 48px rgba(38,59,88,0.28)"; el.style.transform = "translateY(-4px)"; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 4px 20px rgba(38,59,88,0.12)"; el.style.transform = "translateY(0)"; }}
          >
            <img src={card.img} alt={card.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90" />
            <div className="absolute inset-0 transition-all duration-300" style={{ background: "linear-gradient(to top, rgba(20,37,61,0.75) 0%, transparent 55%)" }} />
            {/* Aero glass bottom bar on hover */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-7">
              <p className="text-xs tracking-widest uppercase mb-1" style={{ color: NAVY2 }}>{card.sub}</p>
              <h3 className="font-display text-2xl text-white">{card.title}</h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

// ── Contact ───────────────────────────────────────────────────────────────────

function Contact() {
  const { ref, visible } = useFadeIn();
  return (
    <section id="contact" style={{ borderTop: `1px solid ${NAVY2}25` }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24 md:py-32">
        <div ref={ref} className={`grid md:grid-cols-2 gap-16 items-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div>
            <p className="text-xs tracking-[0.2em] uppercase font-medium mb-4" style={{ color: NAVY2 }}>Contact</p>
            <h2 className="font-display text-4xl md:text-5xl mb-6" style={{ color: NAVY }}>Let's Connect</h2>
            <p className="leading-relaxed font-light" style={{ color: MUTED }}>
              I'm always interested in conversations about design, research, and creative collaboration. Reach out via email or find me on the platforms below.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { label: "Email", value: "bluejjay25@gmail.com", href: "mailto:bluejjay25@gmail.com" },
              { label: "LinkedIn", value: "jianna-shao-7a7360349", href: "https://linkedin.com/in/jianna-shao-7a7360349/" },
              { label: "Instagram", value: "@whenbluejayscry", href: "https://instagram.com/whenbluejayscry" },
            ].map((item) => (
              <a
                key={item.label} href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                className="group flex items-center justify-between pb-4 transition-all duration-200"
                style={{ borderBottom: `1px solid ${NAVY2}25` }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderBottomColor = NAVY2; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderBottomColor = `${NAVY2}25`; }}
              >
                <span className="text-xs tracking-widest uppercase transition-colors duration-200 group-hover:text-[#263B58]" style={{ color: MUTED }}>{item.label}</span>
                <span className="text-sm font-light flex items-center gap-2" style={{ color: NAVY }}>
                  {item.value}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: NAVY2 }}>→</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${NAVY2}20`, background: "rgba(255,255,255,0.4)" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8 flex items-center justify-between">
        <span className="font-display text-sm" style={{ color: MUTED }}>Jianna Shao</span>
        <span className="text-xs" style={{ color: MUTED }}>© 2026 · All rights reserved</span>
      </div>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

const SECTION_IDS = ["about", "work", "projects", "art", "contact"];

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useActiveSection(SECTION_IDS);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="min-h-screen">
      <CustomCursor />
      <Nav scrolled={scrolled} activeSection={activeSection} />
      <SnakePath />
      <main>
        <Hero />
        <Work />
        <Research />
        <Art />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
