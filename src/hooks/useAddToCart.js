import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, refreshCartCount } from '../api/client';
import { store } from '../store';
import { toast } from '../components/Toasts';

/** Returns [add(productId, qty), busy]. Sends guests to the login page first. */
export function useAddToCart() {
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);

  const add = async (productId, quantity = 1) => {
    if (!store.state.accessToken) {
      toast('Please sign in to add items to your cart', 'info');
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
      return false;
    }
    setBusy(true);
    try {
      await api.addToCart(productId, quantity);
      await refreshCartCount();
      toast('Added to cart', 'success');
      return true;
    } catch (err) {
      toast(err.message, 'error');
      return false;
    } finally { setBusy(false); }
  };

  return [add, busy];
}
