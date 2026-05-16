import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { itemsApi, approvalsApi } from '../api';

export function DashboardPage() {
  const { currentTenant, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ items: 0, pendingApprovals: 0 });

  useEffect(() => {
    if (!currentTenant) return;
    Promise.all([
      itemsApi.list(currentTenant.id, { limit: 1 }),
      approvalsApi.list(currentTenant.id, { status: 'pending', page: 1 }),
    ]).then(([items, approvals]) => {
      setStats({
        items: (items as { pagination: { total: number } }).pagination.total,
        pendingApprovals: (approvals as { pagination: { total: number } }).pagination.total,
      });
    }).catch(() => {});
  }, [currentTenant]);

  if (!currentTenant) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Welcome, {user?.full_name}!</h2>
          <p style={{ color: 'var(--gray-600)' }}>Select a tenant from the sidebar to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <span className="text-gray">{currentTenant.name}</span>
      </div>
      <div className="page-body">
        <div className="grid-3" style={{ marginBottom: '24px' }}>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/items')}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)' }}>{stats.items}</div>
            <div className="text-gray text-sm">Total Items</div>
          </div>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/approvals?status=pending')}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: stats.pendingApprovals > 0 ? 'var(--warning)' : 'var(--gray-400)' }}>
              {stats.pendingApprovals}
            </div>
            <div className="text-gray text-sm">Pending Approvals</div>
          </div>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/workflows')}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--success)' }}>⚙</div>
            <div className="text-gray text-sm">Manage Workflows</div>
          </div>
        </div>
        <div className="alert alert-info">
          <strong>Role:</strong> You are a <strong>{currentTenant.role}</strong> in <strong>{currentTenant.name}</strong>.{' '}
          {currentTenant.role === 'admin' && 'You can manage workflows, members, and approve items.'}
          {currentTenant.role === 'approver' && 'You can review and vote on approval requests.'}
          {currentTenant.role === 'member' && 'You can create and transition items.'}
          {currentTenant.role === 'viewer' && 'You have read-only access.'}
        </div>
      </div>
    </>
  );
}
