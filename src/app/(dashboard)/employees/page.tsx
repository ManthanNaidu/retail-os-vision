'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Check, Search, Phone,
  Edit2, Trash2, Users, DollarSign, UserCheck, UserX, Umbrella
} from 'lucide-react';
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

  const getStatusConfig = (status: string) => {
    if (status === 'active') return { label: 'Present', bg: '#d1fae5', color: '#065f46', icon: UserCheck };
    if (status === 'absent') return { label: 'Absent', bg: '#fee2e2', color: '#991b1b', icon: UserX };
    return { label: 'Leave', bg: '#fef3c7', color: '#92400e', icon: Umbrella };
  };

  return (
    <div className="page-enter has-bottom-nav">
      <div className="page-container py-5">
        <div className="flex justify-between items-center mb-6 px-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Employees</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your team members</p>
          </div>
          <button onClick={() => openForm()} className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: 'var(--primary)' }}>
            <Plus size={20} />
          </button>
        </div>

        <div className="px-4 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl flex flex-col items-center text-center border" style={{ background: 'var(--bg-pearl)', borderColor: 'var(--border)' }}>
              <Users size={18} className="mb-1" style={{ color: 'var(--primary)' }} />
              <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-secondary)' }}>Total Staff</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{employees.length}</p>
            </div>
            <div className="p-3 rounded-2xl flex flex-col items-center text-center border" style={{ background: 'var(--bg-pearl)', borderColor: 'var(--border)' }}>
              <UserCheck size={18} className="mb-1 text-green-600" />
              <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-secondary)' }}>Present Today</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{presentToday}</p>
            </div>
            <div className="p-3 rounded-2xl flex flex-col items-center text-center border" style={{ background: 'var(--bg-pearl)', borderColor: 'var(--border)' }}>
              <DollarSign size={18} className="mb-1 text-amber-600" />
              <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-secondary)' }}>Total Payroll</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalPayroll)}</p>
            </div>
          </div>
        </div>

        <div className="px-4 mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none"
              style={{ background: 'var(--bg-pearl)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <div className="px-4 mb-4">
          <p className="section-header">Team Members</p>
        </div>

        <div className="px-4 space-y-3 pb-20">
          {filtered.map(emp => {
            const status = getStatusConfig(emp.status);
            const StatusIcon = status.icon;
            return (
              <div key={emp.id} className="list-item flex flex-col gap-3 p-4 rounded-2xl border" style={{ background: 'white', borderColor: 'var(--border)' }}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: 'var(--primary)' }}>
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{emp.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{emp.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full font-semibold flex items-center gap-1" style={{ background: status.bg, color: status.color }}>
                    <StatusIcon size={10} /> {status.label}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 my-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    <Phone size={12} /> {emp.phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <DollarSign size={12} /> {formatCurrency(emp.salary)} / mo
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t mt-1" style={{ borderColor: 'var(--border)' }}>
                  <button onClick={() => openForm(emp)} className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5" style={{ background: 'var(--bg-pearl)', color: 'var(--text-primary)' }}>
                    <Edit2 size={14} /> Edit
                  </button>
                  <button onClick={() => setEmployeeToDelete(emp)} className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5" style={{ background: '#fee2e2', color: '#dc2626' }}>
                    <Trash2 size={14} /> Delete
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
                  <button type="submit" className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 mt-4" style={{ background: 'var(--primary)' }}>
                    <Check size={18} /> {editingEmployee ? 'Save Changes' : 'Add Employee'}
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
    </div>
  );
}
