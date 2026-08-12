'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Check, Search, Phone, Menu, Bell,
  Edit2, Trash2, Users, DollarSign, UserCheck, UserX, Umbrella
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { formatCurrency } from '@/lib/utils';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';

interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  salary: number;
  commission: number;
  attendance: number;
  sales: number;
  joinDate: string;
  status: 'active' | 'absent' | 'leave';
  todayIn?: string;
  advances: number;
}

const MOCK_EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Ramesh Babu', role: 'Cashier', phone: '9876543211', salary: 18000, commission: 1.5, attendance: 96, sales: 145000, joinDate: '2022-03-15', status: 'active', todayIn: '09:02', advances: 2000 },
  { id: 'e2', name: 'Sunita Devi', role: 'Sales Staff', phone: '9876543212', salary: 15000, commission: 2, attendance: 88, sales: 98000, joinDate: '2023-01-10', status: 'active', todayIn: '09:15', advances: 0 },
  { id: 'e3', name: 'Prakash Kumar', role: 'Store Manager', phone: '9876543213', salary: 28000, commission: 3, attendance: 98, sales: 320000, joinDate: '2020-06-01', status: 'active', todayIn: '08:45', advances: 5000 },
  { id: 'e4', name: 'Lakshmi S', role: 'Helper', phone: '9876543214', salary: 10000, commission: 0, attendance: 72, sales: 0, joinDate: '2024-01-20', status: 'absent', advances: 0 },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | undefined>(undefined);

  const [formData, setFormData] = useState({
    name: '',
    role: 'Sales Staff',
    phone: '',
    salary: '',
    status: 'active' as Employee['status']
  });

  const openForm = (emp?: Employee) => {
    if (emp) {
      setFormData({
        name: emp.name,
        role: emp.role,
        phone: emp.phone,
        salary: emp.salary.toString(),
        status: emp.status
      });
      setEditingEmployee(emp);
    } else {
      setFormData({
        name: '',
        role: 'Sales Staff',
        phone: '',
        salary: '',
        status: 'active'
      });
      setEditingEmployee(undefined);
    }
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...emp, ...formData, salary: Number(formData.salary) } 
          : emp
      ));
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        ...formData,
        salary: Number(formData.salary),
        commission: 0,
        attendance: 100,
        sales: 0,
        joinDate: new Date().toISOString(),
        advances: 0
      };
      setEmployees(prev => [newEmp, ...prev]);
    }
    setShowForm(false);
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  const totalPayroll = employees.reduce((s, e) => s + e.salary, 0);
  const presentToday = employees.filter(e => e.status === 'active').length;

  const notifications = useAppStore(s => s.notifications);
  const sectionNotifications = notifications.filter(n => !n.section || n.section === '/employees');
  const unreadCount = sectionNotifications.filter(n => !n.isRead).length;

  const getStatusConfig = (status: string) => {
    if (status === 'active') return { label: 'Present', bg: '#d1fae5', color: '#065f46', icon: UserCheck };
    if (status === 'absent') return { label: 'Absent', bg: '#fee2e2', color: '#991b1b', icon: UserX };
    return { label: 'Leave', bg: '#fef3c7', color: '#92400e', icon: Umbrella };
  };

  return (
    <div className="page-enter has-bottom-nav" style={{ minHeight: '100vh', background: '#F4F6FA', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Orange Hero Section */}
      <div style={{ background: '#E65C00', paddingBottom: '32px', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => useAppStore.getState().toggleSidebar()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <Menu size={24} color="white" />
                </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative', cursor: 'pointer' }}>
                    <Bell size={22} color="white" />
                    {unreadCount > 0 && (
                        <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', background: '#EF4444', color: 'white', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid #E65C00' }}>
                            {unreadCount}
                        </div>
                    )}
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF6B00', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                    U
                </div>
            </div>
        </div>

        {/* Hero Content */}
        <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <div style={{ zIndex: 10, maxWidth: '60%' }}>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: 600, margin: '0 0 2px' }}>Team</p>
                <h2 style={{ color: 'white', fontSize: '28px', fontWeight: 800, lineHeight: 1.1, margin: '0 0 4px' }}>
                    Employees
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 500, margin: '0 0 16px' }}>
                    Manage your team members
                </p>
                
                <button onClick={() => openForm()} style={{ background: 'white', color: '#FF6B00', border: 'none', padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <Plus size={18} /> Add Employee
                </button>
            </div>
            
            <img src="/images/team_banner.jpg" alt="Team" style={{ position: 'absolute', right: '-20px', top: '-10px', width: '220px', height: 'auto', objectFit: 'contain' }} />
        </div>
      </div>

      {/* Stats Cards - Overlapping the banner */}
      <div style={{ padding: '0 16px', marginTop: '-24px', position: 'relative', zIndex: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <Users size={16} color="#EA580C" />
                  </div>
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px', fontWeight: 600 }}>Total Staff</p>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>{employees.length}</p>
              </div>
              <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <UserCheck size={16} color="#16A34A" />
                  </div>
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px', fontWeight: 600 }}>Present Today</p>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>{presentToday}</p>
              </div>
              <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <DollarSign size={16} color="#4F46E5" />
                  </div>
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px', fontWeight: 600 }}>Total Payroll</p>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>{formatCurrency(totalPayroll)}</p>
              </div>
          </div>
      </div>

        <div className="px-4 mb-6 mt-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
            <input 
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pr-4 py-3.5 rounded-xl text-sm font-medium focus:outline-none"
              style={{ paddingLeft: '44px', background: 'white', border: 'none', color: '#111827', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}
            />
          </div>
        </div>

        <div className="px-4 mb-4">
          <p style={{ fontSize: '12px', fontWeight: 800, color: '#F97316', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Team Members</p>
        </div>

        <div className="px-4 space-y-3 pb-24">
          {filtered.map(emp => {
            const status = getStatusConfig(emp.status);
            const StatusIcon = status.icon;
            return (
              <div key={emp.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C', fontWeight: 'bold', fontSize: '18px', flexShrink: 0 }}>
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>{emp.name}</p>
                      <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 4px' }}>{emp.role}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#6B7280' }}>
                        <Phone size={10} /> {emp.phone}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '100px', fontWeight: 700, background: status.bg, color: status.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {status.label}
                    </span>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#111827' }}>
                      {formatCurrency(emp.salary)} <span style={{ color: '#6B7280', fontWeight: 500 }}>/ mo</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => openForm(emp)} style={{ flex: 1, height: '44px', borderRadius: '12px', border: '1px solid #F3F4F6', background: 'white', color: '#4B5563', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: 700 }}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button onClick={() => setEmployeeToDelete(emp)} style={{ flex: 1, height: '44px', borderRadius: '12px', border: '1px solid #FEE2E2', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: 700 }}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
                className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</h2>
                  <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-pearl)', color: 'var(--text-secondary)' }}>
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                      style={{ background: 'var(--bg-pearl)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} placeholder="Employee Name" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Role</label>
                    <select required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                      style={{ background: 'var(--bg-pearl)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                      {['Cashier', 'Sales Staff', 'Store Manager', 'Helper', 'Accountant', 'Security'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Phone</label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                      style={{ background: 'var(--bg-pearl)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} placeholder="Phone Number" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Monthly Salary (₹)</label>
                    <input required type="number" min="0" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                      style={{ background: 'var(--bg-pearl)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} placeholder="e.g. 15000" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Status</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: 'active', label: 'Present', color: '#059669', bg: '#d1fae5' },
                        { val: 'absent', label: 'Absent', color: '#dc2626', bg: '#fee2e2' },
                        { val: 'leave', label: 'Leave', color: '#d97706', bg: '#fef3c7' }
                      ].map(s => (
                        <button key={s.val} type="button" onClick={() => setFormData({ ...formData, status: s.val as any })}
                          className="py-2 rounded-xl text-xs font-bold border transition-colors"
                          style={{
                            background: formData.status === s.val ? s.bg : 'var(--bg-pearl)',
                            color: formData.status === s.val ? s.color : 'var(--text-secondary)',
                            borderColor: formData.status === s.val ? s.color : 'var(--border)'
                          }}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 mt-6 mb-4 text-base" style={{ background: 'var(--primary)' }}>
                    <Check size={20} /> {editingEmployee ? 'Save Changes' : 'Add Employee'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {employeeToDelete && (
          <ConfirmDelete
            title="Delete Employee"
            message={`Are you sure you want to delete ${employeeToDelete.name}?`}
            onConfirm={() => {
              setEmployees(prev => prev.filter(e => e.id !== employeeToDelete.id));
              setEmployeeToDelete(undefined);
            }}
            onCancel={() => setEmployeeToDelete(undefined)}
          />
        )}
    </div>
  );
}
