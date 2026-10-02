import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { EmptyState, ErrorState, Img, Spinner } from '../components/bits';
import { confirmDialog } from '../components/ConfirmHost';
import { toast } from '../components/Toasts';
import { api } from '../api/client';
import { price } from '../config';
import { store } from '../store';
import { useSeo } from '../hooks/useSeo';

export default function Cart() {
  useSeo({ title: 'Your cart', noindex: true });
  const [cart, setCart] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [ordered, setOrdered] = useState(false);

  const load = useCallback(async () => {
    const c = await api.cart();
    store.setCartCount(c.items?.reduce((n, i) => n + i.quantity, 0) ?? 0);
    setCart(c);
    return c;
  }, []);

  const start = useCallback(() => {
    setError(null); setCart(null);
    load().catch(setError);
  }, [load]);

  useEffect(() => { start(); }, [start]);

  async function mutate(fn, success) {
    if (busy) return null;
    setBusy(true);
    try {
      await fn();
      const fresh = await load();
      if (success) toast(success, 'success');
      return fresh;
    } catch (err) {
      toast(err.message, 'error');
      return null;
    } finally { setBusy(false); }
  }

  const changeQty = (item, q) => (q < 1
    ? mutate(() => api.removeFromCart(item.id), 'Item removed')
    : mutate(() => api.editQuantity(item.id, Math.min(q, 99))));

  async function checkout() {
    const ok = await confirmDialog({
      title: 'Place order?',
      message: `You are about to order ${store.state.cartCount} item(s) for ${price(cart.totalPrice)}.`,
      confirmText: 'Place order',
    });
    if (!ok) return;
    const fresh = await mutate(() => api.checkout());
    if (fresh && !fresh.items?.length) setOrdered(true);
  }

  if (error) return <div className="container"><ErrorState error={error} onRetry={start} /></div>;
  if (!cart) return <Spinner />;

  if (ordered) {
    return <div className="container"><EmptyState title="Order placed!" text="Thank you — we're preparing your food." icon="check-circle"><Link className="btn btn-primary" to="/menu">Order more</Link></EmptyState></div>;
  }

  const items = cart.items || [];
  if (!items.length) {
    return <div className="container"><EmptyState title="Your cart is empty" text="Add a few delicious dishes to get started." icon="bag"><Link className="btn btn-primary" to="/menu">Browse the menu</Link></EmptyState></div>;
  }

  const units = items.reduce((n, i) => n + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <div className="container">
      <h1 className="page-title">Your cart</h1>
      <div className={`cart-layout ${busy ? 'is-busy' : ''}`}>
        <ul className="cart-list">
          {items.map((it) => (
            <li key={it.id} className="cart-item">
              <Link className="cart-thumb" to={`/product/${it.product.id}`}><Img src={it.product.image} alt={it.product.name} /></Link>
              <div className="cart-info">
                <Link className="cart-name" to={`/product/${it.product.id}`}>{it.product.name}</Link>
                <span className="muted">{price(it.product.price)} each</span>
              </div>
              <div className="stepper" role="group" aria-label={`Quantity of ${it.product.name}`}>
                <button type="button" aria-label="Decrease" onClick={() => changeQty(it, it.quantity - 1)}><Icon name="minus" /></button>
                <output>{it.quantity}</output>
                <button type="button" aria-label="Increase" onClick={() => changeQty(it, it.quantity + 1)}><Icon name="plus" /></button>
              </div>
              <strong className="cart-line">{price(it.product.price * it.quantity)}</strong>
              <button className="icon-btn" aria-label={`Remove ${it.product.name}`} onClick={() => mutate(() => api.removeFromCart(it.id), 'Item removed')}><Icon name="trash" /></button>
            </li>
          ))}
        </ul>
        <aside className="summary">
          <h2>Order summary</h2>
          <dl>
            <dt>Items</dt><dd>{units}</dd>
            <dt className="total">Total</dt><dd className="total">{price(cart.totalPrice || total)}</dd>
          </dl>
          <button className="btn btn-primary btn-lg btn-block" onClick={checkout}>Checkout</button>
          <Link className="link center" to="/menu">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
