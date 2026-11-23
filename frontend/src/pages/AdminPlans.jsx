import React, { useState, useEffect } from 'react';
import { planAPI } from '../services/api';
import { Plus, Pencil, Trash2, Crown, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '',
  description: '',
  price: 0,
  duration: 30,
  features: '',
  benefits: '',
  storage_quota_mb: 100,
  maxPodcasts: 0,
  isActive: true,
};

const AdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await planAPI.getAllPlans();
      setPlans(res.data.plans || res.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (plan) => {
    setEditingId(plan.id || plan._id);
    setForm({
      name: plan.name || '',
      description: plan.description || '',
      price: plan.price ?? 0,
      duration: plan.duration ?? 30,
      features: (plan.features || []).join(', '),
      benefits: (plan.benefits || []).join(', '),
      storage_quota_mb: plan.storage_quota_mb ?? 100,
      maxPodcasts: plan.maxPodcasts ?? plan.max_podcasts ?? 0,
      isActive: plan.isActive ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      duration: Number(form.duration),
      features: form.features.split(',').map((s) => s.trim()).filter(Boolean),
      benefits: form.benefits.split(',').map((s) => s.trim()).filter(Boolean),
      storage_quota_mb: Number(form.storage_quota_mb),
      maxPodcasts: Number(form.maxPodcasts),
      isActive: form.isActive,
    };
    try {
      if (editingId) {
        await planAPI.updatePlan(editingId, payload);
        toast.success('Plan updated');
      } else {
        await planAPI.createPlan(payload);
        toast.success('Plan created');
      }
      setShowForm(false);
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan) => {
    const id = plan.id || plan._id;
    if (!window.confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return;
    try {
      await planAPI.deletePlan(id);
      toast.success('Plan deleted');
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete plan');
    }
  };

  const handleToggleActive = async (plan) => {
    const id = plan.id || plan._id;
    try {
      await planAPI.updatePlan(id, { isActive: !plan.isActive });
      toast.success(plan.isActive ? 'Plan deactivated' : 'Plan activated');
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update plan');
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Plans</h1>
          <p className="text-gray-600 mt-1">Create, edit, activate or delete subscription plans</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Plan</span>
        </button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Plan' : 'Create Plan'}
          </h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Name</label>
              <input className={inputCls} value={form.name} required
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Price ($)</label>
              <input className={inputCls} type="number" min="0" value={form.price} required
                onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Duration (days)</label>
              <input className={inputCls} type="number" min="1" value={form.duration} required
                onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Storage (MB)</label>
              <input className={inputCls} type="number" min="0" value={form.storage_quota_mb}
                onChange={(e) => setForm({ ...form, storage_quota_mb: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Max Podcasts (0 = unlimited)</label>
              <input className={inputCls} type="number" min="0" value={form.maxPodcasts}
                onChange={(e) => setForm({ ...form, maxPodcasts: e.target.value })} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 text-primary-600" />
                <span>Active (visible to users)</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Description</label>
              <input className={inputCls} value={form.description} required
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Features (comma separated)</label>
              <input className={inputCls} value={form.features} placeholder="Feature 1, Feature 2"
                onChange={(e) => setForm({ ...form, features: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Benefits (comma separated)</label>
              <input className={inputCls} value={form.benefits} placeholder="Benefit 1, Benefit 2"
                onChange={(e) => setForm({ ...form, benefits: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex space-x-3">
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : editingId ? 'Update Plan' : 'Create Plan'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plans table */}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Storage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {plans.map((plan) => (
              <tr key={plan.id || plan._id} className={!plan.isActive ? 'opacity-60' : ''}>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <Crown className="h-5 w-5 text-primary-500" />
                    <div>
                      <p className="font-medium text-gray-900">{plan.name}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{plan.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">${plan.price}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{plan.duration} days</td>
                <td className="px-6 py-4 text-sm text-gray-900">{plan.storage_quota_mb} MB</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className="flex items-center space-x-1 text-sm"
                    title={plan.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {plan.isActive ? (
                      <><ToggleRight className="h-5 w-5 text-green-500" /><span className="text-green-600">Active</span></>
                    ) : (
                      <><ToggleLeft className="h-5 w-5 text-gray-400" /><span className="text-gray-500">Inactive</span></>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openEdit(plan)} className="text-primary-600 hover:text-primary-800 p-1" title="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(plan)} className="text-red-600 hover:text-red-800 p-1" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {plans.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No plans found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPlans;
