// screens.js — All UI screens (preview card, city detail, wishlist, surprise,
// popular rail, search). Detail screen fetches from MockDB.

const { useState: useS, useEffect: useE, useRef: useR, useMemo: useMS } = React;

const FONT_DISPLAY = '"Cormorant Garamond", "Playfair Display", Georgia, serif';
const FONT_SANS = '"Inter Tight", "SF Pro", -apple-system, system-ui, sans-serif';

const glass = (extra = {}) => ({
  background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
  border: '1px solid rgba(255,255,255,0.10)',
  backdropFilter: 'blur(24px) saturate(140%)',
  WebkitBackdropFilter: 'blur(24px) saturate(140%)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
  ...extra,
});

const costPips = (cost) => {
  const map = { Budget: 1, Moderate: 2, Premium: 3 };
  const n = map[cost] || 2;
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: i < n ? '#F4D9A6' : 'rgba(255,255,255,0.25)',
        }}/>
      ))}
    </span>
  );
};

const stars = (rating) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  return '★'.repeat(full) + (half ? '⯨' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
};

function SearchBar({ value, onChange, onClose, results, onPick }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
      background: 'rgba(2,4,12,0.92)',
      backdropFilter: 'blur(24px)',
      zIndex: 50,
      display: 'flex', flexDirection: 'column',
      animation: 'fadeIn 220ms ease-out',
    }}>
      <div style={{ padding: '54px 18px 12px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{
          ...glass({ borderRadius: 18, padding: '12px 16px' }),
          flex: 1, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ color: 'rgba(244,217,166,0.85)', fontSize: 15 }}>⌕</span>
          <input
            autoFocus
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Search 25 destinations..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontSize: 14, fontFamily: FONT_SANS, fontWeight: 500,
            }}
          />
        </div>
        <button onClick={onClose} style={{
          padding: '12px 14px', borderRadius: 14,
          ...glass({}), color: '#fff', fontSize: 13, fontWeight: 500,
          border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
        }}>Close</button>
      </div>
      <div style={{ overflow: 'auto', padding: '10px 14px 100px' }}>
        {results.length === 0 && value && (
          <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
            No matches for "{value}"
          </div>
        )}
        {!value && (
          <div style={{ padding: '14px 8px 6px', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(244,217,166,0.85)' }}>Iconic destinations</div>
        )}
        {results.map(c => (
          <button key={c.id} onClick={() => onPick(c)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 14px', marginBottom: 6,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14, cursor: 'pointer', textAlign: 'left',
          }}>
            <div style={{
              width: 46, height: 46, borderRadius: 10,
              backgroundImage: `url(${c.hero})`, backgroundSize: 'cover', backgroundPosition: 'center',
              flexShrink: 0,
            }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 14, color: '#fff', fontWeight: 600 }}>
                <span style={{ marginRight: 6 }}>{c.flag}</span>{c.name}
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: 'rgba(244,217,166,0.85)', letterSpacing: 0.6, marginTop: 2 }}>
                {c.country} · {c.cost} · {c.season.split(' · ')[0]}
              </div>
            </div>
            <span style={{ color: 'rgba(244,217,166,0.85)', fontSize: 16 }}>›</span>
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
      opacity: hidden ? 0 : 1,
      transition: 'opacity 250ms',
    }}>
      <div style={{
        padding: '0 16px 6px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: FONT_SANS, fontSize: 9.5, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(244,217,166,0.9)' }}>Popular right now</span>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, fontStyle: 'italic', color: 'rgba(255,255,255,0.55)' }}>swipe →</span>
      </div>
      <div style={{
        display: 'flex', gap: 10, overflowX: 'auto', padding: '4px 16px 4px',
        scrollbarWidth: 'none',
      }}>
        {popular.map(c => (
          <button key={c.id} onClick={() => onPick(c)} style={{
            flex: '0 0 132px', height: 88,
            position: 'relative', borderRadius: 16, overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundImage: `url(${c.hero})`, backgroundSize: 'cover', backgroundPosition: 'center',
            cursor: 'pointer', padding: 0,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.85) 100%)',
            }}/>
            <div style={{
              position: 'absolute', left: 10, right: 10, bottom: 8, textAlign: 'left',
            }}>
              <div style={{ fontSize: 14, marginBottom: 2 }}>{c.flag}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 500, color: '#fff', lineHeight: 1.0 }}>{c.name}</div>
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
      padding: '0 14px 100px',
      transform: visible ? 'translateY(0)' : 'translateY(110%)',
      transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
      zIndex: 30,
    }}>
      <div style={glass({ borderRadius: 28, overflow: 'hidden', position: 'relative' })}>
        <div style={{
          position: 'relative', height: 220,
          backgroundImage: `url(${city.hero})`, backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.0) 30%, rgba(8,12,28,0.7) 75%, rgba(8,12,28,0.95) 100%)' }}/>
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 16,
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)',
            fontSize: 14, lineHeight: 1, cursor: 'pointer',
          }}>✕</button>
          <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.45)' }}/>
          <div style={{ position: 'absolute', left: 22, right: 22, bottom: 16 }}>
            <div style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: 'rgba(244,217,166,0.95)', marginBottom: 2 }}>
              <span style={{ marginRight: 6 }}>{city.flag}</span>{city.country}
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 38, lineHeight: 1.0, fontWeight: 500, color: '#fff', letterSpacing: -0.5 }}>{city.name}</div>
          </div>
        </div>

        <div style={{ padding: '18px 22px 22px' }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 17, lineHeight: 1.35, color: 'rgba(255,255,255,0.86)', marginBottom: 18 }}>
            "{city.hook}"
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            <div style={glass({ borderRadius: 14, padding: '10px 12px' })}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(244,217,166,0.85)', marginBottom: 4 }}>Best Time</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: '#fff', fontWeight: 500 }}>{city.season}</div>
            </div>
            <div style={glass({ borderRadius: 14, padding: '10px 12px' })}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(244,217,166,0.85)', marginBottom: 4 }}>Trip Cost</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: '#fff', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                {city.cost} {costPips(city.cost)}
              </div>
            </div>
          </div>
          <button onClick={() => onBringMe(city)} style={ctaPrimaryStyle}>Bring Me There →</button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => onSave(city)} style={{ flex: 1, padding: '13px 0', ...glass({ borderRadius: 14 }), fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500, color: saved ? '#F4D9A6' : '#fff', cursor: 'pointer' }}>
              {saved ? '♥ Saved' : '♡ Save'}
            </button>
            <button onClick={() => onItinerary(city)} style={{ flex: 1, padding: '13px 0', ...glass({ borderRadius: 14 }), fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500, color: '#fff', cursor: 'pointer' }}>
              View Itinerary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ctaPrimaryStyle = {
  width: '100%', padding: '16px 20px',
  background: 'linear-gradient(180deg, #F8E2B4 0%, #E5BD7A 100%)',
  border: 'none', borderRadius: 16,
  fontFamily: FONT_SANS, fontSize: 15, fontWeight: 600, letterSpacing: 0.4,
  color: '#1A1410', cursor: 'pointer',
  boxShadow: '0 6px 24px rgba(229,189,122,0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
  marginBottom: 10,
};

function BottomNav({ active, onChange }) {
  const items = [
    { id: 'globe', label: 'Globe', icon: '🌐' },
    { id: 'trips', label: 'Trips', icon: '✈' },
    { id: 'wishlist', label: 'Wishlist', icon: '♡' },
    { id: 'surprise', label: 'Surprise', icon: '✦' },
    { id: 'profile', label: 'Profile', icon: '◐' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 14, right: 14, bottom: 18,
      ...glass({
        borderRadius: 28, padding: '10px 8px 12px',
        background: 'linear-gradient(180deg, rgba(20,28,52,0.55), rgba(10,14,30,0.75))',
      }),
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      zIndex: 20,
    }}>
      {items.map(it => {
        const isActive = active === it.id;
        const isSurprise = it.id === 'surprise';
        return (
          <button key={it.id} onClick={() => onChange(it.id)} style={{
            flex: 1, padding: '6px 4px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: isActive ? '#F4D9A6' : 'rgba(255,255,255,0.55)',
          }}>
            <span style={{
              width: 32, height: 32, borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              background: isActive ? (isSurprise ? 'radial-gradient(circle, rgba(244,217,166,0.35), transparent)' : 'rgba(244,217,166,0.15)') : 'transparent',
              color: isActive ? '#F4D9A6' : 'rgba(255,255,255,0.7)',
            }}>{it.icon}</span>
            <span style={{ fontFamily: FONT_SANS, fontSize: 9.5, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase' }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function PhotoGallery({ photos }) {
  const [idx, setIdx] = useS(0);
  const containerRef = useR(null);
  const onScroll = (e) => {
    const w = e.target.clientWidth;
    const next = Math.round(e.target.scrollLeft / w);
    if (next !== idx) setIdx(next);
  };
  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef} onScroll={onScroll} style={{
        display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
      }}>
        {photos.map((p, i) => (
          <div key={i} style={{
            flex: '0 0 100%', height: 240, scrollSnapAlign: 'start',
            backgroundImage: `url(${p})`, backgroundSize: 'cover', backgroundPosition: 'center',
          }}/>
        ))}
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 12,
        display: 'flex', justifyContent: 'center', gap: 6,
      }}>
        {photos.map((_, i) => (
          <span key={i} style={{
            width: i === idx ? 24 : 6, height: 6, borderRadius: 3,
            background: i === idx ? '#F4D9A6' : 'rgba(255,255,255,0.45)',
            transition: 'width 240ms',
          }}/>
        ))}
      </div>
      <div style={{
        position: 'absolute', top: 12, right: 14,
        padding: '5px 11px', borderRadius: 100,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)',
        fontFamily: FONT_SANS, fontSize: 11, fontWeight: 500, color: '#fff',
        border: '1px solid rgba(255,255,255,0.15)',
      }}>{idx + 1} / {photos.length}</div>
    </div>
  );
}

function PracticalInfo({ p }) {
  if (!p) return null;
  const rows = [
    { l: 'Currency', v: `${p.currency.symbol} ${p.currency.code}` },
    { l: 'Language', v: p.language },
    { l: 'Timezone', v: p.timezone },
    { l: 'Plug', v: p.plug },
    { l: 'Visa', v: p.visa },
    { l: 'Tipping', v: p.tipping },
  ];
  return (
    <div style={glass({ borderRadius: 18, padding: 16 })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(244,217,166,0.9)' }}>Know before you go</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT_SANS, fontSize: 12, color: 'rgba(244,217,166,0.95)', fontWeight: 600 }}>
          ⛨ Safety <span style={{ color: '#fff' }}>{p.safety.toFixed(1)}</span>
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 14px' }}>
        {rows.map((r, i) => (
          <div key={i}>
            <div style={{ fontFamily: FONT_SANS, fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(244,217,166,0.85)', marginBottom: 2 }}>{r.l}</div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: '#fff', fontWeight: 500, lineHeight: 1.3 }}>{r.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyWeather({ monthly }) {
  if (!monthly) return null;
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const maxT = Math.max(...monthly.temps);
  const minT = Math.min(...monthly.temps);
  const scoreColor = (s) => s >= 5 ? '#F4D9A6' : s >= 4 ? '#D8B47A' : s >= 3 ? '#7a8aa6' : 'rgba(255,255,255,0.18)';
  return (
    <div style={glass({ borderRadius: 18, padding: 16 })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <span style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(244,217,166,0.9)' }}>When to go</span>
        <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Avg high · Visit score</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 70 }}>
        {monthly.temps.map((t, i) => {
          const ratio = (t - minT) / Math.max(1, (maxT - minT));
          const h = 18 + ratio * 50;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontFamily: FONT_SANS, fontSize: 9, color: 'rgba(255,255,255,0.55)' }}>{t}°</span>
              <div style={{
                width: '100%', height: h, borderRadius: 3,
                background: `linear-gradient(180deg, ${scoreColor(monthly.scores[i])}, ${scoreColor(monthly.scores[i])}77)`,
                boxShadow: monthly.scores[i] >= 5 ? '0 0 12px rgba(244,217,166,0.4)' : 'none',
              }}/>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
        {months.map((m, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontFamily: FONT_SANS, fontSize: 10, fontWeight: 600, color: monthly.scores[i] >= 4 ? '#F4D9A6' : 'rgba(255,255,255,0.45)' }}>{m}</div>
        ))}
      </div>
    </div>
  );
}

function HotelsSection({ hotels }) {
  if (!hotels || hotels.length === 0) return null;
  return (
    <Section label="Where to stay · live availability">
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -22px', padding: '0 22px 6px', scrollbarWidth: 'none' }}>
        {hotels.map(h => (
          <div key={h.id} style={{ flex: '0 0 240px', ...glass({ borderRadius: 18 }), overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: 130, backgroundImage: `url(${h.img})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
              <div style={{
                position: 'absolute', top: 10, left: 10,
                padding: '4px 10px', borderRadius: 100,
                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
                fontFamily: FONT_SANS, fontSize: 9.5, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase',
                color: '#F4D9A6', border: '1px solid rgba(244,217,166,0.4)',
              }}>{h.tier}</div>
              {h.availability !== 'Available' && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  padding: '4px 10px', borderRadius: 100,
                  background: 'rgba(229,77,77,0.7)', fontFamily: FONT_SANS, fontSize: 10, fontWeight: 600, color: '#fff',
                }}>{h.availability}</div>
              )}
            </div>
            <div style={{ padding: '12px 14px 14px' }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2, lineHeight: 1.2 }}>{h.name}</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: 'rgba(244,217,166,0.85)', letterSpacing: 0.4, marginBottom: 8 }}>{h.area}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ color: '#F4D9A6', fontSize: 11 }}>{stars(h.rating)}</span>
                <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: '#fff', fontWeight: 600 }}>{h.rating.toFixed(1)}</span>
                <span style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: 'rgba(255,255,255,0.45)' }}>· {h.reviewCount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                {h.perks.slice(0, 3).map((perk, i) => (
                  <span key={i} style={{ padding: '3px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.07)', fontFamily: FONT_SANS, fontSize: 9.5, color: 'rgba(255,255,255,0.7)', fontWeight: 500, border: '1px solid rgba(255,255,255,0.05)' }}>{perk}</span>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: '#fff', fontWeight: 500 }}>${h.pricePerNight}</span>
                  <span style={{ fontFamily: FONT_SANS, fontSize: 10, color: 'rgba(255,255,255,0.45)', marginLeft: 4 }}>/night</span>
                </div>
                <button style={{ padding: '6px 12px', borderRadius: 100, background: 'rgba(244,217,166,0.15)', border: '1px solid rgba(244,217,166,0.4)', color: '#F4D9A6', fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Book</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ActivitiesSection({ activities }) {
  if (!activities || activities.length === 0) return null;
  return (
    <Section label="Bookable experiences">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activities.slice(0, 6).map(a => (
          <div key={a.id} style={{
            ...glass({ borderRadius: 16 }), padding: 12,
            display: 'flex', gap: 12, alignItems: 'center',
          }}>
            <div style={{ width: 72, height: 72, borderRadius: 12, backgroundImage: `url(${a.img})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3, lineHeight: 1.25 }}>{a.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontFamily: FONT_SANS, fontSize: 10.5, color: 'rgba(255,255,255,0.55)' }}>
                <span>⏱ {a.duration}</span>
                <span>· {a.area}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#F4D9A6', fontSize: 10 }}>★</span>
                <span style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, color: '#fff' }}>{a.rating}</span>
                <span style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: 'rgba(255,255,255,0.45)' }}>({a.reviewCount.toLocaleString()})</span>
                {a.booksFast && <span style={{ marginLeft: 4, padding: '2px 7px', borderRadius: 100, background: 'rgba(244,77,77,0.15)', border: '1px solid rgba(244,77,77,0.4)', color: '#ff9c9c', fontFamily: FONT_SANS, fontSize: 9, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Books fast</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: '#fff', fontWeight: 500, lineHeight: 1 }}>${a.price}</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 9.5, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>per person</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function FlightsSection({ flights, cityName }) {
  if (!flights || flights.length === 0) return null;
  const sorted = [...flights].sort((a, b) => a.price - b.price).slice(0, 4);
  return (
    <Section label={`Getting to ${cityName}`}>
      <div style={glass({ borderRadius: 18 })}>
        {sorted.map((f, i) => (
          <div key={f.id} style={{
            padding: '12px 16px',
            borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(244,217,166,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#F4D9A6' }}>✈</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: '#fff', fontWeight: 600 }}>{f.fromName} → {cityName}</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
                {f.airline} · {f.duration} · {f.stops === 0 ? 'Nonstop' : `${f.stops} stop`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 500, color: '#fff', lineHeight: 1 }}>${f.price}</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 9.5, color: 'rgba(244,217,166,0.85)', marginTop: 2 }}>{f.nextDeparture}</div>
            </div>
          </div>
        ))}
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
              background: 'rgba(244,217,166,0.15)', color: '#F4D9A6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT_SANS, fontSize: 11, fontWeight: 700,
            }}>{i + 1}</span>
            <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.45 }}>{tip}</div>
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
    <Section label={`Traveler reviews · ${avg} ★`}>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -22px', padding: '0 22px 6px', scrollbarWidth: 'none' }}>
        {reviews.map(r => (
          <div key={r.id} style={{ flex: '0 0 260px', ...glass({ borderRadius: 16 }), padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: '#fff', fontWeight: 600 }}>{r.author}</span>
              <span style={{ color: '#F4D9A6', fontSize: 11 }}>{stars(r.rating)}</span>
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 14, lineHeight: 1.45, color: 'rgba(255,255,255,0.82)', marginBottom: 8 }}">&#34;{r.text}&#34;</div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: 'rgba(255,255,255,0.45)' }}>{r.date}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function DbLoadingHint() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 0' }}>
      <div style={{ width: 40, height: 40, animation: 'spin 1.4s linear infinite' }}>
        <svg viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(244,217,166,0.2)" strokeWidth="2"/>
          <path d="M20 4 A16 16 0 0 1 36 20" fill="none" stroke="#F4D9A6" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: 'rgba(244,217,166,0.85)', letterSpacing: 2, textTransform: 'uppercase' }}>Loading availability…</div>
    </div>
  );
}

function CityDetail({ city, onBack, onWish, wished }) {
  const [db, setDb] = useS(null);
  const [loading, setLoading] = useS(true);

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

  const itinerary = [
    { day: 'Day 1', title: 'Settle in & wander', items: [`Arrive — coffee in ${city.neighborhoods[0].name}`, `Sunset walk to ${city.places[0].name}`, 'Casual neighborhood dinner'] },
    { day: 'Day 2', title: 'The icons', items: [`Morning: ${city.places[1].name}`, `Afternoon: ${city.places[2].name}`, `Evening: ${city.food[0]} & wine`] },
    { day: 'Day 3', title: 'Slow & local', items: [`Market crawl in ${city.neighborhoods[1].name}`, `Hidden corner: ${city.places[3].name}`, 'Last-night rooftop'] },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#070B1C', overflow: 'auto', overscrollBehavior: 'contain' }}>
      <div style={{ position: 'relative' }}>
        <PhotoGallery photos={city.photos || [city.hero]}/>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(7,11,28,0.4) 0%, rgba(7,11,28,0.0) 35%, rgba(7,11,28,0.0) 60%, rgba(7,11,28,1) 100%)' }}/>
        <button onClick={onBack} style={{
          position: 'absolute', top: 50, left: 16, width: 40, height: 40, borderRadius: 20,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.18)', color: '#fff', fontSize: 18, cursor: 'pointer',
          zIndex: 5,
        }}>‹</button>
        <button onClick={() => onWish(city)} style={{
          position: 'absolute', top: 50, right: 16, width: 40, height: 40, borderRadius: 20,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.18)', color: wished ? '#F4D9A6' : '#fff', fontSize: 16, cursor: 'pointer',
          zIndex: 5,
        }}>{wished ? '♥' : '♡'}</button>
      </div>

      <div style={{ padding: '20px 22px 0' }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: 2.6, textTransform: 'uppercase', color: 'rgba(244,217,166,0.95)', marginBottom: 6 }}>
          <span style={{ marginRight: 6 }}>{city.flag}</span>{city.country}
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 48, lineHeight: 0.95, fontWeight: 500, color: '#fff', letterSpacing: -1.0 }}>{city.name}</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 16, lineHeight: 1.35, color: 'rgba(255,255,255,0.78)', marginTop: 12, marginBottom: 8 }}">&#34;{city.hook}&#34;</div>
      </div>

      <div style={{ padding: '14px 22px 140px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 22 }}>
          {[
            { l: 'Best', v: city.season.split(' · ')[0] },
            { l: 'Cost', v: city.cost },
            { l: 'Daily', v: city.daily },
            { l: 'Hotel', v: db ? `$${db.summary.hotelFrom}+` : '—' },
          ].map((s, i) => (
            <div key={i} style={glass({ borderRadius: 14, padding: '10px 8px', textAlign: 'center' })}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 8.5, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(244,217,166,0.85)', marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: '#fff', fontWeight: 600 }}>{s.v}</div>
            </div>
          ))}
        </div>

        <Section label="Overview">
          <div style={{ fontFamily: FONT_SANS, fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.78)' }}>{city.overview}</div>
        </Section>

        <PracticalInfoSection p={city.practical}/>
        <MonthlyWeatherSection monthly={city.monthly}/>

        {loading ? <DbLoadingHint/> : (
          <>
            <HotelsSection hotels={db?.hotels}/>
            <ActivitiesSection activities={db?.activities}/>
            <FlightsSection flights={db?.flights} cityName={city.name}/>
          </>
        )}

        <Section label="Top 5 iconic places">
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -22px', padding: '0 22px 6px', scrollbarWidth: 'none' }}>
            {city.places.map((p, i) => (
              <div key={i} style={{ flex: '0 0 144px', ...glass({ borderRadius: 16 }), overflow: 'hidden' }}>
                <div style={{ height: 100, backgroundImage: `url(${p.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}/>
                <div style={{ padding: '10px 12px 12px' }}>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: '#fff', fontWeight: 600, marginBottom: 2, lineHeight: 1.2 }}>{p.name}</div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 10.5, color: 'rgba(244,217,166,0.85)', letterSpacing: 0.6 }}>{p.area}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Suggested 3-day itinerary">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {itinerary.map((d, i) => (
              <div key={i} style={glass({ borderRadius: 16, padding: '14px 16px' })}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: '#fff', fontWeight: 500 }}>{d.day}</span>
                  <span style={{ fontFamily: FONT_SANS, fontSize: 11, color: 'rgba(244,217,166,0.85)', letterSpacing: 0.6, textTransform: 'uppercase' }}>{d.title}</span>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {d.items.map((it, j) => (
                    <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: FONT_SANS, fontSize: 13, color: 'rgba(255,255,255,0.78)', lineHeight: 1.4 }}>
                      <span style={{ width: 4, height: 4, borderRadius: 2, background: '#F4D9A6', marginTop: 7, flexShrink: 0 }}/>
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Food to try">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {city.food.map((f, i) => (
              <div key={i} style={{ ...glass({ borderRadius: 100 }), padding: '8px 14px', fontFamily: FONT_SANS, fontSize: 12, color: '#fff', fontWeight: 500 }}>{f}</div>
            ))}
          </div>
        </Section>

        <Section label="Where to stay · neighborhoods">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {city.neighborhoods.map((n, i) => (
              <div key={i} style={{ ...glass({ borderRadius: 14, padding: '12px 16px' }), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: '#fff', fontWeight: 600, marginBottom: 2 }}>{n.name}</div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: 'rgba(255,255,255,0.55)' }}>{n.vibe}</div>
                </div>
                <span style={{ color: 'rgba(244,217,166,0.85)', fontSize: 16 }}>›</span>
              </div>
            ))}
          </div>
        </Section>

        <TipsSection tips={city.tips}/>
        {!loading && <ReviewsSection reviews={db?.reviews}/>}

        {db && (
          <div style={{
            ...glass({ borderRadius: 18 }), padding: 16, marginTop: 8, marginBottom: 20,
            background: 'linear-gradient(180deg, rgba(244,217,166,0.10), rgba(244,217,166,0.04))',
            border: '1px solid rgba(244,217,166,0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: 'rgba(244,217,166,0.95)', marginBottom: 4 }}>3-day total estimate</div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>flight + hotel + 4 activities</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 500, color: '#fff', lineHeight: 1 }}>${db.summary.total3DayFrom.toLocaleString()}</div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: 'rgba(244,217,166,0.85)', marginTop: 2 }}>per person, from</div>
              </div>
            </div>
          </div>
        )}

        <button style={{ ...ctaPrimaryStyle, marginTop: 10 }}>Build My Trip</button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onWish(city)} style={{ flex: 1, padding: '14px 0', ...glass({ borderRadius: 14 }), fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500, color: wished ? '#F4D9A6' : '#fff', cursor: 'pointer' }}>{wished ? '♥ Wishlisted' : '♡ Add to Wishlist'}</button>
          <button style={{ flex: 1, padding: '14px 0', ...glass({ borderRadius: 14 }), fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500, color: '#fff', cursor: 'pointer' }}>↗ Share City</button>
        </div>
      </div>
    </div>
  );
}

function PracticalInfoSection({ p }) {
  return (
    <Section label="Know before you go">
      <PracticalInfo p={p}/>
    </Section>
  );
}

function MonthlyWeatherSection({ monthly }) {
  return (
    <Section label="When to go">
      <MonthlyWeather monthly={monthly}/>
    </Section>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(244,217,166,0.9)', marginBottom: 12 }}>{label}</div>
      {children}
    </div>
  );
}

function Wishlist({ cities, savedIds, onTap }) {
  const list = cities.filter(c => savedIds.includes(c.id));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#070B1C', overflow: 'auto' }}>
      <div style={{ padding: '70px 22px 24px', background: 'linear-gradient(180deg, rgba(20,28,55,0.5), transparent)' }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: 2.6, textTransform: 'uppercase', color: 'rgba(244,217,166,0.95)', marginBottom: 6 }}>Your collection</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 44, lineHeight: 1, fontWeight: 500, color: '#fff', letterSpacing: -1 }}>Wishlist</div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 8 }}>{list.length} {list.length === 1 ? 'destination' : 'destinations'} saved · drift through later</div>
      </div>
      <div style={{ padding: '8px 16px 140px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {list.length === 0 && (
          <div style={{ ...glass({ borderRadius: 20, padding: '40px 24px' }), textAlign: 'center', fontFamily: FONT_SANS, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>♡</div>
            Tap the heart on any city to start curating your shortlist.
          </div>
        )}
        {list.map(c => (
          <button key={c.id} onClick={() => onTap(c)} style={{ position: 'relative', width: '100%', padding: 0, border: 'none', cursor: 'pointer', borderRadius: 22, overflow: 'hidden', height: 200, background: '#000', textAlign: 'left' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${c.hero})`, backgroundSize: 'cover', backgroundPosition: 'center' }}/>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.85) 100%)' }}/>
            <div style={{ position: 'absolute', top: 14, right: 14, color: '#F4D9A6', fontSize: 18 }}>♥</div>
            <div style={{ position: 'absolute', left: 18, right: 18, bottom: 16 }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(244,217,166,0.95)', marginBottom: 4 }}>
                <span style={{ marginRight: 6 }}>{c.flag}</span>{c.country}
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, lineHeight: 1, fontWeight: 500, color: '#fff', letterSpacing: -0.4, marginBottom: 8 }}>{c.name}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 13, color: 'rgba(255,255,255,0.78)', lineHeight: 1.3 }}">&#34;{c.hook}&#34;</div>
            </div>
          </button>
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
        background: phase === 'spinning' ? 'radial-gradient(circle, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)' : 'radial-gradient(circle, rgba(244,217,166,0.10) 0%, rgba(0,0,0,0.6) 80%)',
        transition: 'background 600ms',
      }}/>
      {phase === 'spinning' && (
        <div style={{ position: 'relative', textAlign: 'center', marginTop: -80 }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(244,217,166,0.95)', marginBottom: 12 }}>Searching the world</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontStyle: 'italic', color: 'rgba(255,255,255,0.92)', letterSpacing: -0.3 }}>where shall we send you?</div>
          <div style={{ margin: '24px auto 0', width: 70, height: 70, animation: 'spin 1.4s linear infinite' }}>
            <svg viewBox="0 0 70 70" style={{ width: '100%', height: '100%' }}>
              <circle cx="35" cy="35" r="30" fill="none" stroke="rgba(244,217,166,0.25)" strokeWidth="1"/>
              <path d="M35 5 A30 30 0 0 1 65 35" fill="none" stroke="#F4D9A6" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      )}
      {phase === 'revealing' && city && (
        <div style={{ textAlign: 'center', marginTop: -120, animation: 'revealIn 700ms cubic-bezier(0.22, 1, 0.36, 1) both' }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 3.5, textTransform: 'uppercase', color: 'rgba(244,217,166,0.95)', marginBottom: 14 }}>You're going to</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 64, lineHeight: 1, fontWeight: 500, color: '#fff', letterSpacing: -1.6, textShadow: '0 4px 40px rgba(244,217,166,0.4)' }}>{city.name}</div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: 2.4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>
            <span style={{ marginRight: 6 }}>{city.flag}</span>{city.country}
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
      padding: '14px 22px 14px 18px',
      borderRadius: 100,
      background: 'linear-gradient(180deg, rgba(244,217,166,0.95), rgba(220,180,110,0.92))',
      border: '1px solid rgba(255,230,180,0.6)',
      boxShadow: '0 8px 32px rgba(244,217,166,0.35), 0 2px 0 rgba(255,255,255,0.3) inset',
      display: 'inline-flex', alignItems: 'center', gap: 10,
      fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, letterSpacing: 0.3,
      color: '#1A1410', cursor: 'pointer', zIndex: 15,
    }}>
      <span style={{ fontSize: 16 }}>✦</span>
      Surprise Me Around the Globe
    </button>
  );
}

Object.assign(window, {
  PreviewCard, BottomNav, CityDetail, Wishlist, SurpriseOverlay, SurpriseFab,
  PopularRail, SearchBar,
});
