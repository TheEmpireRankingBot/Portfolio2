// screens.js — Driftly UI. All screens, cards, and sections.
const { useState: useS, useEffect: useE, useRef: useR, useMemo: useMS } = React;

const FONT_DISPLAY = '"Cormorant Garamond", "Playfair Display", Georgia, serif';
const FONT_SANS = '"Inter Tight", "SF Pro", -apple-system, system-ui, sans-serif';

const GOLD      = '#F4D9A6';
const GOLD_DIM  = 'rgba(244,217,166,0.85)';
const FG        = '#fff';
const FG_DIM    = 'rgba(255,255,255,0.78)';
const FG_MUTED  = 'rgba(255,255,255,0.45)';
const SURFACE   = '#070B1C';
const BORDER    = 'rgba(255,255,255,0.08)';

const glass = (extra = {}) => ({
  background: 'linear-gradient(160deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)',
  border: `1px solid ${BORDER}`,
  backdropFilter: 'blur(24px) saturate(150%)',
  WebkitBackdropFilter: 'blur(24px) saturate(150%)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.06)',
  ...extra,
});

const CITY_IATA = {
  tokyo:'TYO', paris:'CDG', nyc:'JFK', london:'LHR', singapore:'SIN',
  sydney:'SYD', rio:'GIG', kyoto:'KIX', istanbul:'IST', marrakech:'RAK',
  capetown:'CPT', reykjavik:'KEF', bali:'DPS', bangkok:'BKK', dubai:'DXB',
  barcelona:'BCN', rome:'FCO', amsterdam:'AMS', hongkong:'HKG', seoul:'ICN',
  lisbon:'LIS', cdmx:'MEX', cusco:'CUZ', queenstown:'ZQN', prague:'PRG',
};

const mkFlightURL = (fromName, cityName) =>
  `https://www.google.com/flights?q=${encodeURIComponent('flights from ' + fromName + ' to ' + cityName)}`;

const mkSkyscannerURL = (iata) =>
  iata ? `https://www.skyscanner.net/flights-to/${iata.toLowerCase()}/` : 'https://www.skyscanner.net/';

const mkKayakURL = (fromCode, iata) =>
  iata ? `https://www.kayak.com/flights/${fromCode}-${iata}?sort=price_a` : 'https://www.kayak.com/explore';

const mkBookingURL = (cityName) =>
  `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(cityName)}&nflt=ht_id%3D204`;

const mkAirbnbURL = (cityName) =>
  `https://www.airbnb.com/s/${encodeURIComponent(cityName)}/homes`;

const mkViatorURL = (cityName) =>
  `https://www.viator.com/en-US/tours/${cityName.replace(/\s+/g, '-')}/`;

const mkGYGURL = (cityName) =>
  `https://www.getyourguide.com/s/?q=${encodeURIComponent(cityName + ' tours')}`;

const costPips = (cost) => {
  const map = { Budget: 1, Moderate: 2, Premium: 3 };
  const n = map[cost] || 2;
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: i < n ? GOLD : 'rgba(255,255,255,0.22)',
        }} />
      ))}
    </span>
  );
};

const starStr = (rating) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  return '★'.repeat(full) + (half ? '⯨' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
};

const ExternalLink = ({ href, children, style }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', ...style }}>
    {children}
  </a>
);

const ctaPrimary = {
  width: '100%', padding: '16px 20px',
  background: 'linear-gradient(180deg, #F8E2B4 0%, #E0B86E 100%)',
  border: 'none', borderRadius: 16,
  fontFamily: FONT_SANS, fontSize: 15, fontWeight: 700, letterSpacing: 0.3,
  color: '#1A1208', cursor: 'pointer',
  boxShadow: '0 6px 28px rgba(229,189,122,0.32), inset 0 1px 0 rgba(255,255,255,0.45)',
  marginBottom: 10,
};

const VIBES = [
  { label: 'All',       val: '' },
  { label: 'Culture',   val: 'culture' },
  { label: 'Beach',     val: 'beach' },
  { label: 'Food',      val: 'foodie' },
  { label: 'Adventure', val: 'adventure' },
  { label: 'Romance',   val: 'romance' },
  { label: 'Nature',    val: 'nature' },
];

function SearchBar({ value, onChange, onClose, results, onPick }) {
  const [vibe, setVibe] = useS('');
  const inputRef = useR(null);

  useE(() => { inputRef.current?.focus(); }, []);

  const filtered = useMS(() => {
    if (!vibe) return results;
    return results.filter(c => c.vibes.includes(vibe));
  }, [results, vibe]);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(2,4,12,0.95)',
      backdropFilter: 'blur(28px)',
      zIndex: 50,
      display: 'flex', flexDirection: 'column',
      animation: 'fadeIn 200ms ease-out',
    }}>
      <div style={{ padding: '52px 16px 10px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{
          ...glass({ borderRadius: 16, padding: '12px 16px' }),
          flex: 1, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ color: GOLD_DIM, fontSize: 16 }}>⌕</span>
          <input
            ref={inputRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Search destinations, vibes…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: FG, fontSize: 15, fontFamily: FONT_SANS, fontWeight: 500,
            }}
          />
          {value && (
            <button onClick={() => onChange('')} style={{
              background: 'none', border: 'none', color: FG_MUTED, cursor: 'pointer', fontSize: 16, padding: 2,
            }}>✕</button>
          )}
        </div>
        <button onClick={onClose} style={{
          padding: '12px 14px', borderRadius: 14,
          ...glass({}), color: FG, fontSize: 13, fontWeight: 600,
          cursor: 'pointer',
        }}>Done</button>
      </div>

      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '4px 16px 12px', scrollbarWidth: 'none' }}>
        {VIBES.map(v => (
          <button key={v.val} onClick={() => setVibe(v.val)} style={{
            padding: '7px 14px', borderRadius: 100, border: 'none', cursor: 'pointer',
            background: vibe === v.val ? 'linear-gradient(180deg,#F8E2B4,#E0B86E)' : 'rgba(255,255,255,0.08)',
            color: vibe === v.val ? '#1A1208' : FG_DIM,
            fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600,
            flexShrink: 0,
            transition: 'background 180ms, color 180ms',
          }}>{v.label}</button>
        ))}
      </div>

      <div style={{ overflow: 'auto', padding: '0 12px 100px' }}>
        {!value && !vibe && (
          <div style={{ padding: '10px 6px 6px', fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: GOLD_DIM }}>
            Iconic destinations
          </div>
        )}
        {filtered.length === 0 && (value || vibe) && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: FG_MUTED, fontSize: 13, fontFamily: FONT_SANS }}>
            Nothing matches — try a different vibe.
          </div>
        )}
        {filtered.map(c => (
          <button key={c.id} onClick={() => onPick(c)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 13,
            padding: '11px 12px', marginBottom: 5,
            background: 'transparent', border: `1px solid ${BORDER}`,
            borderRadius: 14, cursor: 'pointer', textAlign: 'left',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 11, flexShrink: 0,
              backgroundImage: `url(${c.hero})`, backgroundSize: 'cover', backgroundPosition: 'center',
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 14, color: FG, fontWeight: 600 }}>
                <span style={{ marginRight: 6 }}>{c.flag}</span>{c.name}
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: GOLD_DIM, letterSpacing: 0.4, marginTop: 2 }}>
                {c.country} · {c.cost} · {c.season.split(' · ')[0]}
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                {c.vibes.slice(0, 3).map(v => (
                  <span key={v} style={{
                    padding: '2px 7px', borderRadius: 100,
                    background: 'rgba(255,255,255,0.07)',
                    fontFamily: FONT_SANS, fontSize: 10, color: FG_MUTED, fontWeight: 500,
                  }}>{v}</span>
                ))}
              </div>
            </div>
            <span style={{ color: GOLD_DIM, fontSize: 18, flexShrink: 0 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PopularRail({ cities, onPick, hidden }) {
  const popular = useMS(() => cities.filter(c => c.tier === 'iconic').slice(0, 12), [cities]);
  if (hidden) return null;
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 102,
      zIndex: 6,
      transition: 'opacity 250ms',
    }}>
      <div style={{ padding: '0 18px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: FONT_SANS, fontSize: 9.5, letterSpacing: 2.2, textTransform: 'uppercase', color: GOLD_DIM }}>Trending</span>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontStyle: 'italic', color: FG_MUTED }}>swipe →</span>
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '4px 18px 4px', scrollbarWidth: 'none' }}>
        {popular.map(c => (
          <button key={c.id} onClick={() => onPick(c)} style={{
            flex: '0 0 128px', height: 90, position: 'relative',
            borderRadius: 16, overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.07)',
            backgroundImage: `url(${c.hero})`, backgroundSize: 'cover', backgroundPosition: 'center',
            cursor: 'pointer', padding: 0,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 25%, rgba(0,0,0,0.88) 100%)',
            }} />
            <div style={{ position: 'absolute', top: 8, left: 10 }}>
              <span style={{
                padding: '3px 7px', borderRadius: 100,
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                fontFamily: FONT_SANS, fontSize: 9, fontWeight: 600,
                color: c.cost === 'Budget' ? '#9FE8A0' : c.cost === 'Moderate' ? GOLD : '#E8C9FF',
                border: `1px solid ${c.cost === 'Budget' ? 'rgba(159,232,160,0.4)' : c.cost === 'Moderate' ? 'rgba(244,217,166,0.4)' : 'rgba(232,201,255,0.4)'}`,
              }}>{c.cost}</span>
            </div>
            <div style={{ position: 'absolute', left: 10, right: 8, bottom: 8 }}>
              <div style={{ fontSize: 12, marginBottom: 1 }}>{c.flag}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 500, color: FG, lineHeight: 1.05 }}>{c.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function PreviewCard({ city, visible, onClose, onBringMe, onSave, onItinerary, saved }) {
  if (!city) return null;
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '0 12px 98px',
      transform: visible ? 'translateY(0)' : 'translateY(115%)',
      transition: 'transform 580ms cubic-bezier(0.22, 1, 0.36, 1)',
      zIndex: 30,
    }}>
      <div style={glass({ borderRadius: 28, overflow: 'hidden', position: 'relative' })}>
        <div style={{
          position: 'relative', height: 210,
          backgroundImage: `url(${city.hero})`, backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 28%, rgba(6,10,26,0.75) 70%, rgba(6,10,26,0.97) 100%)' }} />
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 38, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.40)' }} />
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 16,
            background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.85)',
            fontSize: 13, cursor: 'pointer',
          }}>✕</button>
          <div style={{ position: 'absolute', left: 20, right: 20, bottom: 14 }}>
            <div style={{ fontFamily: FONT_SANS, fontSize: 10.5, letterSpacing: 2.4, textTransform: 'uppercase', color: GOLD_DIM, marginBottom: 3 }}>
              {city.flag} {city.country}
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, lineHeight: 1, fontWeight: 500, color: FG, letterSpacing: -0.5 }}>
              {city.name}
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 20px 20px' }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 16, lineHeight: 1.4, color: FG_DIM, marginBottom: 16 }}>
            "{city.hook}"
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[
              { l: 'Best time',  v: city.season.split(' · ')[0] },
              { l: 'Daily cost', v: city.daily.split('–')[0] + '+' },
              { l: 'Trip type',  v: city.cost },
            ].map((s, i) => (
              <div key={i} style={glass({ borderRadius: 12, padding: '9px 10px' })}>
                <div style={{ fontFamily: FONT_SANS, fontSize: 8.5, letterSpacing: 1.4, textTransform: 'uppercase', color: GOLD_DIM, marginBottom: 3 }}>{s.l}</div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: FG, fontWeight: 600 }}>{s.v}</div>
              </div>
            ))}
          </div>
          <button onClick={() => onBringMe(city)} style={ctaPrimary}>
            Explore {city.name} →
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onSave(city)} style={{
              flex: 1, padding: '13px 0', cursor: 'pointer',
              ...glass({ borderRadius: 13 }),
              fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600,
              color: saved ? GOLD : FG,
              border: saved ? '1px solid rgba(244,217,166,0.35)' : `1px solid ${BORDER}`,
            }}>
              {saved ? '♥ Saved' : '♡ Save'}
            </button>
            <button onClick={() => onItinerary(city)} style={{
              flex: 1, padding: '13px 0', cursor: 'pointer',
              ...glass({ borderRadius: 13 }),
              fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: FG,
            }}>
              Plan trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BottomNav({ active, onChange }) {
  const items = [
    { id: 'globe',    label: 'Explore',  icon: '🌐' },
    { id: 'wishlist', label: 'Saved',    icon: '♡'  },
    { id: 'surprise', label: 'Surprise', icon: '✦'  },
  ];
  return (
    <div style={{
      position: 'absolute', left: 16, right: 16, bottom: 18,
      ...glass({
        borderRadius: 28, padding: '10px 16px 13px',
        background: 'linear-gradient(180deg, rgba(18,26,54,0.60), rgba(8,12,28,0.80))',
      }),
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      zIndex: 20,
    }}>
      {items.map(it => {
        const isActive = active === it.id;
        const isSurp = it.id === 'surprise';
        return (
          <button key={it.id} onClick={() => onChange(it.id)} style={{
            flex: 1, padding: '5px 4px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <span style={{
              width: 36, height: 36, borderRadius: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
              background: isActive
                ? (isSurp ? 'linear-gradient(135deg,rgba(244,217,166,0.30),rgba(220,180,110,0.18))' : 'rgba(244,217,166,0.16)')
                : 'transparent',
              color: isActive ? GOLD : 'rgba(255,255,255,0.65)',
              transition: 'background 200ms, color 200ms',
              boxShadow: isActive && !isSurp ? '0 0 14px rgba(244,217,166,0.18)' : 'none',
            }}>{it.icon}</span>
            <span style={{
              fontFamily: FONT_SANS, fontSize: 9.5, fontWeight: 600,
              letterSpacing: 0.6, textTransform: 'uppercase',
              color: isActive ? GOLD : 'rgba(255,255,255,0.50)',
              transition: 'color 200ms',
            }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function PhotoGallery({ photos }) {
  const [idx, setIdx] = useS(0);
  const onScroll = (e) => {
    const next = Math.round(e.target.scrollLeft / e.target.clientWidth);
    if (next !== idx) setIdx(next);
  };
  return (
    <div style={{ position: 'relative' }}>
      <div onScroll={onScroll} style={{
        display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
      }}>
        {photos.map((p, i) => (
          <div key={i} style={{
            flex: '0 0 100%', height: 260, scrollSnapAlign: 'start',
            backgroundImage: `url(${p})`, backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, display: 'flex', justifyContent: 'center', gap: 6 }}>
        {photos.map((_, i) => (
          <span key={i} style={{
            width: i === idx ? 22 : 6, height: 6, borderRadius: 3,
            background: i === idx ? GOLD : 'rgba(255,255,255,0.40)',
            transition: 'width 220ms',
          }} />
        ))}
      </div>
      <div style={{
        position: 'absolute', top: 14, right: 14,
        padding: '5px 11px', borderRadius: 100,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
        fontFamily: FONT_SANS, fontSize: 11, fontWeight: 500, color: FG,
        border: '1px solid rgba(255,255,255,0.14)',
      }}>{idx + 1} / {photos.length}</div>
    </div>
  );
}

function Section({ label, sublabel, children, id }) {
  return (
    <div id={id} style={{ marginBottom: 26, scrollMarginTop: 64 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: GOLD_DIM }}>{label}</span>
        {sublabel && <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: FG_MUTED }}>{sublabel}</span>}
      </div>
      {children}
    </div>
  );
}

function PracticalInfo({ p }) {
  if (!p) return null;
  const rows = [
    { l: 'Currency', v: `${p.currency.symbol} ${p.currency.code}` },
    { l: 'Language', v: p.language },
    { l: 'Timezone', v: p.timezone },
    { l: 'Plug',     v: p.plug },
    { l: 'Visa',     v: p.visa },
    { l: 'Tipping',  v: p.tipping },
  ];
  return (
    <div style={glass({ borderRadius: 18, padding: 16 })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: GOLD_DIM }}>Need to know</span>
        <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: FG, fontWeight: 600 }}>
          <span style={{ color: GOLD }}>⛨ </span>{p.safety.toFixed(1)} safety
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px 16px' }}>
        {rows.map((r, i) => (
          <div key={i}>
            <div style={{ fontFamily: FONT_SANS, fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', color: GOLD_DIM, marginBottom: 2 }}>{r.l}</div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: FG, fontWeight: 500, lineHeight: 1.3 }}>{r.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyWeather({ monthly }) {
  if (!monthly) return null;
  const MONTHS = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const maxT = Math.max(...monthly.temps);
  const minT = Math.min(...monthly.temps);
  const scoreCol = (s) => s >= 5 ? GOLD : s >= 4 ? '#D8B47A' : s >= 3 ? '#5E7AA0' : 'rgba(255,255,255,0.16)';
  return (
    <div style={glass({ borderRadius: 18, padding: 16 })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <span style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: GOLD_DIM }}>When to go</span>
        <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: FG_MUTED }}>Avg high · visit score</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 68 }}>
        {monthly.temps.map((t, i) => {
          const ratio = (t - minT) / Math.max(1, maxT - minT);
          const h = 16 + ratio * 50;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontFamily: FONT_SANS, fontSize: 8.5, color: FG_MUTED }}>{t}°</span>
              <div style={{
                width: '100%', height: h, borderRadius: 3,
                background: `linear-gradient(180deg, ${scoreCol(monthly.scores[i])}, ${scoreCol(monthly.scores[i])}88)`,
                boxShadow: monthly.scores[i] >= 5 ? '0 0 10px rgba(244,217,166,0.35)' : 'none',
              }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 3, marginTop: 5 }}>
        {MONTHS.map((m, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontFamily: FONT_SANS, fontSize: 9.5, fontWeight: 600, color: monthly.scores[i] >= 4 ? GOLD : FG_MUTED }}>{m}</div>
        ))}
      </div>
    </div>
  );
}

function HotelsSection({ hotels, city }) {
  if (!hotels || hotels.length === 0) return null;
  return (
    <Section label="Places to stay" id="dt-stay">
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -22px', padding: '0 22px 6px', scrollbarWidth: 'none' }}>
        {hotels.map(h => (
          <div key={h.id} style={{ flex: '0 0 238px', ...glass({ borderRadius: 18 }), overflow: 'hidden' }}>
            <div style={{ height: 128, backgroundImage: `url(${h.img})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
              <div style={{
                position: 'absolute', top: 10, left: 10,
                padding: '4px 10px', borderRadius: 100,
                background: 'rgba(0,0,0,0.58)', backdropFilter: 'blur(8px)',
                fontFamily: FONT_SANS, fontSize: 9.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                color: GOLD, border: `1px solid rgba(244,217,166,0.35)`,
              }}>{h.tier}</div>
              {h.availability !== 'Available' && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  padding: '4px 10px', borderRadius: 100,
                  background: 'rgba(220,60,60,0.72)', fontFamily: FONT_SANS, fontSize: 9.5, fontWeight: 600, color: FG,
                }}>{h.availability}</div>
              )}
            </div>
            <div style={{ padding: '12px 14px 14px' }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: FG, marginBottom: 1, lineHeight: 1.25 }}>{h.name}</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: GOLD_DIM, marginBottom: 8 }}>{h.area}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <span style={{ color: GOLD, fontSize: 10.5 }}>{starStr(h.rating)}</span>
                <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: FG, fontWeight: 700 }}>{h.rating.toFixed(1)}</span>
                <span style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: FG_MUTED }}>· {h.reviewCount.toLocaleString()} reviews</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                {h.perks.slice(0, 3).map((pk, i) => (
                  <span key={i} style={{ padding: '3px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.07)', fontFamily: FONT_SANS, fontSize: 9.5, color: FG_DIM, fontWeight: 500, border: `1px solid ${BORDER}` }}>{pk}</span>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: FG, fontWeight: 500 }}>${h.pricePerNight}</span>
                  <span style={{ fontFamily: FONT_SANS, fontSize: 10, color: FG_MUTED, marginLeft: 4 }}>/night</span>
                </div>
                <ExternalLink href={mkBookingURL(city.name)} style={{
                  padding: '7px 12px', borderRadius: 100,
                  background: 'rgba(244,217,166,0.14)', border: `1px solid rgba(244,217,166,0.38)`,
                  color: GOLD, fontFamily: FONT_SANS, fontSize: 11, fontWeight: 700,
                }}>Book →</ExternalLink>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {[
          { label: 'Booking.com', url: mkBookingURL(city.name) },
          { label: 'Airbnb',      url: mkAirbnbURL(city.name)  },
        ].map(s => (
          <ExternalLink key={s.label} href={s.url} style={{
            flex: 1, padding: '11px 0', textAlign: 'center',
            ...glass({ borderRadius: 13 }),
            fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: FG_DIM,
          }}>{s.label} ↗</ExternalLink>
        ))}
      </div>
    </Section>
  );
}

function ActivitiesSection({ activities, city }) {
  if (!activities || activities.length === 0) return null;
  return (
    <Section label="Things to do" id="dt-do">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {activities.slice(0, 6).map(a => (
          <ExternalLink key={a.id} href={mkViatorURL(city.name)} style={{
            ...glass({ borderRadius: 16 }), padding: 12,
            display: 'flex', gap: 12, alignItems: 'center',
          }}>
            <div style={{ width: 72, height: 72, borderRadius: 12, backgroundImage: `url(${a.img})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: FG, marginBottom: 3, lineHeight: 1.3 }}>{a.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT_SANS, fontSize: 10.5, color: FG_MUTED, marginBottom: 4 }}>
                <span>⏱ {a.duration}</span>
                <span>· {a.area}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: GOLD, fontSize: 10.5 }}>★</span>
                <span style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 700, color: FG }}>{a.rating}</span>
                <span style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: FG_MUTED }}>({a.reviewCount.toLocaleString()})</span>
                {a.booksFast && (
                  <span style={{ marginLeft: 4, padding: '2px 7px', borderRadius: 100, background: 'rgba(255,90,90,0.14)', border: '1px solid rgba(255,90,90,0.35)', color: '#FF9494', fontFamily: FONT_SANS, fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>Fills fast</span>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: FG, fontWeight: 500, lineHeight: 1 }}>${a.price}</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 9.5, color: FG_MUTED, marginTop: 2 }}>/ person</div>
              <div style={{ marginTop: 6, fontFamily: FONT_SANS, fontSize: 10.5, fontWeight: 600, color: GOLD }}>Book →</div>
            </div>
          </ExternalLink>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {[
          { label: 'Viator',        url: mkViatorURL(city.name) },
          { label: 'GetYourGuide',  url: mkGYGURL(city.name)    },
        ].map(s => (
          <ExternalLink key={s.label} href={s.url} style={{
            flex: 1, padding: '11px 0', textAlign: 'center',
            ...glass({ borderRadius: 13 }),
            fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: FG_DIM,
          }}>{s.label} ↗</ExternalLink>
        ))}
      </div>
    </Section>
  );
}

function FlightsSection({ flights, city }) {
  if (!flights || flights.length === 0) return null;
  const iata = CITY_IATA[city.id] || '';
  const sorted = [...flights].sort((a, b) => a.price - b.price);
  return (
    <Section label={`Flights to ${city.name}`} id="dt-fly">
      <div style={glass({ borderRadius: 18, overflow: 'hidden' })}>
        {sorted.map((f, i) => (
          <ExternalLink key={f.id} href={mkFlightURL(f.fromName, city.name)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '13px 16px',
            borderTop: i === 0 ? 'none' : `1px solid ${BORDER}`,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(244,217,166,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: GOLD, flexShrink: 0,
            }}>✈</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: FG, fontWeight: 600 }}>
                {f.fromName}
                <span style={{ color: GOLD_DIM, margin: '0 5px', fontSize: 11 }}>→</span>
                {city.name}
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: FG_MUTED, marginTop: 2 }}>
                {f.airline} · {f.duration} · {f.stops === 0 ? 'Nonstop' : `${f.stops} stop`}
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: GOLD_DIM, marginTop: 1 }}>{f.nextDeparture}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 500, color: FG, lineHeight: 1 }}>${f.price}</div>
              <div style={{
                marginTop: 5, display: 'inline-block',
                padding: '3px 9px', borderRadius: 100,
                background: 'rgba(244,217,166,0.12)', border: `1px solid rgba(244,217,166,0.30)`,
                fontFamily: FONT_SANS, fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: 0.3,
              }}>Search →</div>
            </div>
          </ExternalLink>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 9.5, letterSpacing: 1.8, textTransform: 'uppercase', color: FG_MUTED, marginBottom: 8 }}>Search live prices</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Google Flights', url: `https://www.google.com/flights?q=${encodeURIComponent('flights to ' + city.name)}` },
            { label: 'Skyscanner',     url: mkSkyscannerURL(iata) },
            { label: 'Kayak',          url: `https://www.kayak.com/explore` },
          ].map(s => (
            <ExternalLink key={s.label} href={s.url} style={{
              flex: 1, padding: '11px 6px',
              ...glass({ borderRadius: 13 }),
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
            }}>
              <span style={{ fontSize: 16 }}>
                {s.label === 'Google Flights' ? '◎' : s.label === 'Skyscanner' ? '◈' : '◇'}
              </span>
              <span style={{ fontFamily: FONT_SANS, fontSize: 10, fontWeight: 700, color: FG, letterSpacing: 0.2, textAlign: 'center' }}>{s.label}</span>
            </ExternalLink>
          ))}
        </div>
      </div>
    </Section>
  );
}

function TipsSection({ tips }) {
  if (!tips || tips.length === 0) return null;
  return (
    <Section label="Local tips">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tips.map((tip, i) => (
          <div key={i} style={{ ...glass({ borderRadius: 14 }), padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{
              flexShrink: 0, width: 24, height: 24, borderRadius: 12,
              background: 'rgba(244,217,166,0.14)', color: GOLD,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT_SANS, fontSize: 11, fontWeight: 700,
            }}>{i + 1}</span>
            <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: FG_DIM, lineHeight: 1.48 }}>{tip}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ReviewsSection({ reviews }) {
  if (!reviews || reviews.length === 0) return null;
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  return (
    <Section label="Traveler reviews" sublabel={`${avg} ★ avg`}>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -22px', padding: '0 22px 6px', scrollbarWidth: 'none' }}>
        {reviews.map(r => (
          <div key={r.id} style={{ flex: '0 0 255px', ...glass({ borderRadius: 16 }), padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: FG, fontWeight: 700 }}>{r.author}</span>
              <span style={{ color: GOLD, fontSize: 11 }}>{starStr(r.rating)}</span>
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 14, lineHeight: 1.48, color: FG_DIM, marginBottom: 8 }}>&#34;{r.text}&#34;</div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: FG_MUTED }}>{r.date}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function DbLoadingHint() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '28px 0' }}>
      <div style={{ width: 44, height: 44, animation: 'spin 1.2s linear infinite' }}>
        <svg viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="18" stroke="rgba(244,217,166,0.18)" strokeWidth="2"/>
          <path d="M22 4 A18 18 0 0 1 40 22" stroke={GOLD} strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: GOLD_DIM, letterSpacing: 2.2, textTransform: 'uppercase' }}>
        Checking availability…
      </div>
    </div>
  );
}

function CityDetail({ city, onBack, onWish, wished }) {
  const [db, setDb] = useS(null);
  const [loading, setLoading] = useS(true);
  const scrollRef = useR(null);

  useE(() => {
    if (!city) return;
    setDb(null);
    setLoading(true);
    let cancelled = false;
    window.MockDB.fetchCity(city.id).then(d => {
      if (!cancelled) { setDb(d); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [city?.id]);

  if (!city) return null;

  const SLOT_ICONS = { Morning: '🌅', Afternoon: '☀️', Evening: '🌙' };
  const itinerary = [
    {
      day: 1,
      theme: 'Arrive & wander',
      slots: {
        Morning:   `Arrive. Coffee in ${city.neighborhoods[0].name}. Drop the bags.`,
        Afternoon: `First walk to ${city.places[0].name} — no plan, just go.`,
        Evening:   `Dinner: ${city.food[0]}. Neighborhood spot, nothing fancy.`,
      },
    },
    {
      day: 2,
      theme: 'The iconic bits',
      slots: {
        Morning:   `${city.places[1].name} — before 9am beats the crowds.`,
        Afternoon: `${city.places[2].name}, then a long slow lunch in ${city.neighborhoods[0].name}.`,
        Evening:   `${city.food[1]} and a local bar. Nowhere to be.`,
      },
    },
    {
      day: 3,
      theme: 'Go local',
      slots: {
        Morning:   `Market morning in ${city.neighborhoods[1].name}.`,
        Afternoon: `${city.places[3]?.name || city.places[0].name} — take your time.`,
        Evening:   `Last dinner: ${city.food[2]}. Rooftop if the weather holds.`,
      },
    },
  ];

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el && scrollRef.current) {
      const top = el.offsetTop - 60;
      scrollRef.current.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div ref={scrollRef} style={{ position: 'absolute', inset: 0, background: SURFACE, overflow: 'auto', overscrollBehavior: 'contain' }}>
      <div style={{ position: 'relative' }}>
        <PhotoGallery photos={city.photos || [city.hero]} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(7,11,28,0.38) 0%, transparent 35%, transparent 60%, rgba(7,11,28,1) 100%)' }} />
        <button onClick={onBack} style={{
          position: 'absolute', top: 50, left: 16, width: 42, height: 42, borderRadius: 21,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.18)', color: FG, fontSize: 20, cursor: 'pointer', zIndex: 5,
        }}>‹</button>
        <button onClick={() => onWish(city)} style={{
          position: 'absolute', top: 50, right: 16, width: 42, height: 42, borderRadius: 21,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)',
          border: `1px solid ${wished ? 'rgba(244,217,166,0.45)' : 'rgba(255,255,255,0.18)'}`,
          color: wished ? GOLD : FG, fontSize: 18, cursor: 'pointer', zIndex: 5,
        }}>{wished ? '♥' : '♡'}</button>
      </div>

      <div style={{ padding: '18px 22px 0' }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 10.5, letterSpacing: 2.8, textTransform: 'uppercase', color: GOLD_DIM, marginBottom: 6 }}>
          {city.flag} {city.country}
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 50, lineHeight: 0.95, fontWeight: 500, color: FG, letterSpacing: -1.5 }}>{city.name}</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 16, lineHeight: 1.38, color: FG_DIM, marginTop: 12, marginBottom: 6 }}>&#34;{city.hook}&#34;</div>
      </div>

      <div style={{
        position: 'sticky', top: 0, zIndex: 15,
        background: SURFACE,
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none',
        padding: '4px 8px',
      }}>
        {[
          { label: 'Overview', id: 'dt-overview' },
          { label: 'Plan',     id: 'dt-plan'     },
          { label: 'Stay',     id: 'dt-stay'     },
          { label: 'Do',       id: 'dt-do'       },
          { label: 'Flights',  id: 'dt-fly'      },
        ].map(t => (
          <button key={t.id} onClick={() => scrollToId(t.id)} style={{
            padding: '9px 14px', borderRadius: 10, border: 'none', background: 'none',
            fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: FG_DIM,
            cursor: 'pointer', flexShrink: 0, letterSpacing: 0.2,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '18px 22px 140px' }}>
        <div id="dt-overview" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 24, scrollMarginTop: 60 }}>
          {[
            { l: 'Best',   v: city.season.split(' · ')[0] },
            { l: 'Daily',  v: city.daily.split('–')[0] + '+'   },
            { l: 'Budget', v: city.cost  },
            { l: 'Hotel',  v: db ? `$${db.summary.hotelFrom}+` : '—' },
          ].map((s, i) => (
            <div key={i} style={glass({ borderRadius: 14, padding: '10px 8px', textAlign: 'center' })}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 8.5, letterSpacing: 1.4, textTransform: 'uppercase', color: GOLD_DIM, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: FG, fontWeight: 700 }}>{s.v}</div>
            </div>
          ))}
        </div>

        <Section label="About">
          <div style={{ fontFamily: FONT_SANS, fontSize: 14, lineHeight: 1.58, color: FG_DIM }}>{city.overview}</div>
        </Section>

        <Section label="Need to know">
          <PracticalInfo p={city.practical} />
        </Section>

        <Section label="When to go">
          <MonthlyWeather monthly={city.monthly} />
        </Section>

        <Section label="Must-see spots">
          <div style={{ display: 'flex', gap: 11, overflowX: 'auto', margin: '0 -22px', padding: '0 22px 6px', scrollbarWidth: 'none' }}>
            {city.places.map((p, i) => (
              <div key={i} style={{ flex: '0 0 140px', ...glass({ borderRadius: 16 }), overflow: 'hidden' }}>
                <div style={{ height: 98, backgroundImage: `url(${p.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ padding: '9px 11px 11px' }}>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: FG, fontWeight: 600, marginBottom: 2, lineHeight: 1.25 }}>{p.name}</div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: GOLD_DIM }}>{p.area}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section label="3 days in" sublabel={city.name} id="dt-plan">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {itinerary.map((d) => (
              <div key={d.day} style={glass({ borderRadius: 18, overflow: 'hidden' })}>
                <div style={{
                  padding: '12px 16px 10px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: FG, fontWeight: 500 }}>Day {d.day}</span>
                  <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: GOLD_DIM, letterSpacing: 0.5, textTransform: 'uppercase' }}>{d.theme}</span>
                </div>
                {Object.entries(d.slots).map(([time, act]) => (
                  <div key={time} style={{
                    padding: '10px 16px',
                    borderBottom: time === 'Evening' ? 'none' : `1px solid ${BORDER}`,
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}>
                    <div style={{ flexShrink: 0, textAlign: 'center', width: 48 }}>
                      <div style={{ fontSize: 18, lineHeight: 1 }}>{SLOT_ICONS[time]}</div>
                      <div style={{ fontFamily: FONT_SANS, fontSize: 8.5, letterSpacing: 0.8, textTransform: 'uppercase', color: FG_MUTED, marginTop: 3 }}>{time}</div>
                    </div>
                    <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: FG_DIM, lineHeight: 1.5, paddingTop: 2 }}>{act}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: '14px 16px', ...glass({ borderRadius: 16, background: 'linear-gradient(160deg, rgba(244,217,166,0.08), rgba(244,217,166,0.03))' }), border: `1px solid rgba(244,217,166,0.20)` }}>
            <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: GOLD_DIM, marginBottom: 4 }}>Want a longer or custom plan?</div>
            <ExternalLink href={`https://www.google.com/search?q=3+day+itinerary+${encodeURIComponent(city.name)}`} style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: GOLD }}>
              Browse full itineraries ↗
            </ExternalLink>
          </div>
        </Section>

        <Section label="Where to base yourself">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {city.neighborhoods.map((n, i) => (
              <div key={i} style={{ ...glass({ borderRadius: 14, padding: '12px 16px' }), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: FG, fontWeight: 600, marginBottom: 2 }}>{n.name}</div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: FG_MUTED }}>{n.vibe}</div>
                </div>
                <span style={{ color: GOLD_DIM, fontSize: 18 }}>›</span>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Eat this while you're there">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {city.food.map((f, i) => (
              <div key={i} style={{ ...glass({ borderRadius: 100 }), padding: '8px 15px', fontFamily: FONT_SANS, fontSize: 12.5, color: FG, fontWeight: 500 }}>{f}</div>
            ))}
          </div>
        </Section>

        {loading ? <DbLoadingHint /> : (
          <>
            <HotelsSection hotels={db?.hotels} city={city} />
            <ActivitiesSection activities={db?.activities} city={city} />
            <FlightsSection flights={db?.flights} city={city} />
          </>
        )}

        <TipsSection tips={city.tips} />
        {!loading && <ReviewsSection reviews={db?.reviews} />}

        {db && (
          <div style={{
            ...glass({ borderRadius: 20 }), padding: '18px 20px', marginTop: 4, marginBottom: 20,
            background: 'linear-gradient(160deg, rgba(244,217,166,0.10), rgba(244,217,166,0.03))',
            border: '1px solid rgba(244,217,166,0.22)',
          }}>
            <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: GOLD_DIM, marginBottom: 14 }}>3-day trip estimate</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', marginBottom: 16 }}>
              {[
                { l: 'Flight (cheapest)',    v: `from $${db.summary.flightFrom}` },
                { l: 'Hotel × 3 nights',    v: `from $${db.summary.hotelFrom * 3}` },
                { l: 'Activities (avg)',     v: `~$${db.summary.avgActivity} each` },
                { l: 'Total estimate',       v: `from $${db.summary.total3DayFrom.toLocaleString()}` },
              ].map((r, i) => (
                <div key={i}>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', color: GOLD_DIM, marginBottom: 3 }}>{r.l}</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: FG, fontWeight: 500 }}>{r.v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: FG_MUTED, lineHeight: 1.4 }}>
              Per person · based on cheapest options · excludes meals &amp; extras.
            </div>
          </div>
        )}

        <button onClick={() => onWish(city)} style={{
          ...ctaPrimary,
          background: wished
            ? 'linear-gradient(180deg, #F8E2B4 0%, #E0B86E 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))',
          color: wished ? '#1A1208' : FG,
          border: wished ? 'none' : `1px solid ${BORDER}`,
          boxShadow: wished ? '0 6px 28px rgba(229,189,122,0.32), inset 0 1px 0 rgba(255,255,255,0.45)' : 'none',
        }}>
          {wished ? '♥ Saved to Wishlist' : '♡ Save to Wishlist'}
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          <ExternalLink href={mkFlightURL('', city.name)} style={{
            flex: 1, padding: '14px 0', textAlign: 'center',
            ...glass({ borderRadius: 14 }),
            fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: FG,
          }}>✈ Find flights</ExternalLink>
          <ExternalLink href={mkBookingURL(city.name)} style={{
            flex: 1, padding: '14px 0', textAlign: 'center',
            ...glass({ borderRadius: 14 }),
            fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: FG,
          }}>🏨 Book hotel</ExternalLink>
        </div>
      </div>
    </div>
  );
}

function Wishlist({ cities, savedIds, onTap, onRemove }) {
  const list = cities.filter(c => savedIds.includes(c.id));
  return (
    <div style={{ position: 'absolute', inset: 0, background: SURFACE, overflow: 'auto' }}>
      <div style={{ padding: '68px 22px 20px', background: 'linear-gradient(180deg, rgba(18,26,55,0.55), transparent)' }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 10.5, letterSpacing: 2.8, textTransform: 'uppercase', color: GOLD_DIM, marginBottom: 6 }}>
          Your collection
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 46, lineHeight: 1, fontWeight: 500, color: FG, letterSpacing: -1.2 }}>
          Wishlist
        </div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: FG_MUTED, marginTop: 8 }}>
          {list.length === 0
            ? 'Nothing saved yet — spin the globe and tap ♡'
            : `${list.length} ${list.length === 1 ? 'destination' : 'destinations'} · tap to plan`}
        </div>
      </div>

      {list.length === 0 && (
        <div style={{ margin: '0 16px 24px', ...glass({ borderRadius: 22, padding: '48px 24px' }), textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.7 }}>✈</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 20, color: FG_DIM, lineHeight: 1.4 }}>
            Every trip starts with a wish.
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: FG_MUTED, marginTop: 8 }}>
            Tap any city on the globe and hit ♡ to save it here.
          </div>
        </div>
      )}

      <div style={{ padding: '4px 16px 148px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {list.map(c => (
          <div key={c.id} style={{ position: 'relative' }}>
            <button onClick={() => onTap(c)} style={{
              width: '100%', padding: 0, border: 'none', cursor: 'pointer',
              borderRadius: 22, overflow: 'hidden', height: 195, background: '#000', textAlign: 'left',
              display: 'block',
            }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${c.hero})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.88) 100%)' }} />
              <div style={{ position: 'absolute', left: 18, right: 18, bottom: 16 }}>
                <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: GOLD_DIM, marginBottom: 3 }}>
                  {c.flag} {c.country}
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, lineHeight: 1, fontWeight: 500, color: FG, letterSpacing: -0.4, marginBottom: 6 }}>{c.name}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: FG_DIM }}>{c.season.split(' · ')[0]}</span>
                  <span style={{ color: FG_MUTED }}>·</span>
                  <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: FG_DIM }}>{c.cost}</span>
                  <span style={{ color: FG_MUTED }}>·</span>
                  <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: FG_DIM }}>{c.daily.split('–')[0]}+ /day</span>
                </div>
              </div>
            </button>
            <button onClick={() => onRemove(c)} style={{
              position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 16,
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)', color: GOLD, fontSize: 15, cursor: 'pointer',
            }}>♥</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SurpriseOverlay({ phase, city }) {
  if (phase === 'idle') return null;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 25, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: phase === 'spinning'
          ? 'radial-gradient(circle, rgba(0,0,0,0) 30%, rgba(0,0,0,0.58) 100%)'
          : 'radial-gradient(circle, rgba(244,217,166,0.08) 0%, rgba(0,0,0,0.62) 80%)',
        transition: 'background 600ms',
      }} />
      {phase === 'spinning' && (
        <div style={{ position: 'relative', textAlign: 'center', marginTop: -80 }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 3.5, textTransform: 'uppercase', color: GOLD_DIM, marginBottom: 12 }}>
            Searching the world
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontStyle: 'italic', color: 'rgba(255,255,255,0.90)', letterSpacing: -0.3 }}>
            where shall we send you?
          </div>
          <div style={{ margin: '26px auto 0', width: 64, height: 64, animation: 'spin 1.3s linear infinite' }}>
            <svg viewBox="0 0 64 64" style={{ width: '100%', height: '100%' }}>
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(244,217,166,0.20)" strokeWidth="1.2"/>
              <path d="M32 4 A28 28 0 0 1 60 32" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      )}
      {phase === 'revealing' && city && (
        <div style={{ textAlign: 'center', marginTop: -110, animation: 'revealIn 700ms cubic-bezier(0.22,1,0.36,1) both' }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: GOLD_DIM, marginBottom: 14 }}>You're going to</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 62, lineHeight: 1, fontWeight: 500, color: FG, letterSpacing: -1.8, textShadow: '0 4px 40px rgba(244,217,166,0.4)' }}>
            {city.name}
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: 2.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.68)', marginTop: 10 }}>
            {city.flag} {city.country}
          </div>
        </div>
      )}
    </div>
  );
}

function SurpriseFab({ onTap, hidden }) {
  if (hidden) return null;
  return (
    <button onClick={onTap} style={{
      position: 'absolute', left: '50%', bottom: 110,
      transform: 'translateX(-50%)',
      padding: '14px 24px 14px 20px', borderRadius: 100,
      background: 'linear-gradient(180deg, rgba(244,217,166,0.96), rgba(220,178,108,0.93))',
      border: '1px solid rgba(255,230,180,0.55)',
      boxShadow: '0 8px 32px rgba(244,217,166,0.30), 0 2px 0 rgba(255,255,255,0.28) inset',
      display: 'inline-flex', alignItems: 'center', gap: 10,
      fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, letterSpacing: 0.2,
      color: '#1A1208', cursor: 'pointer', zIndex: 15,
    }}>
      <span style={{ fontSize: 15 }}>✦</span>
      Surprise me
    </button>
  );
}

Object.assign(window, {
  PreviewCard, BottomNav, CityDetail, Wishlist,
  SurpriseOverlay, SurpriseFab, PopularRail, SearchBar,
});
