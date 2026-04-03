import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Settings as SettingsIcon, Users, Building2, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { Role, Section, User } from '@/src/types';

const Settings = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newRole, setNewRole] = useState('');
  const [newSection, setNewSection] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('ems_user') || '{}');

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-id': user.id?.toString() || '',
    'x-account-id': user.account_id?.toString() || '',
    'x-user-role': user.role || ''
  });

  const fetchData = async () => {
    try {
      const [rolesRes, sectionsRes, usersRes] = await Promise.all([
        fetch('/api/roles', { headers: getHeaders() }),
        fetch('/api/sections', { headers: getHeaders() }),
        fetch('/api/users', { headers: getHeaders() })
      ]);

      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (sectionsRes.ok) setSections(await sectionsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (err) {
      setError('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.trim()) return;
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: newRole })
      });
      if (res.ok) {
        setNewRole('');
        fetchData();
      }
    } catch (err) {
      setError('Failed to add role');
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSection.trim()) return;
    try {
      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: newSection })
      });
      if (res.ok) {
        setNewSection('');
        fetchData();
      }
    } catch (err) {
      setError('Failed to add section');
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      const res = await fetch(`/api/roles/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) fetchData();
    } catch (err) {
      setError('Failed to delete role');
    }
  };

  const handleDeleteSection = async (id: number) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    try {
      const res = await fetch(`/api/sections/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) fetchData();
    } catch (err) {
      setError('Failed to delete section');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 p-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
          <SettingsIcon size={32} />
        </div>
        <div>
          <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Account Settings</h1>
          <p className="font-body text-on-surface-variant">Manage your organization's structure and access</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error/10 text-error rounded-xl font-body text-sm font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Roles Management */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-primary" size={24} />
            <h2 className="font-headline text-xl font-bold text-on-surface">Employee Roles</h2>
          </div>
          
          <form onSubmit={handleAddRole} className="flex gap-2 mb-6">
            <input 
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="New role name..."
              className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button type="submit" className="p-2 bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors">
              <Plus size={20} />
            </button>
          </form>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl group">
                <span className="text-sm font-medium text-on-surface">{role.name}</span>
                <button 
                  onClick={() => handleDeleteRole(role.id)}
                  className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sections Management */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="text-primary" size={24} />
            <h2 className="font-headline text-xl font-bold text-on-surface">Departments / Sections</h2>
          </div>

          <form onSubmit={handleAddSection} className="flex gap-2 mb-6">
            <input 
              type="text"
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              placeholder="New section name..."
              className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button type="submit" className="p-2 bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors">
              <Plus size={20} />
            </button>
          </form>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {sections.map((section) => (
              <div key={section.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl group">
                <span className="text-sm font-medium text-on-surface">{section.name}</span>
                <button 
                  onClick={() => handleDeleteSection(section.id)}
                  className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Users Management */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2 bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="text-primary" size={24} />
              <h2 className="font-headline text-xl font-bold text-on-surface">User Management</h2>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-colors">
              <Plus size={18} />
              Add User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="py-4 px-4 font-body text-xs font-bold text-on-surface-variant uppercase tracking-widest">Name</th>
                  <th className="py-4 px-4 font-body text-xs font-bold text-on-surface-variant uppercase tracking-widest">Email</th>
                  <th className="py-4 px-4 font-body text-xs font-bold text-on-surface-variant uppercase tracking-widest">Role</th>
                  <th className="py-4 px-4 font-body text-xs font-bold text-on-surface-variant uppercase tracking-widest">Account</th>
                  <th className="py-4 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-4 text-sm font-semibold text-on-surface">{u.name}</td>
                    <td className="py-4 px-4 text-sm text-on-surface-variant">{u.email}</td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                        u.role === 'super_admin' ? "bg-purple-100 text-purple-700" :
                        u.role === 'admin' ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-700"
                      )}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-on-surface-variant">{(u as any).account_name || 'N/A'}</td>
                    <td className="py-4 px-4 text-right">
                      <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
