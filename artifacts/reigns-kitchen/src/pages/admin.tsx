import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Package, MessageSquare, Tag, RefreshCw, Plus, Trash2, Edit2, Check, X, ChevronDown } from 'lucide-react';

const API = '/api';

function getToken() { return localStorage.getItem('rk_admin_token') ?? ''; }

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = getToken();
  const r = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opts.headers ?? {}),
    },
  });
  return r;
}

// ── Status badge ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#3b82f6',
  preparing: '#f59e0b',
  ready: '#8b5cf6',
  delivered: '#22c55e',
  cancelled: '#ef4444',
  new: '#ef4444',
  read: '#f59e0b',
  replied: '#22c55e',
};

function Badge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? '#6b7280';
  return (
    <span style={{ background: color + '20', color, border: `1px solid ${color}40`, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}

// ── Orders tab ───────────────────────────────────────────────────────────────

function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await apiFetch('/admin/orders');
      const d = await r.json();
      if (d.success) setOrders(d.orders);
      else setError(d.error);
    } catch { setError('Failed to load orders'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: number, status: string) {
    setUpdating(id);
    try {
      const r = await apiFetch(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      const d = await r.json();
      if (d.success) setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch { /* ignore */ }
    setUpdating(null);
  }

  if (loading) return <p style={{ color: '#999', padding: 32 }}>Loading orders…</p>;
  if (error) return <p style={{ color: '#ef4444', padding: 32 }}>{error}</p>;
  if (!orders.length) return <p style={{ color: '#999', padding: 32 }}>No orders yet.</p>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#1a2235', color: '#F5F5DC' }}>
            {['Order #', 'Customer', 'Type', 'Items', 'Total', 'Status', 'Date', ''].map(h => (
              <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => {
            const items = Array.isArray(o.items) ? o.items : [];
            return (
              <React.Fragment key={o.id}>
                <tr style={{ background: i % 2 === 0 ? '#fff' : '#f9f7f0', borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1a2235', whiteSpace: 'nowrap' }}>{o.orderNumber}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                    <div style={{ fontSize: 11, color: '#999' }}>{o.customerPhone}</div>
                  </td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{o.deliveryType}</td>
                  <td style={{ padding: '10px 12px', color: '#666' }}>{items.length} item{items.length !== 1 ? 's' : ''}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1a2235', whiteSpace: 'nowrap' }}>${parseFloat(o.total).toFixed(2)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <select
                      value={o.status}
                      disabled={updating === o.id}
                      onChange={e => updateStatus(o.id, e.target.value)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: STATUS_COLORS[o.status] ?? '#333' }}
                    >
                      {['confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#999', fontSize: 11, whiteSpace: 'nowrap' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <button
                      onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c9a84c', fontSize: 11, display: 'flex', alignItems: 'center', gap: 2 }}
                    >
                      Details <ChevronDown style={{ width: 12, transform: expanded === o.id ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                    </button>
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr style={{ background: '#f0ede4' }}>
                    <td colSpan={8} style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, color: '#999', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</div>
                          {items.map((item: any, j: number) => (
                            <div key={j} style={{ fontSize: 13 }}>{item.name} × {item.qty} — ${(Number(item.price) * item.qty).toFixed(2)}</div>
                          ))}
                        </div>
                        {o.deliveryType !== 'Pickup' && (
                          <div>
                            <div style={{ fontSize: 11, color: '#999', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery</div>
                            <div style={{ fontSize: 13 }}>{o.deliveryAddress}</div>
                            <div style={{ fontSize: 13 }}>{o.deliveryDate}{o.deliveryWindow ? ` · ${o.deliveryWindow}` : ''}</div>
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: 11, color: '#999', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Totals</div>
                          <div style={{ fontSize: 13 }}>Subtotal: ${parseFloat(o.subtotal).toFixed(2)}</div>
                          {parseFloat(o.discountAmount) > 0 && <div style={{ fontSize: 13, color: '#22c55e' }}>Discount ({o.couponCode}): −${parseFloat(o.discountAmount).toFixed(2)}</div>}
                          <div style={{ fontSize: 13 }}>Tax: ${parseFloat(o.tax).toFixed(2)}</div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>Total: ${parseFloat(o.total).toFixed(2)}</div>
                          {o.paymentId && <div style={{ fontSize: 11, color: '#22c55e', marginTop: 4 }}>✅ {o.paymentId}</div>}
                        </div>
                        {(o.allergies || o.note || o.customerEmail) && (
                          <div>
                            <div style={{ fontSize: 11, color: '#999', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</div>
                            {o.customerEmail && <div style={{ fontSize: 13 }}>📧 {o.customerEmail}</div>}
                            {o.allergies && <div style={{ fontSize: 13 }}>⚠️ {o.allergies}</div>}
                            {o.note && <div style={{ fontSize: 13 }}>📝 {o.note}</div>}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Enquiries tab ────────────────────────────────────────────────────────────

function EnquiriesTab() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await apiFetch('/admin/enquiries');
      const d = await r.json();
      if (d.success) setEnquiries(d.enquiries);
      else setError(d.error);
    } catch { setError('Failed to load enquiries'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: number, status: string) {
    setUpdating(id);
    try {
      const r = await apiFetch(`/admin/enquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      const d = await r.json();
      if (d.success) setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    } catch { /* ignore */ }
    setUpdating(null);
  }

  if (loading) return <p style={{ color: '#999', padding: 32 }}>Loading enquiries…</p>;
  if (error) return <p style={{ color: '#ef4444', padding: 32 }}>{error}</p>;
  if (!enquiries.length) return <p style={{ color: '#999', padding: 32 }}>No enquiries yet.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 4 }}>
      {enquiries.map(e => (
        <div key={e.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{e.name}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                {e.email && <span style={{ marginRight: 10 }}>📧 {e.email}</span>}
                {e.phone && <span>📞 {e.phone}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge status={e.status} />
              <select
                value={e.status}
                disabled={updating === e.id}
                onChange={ev => updateStatus(e.id, ev.target.value)}
                style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer' }}
              >
                {['new', 'read', 'replied'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 14, color: '#333', lineHeight: 1.5, background: '#f9f7f0', padding: '10px 12px', borderRadius: 8 }}>{e.message}</p>
          <div style={{ fontSize: 11, color: '#bbb', marginTop: 8 }}>{new Date(e.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

// ── Coupons tab ──────────────────────────────────────────────────────────────

const EMPTY_COUPON = { code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxUses: '', expiresAt: '', active: true };

function CouponsTab() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_COUPON });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiFetch('/admin/coupons');
      const d = await r.json();
      if (d.success) setCoupons(d.coupons);
      else setError(d.error);
    } catch { setError('Failed to load coupons'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setForm({ ...EMPTY_COUPON }); setEditingId(null); setShowForm(true); setFormError(''); }
  function openEdit(c: any) {
    setForm({
      code: c.code,
      description: c.description ?? '',
      discountType: c.discountType,
      discountValue: String(parseFloat(c.discountValue)),
      minOrderAmount: c.minOrderAmount ? String(parseFloat(c.minOrderAmount)) : '',
      maxUses: c.maxUses ? String(c.maxUses) : '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      active: c.active,
    });
    setEditingId(c.id);
    setShowForm(true);
    setFormError('');
  }

  async function save() {
    if (!form.code || !form.discountValue) { setFormError('Code and discount value are required'); return; }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        code: form.code,
        description: form.description || null,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
        active: form.active,
      };
      const r = editingId
        ? await apiFetch(`/admin/coupons/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : await apiFetch('/admin/coupons', { method: 'POST', body: JSON.stringify(payload) });
      const d = await r.json();
      if (d.success) { await load(); setShowForm(false); }
      else setFormError(d.error ?? 'Failed to save');
    } catch { setFormError('Network error'); }
    setSaving(false);
  }

  async function deleteCoupon(id: number) {
    if (!confirm('Delete this coupon?')) return;
    await apiFetch(`/admin/coupons/${id}`, { method: 'DELETE' });
    setCoupons(prev => prev.filter(c => c.id !== id));
  }

  async function toggleActive(c: any) {
    const r = await apiFetch(`/admin/coupons/${c.id}`, { method: 'PATCH', body: JSON.stringify({ active: !c.active }) });
    const d = await r.json();
    if (d.success) setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, active: !c.active } : x));
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666', marginBottom: 4 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1a2235', color: '#FFD700', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          <Plus style={{ width: 14 }} /> New Coupon
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#f9f7f0', border: '1px solid #e5dfc8', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#1a2235' }}>{editingId ? 'Edit Coupon' : 'Create Coupon'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <label style={labelStyle}>Code *</label>
              <input style={inputStyle} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SUMMER20" disabled={!!editingId} />
            </div>
            <div>
              <label style={labelStyle}>Discount Type *</label>
              <select style={inputStyle} value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Value * {form.discountType === 'percentage' ? '(%)' : '($)'}</label>
              <input style={inputStyle} type="number" min="0" step="0.01" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} placeholder={form.discountType === 'percentage' ? '10' : '5.00'} />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <input style={inputStyle} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional label" />
            </div>
            <div>
              <label style={labelStyle}>Min Order ($)</label>
              <input style={inputStyle} type="number" min="0" step="0.01" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} placeholder="0.00" />
            </div>
            <div>
              <label style={labelStyle}>Max Uses</label>
              <input style={inputStyle} type="number" min="1" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} placeholder="Unlimited" />
            </div>
            <div>
              <label style={labelStyle}>Expires On</label>
              <input style={inputStyle} type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
              <input type="checkbox" id="active" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
              <label htmlFor="active" style={{ ...labelStyle, marginBottom: 0 }}>Active</label>
            </div>
          </div>
          {formError && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>{formError}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={save} disabled={saving} style={{ background: '#1a2235', color: '#FFD700', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              {saving ? 'Saving…' : (editingId ? 'Save Changes' : 'Create Coupon')}
            </button>
            <button onClick={() => setShowForm(false)} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: '#999' }}>Loading…</p> : !coupons.length ? (
        <p style={{ color: '#999' }}>No coupons yet. Create one above!</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#1a2235', color: '#F5F5DC' }}>
              {['Code', 'Discount', 'Min Order', 'Uses', 'Expires', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.map((c, i) => (
              <tr key={c.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f7f0', borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1a2235' }}>
                  <div>{c.code}</div>
                  {c.description && <div style={{ fontSize: 11, color: '#999', fontWeight: 400 }}>{c.description}</div>}
                </td>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#c9a84c' }}>
                  {c.discountType === 'percentage' ? `${parseFloat(c.discountValue)}%` : `$${parseFloat(c.discountValue).toFixed(2)}`} off
                </td>
                <td style={{ padding: '10px 12px', color: '#666' }}>
                  {c.minOrderAmount ? `$${parseFloat(c.minOrderAmount).toFixed(2)}` : '—'}
                </td>
                <td style={{ padding: '10px 12px', color: '#666' }}>
                  {c.uses}{c.maxUses ? ` / ${c.maxUses}` : ''}
                </td>
                <td style={{ padding: '10px 12px', color: '#666', fontSize: 12 }}>
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <button onClick={() => toggleActive(c)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Badge status={c.active ? 'delivered' : 'cancelled'} />
                  </button>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(c)} style={{ background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#666' }}>
                      <Edit2 style={{ width: 12 }} />
                    </button>
                    <button onClick={() => deleteCoupon(c.id)} style={{ background: 'none', border: '1px solid #fecaca', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#ef4444' }}>
                      <Trash2 style={{ width: 12 }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Admin page ───────────────────────────────────────────────────────────────

type Tab = 'orders' | 'enquiries' | 'coupons';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [checking, setChecking] = useState(false);
  const [tab, setTab] = useState<Tab>('orders');

  useEffect(() => {
    const saved = localStorage.getItem('rk_admin_token');
    if (saved) verifyToken(saved);
  }, []);

  async function verifyToken(token: string) {
    setChecking(true);
    try {
      const r = await fetch(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (r.ok || r.status !== 401) {
        localStorage.setItem('rk_admin_token', token);
        setAuthed(true);
      } else {
        localStorage.removeItem('rk_admin_token');
      }
    } catch { /* ignore */ }
    setChecking(false);
  }

  async function login() {
    setAuthError('');
    setChecking(true);
    try {
      const r = await fetch(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${password}`, 'Content-Type': 'application/json' },
      });
      if (r.status === 401) { setAuthError('Incorrect password'); setChecking(false); return; }
      localStorage.setItem('rk_admin_token', password);
      setAuthed(true);
    } catch { setAuthError('Could not reach server'); }
    setChecking(false);
  }

  function logout() { localStorage.removeItem('rk_admin_token'); setAuthed(false); setPassword(''); }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5dc' }}>
        <p style={{ color: '#666' }}>Checking authentication…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5dc' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 40, width: '100%', maxWidth: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 52, height: 52, background: '#1a2235', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Package style={{ color: '#FFD700', width: 26 }} />
            </div>
            <h1 style={{ margin: 0, fontSize: 22, color: '#1a2235', fontFamily: 'serif' }}>Reigns Kitchen</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#999' }}>Admin Dashboard</p>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 14, boxSizing: 'border-box' }}
              placeholder="Enter admin password"
              autoFocus
            />
          </div>
          {authError && <p style={{ color: '#ef4444', fontSize: 13, margin: '0 0 8px' }}>{authError}</p>}
          <button
            onClick={login}
            disabled={!password || checking}
            style={{ width: '100%', padding: '11px', background: '#1a2235', color: '#FFD700', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 }}
          >
            {checking ? 'Signing in…' : 'Sign In'}
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'orders', label: 'Orders', icon: <Package style={{ width: 15 }} /> },
    { key: 'enquiries', label: 'Enquiries', icon: <MessageSquare style={{ width: 15 }} /> },
    { key: 'coupons', label: 'Coupons', icon: <Tag style={{ width: 15 }} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5dc', fontFamily: 'sans-serif' }}>
      <header style={{ background: '#1a2235', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Package style={{ color: '#FFD700', width: 22 }} />
          <span style={{ color: '#F5F5DC', fontWeight: 700, fontSize: 17, fontFamily: 'serif' }}>Reigns Kitchen Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/" style={{ color: '#c9a84c', fontSize: 12, textDecoration: 'none' }}>← View Site</a>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', color: '#F5F5DC', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12 }}>
            <LogOut style={{ width: 13 }} /> Sign Out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', gap: 4, background: '#fff', borderRadius: 12, padding: 4, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', width: 'fit-content' }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                background: tab === t.key ? '#1a2235' : 'transparent',
                color: tab === t.key ? '#FFD700' : '#666',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0ede4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 16, color: '#1a2235', fontWeight: 700 }}>
              {tab === 'orders' ? 'Orders' : tab === 'enquiries' ? 'Contact Enquiries' : 'Coupon Codes'}
            </h2>
          </div>
          <div style={{ padding: 16 }}>
            {tab === 'orders' && <OrdersTab />}
            {tab === 'enquiries' && <EnquiriesTab />}
            {tab === 'coupons' && <CouponsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
