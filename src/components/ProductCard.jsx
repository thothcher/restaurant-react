import { Link } from 'react-router-dom';
import Icon from './Icon';
import { Img, Stars, VegBadge, SpiceBadge } from './bits';
import { useAddToCart } from '../hooks/useAddToCart';
import { price } from '../config';

export default function ProductCard({ p, index = 0 }) {
  const [add, busy] = useAddToCart();
  return (
    <article className="card" data-aos="fade-up" data-aos-delay={(index % 4) * 70}>
      <Link className="card-media" to={`/product/${p.id}`} aria-label={p.name}>
        <Img src={p.image} alt={p.name} />
        <div className="card-badges"><VegBadge vegetarian={p.vegeterian ?? p.vegetarian} /><SpiceBadge level={p.spiciness} /></div>
      </Link>
      <div className="card-body">
        <h3 className="card-title"><Link to={`/product/${p.id}`}>{p.name}</Link></h3>
        <p className="card-desc">{p.description}</p>
        <div className="card-rate"><Stars rate={p.rate} /></div>
        <div className="card-foot">
          <strong className="price">{price(p.price)}</strong>
          <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => add(p.id, 1)} aria-label={`Add ${p.name} to cart`}>
            <Icon name="plus" /> Add
          </button>
        </div>
      </div>
    </article>
  );
}
