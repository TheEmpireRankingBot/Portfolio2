// screens.js — UI for preview card, city detail page, wishlist, surprise reveal.
const { useState: useS, useEffect: useE, useRef: useR } = React;

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
  const map = { 'Budget': 1, 'Moderate': 2, 'Premium': 3 };
  const n = map[cost] || 2;
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: i < n ? '#F4D9A6' : 'rgba(255,255,255,0.25)',
        }}/>
      ))}
    </span>
  );
};

function PreviewCard({ city, visible, onClose, onBringMe, onSave, onItinerary, saved }) {
  if (!city) return null;
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '0 14px 100px',
        transform: visible ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
        zIndex: 30,
      }}
    >
      <div style={glass({
        borderRadius: 28,
        overflow: 'hidden',
        position: 'relative',
      })}>
        <div style={{
          position: 'relative',
          height: 220,
          backgroundImage: `url(${city.hero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.0) 30%, rgba(8,12,28,0.7) 75%, rgba(8,12,28,0.95) 100%)',
          }}/>
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14,
            width: 32, height: 32, borderRadius: 16,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: 'rgba(255,255,255,0.9)',
            fontSize: 14, lineHeight: 1, cursor: 'pointer',
          }}>✕</button>
          <div style={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            width: 36, height: 4, borderRadius: 2,
            background: 'rgba(255,255,255,0.45)',
          }}/>
          <div style={{ position: 'absolute', left: 22, right: 22, bottom: 16 }}>
            <div style={{
              fontFamily: FONT_SANS, fontSize: 11, letterSpacing: 2.4,
              textTransform: 'uppercase',
              color: 'rgba(244,217,166,0.95)',
              marginBottom: 2,
            }}>{city.country}</div>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: 38, lineHeight: 1.0,
              fontWeight: 500, color: '#fff',
              letterSpacing: -0.5,
            }}>{city.name}</div>
          </div>
        </div>

        <div style={{ padding: '18px 22px 22px' }}>
          <div style={{
            fontFamily: FONT_DISPLAY, fontStyle: 'italic',
            fontSize: 17, lineHeight: 1.35,
            color: 'rgba(255,255,255,0.86)',
            marginBottom: 18,
          }}>"{city.hook}"</div>

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

          <button onClick={() => onBringMe(city)} style={{
            width: '100%', padding: '16px 20px',
            background: 'linear-gradient(180deg, #F8E2B4 0%, #E5BD7A 100%)',
            border: 'none', borderRadius: 16,
            fontFamily: FONT_SANS, fontSize: 15, fontWeight: 600, letterSpacing: 0.4,
            color: '#1A1410', cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(229,189,122,0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
            marginBottom: 10,
          }}>Bring Me There →</button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => onSave(city)} style={{
              flex: 1, padding: '13px 0',
              ...glass({ borderRadius: 14 }),
              fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500,
              color: saved ? '#F4D9A6' : '#fff', cursor: 'pointer',
            }}>
              {saved ? '♥ Saved' : '♡ Save'}
            </button>
            <button onClick={() => onItinerary(city)} style={{
              flex: 1, padding: '13px 0',
              ...glass({ borderRadius: 14 }),
              fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500,
              color: '#fff', cursor: 'pointer',
            }}>View Itinerary</button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        borderRadius: 28,
        padding: '10px 8px 12px',
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
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
              background: isActive
                ? (isSurprise ? 'radial-gradient(circle, rgba(244,217,166,0.35), transparent)' : 'rgba(244,217,166,0.15)')
                : 'transparent',
              color: isActive ? '#F4D9A6' : 'rgba(255,255,255,0.7)',
            }}>{it.icon}</span>
            <span style={{
              fontFamily: FONT_SANS, fontSize: 9.5, fontWeight: 600,
              letterSpacing: 0.6, textTransform: 'uppercase',
            }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function CityDetail({ city, onBack, onWish, wished }) {
  if (!city) return null;
  const itinerary = [
    { day: 'Day 1', title: 'Settle in & wander', items: [`Arrive — coffee in ${city.neighborhoods[0].name}`, `Sunset walk to ${city.places[0].name}`, 'Casual neighborhood dinner'] },
    { day: 'Day 2', title: 'The icons', items: [`Morning: ${city.places[1].name}`, `Afternoon: ${city.places[2].name}`, `Evening: ${city.food[0]} & wine`] },
    { day: 'Day 3', title: 'Slow & local', items: [`Market crawl in ${city.neighborhoods[1].name}`, `Hidden corner: ${city.places[3].name}`, 'Last-night rooftop'] },
  ];
  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#070B1C',
      overflow: 'auto', overscrollBehavior: 'contain',
    }}>
      <div style={{
        position: 'relative', height: 380,
        backgroundImage: `url(${city.hero})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,11,28,0.4) 0%, rgba(7,11,28,0.0) 35%, rgba(7,11,28,0.5) 70%, rgba(7,11,28,1) 100%)' }}/>
        <button onClick={onBack} style={{
          position: 'absolute', top: 60, left: 16,
          width: 40, height: 40, borderRadius: 20,
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff', fontSize: 18, cursor: 'pointer',
        }}>‹</button>
        <button onClick={() => onWish(city)} style={{
          position: 'absolute', top: 60, right: 16,
          width: 40, height: 40, borderRadius: 20,
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: wished ? '#F4D9A6' : '#fff', fontSize: 16, cursor: 'pointer',
        }}>{wished ? '♥' : '♡'}</button>
        <div style={{ position: 'absolute', left: 22, right: 22, bottom: 22 }}>
          <div style={{
            fontFamily: FONT_SANS, fontSize: 11, letterSpacing: 2.6,
            textTransform: 'uppercase', color: 'rgba(244,217,166,0.95)', marginBottom: 6,
          }}>{city.country}</div>
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: 56, lineHeight: 0.95,
            fontWeight: 500, color: '#fff', letterSpacing: -1.2,
          }}>{city.name}</div>
          <div style={{
            fontFamily: FONT_DISPLAY, fontStyle: 'italic',
            fontSize: 15, lineHeight: 1.3,
            color: 'rgba(255,255,255,0.8)',
            marginTop: 10, maxWidth: 300,
          }}>"{city.hook}"</div>
        </div>
      </div>

      <div style={{ padding: '22px 22px 140px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 26 }}>
          {[
            { l: 'Best', v: city.season.split(' · ')[0] },
            { l: 'Cost', v: city.cost },
            { l: 'Daily', v: city.daily },
          ].map((s,i) => (
            <div key={i} style={glass({ borderRadius: 14, padding: '12px 10px', textAlign: 'center' })}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 8.5, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(244,217,166,0.85)', marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: '#fff', fontWeight: 600 }}>{s.v}</div>
            </div>
          ))}
        </div>

        <Section label="Overview">
          <div style={{ fontFamily: FONT_SANS, fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.78)' }}>{city.overview}</div>
        </Section>

        <Section label="Top 5 iconic places">
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -22px', padding: '0 22px 6px', scrollbarWidth: 'none' }}>
            {city.places.map((p, i) => (
              <div key={i} style={{
                flex: '0 0 144px',
                ...glass({ borderRadius: 16 }),
                overflow: 'hidden',
              }}>
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
              <div key={i} style={{
                ...glass({ borderRadius: 100 }),
                padding: '8px 14px',
                fontFamily: FONT_SANS, fontSize: 12, color: '#fff', fontWeight: 500,
              }}>{f}</div>
            ))}
          </div>
        </Section>

        <Section label="Where to stay">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {city.neighborhoods.map((n, i) => (
              <div key={i} style={{
                ...glass({ borderRadius: 14, padding: '12px 16px' }),
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: '#fff', fontWeight: 600, marginBottom: 2 }}>{n.name}</div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: 'rgba(255,255,255,0.55)' }}>{n.vibe}</div>
                </div>
                <span style={{ color: 'rgba(244,217,166,0.85)', fontSize: 16 }}>›</span>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Weather & best season">
          <div style={{
            ...glass({ borderRadius: 16, padding: '16px 18px' }),
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: '#fff', fontWeight: 500 }}>{city.weather.split(' / ')[0]}</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{city.weather.split(' / ')[1]}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 9.5, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(244,217,166,0.85)', marginBottom: 3 }}>Best Season</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: '#fff', fontWeight: 500 }}>{city.season}</div>
            </div>
          </div>
        </Section>

        <button style={{
          width: '100%', padding: '17px 20px',
          background: 'linear-gradient(180deg, #F8E2B4 0%, #E5BD7A 100%)',
          border: 'none', borderRadius: 16,
          fontFamily: FONT_SANS, fontSize: 15, fontWeight: 600, letterSpacing: 0.4,
          color: '#1A1410', cursor: 'pointer',
          boxShadow: '0 6px 24px rgba(229,189,122,0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
          marginTop: 30, marginBottom: 10,
        }}>Build My Trip</button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onWish(city)} style={{
            flex: 1, padding: '14px 0',
            ...glass({ borderRadius: 14 }),
            fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500,
            color: wished ? '#F4D9A6' : '#fff', cursor: 'pointer',
          }}>{wished ? '♥ Wishlisted' : '♡ Add to Wishlist'}</button>
          <button style={{
            flex: 1, padding: '14px 0',
            ...glass({ borderRadius: 14 }),
            fontFamily: FONT_SANS, fontSize: 13, fontWeight: 500,
            color: '#fff', cursor: 'pointer',
          }}>↗ Share City</button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{
        fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 2.2,
        textTransform: 'uppercase', color: 'rgba(244,217,166,0.9)', marginBottom: 12,
      }}>{label}</div>
      {children}
    </div>
  );
}

function Wishlist({ cities, savedIds, onTap, onBack }) {
  const list = cities.filter(c => savedIds.includes(c.id));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#070B1C', overflow: 'auto' }}>
      <div style={{
        padding: '70px 22px 24px',
        background: 'linear-gradient(180deg, rgba(20,28,55,0.5), transparent)',
      }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: 2.6, textTransform: 'uppercase', color: 'rgba(244,217,166,0.95)', marginBottom: 6 }}>Your collection</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 44, lineHeight: 1, fontWeight: 500, color: '#fff', letterSpacing: -1 }}>Wishlist</div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 8 }}>
          {list.length} {list.length === 1 ? 'destination' : 'destinations'} saved · drift through later
        </div>
      </div>
      <div style={{ padding: '8px 16px 140px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {list.length === 0 && (
          <div style={{
            ...glass({ borderRadius: 20, padding: '40px 24px' }),
            textAlign: 'center',
            fontFamily: FONT_SANS, fontSize: 13, color: 'rgba(255,255,255,0.6)',
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>♡</div>
            Tap the heart on any city to start curating your shortlist.
          </div>
        )}
        {list.map(c => (
          <button key={c.id} onClick={() => onTap(c)} style={{
            position: 'relative', width: '100%', padding: 0, border: 'none', cursor: 'pointer',
            borderRadius: 22, overflow: 'hidden',
            height: 200, background: '#000',
            textAlign: 'left',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${c.hero})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
            }}/>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.85) 100%)',
            }}/>
            <div style={{ position: 'absolute', top: 14, right: 14, color: '#F4D9A6', fontSize: 18 }}>♥</div>
            <div style={{ position: 'absolute', left: 18, right: 18, bottom: 16 }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(244,217,166,0.95)', marginBottom: 4 }}>{c.country}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, lineHeight: 1, fontWeight: 500, color: '#fff', letterSpacing: -0.4, marginBottom: 8 }}>{c.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 13, color: 'rgba(255,255,255,0.78)', lineHeight: 1.3, flex: 1 }}>"{c.hook}"</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT_SANS, fontSize: 11, color: 'rgba(255,255,255,0.85)', flexShrink: 0 }}>
                  {c.cost}
                </div>
              </div>
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
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',
      zIndex: 25,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: phase === 'spinning'
          ? 'radial-gradient(circle, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)'
          : 'radial-gradient(circle, rgba(244,217,166,0.10) 0%, rgba(0,0,0,0.6) 80%)',
        transition: 'background 600ms',
      }}/>
      {phase === 'spinning' && (
        <div style={{ position: 'relative', textAlign: 'center', marginTop: -80 }}>
          <div style={{
            fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 3,
            textTransform: 'uppercase', color: 'rgba(244,217,166,0.95)', marginBottom: 12,
          }}>Searching the world</div>
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: 28, fontStyle: 'italic',
            color: 'rgba(255,255,255,0.92)', letterSpacing: -0.3,
          }}>where shall we send you?</div>
          <div style={{
            margin: '24px auto 0', width: 70, height: 70, position: 'relative',
            animation: 'spin 1.4s linear infinite',
          }}>
            <svg viewBox="0 0 70 70" style={{ width: '100%', height: '100%' }}>
              <circle cx="35" cy="35" r="30" fill="none" stroke="rgba(244,217,166,0.25)" strokeWidth="1"/>
              <path d="M35 5 A30 30 0 0 1 65 35" fill="none" stroke="#F4D9A6" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      )}
      {phase === 'revealing' && city && (
        <div style={{
          textAlign: 'center', marginTop: -120,
          animation: 'revealIn 700ms cubic-bezier(0.22, 1, 0.36, 1) both',
        }}>
          <div style={{
            fontFamily: FONT_SANS, fontSize: 10, letterSpacing: 3.5,
            textTransform: 'uppercase', color: 'rgba(244,217,166,0.95)', marginBottom: 14,
          }}>You're going to</div>
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: 64, lineHeight: 1,
            fontWeight: 500, color: '#fff', letterSpacing: -1.6,
            textShadow: '0 4px 40px rgba(244,217,166,0.4)',
          }}>{city.name}</div>
          <div style={{
            fontFamily: FONT_SANS, fontSize: 12, letterSpacing: 2.4,
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginTop: 10,
          }}>{city.country}</div>
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
      color: '#1A1410', cursor: 'pointer',
      zIndex: 15,
    }}>
      <span style={{ fontSize: 16 }}>✦</span>
      Surprise Me Around the Globe
    </button>
  );
}

Object.assign(window, { PreviewCard, BottomNav, CityDetail, Wishlist, SurpriseOverlay, SurpriseFab });
