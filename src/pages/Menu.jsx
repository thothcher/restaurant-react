import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon';
import ProductCard from '../components/ProductCard';
import { EmptyState, ErrorState, SkeletonCards } from '../components/bits';
import { toast } from '../components/Toasts';
import { api } from '../api/client';
import { config } from '../config';
import { useSeo } from '../hooks/useSeo';

const EMPTY = { q: '', cat: '', veg: '', spice: '', min: '', max: '', rate: '' };
const SPICE_LABELS = ['Not spicy (0)', 'Mild (1)', 'Medium (2)', 'Hot (3)', 'Very hot (4)', 'Extreme (5)'];

const toApi = (f) => ({
  Query: f.q, CategoryId: f.cat, Vegetarian: f.veg ? 'true' : undefined,
  Spiciness: f.spice, MinPrice: f.min, MaxPrice: f.max, Rate: f.rate,
});

export default function Menu() {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState(() => ({ ...EMPTY, ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, params.get(k) || ''])) }));
  const [applied, setApplied] = useState(filters); // debounced copy that actually drives fetching
  const [categories, setCategories] = useState([]);
  const [list, setList] = useState({ items: [], page: 1, hasMore: false, loading: true, loadingMore: false, error: null });
  const [attempt, setAttempt] = useState(0);
  const timer = useRef();
  const filtersRef = useRef(filters);
  const appliedRef = useRef(applied);

  useEffect(() => { api.categories().then(setCategories).catch(() => {}); }, []);

  const update = (patch, debounce = false) => {
    const next = { ...filtersRef.current, ...patch };
    filtersRef.current = next;
    setFilters(next);
    clearTimeout(timer.current);
    if (debounce) timer.current = setTimeout(() => setApplied(next), 350);
    else setApplied(next);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  // Fetch first page whenever the applied filters change; keep the URL shareable.
  useEffect(() => {
    appliedRef.current = applied;
    let off = false;
    setList({ items: [], page: 1, hasMore: false, loading: true, loadingMore: false, error: null });
    const qs = Object.fromEntries(Object.entries(applied).filter(([, v]) => v !== ''));
    setParams(qs, { replace: true });
    api.products({ ...toApi(applied), Page: 1, Take: config.PAGE_SIZE })
      .then((res) => { if (!off) setList({ items: res.products || [], page: 1, hasMore: !!res.hasMore, loading: false, loadingMore: false, error: null }); })
      .catch((error) => { if (!off) setList((l) => ({ ...l, loading: false, error })); });
    return () => { off = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applied, attempt]);

  // The URL changed from outside (e.g. header "Menu" link while filtered): adopt it.
  useEffect(() => {
    const fromUrl = { ...EMPTY, ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, params.get(k) || ''])) };
    if (Object.keys(EMPTY).some((k) => fromUrl[k] !== appliedRef.current[k])) {
      clearTimeout(timer.current);
      filtersRef.current = fromUrl;
      setFilters(fromUrl);
      setApplied(fromUrl);
    }
  }, [params]);

  const loadMore = async () => {
    const snapshot = appliedRef.current;
    const page = list.page + 1;
    setList((l) => ({ ...l, loadingMore: true }));
    try {
      const res = await api.products({ ...toApi(snapshot), Page: page, Take: config.PAGE_SIZE });
      if (appliedRef.current !== snapshot) return; // filters changed meanwhile
      setList((l) => ({ ...l, items: [...l.items, ...(res.products || [])], page, hasMore: !!res.hasMore, loadingMore: false }));
    } catch (err) {
      toast(err.message, 'error');
      setList((l) => ({ ...l, loadingMore: false }));
    }
  };

  const cat = categories.find((c) => String(c.id) === String(applied.cat));
  useSeo({
    title: cat ? `${cat.name} Menu` : 'Menu',
    description: cat ? `Order ${cat.name.toLowerCase()} from the Trattoria menu online.` : 'Explore the full Trattoria menu. Filter by category, vegetarian, spiciness, rating and price.',
    path: cat ? `/menu?cat=${cat.id}` : '/menu',
    noindex: [applied.q, applied.veg, applied.spice, applied.min, applied.max, applied.rate].some(Boolean), // avoid indexing endless filter combos
  });

  const { items, hasMore, loading, loadingMore, error } = list;

  return (
    <div className="container menu-layout">
      <aside className="filters" aria-label="Filters">
        <form onSubmit={(e) => e.preventDefault()} noValidate>
          <div className="filters-head">
            <h2>Filters</h2>
            <button type="button" className="link" onClick={() => update(EMPTY)}>Reset</button>
          </div>
          <div className="field">
            <label htmlFor="q">Search</label>
            <div className="input-wrap">
              <Icon name="search" className="input-ico" />
              <input id="q" name="q" type="search" className="has-ico" placeholder="Pizza, pasta…" autoComplete="off"
                value={filters.q} onChange={(e) => update({ q: e.target.value }, true)} />
            </div>
          </div>
          <div className="field">
            <span className="label">Category</span>
            <div className="chips">
              {categories.map((c) => (
                <button key={c.id} type="button" className="chip" aria-pressed={String(filters.cat) === String(c.id)}
                  onClick={() => update({ cat: String(filters.cat) === String(c.id) ? '' : String(c.id) })}>{c.name}</button>
              ))}
            </div>
          </div>
          <label className="check">
            <input type="checkbox" checked={!!filters.veg} onChange={(e) => update({ veg: e.target.checked ? '1' : '' })} />
            <span><Icon name="leaf" /> Vegetarian only</span>
          </label>
          <div className="field">
            <label htmlFor="spice">Spiciness</label>
            <select id="spice" value={filters.spice} onChange={(e) => update({ spice: e.target.value })}>
              <option value="">Any</option>
              {SPICE_LABELS.map((l, n) => <option key={n} value={n}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <span className="label">Price ({config.CURRENCY})</span>
            <div className="range">
              <input type="number" min="0" step="0.5" placeholder="Min" aria-label="Minimum price" value={filters.min} onChange={(e) => update({ min: e.target.value }, true)} />
              <span>–</span>
              <input type="number" min="0" step="0.5" placeholder="Max" aria-label="Maximum price" value={filters.max} onChange={(e) => update({ max: e.target.value }, true)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="rate">Minimum rating</label>
            <select id="rate" value={filters.rate} onChange={(e) => update({ rate: e.target.value })}>
              <option value="">Any</option>
              {[2, 3, 4].map((n) => <option key={n} value={n}>{n}+ stars</option>)}
            </select>
          </div>
        </form>
      </aside>

      <section className="results">
        <div className="results-head">
          <h1>Menu</h1>
          <span className="muted">{items.length ? `${items.length} dish${items.length === 1 ? '' : 'es'}${hasMore ? '+' : ''}` : ''}</span>
        </div>
        <div className="grid">
          {loading && <SkeletonCards n={6} />}
          {error && !loading && <ErrorState error={error} onRetry={() => setAttempt((a) => a + 1)} />}
          {!loading && !error && !items.length && <EmptyState title="No dishes found" text="Try adjusting or resetting your filters." icon="search" />}
          {items.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
        </div>
        {hasMore && (
          <div className="more">
            <button className={`btn btn-outline ${loadingMore ? 'is-loading' : ''}`} disabled={loadingMore} onClick={loadMore}><span>Load more</span></button>
          </div>
        )}
      </section>
    </div>
  );
}
