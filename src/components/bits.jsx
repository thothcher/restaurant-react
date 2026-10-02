// Small presentational pieces shared across pages.
import Icon, { PLACEHOLDER } from './Icon';

export function Img({ src, alt = '', className, eager = false }) {
  return (
    <img
      className={className} src={src || PLACEHOLDER} alt={alt} decoding="async" loading={eager ? undefined : 'lazy'}
      onError={(e) => { if (!e.currentTarget.dataset.fallback) { e.currentTarget.dataset.fallback = '1'; e.currentTarget.src = PLACEHOLDER; } }}
    />
  );
}

export function Stars({ rate = 0 }) {
  const r = Math.max(0, Math.min(5, Number(rate) || 0));
  const five = [0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" className="ic-fill" />);
  return (
    <>
      <span className="stars" role="img" aria-label={`Rated ${r.toFixed(1)} out of 5`}>
        <span className="stars-bg">{five}</span>
        <span className="stars-fg" style={{ width: `${(r / 5) * 100}%` }}>{five}</span>
      </span>
      <span className="rate-num">{r.toFixed(1)}</span>
    </>
  );
}

export const VegBadge = ({ vegetarian }) => (vegetarian ? <span className="badge badge-veg"><Icon name="leaf" /> Veg</span> : null);

export const SpiceBadge = ({ level }) => (level > 0 ? (
  <span className="badge badge-spice" title={`Spiciness ${level}/5`} aria-label={`Spiciness ${level} out of 5`}>
    {Array.from({ length: Math.min(level, 5) }, (_, i) => <Icon key={i} name="flame" />)}
  </span>
) : null);

export function EmptyState({ title, text, icon = 'utensils', children }) {
  return (
    <div className="empty">
      <div className="empty-ico"><Icon name={icon} /></div>
      <h2>{title}</h2>
      <p>{text}</p>
      {children}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <EmptyState title="Something went wrong" text={error?.message} icon="alert">
      {onRetry && <button className="btn btn-primary" onClick={onRetry}>Try again</button>}
    </EmptyState>
  );
}

export const SkeletonCards = ({ n = 6 }) => Array.from({ length: n }, (_, i) => (
  <div key={i} className="card skeleton"><div className="card-media" /><div className="card-body"><i /><i /><i className="short" /></div></div>
));

export const Spinner = () => <div className="container"><div className="skeleton detail-skel" /></div>;
