// app.js — Driftly main app. Orchestrates globe + screens + state.
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

  // Dismiss loading screen on first render
  useEf(() => {
    const t = setTimeout(() => {
      if (window._driftlyReady) { window._driftlyReady(); window._driftlyReady = null; }
    }, 320);
    return () => clearTimeout(t);
  }, []);

  const searchResults = useMm(() => {
    if (!searchQuery.trim()) return cities.filter(c => c.tier === 'iconic');
    const q = searchQuery.toLowerCase();
    return cities.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.vibes.some(v => v.includes(q)) ||
      c.hook.toLowerCase().includes(q)
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

  const onOpenDetail = () => {
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
    if (id === 'wishlist') { setView('wishlist'); setShowCard(false); }
    else if (id === 'globe') { setView('globe'); setShowCard(false); }
  };

  const onPickFromSearch = (city) => {
    setSearchOpen(false);
    setSearchQuery('');
    onCityTap(city);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at 35% 0%, #0F1A3C 0%, #060A1E 48%, #020408 100%)',
      overflow: 'hidden',
      fontFamily: APP_FONT_SANS,
      color: '#fff',
    }}>
      <Stars />

      {view === 'globe' && (
        <>
          {/* Top bar — brand + search */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 54,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 20px', zIndex: 5,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{
                width: 32, height: 32, borderRadius: 11,
                background: 'linear-gradient(135deg, #F8E2B4 0%, #C69038 100%)',
                boxShadow: '0 3px 18px rgba(244,217,166,0.38)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>✈</span>
              <span style={{
                fontFamily: APP_FONT_DISPLAY,
                fontSize: 28, fontWeight: 500,
                letterSpacing: -0.9, color: '#fff',
              }}>driftly</span>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {savedIds.length > 0 && (
                <button onClick={() => onTabChange('wishlist')} style={{
                  padding: '8px 12px', borderRadius: 20,
                  background: 'rgba(244,217,166,0.10)',
                  border: '1px solid rgba(244,217,166,0.25)',
                  color: '#F4D9A6', fontSize: 12, fontFamily: APP_FONT_SANS, fontWeight: 600,
                  cursor: 'pointer', letterSpacing: 0.2,
                }}>♥ {savedIds.length}</button>
              )}
              <button onClick={() => setSearchOpen(true)} style={{
                width: 40, height: 40, borderRadius: 20,
                background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.9)', fontSize: 17, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>⌕</button>
            </div>
          </div>

          {/* Tagline */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 108,
            textAlign: 'center', zIndex: 4,
            opacity: showCard || surprisePhase !== 'idle' ? 0 : 1,
            transition: 'opacity 280ms',
            pointerEvents: 'none',
          }}>
            <div style={{
              fontFamily: APP_FONT_SANS, fontSize: 10, letterSpacing: 3,
              textTransform: 'uppercase', color: 'rgba(244,217,166,0.82)', marginBottom: 5,
            }}>
              {hoverCity ? `${hoverCity.flag} ${hoverCity.country}` : 'tap any city · spin to explore'}
            </div>
            <div style={{
              fontFamily: APP_FONT_DISPLAY, fontSize: 27, fontStyle: 'italic',
              color: 'rgba(255,255,255,0.88)', letterSpacing: -0.4,
              transition: 'all 180ms',
            }}>
              {hoverCity ? hoverCity.name : 'drift somewhere new'}
            </div>
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

          {/* Destination rail */}
          <window.PopularRail
            cities={cities}
            onPick={onCityTap}
            hidden={showCard || surprisePhase !== 'idle'}
          />

          <window.SurpriseOverlay phase={surprisePhase} city={surpriseCity} />

          <window.PreviewCard
            city={selected}
            visible={showCard}
            onClose={closeCard}
            onBringMe={onOpenDetail}
            onSave={onSave}
            onItinerary={onOpenDetail}
            saved={selected ? savedIds.includes(selected.id) : false}
          />

          <window.BottomNav active={tab} onChange={onTabChange} />

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
          onBack={() => { setView('globe'); }}
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
            onRemove={onSave}
          />
          <window.BottomNav active="wishlist" onChange={onTabChange} />
        </>
      )}
    </div>
  );
}

function Stars() {
  const list = useMm(() => {
    const arr = [];
    for (let i = 0; i < 85; i++) {
      arr.push({
        x: Math.random() * 100, y: Math.random() * 100,
        s: Math.random() * 1.5 + 0.25,
        o: Math.random() * 0.55 + 0.12,
        d: Math.random() * 3.5 + 2,
      });
    }
    return arr;
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {list.map((s, i) => (
        <span key={i} style={{
          position: 'absolute',
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.s, height: s.s, borderRadius: '50%',
          background: '#fff', opacity: s.o,
          animation: `twinkle ${s.d}s ease-in-out infinite`,
          animationDelay: `${i * 0.11}s`,
        }} />
      ))}
    </div>
  );
}

window.GlobeTripApp = GlobeTripApp;
