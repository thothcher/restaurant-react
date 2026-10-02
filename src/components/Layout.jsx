import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import Toasts, { toast } from './Toasts';
import ConfirmHost from './ConfirmHost';
import { store, useStore } from '../store';
import { useEffects } from '../hooks/useEffects';

function applyTheme(t) {
  if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
}
export function initTheme() {
  try { applyTheme(localStorage.getItem('restaurant.theme')); } catch { /* ignore */ }
}
function toggleTheme() {
  const root = document.documentElement;
  const dark = root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  const next = dark ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('restaurant.theme', next); } catch { /* ignore */ }
}

function Header() {
  const { accessToken, user, cartCount } = useStore();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setOpen(false); }, [pathname]);

  const logout = () => {
    store.clear();
    toast('Signed out', 'info');
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/"><Icon name="utensils" /> Trattoria</Link>
        <button className="nav-toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span className="bar" /><span className="bar" /><span className="bar" />
        </button>
        <nav className={`nav ${open ? 'open' : ''}`} aria-label="Main">
          <NavLink to="/menu">Menu</NavLink>
          {accessToken ? (
            <>
              <NavLink to="/cart" className="cart-link"><Icon name="bag" /> Cart{cartCount > 0 && <span className="count">{cartCount}</span>}</NavLink>
              <NavLink to="/profile"><Icon name="user" /> {user?.firstName || 'Profile'}</NavLink>
              <button className="btn btn-outline btn-sm" onClick={logout}>Sign out</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Sign in</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
          <button className="icon-btn" aria-label="Toggle dark mode" onClick={toggleTheme}><Icon name="contrast" /></button>
        </nav>
      </div>
    </header>
  );
}

/** Scroll to top and move focus to <main> on every navigation (a11y for client-side routing). */
function RouteEffects({ mainRef }) {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, mainRef]);
  return null;
}

export default function Layout() {
  const mainRef = useRef(null);
  useEffects();
  return (
    <>
      <a className="skip" href="#app">Skip to content</a>
      <Header />
      <main id="app" tabIndex={-1} ref={mainRef}><Outlet /></main>
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} <a href="https://github.com/thothcher" target="_blank" rel="noopener noreferrer">thothcher</a></span>
        <span>Powered by RestaurantAPI</span>
      </footer>
      <Toasts />
      <ConfirmHost />
      <RouteEffects mainRef={mainRef} />
    </>
  );
}

export function RequireAuth({ children }) {
  const { accessToken } = useStore();
  const { pathname } = useLocation();
  return accessToken ? children : <Navigate to={`/login?next=${encodeURIComponent(pathname)}`} replace />;
}

export function GuestOnly({ children }) {
  const { accessToken } = useStore();
  return accessToken ? <Navigate to="/menu" replace /> : children;
}
