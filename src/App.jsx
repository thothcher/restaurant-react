import { useEffect } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Layout, { GuestOnly, RequireAuth } from './components/Layout';
import { EmptyState } from './components/bits';
import { api, refreshCartCount } from './api/client';
import { store } from './store';
import { useSeo } from './hooks/useSeo';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import { Forgot, Login, Register, Reset, Verify } from './pages/Auth';

function NotFound() {
  useSeo({ title: 'Page not found', noindex: true });
  return (
    <div className="container">
      <EmptyState title="Page not found" text="The page you are looking for does not exist.">
        <Link className="btn btn-primary" to="/">Go home</Link>
      </EmptyState>
    </div>
  );
}

const guest = (el) => <GuestOnly>{el}</GuestOnly>;
const auth = (el) => <RequireAuth>{el}</RequireAuth>;

export default function App() {
  // Validate a stored session (refreshing the token if needed) and fill the header.
  useEffect(() => {
    if (!store.state.accessToken) return;
    api.me().then(store.setUser).catch(() => {});
    refreshCartCount();
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="product/:id" element={<Product />} />
        <Route path="cart" element={auth(<Cart />)} />
        <Route path="profile" element={auth(<Profile />)} />
        <Route path="login" element={guest(<Login />)} />
        <Route path="register" element={guest(<Register />)} />
        <Route path="verify" element={guest(<Verify />)} />
        <Route path="forgot" element={guest(<Forgot />)} />
        <Route path="reset" element={guest(<Reset />)} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
