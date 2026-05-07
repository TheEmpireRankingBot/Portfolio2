// app.js — GlobeTrip main app. Orchestrates globe + screens + state.
const { useState: useSt, useEffect: useEf, useRef: useRf, useMemo: useMm } = React;

const APP_FONT_DISPLAY = '"Cormorant Garamond", "Playfair Display", Georgia, serif';
const APP_FONT_SANS = '"Inter Tight", "SF Pro", -apple-system, system-ui, sans-serif';

function GlobeTripApp() {
  const cities = window.CITIES;
  const globeRef = useRf(null);

  const [tab, setTab] = useSt('globe');
  const [view, setView] = useSt('globe');
  const [selectedId, setSelectedId] = useSt(null);
  const [showCard, setShowCard] = useSt(false);
  const [savedIds, setSavedIds] = useSt([]);
  const [surprisePhase, setSurprisePhase] = useSt('idle');
  const [surpriseCity, setSurpriseCity] = useSt(null);
  const [searchOpen, setSearchOpen] = useSt(false);
  const [searchQuery, setSearchQuery] = useSt('');
  const [hoverCity, setHoverCity] = useSt(null);

  const selected = cities.find(c => c.id === selectedId);

  const searchResults = useMm(() => {
    if (!searchQuery.trim()) return cities.filter(c => c.tier === 'iconic');
    const q = searchQuery.toLowerCase();
    return cities.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.vibes.some(v => v.includes(q))
    );
  }, [searchQuery, cities]);

  const onCityTap = (city) => {
    setSelectedId(city.id);
    globeRef.current?.glideToCity(city, 700);
    setTimeout(() => setShowCard(true), 280);
  };

  const closeCard = () => {
    setShowCard(false);
    setTimeout(() => setSelectedId(null), 500);
  };

  const onSave = (city) => {
    setSavedIds(ids =>
      ids.includes(city.id) ? ids.filter(x => x !== city.id) : [...ids, city.id]
    );
  };

  const onBringMe = () => {
    setShowCard(false);
    setTimeout(() => setView('detail'), 200);
  };

  const onSurprise = () => {
    if (surprisePhase !== 'idle') return;
    setShowCard(false);
    setSelectedId(null);
    setSurprisePhase('spinning');
    const target = cities[Math.floor(Math.random() * cities.length)];
    globeRef.current?.spinToCity(target, 2400, 3);
    setTimeout(() => {
      setSurpriseCity(target);
      setSurprisePhase('revealing');
      setTimeout(() => {
        setSurprisePhase('idle');
        setSelectedId(target.id);
        setShowCard(true);
      }, 1800);
    }, 2400);
  };

  const onTabChange = (id) => {
    if (id === 'surprise') { onSurprise(); return; }
    setTab(id);
    if (id === 'wishlist') setView('wishlist');
    else if (id === 'globe') { setView('globe'); setShowCard(false); }
  };

  const onPickFromSearch = (city) => {
    setSearchOpen(false);
    setSearchQuery('');
    onCityTap(city);
  };

  const onPickFromRail = (city) => {
    onCityTap(city);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at 30% 0%, #0E1738 0%, #060A1E 45%, #02040C 100%)',
      overflow: 'hidden',
      fontFamily: APP_FONT_SANS,
      color: '#fff',
    }}>
      <Stars/>

      {view === 'globe' && (
        <>
          {/* Top bar — brand + search */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 56,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 22px', zIndex: 5,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 28, height: 28, borderRadius: 14,
                background: 'linear-gradient(135deg, #F4D9A6, #B88B4D)',
                boxShadow: '0 2px 14px rgba(244,217,166,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#1A1410', fontWeight: 700, fontSize: 13,
              }}>◐</span>
              <span style={{
                fontFamily: APP_FONT_DISPLAY, fontSize: 22, fontWeight: 500,
                letterSpacing: -0.3, color: '#fff',
              }}>GlobeTrip</span>
            </div>
            <button onClick={() => setSearchOpen(true)} style={{
              width: 38, height: 38, borderRadius: 19,
              background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff', fontSize: 15, cursor: 'pointer',
            }}>⌕</button>
          </div>

          {/* Tagline */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 110,
            textAlign: 'center', zIndex: 4,
            opacity: showCard || surprisePhase !== 'idle' ? 0 : 1,
            transition: 'opacity 300ms',
          }}>
            <div style={{
              fontFamily: APP_FONT_SANS, fontSize: 10.5, letterSpacing: 2.6,
              textTransform: 'uppercase', color: 'rgba(244,217,166,0.9)', marginBottom: 6,
            }}>
              {hoverCity ? `${hoverCity.flag} ${hoverCity.country}` : '25 destinations · spin the world'}
            </div>
            <div style={{
              fontFamily: APP_FONT_DISPLAY, fontSize: 26, fontStyle: 'italic',
              color: 'rgba(255,255,255,0.85)', letterSpacing: -0.3,
              transition: 'all 200ms',
            }}>{hoverCity ? hoverCity.name : 'where to next?'}</div>
          </div>

          {/* Globe */}
          <div style={{ position: 'absolute', inset: 0 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: '46%', height: 0 }}>
              <window.Globe
                ref={globeRef}
                cities={cities}
                size={320}
                onCityTap={onCityTap}
                onCityHover={setHoverCity}
                highlightId={surprisePhase === 'revealing' ? surpriseCity?.id : selectedId}
                autoRotate={true}
              />
            </div>
          </div>

          {/* Popular destinations rail */}
          <window.PopularRail
            cities={cities}
            onPick={onPickFromRail}
            hidden={showCard || surprisePhase !== 'idle'}
          />

          <window.SurpriseOverlay phase={surprisePhase} city={surpriseCity}/>
          <window.PreviewCard
            city={selected}
            visible={showCard}
            onClose={closeCard}
            onBringMe={onBringMe}
            onSave={onSave}
            onItinerary={onBringMe}
            saved={selected ? savedIds.includes(selected.id) : false}
          />
          <window.BottomNav active={tab} onChange={onTabChange}/>

          {searchOpen && (
            <window.SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClose={() => { setSearchOpen(false); setSearchQuery(''); }}
              results={searchResults}
              onPick={onPickFromSearch}
            />
          )}
        </>
      )}

      {view === 'detail' && (
        <window.CityDetail
          city={selected}
          onBack={() => setView('globe')}
          onWish={onSave}
          wished={selected ? savedIds.includes(selected.id) : false}
        />
      )}

      {view === 'wishlist' && (
        <>
          <window.Wishlist
            cities={cities}
            savedIds={savedIds}
            onTap={(c) => { setSelectedId(c.id); setView('detail'); }}
          />
          <window.BottomNav active="wishlist" onChange={onTabChange}/>
        </>
      )}
    </div>
  );
}

function Stars() {
  const stars = useMm(() => {
    const arr = [];
    for (let i = 0; i < 80; i++) {
      arr.push({
        x: Math.random() * 100, y: Math.random() * 100,
        s: Math.random() * 1.4 + 0.3,
        o: Math.random() * 0.6 + 0.2,
        d: Math.random() * 3 + 2,
      });
    }
    return arr;
  }, []);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {stars.map((s, i) => (
        <span key={i} style={{
          position: 'absolute',
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.s, height: s.s, borderRadius: '50%',
          background: '#fff', opacity: s.o,
          animation: `twinkle ${s.d}s ease-in-out infinite`,
          animationDelay: `${i * 0.13}s`,
        }}/>
      ))}
    </div>
  );
}

window.GlobeTripApp = GlobeTripApp;
