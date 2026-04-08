import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Package, MessageSquare, Tag, RefreshCw, Plus, Trash2, Edit2, Check, X, ChevronDown, Users, ShieldCheck } from 'lucide-react';

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

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#3b82f6',
  preparing: '#f59e0b',
  ready: '#8b5cf6',
  delivered: '#22c55e',
  cancelled: '#ef4444',
  new: '#ef4444',
  read: '#f59e0b',
  replied: '#22c55e',
  active: '#22c55e',
  inactive: '#ef4444',
  owner: '#FFD700',
  manager: '#8b5cf6',
  support: '#3b82f6',
};

function Badge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? '#6b7280';
  return (
    <span style={{ background: color + '20', color, border: `1px solid ${color}40`, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}

// ── Orders tab ────────────────────────────────────────────────────────────────

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
          <tr style={{ background: '#f8f6f0', borderBottom: '1px solid #eee' }}>
            {['#', 'Date', 'Customer', 'Delivery', 'Total', 'Status', 'Update', ''].map(h => (
              <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#666', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map(o => {
            const isExpanded = expanded === o.id;
            return (
              <React.Fragment key={o.id}>
                <tr style={{ borderBottom: '1px solid #f0ede4', background: isExpanded ? '#fffef8' : 'transparent' }}>
                  <td style={{ padding: '10px 12px', color: '#999', fontFamily: 'monospace' }}>#{o.id}</td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, color: '#1a2235' }}>{o.customerName}</div>
                    <div style={{ color: '#999', fontSize: 11 }}>{o.customerEmail}</div>
                  </td>
                  <td style={{ padding: '10px 12px', textTransform: 'capitalize' }}>{o.deliveryType}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1a2235' }}>${(parseFloat(o.total ?? '0')).toFixed(2)}</td>
                  <td style={{ padding: '10px 12px' }}><Badge status={o.status} /></td>
                  <td style={{ padding: '10px 12px' }}>
                    <select
                      disabled={updating === o.id}
                      value={o.status}
                      onChange={e => updateStatus(o.id, e.target.value)}
                      style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12, cursor: 'pointer', background: '#fff' }}
                    >
                      {['confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map(s => (
                        <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <button onClick={() => setExpanded(isExpanded ? null : o.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c9a84c', display: 'flex', alignItems: 'center', gap: 2, fontSize: 12, fontWeight: 600 }}>
                      <ChevronDown style={{ width: 14, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                      {isExpanded ? 'Less' : 'More'}
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr style={{ borderBottom: '1px solid #f0ede4', background: '#fffef8' }}>
                    <td colSpan={8} style={{ padding: '0 12px 16px 12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, paddingTop: 12 }}>
                        <div>
                          <p style={{ fontWeight: 700, color: '#1a2235', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Items</p>
                          {(Array.isArray(o.items) ? o.items : []).map((item: any, i: number) => {
                            const qty = item.quantity ?? item.qty ?? 1;
                            return (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                                <span>{item.name} × {qty}</span>
                                <span style={{ color: '#666' }}>${(item.price * qty).toFixed(2)}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: '#1a2235', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Delivery Info</p>
                          <p style={{ fontSize: 12, color: '#555', margin: '0 0 2px' }}>{o.deliveryAddress || '—'}</p>
                          <p style={{ fontSize: 12, color: '#555', margin: '0 0 2px' }}>{o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString() : '—'}</p>
                          <p style={{ fontSize: 12, color: '#555', margin: 0 }}>{o.customerPhone || '—'}</p>
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: '#1a2235', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Totals</p>
                          {[
                            ['Subtotal', `$${parseFloat(o.subtotal ?? '0').toFixed(2)}`],
                            ['Delivery', `$${parseFloat(o.deliveryFee ?? '0').toFixed(2)}`],
                            ['Tax', `$${parseFloat(o.tax ?? '0').toFixed(2)}`],
                            o.discountAmount && parseFloat(o.discountAmount) > 0 ? ['Coupon', `-$${parseFloat(o.discountAmount).toFixed(2)}`] : null,
                            ['Total', `$${parseFloat(o.total ?? '0').toFixed(2)}`],
                          ].filter(Boolean).map(([label, val]) => (
                            <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                              <span style={{ color: '#666' }}>{label}</span>
                              <span style={{ fontWeight: label === 'Total' ? 700 : 400 }}>{val as string}</span>
                            </div>
                          ))}
                          {o.paymentId && <p style={{ fontSize: 11, color: '#999', marginTop: 6 }}>Payment ID: {o.paymentId}</p>}
                        </div>
                        {o.note && (
                          <div>
                            <p style={{ fontWeight: 700, color: '#1a2235', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Notes</p>
                            <p style={{ fontSize: 12, color: '#555', margin: 0 }}>{o.note}</p>
                          </div>
                        )}
                        {o.allergies && (
                          <div>
                            <p style={{ fontWeight: 700, color: '#1a2235', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Allergies</p>
                            <p style={{ fontSize: 12, color: '#555', margin: 0 }}>{o.allergies}</p>
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

// ── Enquiries tab ─────────────────────────────────────────────────────────────

function EnquiriesTab() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
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

  function openReply(e: any) {
    setReplyingTo(e.id);
    setReplyText('');
    setSendError('');
  }

  async function sendReply(id: number) {
    if (!replyText.trim()) { setSendError('Please write a reply first.'); return; }
    setSending(true); setSendError('');
    try {
      const r = await apiFetch(`/admin/enquiries/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ replyText }),
      });
      const d = await r.json();
      if (d.success) {
        setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: 'replied', replyText } : e));
        setReplyingTo(null);
        setReplyText('');
      } else {
        setSendError(d.error ?? 'Failed to send reply');
      }
    } catch { setSendError('Network error. Please try again.'); }
    setSending(false);
  }

  if (loading) return <p style={{ color: '#999', padding: 32 }}>Loading enquiries…</p>;
  if (error) return <p style={{ color: '#ef4444', padding: 32 }}>{error}</p>;
  if (!enquiries.length) return <p style={{ color: '#999', padding: 32 }}>No enquiries yet.</p>;

  return (
    <div>
      {enquiries.map(e => {
        const isReplying = replyingTo === e.id;
        return (
          <div key={e.id} style={{ border: '1px solid #f0ede4', borderRadius: 10, marginBottom: 12, overflow: 'hidden', background: e.status === 'new' ? '#fffef8' : '#fff' }}>
            <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 16px', alignItems: 'start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, gridColumn: '1 / -1', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: '#1a2235', fontSize: 14 }}>{e.name}</span>
                  <Badge status={e.status ?? 'new'} />
                  <span style={{ color: '#bbb', fontSize: 11, marginLeft: 'auto' }}>{new Date(e.createdAt).toLocaleString()}</span>
                </div>
                {e.email && (
                  <>
                    <span style={{ fontSize: 11, color: '#999', fontWeight: 600, textTransform: 'uppercase' }}>Email</span>
                    <span style={{ fontSize: 12, color: '#555' }}>{e.email}</span>
                  </>
                )}
                {e.phone && (
                  <>
                    <span style={{ fontSize: 11, color: '#999', fontWeight: 600, textTransform: 'uppercase' }}>Phone</span>
                    <span style={{ fontSize: 12, color: '#555' }}>{e.phone}</span>
                  </>
                )}
                <span style={{ fontSize: 11, color: '#999', fontWeight: 600, textTransform: 'uppercase', paddingTop: 2 }}>Message</span>
                <p style={{ margin: 0, fontSize: 13, color: '#333', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{e.message}</p>
                {e.replyText && (
                  <>
                    <span style={{ fontSize: 11, color: '#059669', fontWeight: 600, textTransform: 'uppercase', paddingTop: 2 }}>Reply sent</span>
                    <p style={{ margin: 0, fontSize: 12, color: '#059669', lineHeight: 1.5, whiteSpace: 'pre-wrap', background: '#f0fdf4', padding: '8px 10px', borderRadius: 6 }}>{e.replyText}</p>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 120, alignItems: 'flex-end' }}>
                <select
                  disabled={updating === e.id}
                  value={e.status ?? 'new'}
                  onChange={ev => updateStatus(e.id, ev.target.value)}
                  style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12, cursor: 'pointer', background: '#fff', width: '100%' }}
                >
                  {['new', 'read', 'replied'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                {e.email ? (
                  <button
                    onClick={() => isReplying ? setReplyingTo(null) : openReply(e)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: isReplying ? '#f0ede4' : '#1a2235', color: isReplying ? '#666' : '#FFD700' }}
                  >
                    {isReplying ? 'Cancel' : e.replyText ? 'Reply again' : 'Reply'}
                  </button>
                ) : (
                  <span style={{ fontSize: 11, color: '#bbb', textAlign: 'center' }}>No email to reply</span>
                )}
              </div>
            </div>

            {isReplying && (
              <div style={{ borderTop: '1px solid #f0ede4', padding: '14px 16px', background: '#f8f6f0' }}>
                <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#1a2235' }}>
                  Reply to {e.name} <span style={{ color: '#999', fontWeight: 400 }}>({e.email})</span>
                </p>
                <p style={{ margin: '0 0 8px', fontSize: 11, color: '#888' }}>
                  Email will be sent from catering@reignskitchen.com and will include their original message.
                </p>
                <textarea
                  value={replyText}
                  onChange={ev => setReplyText(ev.target.value)}
                  placeholder={`Hi ${e.name},\n\nThank you for reaching out…`}
                  rows={5}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 13, boxSizing: 'border-box', resize: 'vertical', fontFamily: 'sans-serif', lineHeight: 1.5 }}
                />
                {sendError && <p style={{ color: '#ef4444', fontSize: 12, margin: '6px 0 0' }}>{sendError}</p>}
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button
                    onClick={() => sendReply(e.id)}
                    disabled={sending}
                    style={{ background: '#1a2235', color: '#FFD700', border: 'none', borderRadius: 7, padding: '9px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: sending ? 0.6 : 1 }}
                  >
                    {sending ? 'Sending…' : 'Send Reply'}
                  </button>
                  <button
                    onClick={() => setReplyingTo(null)}
                    style={{ background: '#eee', color: '#555', border: 'none', borderRadius: 7, padding: '9px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Coupons tab ───────────────────────────────────────────────────────────────

function CouponsTab() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const EMPTY = { code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxUses: '', expiresAt: '', active: true };
  const [form, setForm] = useState(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await apiFetch('/admin/coupons');
      const d = await r.json();
      if (d.success) setCoupons(d.coupons);
      else setError(d.error);
    } catch { setError('Failed to load coupons'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditing(null); setForm(EMPTY); setFormError(''); setShowForm(true); }
  function openEdit(c: any) {
    setEditing(c);
    setForm({
      code: c.code, description: c.description ?? '', discountType: c.discountType,
      discountValue: c.discountValue, minOrderAmount: c.minOrderAmount ?? '',
      maxUses: c.maxUses ?? '', expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 10) : '',
      active: c.active,
    });
    setFormError('');
    setShowForm(true);
  }

  async function save() {
    if (!form.code || !form.discountValue) { setFormError('Code and discount value are required'); return; }
    setSaving(true); setFormError('');
    try {
      const body = JSON.stringify({ ...form, discountValue: parseFloat(form.discountValue), minOrderAmount: form.minOrderAmount || null, maxUses: form.maxUses || null, expiresAt: form.expiresAt || null });
      const r = editing
        ? await apiFetch(`/admin/coupons/${editing.id}`, { method: 'PATCH', body })
        : await apiFetch('/admin/coupons', { method: 'POST', body });
      const d = await r.json();
      if (d.success) { await load(); setShowForm(false); }
      else setFormError(d.error ?? 'Failed to save');
    } catch { setFormError('Network error'); }
    setSaving(false);
  }

  async function deleteCoupon(id: number) {
    if (!confirm('Delete this coupon?')) return;
    try {
      await apiFetch(`/admin/coupons/${id}`, { method: 'DELETE' });
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch { /* ignore */ }
  }

  async function toggleActive(c: any) {
    try {
      const r = await apiFetch(`/admin/coupons/${c.id}`, { method: 'PATCH', body: JSON.stringify({ active: !c.active }) });
      const d = await r.json();
      if (d.success) setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, active: !c.active } : x));
    } catch { /* ignore */ }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 11px', borderRadius: 7, border: '1.5px solid #ddd', fontSize: 13, boxSizing: 'border-box', background: '#fff' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1a2235', color: '#FFD700', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
          <Plus style={{ width: 14 }} /> New Coupon
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#f8f6f0', border: '1px solid #e8e4d8', borderRadius: 10, padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#1a2235' }}>{editing ? 'Edit Coupon' : 'Create Coupon'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Code *</label>
              <input style={inputStyle} value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SUMMER20" disabled={!!editing} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Type *</label>
              <select style={inputStyle} value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Discount Value *</label>
              <input style={inputStyle} type="number" min="0" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} placeholder={form.discountType === 'percentage' ? '20' : '10.00'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Min Order Amount</label>
              <input style={inputStyle} type="number" min="0" value={form.minOrderAmount} onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} placeholder="50.00" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Max Uses</label>
              <input style={inputStyle} type="number" min="1" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} placeholder="Unlimited" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Expiry Date</label>
              <input style={inputStyle} type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Description</label>
              <input style={inputStyle} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
            </div>
            {editing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="active-toggle" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                <label htmlFor="active-toggle" style={{ fontSize: 13, color: '#444' }}>Active</label>
              </div>
            )}
          </div>
          {formError && <p style={{ color: '#ef4444', fontSize: 12, margin: '10px 0 0' }}>{formError}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={save} disabled={saving} style={{ background: '#1a2235', color: '#FFD700', border: 'none', borderRadius: 7, padding: '9px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Coupon'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ background: '#eee', color: '#555', border: 'none', borderRadius: 7, padding: '9px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: '#999' }}>Loading coupons…</p> : error ? <p style={{ color: '#ef4444' }}>{error}</p> : !coupons.length ? <p style={{ color: '#999' }}>No coupons yet.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8f6f0', borderBottom: '1px solid #eee' }}>
              {['Code', 'Discount', 'Min Order', 'Uses', 'Expires', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#666' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f0ede4', opacity: c.active ? 1 : 0.5 }}>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700, color: '#1a2235' }}>{c.code}</td>
                <td style={{ padding: '10px 12px' }}>{c.discountType === 'percentage' ? `${c.discountValue}%` : `$${parseFloat(c.discountValue).toFixed(2)}`}</td>
                <td style={{ padding: '10px 12px', color: '#555' }}>{c.minOrderAmount ? `$${parseFloat(c.minOrderAmount).toFixed(2)}` : '—'}</td>
                <td style={{ padding: '10px 12px', color: '#555' }}>{c.usedCount ?? 0}{c.maxUses ? ` / ${c.maxUses}` : ''}</td>
                <td style={{ padding: '10px 12px', color: '#555', fontSize: 11 }}>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'No expiry'}</td>
                <td style={{ padding: '10px 12px' }}><Badge status={c.active ? 'active' : 'inactive'} /></td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(c)} style={{ background: '#f0ede4', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#555' }} title="Edit"><Edit2 style={{ width: 12 }} /></button>
                    <button onClick={() => toggleActive(c)} style={{ background: c.active ? '#fef3c7' : '#d1fae5', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#555' }} title={c.active ? 'Deactivate' : 'Activate'}>{c.active ? <X style={{ width: 12 }} /> : <Check style={{ width: 12 }} />}</button>
                    <button onClick={() => deleteCoupon(c.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#ef4444' }} title="Delete"><Trash2 style={{ width: 12 }} /></button>
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

// ── Staff tab (owner only) ────────────────────────────────────────────────────

function StaffTab() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const EMPTY = { name: '', username: '', email: '', password: '', role: 'support' };
  const [form, setForm] = useState(EMPTY);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await apiFetch('/admin/staff');
      const d = await r.json();
      if (d.success) setStaff(d.staff);
      else setError(d.error);
    } catch { setError('Failed to load staff'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditing(null); setForm(EMPTY); setFormError(''); setShowForm(true); }
  function openEdit(s: any) {
    setEditing(s);
    setForm({ name: s.name, username: s.username, email: s.email ?? '', password: '', role: s.role });
    setFormError(''); setShowForm(true);
  }

  async function save() {
    if (!form.name || !form.username) { setFormError('Name and username are required'); return; }
    if (!editing && !form.password) { setFormError('Password is required for new staff'); return; }
    setSaving(true); setFormError('');
    try {
      const body: any = { name: form.name, email: form.email || null, role: form.role };
      if (!editing) { body.username = form.username; body.password = form.password; }
      if (editing && form.password) body.password = form.password;
      const r = editing
        ? await apiFetch(`/admin/staff/${editing.id}`, { method: 'PATCH', body: JSON.stringify(body) })
        : await apiFetch('/admin/staff', { method: 'POST', body: JSON.stringify(body) });
      const d = await r.json();
      if (d.success) { await load(); setShowForm(false); }
      else setFormError(d.error ?? 'Failed to save');
    } catch { setFormError('Network error'); }
    setSaving(false);
  }

  async function deactivate(id: number) {
    if (!confirm('Deactivate this staff member? They will no longer be able to log in.')) return;
    try {
      await apiFetch(`/admin/staff/${id}`, { method: 'DELETE' });
      setStaff(prev => prev.filter(s => s.id !== id));
    } catch { /* ignore */ }
  }

  async function reactivate(id: number) {
    try {
      const r = await apiFetch(`/admin/staff/${id}`, { method: 'PATCH', body: JSON.stringify({ active: true }) });
      const d = await r.json();
      if (d.success) setStaff(prev => prev.map(s => s.id === id ? { ...s, active: true } : s));
    } catch { /* ignore */ }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 11px', borderRadius: 7, border: '1.5px solid #ddd', fontSize: 13, boxSizing: 'border-box', background: '#fff' };

  return (
    <div>
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#92400e' }}>
        <strong>Staff Roles:</strong> <strong>Manager</strong> — manage orders, enquiries, and coupons. <strong>Support</strong> — manage enquiries and view orders only.
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1a2235', color: '#FFD700', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
          <Plus style={{ width: 14 }} /> Add Staff Member
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#f8f6f0', border: '1px solid #e8e4d8', borderRadius: 10, padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#1a2235' }}>{editing ? 'Edit Staff Member' : 'Add Staff Member'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Full Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Username *</label>
              <input style={inputStyle} value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="jane" disabled={!!editing} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Email</label>
              <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@example.com" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>Role *</label>
              <select style={inputStyle} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="support">Support</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 4, textTransform: 'uppercase' }}>{editing ? 'New Password (leave blank to keep)' : 'Password *'}</label>
              <input style={inputStyle} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={editing ? '••••••••' : 'Set a strong password'} />
            </div>
          </div>
          {formError && <p style={{ color: '#ef4444', fontSize: 12, margin: '10px 0 0' }}>{formError}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={save} disabled={saving} style={{ background: '#1a2235', color: '#FFD700', border: 'none', borderRadius: 7, padding: '9px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Staff'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ background: '#eee', color: '#555', border: 'none', borderRadius: 7, padding: '9px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: '#999' }}>Loading staff…</p> : error ? <p style={{ color: '#ef4444' }}>{error}</p> : !staff.length ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          <Users style={{ width: 40, margin: '0 auto 12px', opacity: 0.3 }} />
          <p>No staff members yet. Add your first team member above.</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8f6f0', borderBottom: '1px solid #eee' }}>
              {['Name', 'Username', 'Email', 'Role', 'Status', 'Added', ''].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#666' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f0ede4', opacity: s.active ? 1 : 0.5 }}>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1a2235' }}>{s.name}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#555' }}>{s.username}</td>
                <td style={{ padding: '10px 12px', color: '#555', fontSize: 11 }}>{s.email || '—'}</td>
                <td style={{ padding: '10px 12px' }}><Badge status={s.role} /></td>
                <td style={{ padding: '10px 12px' }}><Badge status={s.active ? 'active' : 'inactive'} /></td>
                <td style={{ padding: '10px 12px', color: '#999', fontSize: 11 }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(s)} style={{ background: '#f0ede4', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#555' }} title="Edit"><Edit2 style={{ width: 12 }} /></button>
                    {s.active
                      ? <button onClick={() => deactivate(s.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#ef4444' }} title="Deactivate"><X style={{ width: 12 }} /></button>
                      : <button onClick={() => reactivate(s.id)} style={{ background: '#d1fae5', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#059669' }} title="Reactivate"><Check style={{ width: 12 }} /></button>
                    }
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

// ── Admin page ────────────────────────────────────────────────────────────────

type Tab = 'orders' | 'enquiries' | 'coupons' | 'staff';

interface AdminUser { role: string; name: string; }

export default function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authError, setAuthError] = useState('');
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>('orders');

  useEffect(() => {
    const saved = localStorage.getItem('rk_admin_token');
    if (saved) verifyToken(saved);
    else setChecking(false);
  }, []);

  async function verifyToken(token: string) {
    setChecking(true);
    try {
      const r = await fetch(`${API}/admin/auth/me`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (r.ok) {
        const d = await r.json();
        if (d.success) {
          localStorage.setItem('rk_admin_token', token);
          setAdminUser(d.user);
          setAuthed(true);
          if (d.user.role === 'support') setTab('enquiries');
        } else {
          localStorage.removeItem('rk_admin_token');
        }
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
      const body: any = { password };
      if (username.trim()) body.username = username.trim();
      const r = await fetch(`${API}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!d.success) { setAuthError(d.error ?? 'Invalid credentials'); setChecking(false); return; }
      localStorage.setItem('rk_admin_token', d.token);
      setAdminUser({ role: d.role, name: d.name });
      setAuthed(true);
      if (d.role === 'support') setTab('enquiries');
    } catch { setAuthError('Could not reach server'); }
    setChecking(false);
  }

  async function logout() {
    try { await apiFetch('/admin/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    localStorage.removeItem('rk_admin_token');
    setAuthed(false);
    setAdminUser(null);
    setPassword('');
    setUsername('');
  }

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
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username <span style={{ color: '#bbb', fontWeight: 400, textTransform: 'none' }}>(leave blank for owner login)</span></label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 14, boxSizing: 'border-box' }}
              placeholder="staff username"
              autoComplete="username"
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 14, boxSizing: 'border-box' }}
              placeholder="Enter password"
              autoFocus
              autoComplete="current-password"
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

  const isOwner = adminUser?.role === 'owner';
  const isManager = adminUser?.role === 'manager';

  const allTabs: { key: Tab; label: string; icon: React.ReactNode; show: boolean }[] = [
    { key: 'orders', label: 'Orders', icon: <Package style={{ width: 15 }} />, show: isOwner || isManager || true },
    { key: 'enquiries', label: 'Enquiries', icon: <MessageSquare style={{ width: 15 }} />, show: true },
    { key: 'coupons', label: 'Coupons', icon: <Tag style={{ width: 15 }} />, show: isOwner || isManager },
    { key: 'staff', label: 'Staff', icon: <Users style={{ width: 15 }} />, show: isOwner },
  ];
  const tabs = allTabs.filter(t => t.show);

  const tabTitles: Record<Tab, string> = {
    orders: 'Orders',
    enquiries: 'Contact Enquiries',
    coupons: 'Coupon Codes',
    staff: 'Staff Management',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5dc', fontFamily: 'sans-serif' }}>
      <header style={{ background: '#1a2235', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Package style={{ color: '#FFD700', width: 22 }} />
          <span style={{ color: '#F5F5DC', fontWeight: 700, fontSize: 17, fontFamily: 'serif' }}>Reigns Kitchen Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {adminUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '5px 11px' }}>
              <ShieldCheck style={{ width: 13, color: '#c9a84c' }} />
              <span style={{ color: '#c9a84c', fontSize: 12, fontWeight: 600 }}>{adminUser.name}</span>
              <Badge status={adminUser.role} />
            </div>
          )}
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
            <h2 style={{ margin: 0, fontSize: 16, color: '#1a2235', fontWeight: 700 }}>{tabTitles[tab]}</h2>
          </div>
          <div style={{ padding: 16 }}>
            {tab === 'orders' && <OrdersTab />}
            {tab === 'enquiries' && <EnquiriesTab />}
            {tab === 'coupons' && (isOwner || isManager) && <CouponsTab />}
            {tab === 'staff' && isOwner && <StaffTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
