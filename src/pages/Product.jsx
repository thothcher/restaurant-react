import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import { EmptyState, ErrorState, Img, Spinner, SpiceBadge, Stars, VegBadge } from '../components/bits';
import { api } from '../api/client';
import { price } from '../config';
import { useAddToCart } from '../hooks/useAddToCart';
import { useSeo } from '../hooks/useSeo';

export default function Product() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const [state, setState] = useState({ loading: true });
  const [qty, setQty] = useState(1);
  const [add, busy] = useAddToCart();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let off = false;
    setState({ loading: true });
    setQty(1);
    Promise.all([api.product(id), api.categories().catch(() => [])])
      .then(([p, categories]) => { if (!off) setState({ p, category: categories.find((c) => c.id === p.categoryId) }); })
      .catch((error) => { if (!off) setState({ error }); });
    return () => { off = true; };
  }, [id, attempt]);

  const { p, category, error, loading } = state;
  const missing = error && (error.status === 400 || error.status === 404);

  useSeo(p ? {
    title: p.name, description: (p.description || `${p.name} from the Trattoria menu.`).slice(0, 155), path: pathname, type: 'product', image: p.image,
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.description, image: p.image,
      ...(category && { category: category.name }),
      ...(p.rate > 0 && { aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rate, bestRating: 5, ratingCount: 1 } }),
      offers: { '@type': 'Offer', price: p.price, priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
    },
  } : { title: error ? (missing ? 'Dish not found' : 'Error') : 'Dish', noindex: !!error });

  if (loading) return <Spinner />;
  if (error) {
    return (
      <div className="container">
        {missing
          ? <EmptyState title="Dish not found" text="This dish may have been removed."><Link className="btn btn-primary" to="/menu">Back to menu</Link></EmptyState>
          : <ErrorState error={error} onRetry={() => setAttempt((a) => a + 1)} />}
      </div>
    );
  }

  return (
    <div className="container">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/menu">Menu</Link>
        {category && <> / <Link to={`/menu?cat=${category.id}`}>{category.name}</Link></>} / <span>{p.name}</span>
      </nav>
      <div className="detail">
        <div className="detail-media" data-aos="fade-right"><div data-parallax="0.06"><Img src={p.image} alt={p.name} eager /></div></div>
        <div className="detail-info" data-aos="fade-left">
          <div className="badges"><VegBadge vegetarian={p.vegetarian} /><SpiceBadge level={p.spiciness} /></div>
          <h1>{p.name}</h1>
          <div className="card-rate"><Stars rate={p.rate} /></div>
          <p className="lead">{p.description}</p>
          <div className="buy">
            <strong className="price price-lg">{price(p.price)}</strong>
            <div className="stepper" role="group" aria-label="Quantity">
              <button type="button" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))}><Icon name="minus" /></button>
              <output aria-live="polite">{qty}</output>
              <button type="button" aria-label="Increase" onClick={() => setQty((q) => Math.min(99, q + 1))}><Icon name="plus" /></button>
            </div>
            <button className="btn btn-primary btn-lg" disabled={busy} onClick={() => add(p.id, qty)}>
              <Icon name="bag" /> Add to cart · <span>{price(p.price * qty)}</span>
            </button>
          </div>
        </div>
      </div>
      {p.ingredients?.length > 0 && (
        <section className="panel" data-aos="fade-up"><h2>Ingredients</h2><ul className="list">{p.ingredients.map((i) => <li key={i}>{i}</li>)}</ul></section>
      )}
      {p.method && <section className="panel" data-aos="fade-up"><h2>How it's made</h2><p>{p.method}</p></section>}
    </div>
  );
}
