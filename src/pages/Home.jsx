import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon, { CATEGORY_ICONS } from '../components/Icon';
import ProductCard from '../components/ProductCard';
import { ErrorState, Img, SkeletonCards, EmptyState } from '../components/bits';
import { api } from '../api/client';
import { useSeo } from '../hooks/useSeo';

const PARALLAX = [0.12, -0.1, 0.2];

export default function Home() {
  useSeo({ description: 'Fresh pizzas, pastas, mains and desserts. Browse the Trattoria menu and order online in a few taps.' });
  const [data, setData] = useState(null); // { cats, top } as settled results

  useEffect(() => {
    let off = false;
    Promise.allSettled([api.categories(), api.products({ Page: 1, Take: 50 })]).then(([cats, top]) => { if (!off) setData({ cats, top }); });
    return () => { off = true; };
  }, []);

  const best = data?.top.status === 'fulfilled'
    ? [...(data.top.value.products || [])].sort((a, b) => b.rate - a.rate) : [];
  const pics = best.filter((p) => p.image).slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="hero-inner container">
          <div className="hero-text">
            <p className="eyebrow" data-aos="fade-up">Fresh · Handmade · Delivered</p>
            <h1 data-aos="fade-up" data-aos-delay="80">Authentic flavours, ordered in a few taps.</h1>
            <p className="lead" data-aos="fade-up" data-aos-delay="160">Explore our menu, filter by what you love, and have your meal taken care of.</p>
            <div className="hero-actions" data-aos="fade-up" data-aos-delay="240">
              <Link className="btn btn-primary btn-lg" to="/menu">Browse the menu <Icon name="arrow" /></Link>
              <Link className="btn btn-outline btn-lg" to="/menu?veg=1"><Icon name="leaf" /> Vegetarian picks</Link>
            </div>
          </div>
          <div className="hero-media" aria-hidden="true">
            {pics.length
              ? pics.slice(0, 3).map((p, i) => <figure key={p.id} data-parallax={PARALLAX[i]}><Img src={p.image} eager /></figure>)
              : [0, 1, 2].map((i) => <figure key={i} className="skeleton" />)}
          </div>
        </div>
      </section>

      <section className="container features">
        <div className="feature" data-aos="fade-up"><Icon name="leaf" /><div><h3>Fresh ingredients</h3><p>Seasonal produce and handmade dough, every day.</p></div></div>
        <div className="feature" data-aos="fade-up" data-aos-delay="100"><Icon name="clock" /><div><h3>Order in seconds</h3><p>Save your cart and check out whenever you're ready.</p></div></div>
        <div className="feature" data-aos="fade-up" data-aos-delay="200"><Icon name="shield" /><div><h3>Secure account</h3><p>Verified email and protected sessions.</p></div></div>
      </section>

      <section className="container section">
        <h2 className="section-title" data-aos="fade-right">Categories</h2>
        <div className="cat-grid">
          {!data && [0, 1, 2].map((i) => <div key={i} className="skeleton cat-tile" />)}
          {data?.cats.status === 'fulfilled' && data.cats.value.map((c, i) => (
            <Link key={c.id} className="cat-tile" to={`/menu?cat=${c.id}`} data-aos="fade-up" data-aos-delay={i * 60}>
              <Icon name={CATEGORY_ICONS[c.name] || 'utensils'} /><span>{c.name}</span>
            </Link>
          ))}
          {data?.cats.status === 'rejected' && <p className="muted">{data.cats.reason.message}</p>}
        </div>
      </section>

      <section className="container section">
        <div className="section-head" data-aos="fade-right">
          <h2 className="section-title">Top rated</h2>
          <Link to="/menu" className="more-link">View all <Icon name="arrow" /></Link>
        </div>
        <div className="grid">
          {!data && <SkeletonCards n={4} />}
          {data?.top.status === 'fulfilled' && (best.length
            ? best.slice(0, 4).map((p, i) => <ProductCard key={p.id} p={p} index={i} />)
            : <EmptyState title="No dishes yet" text="Check back soon." />)}
          {data?.top.status === 'rejected' && <ErrorState error={data.top.reason} />}
        </div>
      </section>

      <section className="band" aria-label="Order now">
        <div className="band-bg" data-parallax="0.18" style={pics[3] ? { backgroundImage: `url("${pics[3].image}")` } : undefined} />
        <div className="band-content container" data-aos="zoom-in">
          <h2>Hungry already?</h2>
          <p>Your next favourite dish is a couple of clicks away.</p>
          <Link className="btn btn-primary btn-lg" to="/menu">Order now <Icon name="arrow" /></Link>
        </div>
      </section>
    </>
  );
}
