import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Blocks,
  CalendarDays,
  Check,
  Compass,
  ExternalLink,
  Menu,
  MoveUpRight,
  Radio,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import EventMap from "./components/EventMap";
import RealmScene, { type RealmControls } from "./components/RealmScene";
import Reveal from "./components/Reveal";
import { eventTracks, packages, schedule, workshops } from "./data";

function SectionLabel({ children, number }: { children: string; number: string }) {
  return (
    <div className="section-label mono">
      <span>{number} <i aria-hidden="true">/</i> {children}</span>
      <span className="section-label-mark">NEXUS · THE AWAKENING</span>
    </div>
  );
}

function Countdown() {
  const [now, setNow] = useState(() => Date.now());
  const target = new Date("2027-03-12T09:00:00+05:30").getTime();
  const remaining = Math.max(0, target - now);
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  });

  return (
    <div className="countdown" aria-label={`${days} days until NEXUS 2027`}>
      {[["D", days], ["H", hours], ["M", minutes], ["S", seconds]].map(([unit, value]) => (
        <div className="countdown-unit" key={unit}>
          <span className="countdown-number">{unit === "D" ? String(value).padStart(3, "0") : String(value).padStart(2, "0")}</span>
          <span className="countdown-label mono">{unit}</span>
        </div>
      ))}
    </div>
  );
}

function FestivalHeader() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  const links = [
    ["About", "#story"],
    ["Events", "#world-map"],
    ["Schedule", "#schedule"],
    ["Workshops", "#workshops"],
    ["Sponsors", "#sponsors"],
    ["Teams", "#guilds"],
    ["Team", "#crew"],
    ["Passes", "#passes"],
  ];

  return (
    <header className="site-header">
      <Link to="/" className="wordmark" aria-label="NEXUS home">
        <span className="wordmark-seal">N</span>
        <span>NEXUS<span className="wordmark-small">/ 2027</span></span>
      </Link>
      <button
        className="mobile-menu-toggle"
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <nav className={`main-nav${open ? " main-nav-open" : ""}`} aria-label="Main navigation">
        {links.map(([label, href]) => (
          <a key={href} href={href} onClick={closeMenu}>{label}</a>
        ))}
        <a className="nav-pass" href="#passes" onClick={closeMenu}>Get your pass <ArrowUpRight size={13} /></a>
      </nav>
    </header>
  );
}

function IntroOverlay({
  onEnter,
  onSkip,
  entering,
}: {
  onEnter: () => void;
  onSkip: () => void;
  entering: boolean;
}) {
  return (
    <motion.div
      className={`intro-overlay${entering ? " intro-overlay-entering" : ""}`}
      initial={{ opacity: 1 }}
      animate={{ opacity: entering ? 0 : 1, scale: entering ? 1.04 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.85, ease: [0.77, 0, 0.18, 1] }}
      aria-label="NEXUS cinematic introduction"
    >
      <div className="intro-vignette" />
      <div className="intro-top mono"><span><span className="live-dot" /> SIGNAL DETECTED</span><span>UNKNOWN WORLD / 001</span></div>
      <motion.div
        className="intro-copy"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: entering ? 0 : 1, y: entering ? -24 : 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <div className="intro-sigil"><span /><span /><span /></div>
        <p className="intro-kicker mono">A TRANSMISSION FROM BEYOND THE KNOWN</p>
        <h1>A NEW REALM<br /><span>AWAITS</span></h1>
        <p className="intro-description">Where imagination meets innovation.</p>
        <div className="intro-actions">
          <button className="button button-primary" onClick={onEnter} type="button" disabled={entering}>
            <span>ENTER THE REALM</span><MoveUpRight size={15} />
          </button>
          <a className="intro-secondary" href="#world-map" onClick={onSkip}><span>EXPLORE EVENTS</span><ArrowDownRight size={14} /></a>
        </div>
      </motion.div>
      <div className="intro-bottom mono">
        <span>ASTERION INSTITUTE · BENGALURU</span>
        <span className="intro-transmission">12—14 MARCH 2027</span>
      </div>
      {!entering && (
        <button className="skip-intro mono" onClick={onSkip} type="button">
          SKIP INTRO <ArrowRight size={12} />
        </button>
      )}
    </motion.div>
  );
}

function Hero() {
  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <div className="hero-scene" aria-hidden="true" />
      <div className="hero-grain" />
      <div className="hero-topline mono">
        <span><span className="live-dot" /> THE REALM IS OPEN</span>
        <span>ASTERION INSTITUTE · BENGALURU</span>
      </div>
      <div className="hero-copy">
        <motion.p className="hero-eyebrow mono" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Sparkles size={12} /> NEXUS TECHFEST · 12—14 MAR 2027
        </motion.p>
        <motion.h1 id="hero-title" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
          THE<br /><span>AWAKENING</span><sup>✳</sup>
        </motion.h1>
        <motion.p className="hero-subtitle" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          A world between worlds.<br />A future waiting to be made.
        </motion.p>
        <motion.div className="hero-actions" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <a href="#world-map" className="button button-primary">EXPLORE THE WORLD <ArrowUpRight size={15} /></a>
          <a href="#schedule" className="button button-glass"><CalendarDays size={15} /> VIEW THE SCHEDULE</a>
        </motion.div>
        <div className="hero-location mono"><span>03 DAYS</span><i /> <span>06 REALMS</span><i /> <span>ONE SHARED FUTURE</span></div>
      </div>
      <div className="hero-side mono"><span>REALM NO. 01</span><span>THE GATEWAY</span><span>SCROLL TO EXPLORE <ArrowDown size={12} /></span></div>
      <div className="hero-bottomline">
        <p>“The world ended. So we built a new one.”</p>
        <div className="hero-countdown-label mono">NEXT GATE OPENS IN <Countdown /></div>
      </div>
      <div className="hero-scroll" aria-hidden="true"><span /></div>
    </section>
  );
}

function StorySection() {
  return (
    <section className="story-section section-padding" id="story">
      <SectionLabel number="01">THE AWAKENING</SectionLabel>
      <div className="story-layout">
        <Reveal className="story-heading">
          <p className="eyebrow mono">THE OLD WORLD WENT QUIET.</p>
          <h2>Something<br />new is <em>calling.</em></h2>
        </Reveal>
        <Reveal className="story-narrative" delay={0.12}>
          <div className="story-symbol"><Radio size={21} /><span>INCOMING TRANSMISSION</span></div>
          <p className="story-lede">The signal is broken. The city is scattered. The next chapter belongs to whoever dares to make it.</p>
          <p>NEXUS is three days inside a world that needs a new story. Explore a realm built from technology, imagination, and the people who refuse to look away. Join a crew, take on a challenge, learn something impossible, and leave the signal brighter than you found it.</p>
          <a className="text-link" href="#world-map">READ THE FIELD GUIDE <ArrowUpRight size={14} /></a>
        </Reveal>
      </div>
      <div className="story-quote">
        <span className="quote-mark">“</span>
        <p>We weren’t waiting for the future.<br /><em>We were making it.</em></p>
        <span className="mono">— ENTRY 001, THE FOUNDERS</span>
      </div>
    </section>
  );
}

function EventExplorer({
  activeEvent,
  setActiveEvent,
}: {
  activeEvent: (typeof eventTracks)[number];
  setActiveEvent: (event: (typeof eventTracks)[number]) => void;
}) {
  const EventIcon = activeEvent.icon;
  return (
    <section className="events-section section-padding" id="world-map">
      <SectionLabel number="02">CHOOSE YOUR REALM</SectionLabel>
      <div className="section-heading">
        <div><p className="eyebrow mono">SIX GATES. SIX CHALLENGES.</p><h2>Find your <em>world.</em></h2></div>
        <p className="section-intro">The map is live. Choose a signal to reveal its location, mission, and time in the realm.</p>
      </div>
      <div className="realm-explorer">
        <div className="map-area">
          <EventMap events={eventTracks} activeId={activeEvent.id} onSelect={(id) => {
            const found = eventTracks.find((event) => event.id === id);
            if (found) setActiveEvent(found);
          }} />
          <div className="map-legend mono"><span><i /> SIGNAL ACTIVE</span><span>SELECT A GATE TO DECODE</span></div>
        </div>
        <aside className="realm-panel" aria-live="polite">
          <div className="realm-panel-top mono"><span>REALM DATA / {String(eventTracks.indexOf(activeEvent) + 1).padStart(2, "0")}</span><span>● ONLINE</span></div>
          <div className="realm-symbol" style={{ "--event-color": activeEvent.accent } as CSSProperties}><EventIcon size={25} strokeWidth={1.35} /></div>
          <p className="realm-district mono">{activeEvent.district} <span>·</span> {activeEvent.category}</p>
          <h3>{activeEvent.name}</h3>
          <p className="realm-description">{activeEvent.description}</p>
          <div className="realm-facts">
            <div><span className="mono">GATE OPENS</span><strong>{activeEvent.day} · {activeEvent.time}</strong></div>
            <div><span className="mono">LOCATION</span><strong>{activeEvent.venue}</strong></div>
            <div><span className="mono">PARTY SIZE</span><strong>{activeEvent.reward}</strong></div>
          </div>
          <a className="button button-primary realm-action" href="#passes">JOIN THIS QUEST <ArrowUpRight size={15} /></a>
          <p className="realm-disclaimer mono">SAMPLE FESTIVAL PROGRAM · FINAL DETAILS TO BE CONFIRMED</p>
        </aside>
      </div>
      <div className="event-index" aria-label="Festival events">
        {eventTracks.map((event, index) => {
          const Icon = event.icon;
          return (
            <button
              className={`event-index-item${event.id === activeEvent.id ? " event-index-active" : ""}`}
              key={event.id}
              type="button"
              onClick={() => setActiveEvent(event)}
              aria-pressed={event.id === activeEvent.id}
              style={{ "--event-color": event.accent } as CSSProperties}
            >
              <span className="event-index-number mono">0{index + 1}</span>
              <Icon size={17} strokeWidth={1.5} />
              <span className="event-index-name">{event.name}</span>
              <ArrowUpRight className="event-index-arrow" size={14} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ScheduleSection() {
  const [day, setDay] = useState(1);
  const dayNames = ["THE GATE OPENS", "THE WORLD EXPANDS", "THE SIGNAL RETURNS"];
  return (
    <section className="schedule-section section-padding" id="schedule">
      <SectionLabel number="03">THREE DAYS INSIDE</SectionLabel>
      <div className="section-heading schedule-heading">
        <div><p className="eyebrow mono">YOUR MAP THROUGH THE UNKNOWN</p><h2>Every day, a <em>new chapter.</em></h2></div>
        <p className="section-intro">Three days of making, learning, competing, and staying up too late talking about it.</p>
      </div>
      <div className="schedule-layout">
        <div className="day-tabs" role="tablist" aria-label="Festival schedule day">
          {[1, 2, 3].map((dayNumber) => (
            <button
              className={`day-tab${day === dayNumber ? " day-tab-active" : ""}`}
              id={`day-tab-${dayNumber}`}
              key={dayNumber}
              type="button"
              role="tab"
              aria-selected={day === dayNumber}
              aria-controls="day-schedule"
              onClick={() => setDay(dayNumber)}
            >
              <span className="mono">DAY 0{dayNumber}</span><strong>{dayNumber === 1 ? "12" : dayNumber === 2 ? "13" : "14"} MAR</strong><span>{dayNames[dayNumber - 1]}</span>
              <ArrowRight size={15} />
            </button>
          ))}
          <div className="schedule-note"><Compass size={17} /><p>All times are local time (IST). Room doors open 15 minutes before each session.</p></div>
        </div>
        <div className="schedule-timeline" id="day-schedule" role="tabpanel" aria-labelledby={`day-tab-${day}`}>
          {schedule.filter((item) => item.day === day).map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal className="schedule-row" key={`${day}-${item.time}`} delay={index * 0.045}>
                <span className="schedule-time mono">{item.time}</span>
                <span className="schedule-timeline-dot" />
                <span className="schedule-icon"><Icon size={16} /></span>
                <div className="schedule-event"><h3>{item.title}</h3><p>{item.note}</p></div>
                <span className="schedule-row-arrow"><ArrowUpRight size={15} /></span>
              </Reveal>
            );
          })}
        </div>
      </div>
      <p className="schedule-disclaimer mono">PROGRAM IS A SAMPLE FOR THE FESTIVAL CONCEPT AND SUBJECT TO CHANGE.</p>
    </section>
  );
}

function WorkshopSection() {
  return (
    <section className="workshop-section section-padding" id="workshops">
      <SectionLabel number="04">THE FIELD SCHOOL</SectionLabel>
      <div className="workshop-grid">
        <Reveal className="workshop-copy">
          <p className="eyebrow mono">CURIOSITY IS A SKILL</p>
          <h2>Learn a thing.<br /><em>Make a thing.</em></h2>
          <p>Small rooms, open minds, actual hands-on time. Meet the people who build tomorrow and try it for yourself—no experience required.</p>
          <a className="text-link" href="#passes">SAVE YOUR WORKSHOP SEAT <ArrowUpRight size={14} /></a>
          <div className="workshop-seal"><span>FIELD<br />SCHOOL</span><Sparkles size={16} /></div>
        </Reveal>
        <div className="workshop-list">
          {workshops.map((workshop, index) => (
            <Reveal className="workshop-item" key={workshop.number} delay={index * 0.1}>
              <div className="workshop-item-top mono"><span>{workshop.number}</span><span>{workshop.length}</span></div>
              <p className="workshop-type mono">{workshop.type}</p>
              <h3>{workshop.title}</h3>
              <p className="workshop-description">{workshop.description}</p>
              <a href="#passes" aria-label={`Save a seat for ${workshop.title}`}><ArrowUpRight size={16} /></a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function GuildsSection() {
  return (
    <section className="guilds-section section-padding" id="guilds">
      <SectionLabel number="05">BUILD YOUR PARTY</SectionLabel>
      <div className="section-heading"><div><p className="eyebrow mono">NO HERO GOES IT ALONE</p><h2>Find your <em>guild.</em></h2></div><p className="section-intro">Come with your crew or find your people when you arrive. Everyone has a place in this world.</p></div>
      <div className="guild-grid">
        <Reveal className="guild-card guild-forge"><span className="guild-number mono">GUILD / 001</span><Blocks size={24} /><h3>The Makers</h3><p>Code, hardware, prototypes, and late-night "what ifs." If it can be built, you're already thinking about it.</p><span className="guild-traits mono">ENGINEERS · TINKERERS · BUILDERS</span><span className="guild-orb" /></Reveal>
        <Reveal className="guild-card guild-signal" delay={0.1}><span className="guild-number mono">GUILD / 002</span><AudioLines size={24} /><h3>The Storytellers</h3><p>Designers, artists, filmmakers, and sound-shapers. You make a new world feel like somewhere we belong.</p><span className="guild-traits mono">DESIGNERS · ARTISTS · DREAMERS</span><span className="guild-orb" /></Reveal>
        <Reveal className="guild-card guild-garden" delay={0.2}><span className="guild-number mono">GUILD / 003</span><Sparkles size={24} /><h3>The Restorers</h3><p>Big-picture thinkers making a better future practical. You ask who this helps—and what happens next.</p><span className="guild-traits mono">THINKERS · ORGANIZERS · DOERS</span><span className="guild-orb" /></Reveal>
      </div>
      <p className="guild-note">No team yet? <a href="#passes">Arrive solo. We’ll help you find your party.</a></p>
    </section>
  );
}

const crewMembers = [
  { name: "Aanya Mehta", role: "REALM DIRECTOR", initials: "AM", hue: "violet" },
  { name: "Kabir Rao", role: "QUESTS & EVENTS", initials: "KR", hue: "blue" },
  { name: "Sana Iyer", role: "ART & ATMOSPHERE", initials: "SI", hue: "pink" },
  { name: "Dev Varma", role: "PEOPLE & PARTNERS", initials: "DV", hue: "gold" },
];

function CrewSection() {
  return (
    <section className="crew-section section-padding" id="crew">
      <SectionLabel number="06">YOUR TRANSMISSION CREW</SectionLabel>
      <div className="section-heading"><div><p className="eyebrow mono">THE REAL PEOPLE BEHIND THE PORTAL</p><h2>Humans who <em>care.</em></h2></div><p className="section-intro">A student crew making a little room for everyone else to try something audacious.</p></div>
      <div className="crew-grid">
        {crewMembers.map((person, index) => (
          <Reveal className={`crew-card crew-${person.hue}`} key={person.name} delay={index * 0.08}>
            <div className="crew-portrait"><div className="portrait-halo" /><div className="portrait-person">{person.initials}</div><span className="portrait-id mono">N / 0{index + 1}</span></div>
            <p className="crew-role mono">{person.role}</p><h3>{person.name}</h3>
            <a href="#contact">MEET THE CREW <ArrowUpRight size={12} /></a>
          </Reveal>
        ))}
      </div>
      <p className="content-note mono">CREW NAMES ARE EDITABLE SAMPLE CONTENT.</p>
    </section>
  );
}

function SponsorSection() {
  const names = [
    { mark: "◈", name: "orbit", light: "works" },
    { mark: "✳", name: "FIELDNOTE", light: "" },
    { mark: "✧", name: "good things.", light: "" },
    { mark: "⌁", name: "LOOP LABS", light: "" },
    { mark: "✦", name: "COMMON GROUND", light: "" },
  ];
  return (
    <section className="sponsor-section section-padding" id="sponsors">
      <SectionLabel number="07">ALLIES OF THE SIGNAL</SectionLabel>
      <div className="sponsor-copy">
        <div><p className="eyebrow mono">BUILT WITH, NOT JUST FUNDED BY</p><h2>Good company.<br /><em>Better futures.</em></h2></div>
        <div><p>We partner with people who put real tools, time, and trust in the hands of the next generation. Want to back a brave idea?</p><a href="#contact" className="text-link">BECOME A FESTIVAL PARTNER <ExternalLink size={13} /></a></div>
      </div>
      <div className="sponsor-wall" aria-label="Illustrative festival partners">
        {names.map((item) => <div className="sponsor-logo" key={item.name}><span>{item.mark}</span><strong>{item.name}<i>{item.light}</i></strong></div>)}
      </div>
      <p className="content-note mono">ILLUSTRATIVE PARTNER NAMES — REPLACE WITH CONFIRMED SPONSORS BEFORE PUBLISHING.</p>
    </section>
  );
}

function PassesSection() {
  const [packageChoice, setPackageChoice] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setSubmitted(true);
    setMessage("You’re on the scout list. This demo doesn’t transmit or store your details—registration opens when the festival team connects its booking service.");
  }

  return (
    <section className="passes-section section-padding" id="passes">
      <SectionLabel number="08">CHOOSE YOUR LOADOUT</SectionLabel>
      <div className="section-heading"><div><p className="eyebrow mono">YOUR WAY INTO THE STORY</p><h2>The gate is <em>open.</em></h2></div><p className="section-intro">Every pass gets you in. Pick how many chapters you want to explore.</p></div>
      <div className="pass-grid">
        {packages.map((pass, index) => (
          <article className={`pass-card${pass.featured ? " pass-card-featured" : ""}`} key={pass.name}>
            {pass.featured && <span className="pass-badge mono">THE COMPLETE QUEST <Sparkles size={12} /></span>}
            <p className="pass-number mono">PASS / 0{index + 1}</p>
            <div className="pass-icon"><span>{index === 0 ? "◉" : index === 1 ? "✳" : "⌘"}</span><span className="pass-orbit" /></div>
            <h3>{pass.name}</h3><p className="pass-description">{pass.description}</p>
            <p className="pass-price">{pass.price}<span> / {pass.unit}</span></p>
            <ul>{pass.includes.map((item) => <li key={item}><Check size={13} />{item}</li>)}</ul>
            <button
              className={`button ${pass.featured ? "button-primary" : "button-outline"}`}
              type="button"
              onClick={() => {
                setPackageChoice(pass.name);
                setMessage("");
                document.querySelector("#registration-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
                window.setTimeout(() => document.querySelector<HTMLInputElement>("#registration-name")?.focus({ preventScroll: true }), 450);
              }}
            >CHOOSE {pass.name.toUpperCase()} <ArrowUpRight size={14} /></button>
          </article>
        ))}
      </div>
      <form className="registration-form" id="registration-form" onSubmit={submitRequest}>
        <div className="registration-intro"><p className="eyebrow mono">TRANSMISSION REQUEST / 08</p><h3>Get on the list.</h3><p>We’ll save your interest locally in this demo. No details are sent anywhere.</p></div>
        <label htmlFor="registration-name">Your name<input id="registration-name" name="name" autoComplete="name" required placeholder="First and last name" /></label>
        <label htmlFor="registration-email">Email address<input id="registration-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
        <label htmlFor="registration-pass">Choose a pass<select id="registration-pass" name="package" required value={packageChoice} onChange={(event) => setPackageChoice(event.target.value)}><option value="">Select a pass</option>{packages.map((pass) => <option key={pass.name}>{pass.name}</option>)}</select></label>
        <button className="button button-primary registration-submit" type="submit" disabled={submitted}>{submitted ? "REQUEST RECEIVED" : "REQUEST A PASS"} {submitted ? <Check size={14} /> : <ArrowUpRight size={14} />}</button>
        <p className="form-message" role="status" aria-live="polite">{message}</p>
      </form>
      <p className="content-note mono">SAMPLE PRICING IN INR. FINAL PRICES, PASSES, AVAILABILITY, AND TERMS TO BE CONFIRMED.</p>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-main">
        <Link to="/" className="wordmark"><span className="wordmark-seal">N</span><span>NEXUS<span className="wordmark-small">/ 2027</span></span></Link>
        <p className="footer-statement">The future<br />isn't a spectator sport.</p>
        <div className="footer-contact"><span className="footer-label mono">THE REALM, IRL</span><span>Asterion Institute of Technology<br />Bengaluru, India</span><span>12—14 March 2027</span></div>
        <div className="footer-contact"><span className="footer-label mono">FOLLOW THE FREQUENCY</span><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram <ExternalLink size={12} /></a><a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn <ExternalLink size={12} /></a><a href="https://www.youtube.com/" target="_blank" rel="noreferrer">YouTube <ExternalLink size={12} /></a></div>
      </div>
      <div className="footer-bottom mono"><span>© 2027 NEXUS · A FICTIONAL FESTIVAL CONCEPT</span><a href="#home">BACK TO THE GATE ↑</a><span>MADE FOR WHAT'S NEXT <Sparkles size={12} /></span></div>
    </footer>
  );
}

function FestivalHome() {
  const controls = useRef<RealmControls>({ entry: 0 });
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [entered, setEntered] = useState(false);
  const [entering, setEntering] = useState(false);
  const [activeEvent, setActiveEvent] = useState(eventTracks[0]);
  const reduceMotion = useReducedMotion();

  function skipIntro() {
    timeline.current?.kill();
    controls.current.entry = 1;
    setEntering(false);
    setEntered(true);
  }

  function enterRealm() {
    if (entering || entered) return;
    if (reduceMotion) {
      skipIntro();
      return;
    }
    setEntering(true);
    const progress = { value: controls.current.entry };
    timeline.current = gsap.timeline({
      onComplete: () => {
        controls.current.entry = 1;
        setEntered(true);
        setEntering(false);
      },
    }).to(progress, {
      value: 1,
      duration: 3.2,
      ease: "power3.in",
      onUpdate: () => {
        controls.current.entry = progress.value;
      },
    });
  }

  return (
    <div className="app-shell">
      <a className="accessibility-skip" href="#main-content">Skip to festival content</a>
      <div className="ambient-vignette" />
      <div className="realm-stage" aria-hidden="true"><RealmScene controls={controls} /></div>
      <AnimatePresence>
        {!entered && (
          <IntroOverlay key="intro" onEnter={enterRealm} onSkip={skipIntro} entering={entering} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {entered && (
          <motion.div
            className="festival-site"
            key="site"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.7 }}
          >
            <FestivalHeader />
            <main id="main-content">
              <Hero />
              <StorySection />
              <EventExplorer activeEvent={activeEvent} setActiveEvent={setActiveEvent} />
              <ScheduleSection />
              <WorkshopSection />
              <GuildsSection />
              <CrewSection />
              <SponsorSection />
              <PassesSection />
            </main>
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<FestivalHome />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
