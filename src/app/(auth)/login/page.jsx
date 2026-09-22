'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Email atau password salah. Silakan coba lagi.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <Image
            src="/images/logoCompany.png"
            alt="Boss Rent Pererenan"
            width={168}
            height={112}
            priority
            style={{ height: 'auto', maxWidth: '168px', marginBottom: '4px' }}
          />
          <h1>Boss Rent Pererenan</h1>
          <p>Masuk ke panel admin</p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <Icon fa="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }} /> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="admin@bossrent.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password <span className="required">*</span>
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="btn-login"
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={loading}
          >
            {loading ? (
              <><Icon fa="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }} /> Masuk...</>
            ) : (
              <><Icon fa="fa-solid fa-right-to-bracket" style={{ marginRight: '6px' }} /> Masuk</>
            )}
          </button>
        </form>

        {/* Footer note */}
        <div className="text-center mt-6">
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Hubungi administrator untuk mendapatkan akses.
          </p>
        </div>
      </div>
    </div>
  );
}
