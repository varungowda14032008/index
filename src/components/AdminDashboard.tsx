import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Calendar,
  Clock,
  User,
  Settings,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Mail,
  Shield,
  Layers,
  BarChart3,
  LogOut,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  BusinessSettings,
  Service,
  Staff,
  DaySchedule,
  HolidayClosure,
  Appointment,
  NotificationLog,
} from '../types/client';

interface AdminDashboardProps {
  initialSettings: BusinessSettings;
  onClose: () => void;
  onSettingsUpdated: (newSettings: BusinessSettings) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialSettings,
  onClose,
  onSettingsUpdated,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('atelier_admin_token')
  );
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'appointments' | 'services' | 'staff' | 'schedule' | 'settings' | 'notifications'
  >('overview');

  // Data states
  const [settings, setSettings] = useState<BusinessSettings>(initialSettings);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<any>({});
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [holidays, setHolidays] = useState<HolidayClosure[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Filters for appointments
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing modals/states
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [editingStaff, setEditingStaff] = useState<Partial<Staff> | null>(null);
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayReason, setNewHolidayReason] = useState('');
  const [previewNotification, setPreviewNotification] = useState<NotificationLog | null>(null);

  // Load admin data when token exists
  useEffect(() => {
    if (token) {
      loadAllAdminData();
    }
  }, [token]);

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Load appointments & stats
      const apptRes = await fetch('/api/admin/appointments', { headers });
      if (apptRes.ok) {
        const apptData = await apptRes.json();
        setAppointments(apptData.data || []);
        setStats(apptData.stats || {});
      }

      // Load services
      const srvRes = await fetch('/api/admin/services', { headers });
      if (srvRes.ok) {
        const srvData = await srvRes.json();
        setServices(srvData.data || []);
      }

      // Load staff
      const stfRes = await fetch('/api/admin/staff', { headers });
      if (stfRes.ok) {
        const stfData = await stfRes.json();
        setStaff(stfData.data || []);
      }

      // Load schedule
      const schRes = await fetch('/api/schedule');
      if (schRes.ok) {
        const schData = await schRes.json();
        setSchedule(schData.data.weekly || []);
        setHolidays(schData.data.holidays || []);
      }

      // Load notifications
      const notifRes = await fetch('/api/admin/notifications', { headers });
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      setToken(data.token);
      localStorage.setItem('atelier_admin_token', data.token);
    } catch (err: any) {
      setLoginError(err.message || 'Incorrect password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('atelier_admin_token');
  };

  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    try {
      const res = await fetch(`/api/admin/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setActionMessage(`Appointment marked as ${status}.`);
        loadAllAdminData();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch {}
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/business', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage('Studio business settings successfully updated.');
        onSettingsUpdated(data.data);
        setTimeout(() => setActionMessage(null), 3500);
      }
    } catch {}
  };

  const handleSaveService = async (srv: Partial<Service>) => {
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(srv),
      });
      if (res.ok) {
        setEditingService(null);
        loadAllAdminData();
        setActionMessage('Treatment saved successfully.');
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch {}
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to remove this treatment?')) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadAllAdminData();
      }
    } catch {}
  };

  const handleSaveStaff = async (member: Partial<Staff>) => {
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(member),
      });
      if (res.ok) {
        setEditingStaff(null);
        loadAllAdminData();
        setActionMessage('Practitioner details updated.');
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch {}
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff profile?')) return;
    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadAllAdminData();
      }
    } catch {}
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayDate || !newHolidayReason) return;
    try {
      const res = await fetch('/api/admin/holidays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: newHolidayDate, reason: newHolidayReason }),
      });
      if (res.ok) {
        setNewHolidayDate('');
        setNewHolidayReason('');
        loadAllAdminData();
      }
    } catch {}
  };

  const handleDeleteHoliday = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/holidays/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) loadAllAdminData();
    } catch {}
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = a.customerName.toLowerCase().includes(q);
      const matchRef = a.reference.toLowerCase().includes(q);
      const matchSrv = a.serviceName.toLowerCase().includes(q);
      return matchName || matchRef || matchSrv;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl border border-stone-200 max-w-6xl w-full h-[92vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-stone-900 text-stone-200 px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-400" />
            <div>
              <span className="font-serif text-lg font-bold text-white block leading-tight">
                Aishwarya Hospital · Hospital Staff & Doctor Portal
              </span>
              <span className="text-[11px] text-stone-400">
                {settings.name} · Vijayanagar 3rd Stage, Mysuru · OPD & Casualty Administration
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {token && (
              <button
                onClick={handleLogout}
                className="text-xs text-stone-400 hover:text-white px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="Sign out of director portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              aria-label="Close director portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* If Not Authenticated -> Login View */}
        {!token ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-stone-50">
            <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 p-8 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-800 mb-4">
                <Lock className="w-6 h-6" />
              </div>

              <h3 className="font-serif text-2xl text-stone-900">Director Sign-In</h3>
              <p className="text-xs text-stone-600 mt-1 mb-6">
                Enter your administrative password to configure business identity, schedules, pricing, and appointments.
              </p>

              {loginError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Director Access Key
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm bg-white text-stone-900 focus:outline-stone-900"
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-stone-900 rounded-xl hover:bg-stone-800 transition-colors cursor-pointer shadow-sm"
                >
                  {isLoggingIn ? 'Authenticating...' : 'Access Dashboard'}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-stone-100 text-xs text-stone-500">
                <span>Demo Key: </span>
                <button
                  type="button"
                  onClick={() => setPasswordInput('atelier2026')}
                  className="font-mono text-stone-900 font-bold underline cursor-pointer hover:text-stone-700 ml-1"
                >
                  atelier2026 (click to fill)
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="flex-1 flex flex-col sm:flex-row overflow-hidden bg-stone-50">
            {/* Sidebar Tabs */}
            <div className="w-full sm:w-56 bg-white border-r border-stone-200 p-3 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-y-auto shrink-0">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full px-3 py-2 text-xs font-medium rounded-lg text-left flex items-center gap-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Overview & KPIs</span>
              </button>

              <button
                onClick={() => setActiveTab('appointments')}
                className={`w-full px-3 py-2 text-xs font-medium rounded-lg text-left flex items-center gap-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'appointments'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Appointments ({appointments.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('services')}
                className={`w-full px-3 py-2 text-xs font-medium rounded-lg text-left flex items-center gap-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'services'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>Treatments & Rates</span>
              </button>

              <button
                onClick={() => setActiveTab('staff')}
                className={`w-full px-3 py-2 text-xs font-medium rounded-lg text-left flex items-center gap-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'staff'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Practitioners ({staff.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('schedule')}
                className={`w-full px-3 py-2 text-xs font-medium rounded-lg text-left flex items-center gap-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'schedule'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span>Hours & Closures</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full px-3 py-2 text-xs font-medium rounded-lg text-left flex items-center gap-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Studio Identity</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full px-3 py-2 text-xs font-medium rounded-lg text-left flex items-center gap-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'notifications'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span>Notifications ({notifications.length})</span>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {actionMessage && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{actionMessage}</span>
                </div>
              )}

              {/* TAB 1: OVERVIEW & KPIS */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-2xl text-stone-900">Studio Performance Overview</h3>
                    <p className="text-xs text-stone-600 mt-1">
                      Real-time appointment metrics and schedule utilization.
                    </p>
                  </div>

                  {/* 4 Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                      <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Today's Visits</p>
                      <p className="font-serif text-3xl font-bold text-stone-900 mt-2 tabular-nums">
                        {stats.todayCount ?? 0}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-1">Scheduled for today</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                      <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Upcoming Bookings</p>
                      <p className="font-serif text-3xl font-bold text-stone-900 mt-2 tabular-nums">
                        {stats.upcomingCount ?? 0}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-1">Confirmed forward sessions</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                      <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Total Sessions</p>
                      <p className="font-serif text-3xl font-bold text-stone-900 mt-2 tabular-nums">
                        {stats.totalBookings ?? 0}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-1">{stats.completedCount ?? 0} completed</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                      <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Booked Revenue</p>
                      <p className="font-serif text-3xl font-bold text-stone-900 mt-2 tabular-nums">
                        {settings.currency}{stats.totalRevenue ?? 0}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-1">Active and completed</p>
                    </div>
                  </div>

                  {/* Quick Action & Google Maps Inaccessibility Notice Card */}
                  <div className="bg-stone-100 p-6 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Google Maps Shortlink Inaccessibility & Configuration Notice</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      The shortlink (<code className="font-mono bg-white px-1.5 py-0.5 rounded text-stone-800">https://maps.app.goo.gl/CVybxwKpQZ2rLeEq81</code>) returned an HTTP 404 response. As instructed by your brief, authentic details were not fabricated. You can update your business name, address, phone number, and Google Maps embed link under the <strong>Studio Identity</strong> tab at any time.
                    </p>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      Configure Studio Identity Now
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: APPOINTMENTS */}
              {activeTab === 'appointments' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl text-stone-900">Guest Appointments</h3>
                      <p className="text-xs text-stone-600 mt-1">
                        Filter, confirm, complete, or cancel studio sessions.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={loadAllAdminData}
                        className="p-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Refresh appointments"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search by guest name, reference, or treatment..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-stone-900"
                      />
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto">
                      {['all', 'confirmed', 'completed', 'cancelled'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg uppercase tracking-wider cursor-pointer whitespace-nowrap ${
                            statusFilter === st
                              ? 'bg-stone-900 text-white shadow-sm'
                              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Appointments Table / Cards */}
                  {filteredAppointments.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
                      No appointments matching this criteria.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAppointments.map((appt) => (
                        <div
                          key={appt.id}
                          className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-stone-900">
                                {appt.reference}
                              </span>
                              <span
                                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                  appt.status === 'confirmed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : appt.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {appt.status}
                              </span>
                              <span className="text-xs text-stone-500">· {appt.servicePrice ? `${settings.currency}${appt.servicePrice}` : ''}</span>
                            </div>

                            <p className="font-serif text-base font-medium text-stone-900">
                              {appt.serviceName}
                            </p>

                            <div className="text-xs text-stone-600 flex flex-wrap gap-x-4 gap-y-1">
                              <span><strong>When:</strong> {appt.date} at {appt.time}–{appt.endTime}</span>
                              <span><strong>Practitioner:</strong> {appt.staffName}</span>
                              <span><strong>Guest:</strong> {appt.customerName} ({appt.customerPhone})</span>
                            </div>

                            {appt.notes && (
                              <p className="text-xs text-stone-500 italic pt-1">
                                Note: {appt.notes}
                              </p>
                            )}
                            {appt.cancellationReason && (
                              <p className="text-xs text-red-600 italic pt-1">
                                Cancellation reason: {appt.cancellationReason}
                              </p>
                            )}
                          </div>

                          {/* Action controls */}
                          <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
                            {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'completed')}
                                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium cursor-pointer"
                              >
                                Mark Completed
                              </button>
                            )}

                            {appt.status !== 'cancelled' && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}

                            {appt.status === 'cancelled' && (
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium cursor-pointer"
                              >
                                Reopen
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: TREATMENTS & SERVICES */}
              {activeTab === 'services' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl text-stone-900">Treatment Catalog</h3>
                      <p className="text-xs text-stone-600 mt-1">
                        Manage active services, session durations, buffer times, and prices.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setEditingService({
                          id: `srv-${Date.now()}`,
                          name: '',
                          category: 'Facial Aesthetics',
                          durationMinutes: 60,
                          bufferMinutes: 15,
                          price: 150,
                          description: '',
                          highlights: ['Bespoke Consultation'],
                          active: true,
                        })
                      }
                      className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-stone-800 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Treatment</span>
                    </button>
                  </div>

                  {/* Editing Modal */}
                  {editingService && (
                    <div className="p-6 bg-white rounded-2xl border border-stone-300 shadow-md space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                        <h4 className="font-serif text-lg font-medium text-stone-900">
                          {editingService.id ? 'Edit Treatment' : 'New Treatment'}
                        </h4>
                        <button
                          onClick={() => setEditingService(null)}
                          className="text-stone-400 hover:text-stone-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Treatment Name
                          </label>
                          <input
                            type="text"
                            value={editingService.name || ''}
                            onChange={(e) =>
                              setEditingService({ ...editingService, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg text-xs"
                            placeholder="e.g. Lymphatic Sculpt Ritual"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Category
                          </label>
                          <input
                            type="text"
                            value={editingService.category || ''}
                            onChange={(e) =>
                              setEditingService({ ...editingService, category: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg text-xs"
                            placeholder="Facial Aesthetics, Body, Consultation"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Duration (Minutes)
                          </label>
                          <input
                            type="number"
                            value={editingService.durationMinutes || 60}
                            onChange={(e) =>
                              setEditingService({
                                ...editingService,
                                durationMinutes: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Price ({settings.currency})
                          </label>
                          <input
                            type="number"
                            value={editingService.price || 0}
                            onChange={(e) =>
                              setEditingService({ ...editingService, price: Number(e.target.value) })
                            }
                            className="w-full px-3 py-2 border rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          value={editingService.description || ''}
                          onChange={(e) =>
                            setEditingService({ ...editingService, description: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setEditingService(null)}
                          className="px-4 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveService(editingService)}
                          className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-stone-900 rounded-lg hover:bg-stone-800"
                        >
                          Save Treatment
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {services.map((srv) => (
                      <div
                        key={srv.id}
                        className="bg-white rounded-2xl border border-stone-200 p-4 flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-medium text-stone-900 text-base">
                              {srv.name}
                            </span>
                            <span className="text-xs text-stone-500 font-mono">
                              ({srv.category} · {srv.durationMinutes} min)
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full ${
                                srv.active
                                  ? 'bg-emerald-100 text-emerald-800 font-semibold'
                                  : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {srv.active ? 'Active' : 'Hidden'}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 mt-1 max-w-xl">{srv.description}</p>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <span className="font-serif text-lg font-bold text-stone-900 tabular-nums">
                            {settings.currency}{srv.price}
                          </span>

                          <button
                            onClick={() => setEditingService(srv)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                            title="Edit treatment"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteService(srv.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            title="Delete treatment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: STAFF */}
              {activeTab === 'staff' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl text-stone-900">Practitioners & Specialists</h3>
                      <p className="text-xs text-stone-600 mt-1">
                        Configure clinical team profiles, assigned services, and active scheduled days.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setEditingStaff({
                          id: `stf-${Date.now()}`,
                          name: '',
                          title: 'Licensed Specialist',
                          bio: '',
                          specialties: ['Holistic Aesthetics'],
                          assignedServiceIds: services.map((s) => s.id),
                          activeDays: [1, 2, 3, 4, 5],
                          active: true,
                        })
                      }
                      className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-stone-800 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Practitioner</span>
                    </button>
                  </div>

                  {/* Staff Edit Modal */}
                  {editingStaff && (
                    <div className="p-6 bg-white rounded-2xl border border-stone-300 shadow-md space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                        <h4 className="font-serif text-lg font-medium text-stone-900">
                          {editingStaff.id ? 'Edit Practitioner' : 'New Practitioner'}
                        </h4>
                        <button
                          onClick={() => setEditingStaff(null)}
                          className="text-stone-400 hover:text-stone-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={editingStaff.name || ''}
                            onChange={(e) =>
                              setEditingStaff({ ...editingStaff, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Title / Credential
                          </label>
                          <input
                            type="text"
                            value={editingStaff.title || ''}
                            onChange={(e) =>
                              setEditingStaff({ ...editingStaff, title: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Biography
                        </label>
                        <textarea
                          rows={2}
                          value={editingStaff.bio || ''}
                          onChange={(e) =>
                            setEditingStaff({ ...editingStaff, bio: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setEditingStaff(null)}
                          className="px-4 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveStaff(editingStaff)}
                          className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-stone-900 rounded-lg hover:bg-stone-800"
                        >
                          Save Practitioner
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staff.map((st) => (
                      <div
                        key={st.id}
                        className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-serif text-lg font-medium text-stone-900">
                              {st.name}
                            </h4>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingStaff(st)}
                                className="p-1 text-stone-400 hover:text-stone-800"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStaff(st.id)}
                                className="p-1 text-red-400 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-stone-500 font-medium">{st.title}</p>
                          <p className="text-xs text-stone-600 mt-2">{st.bio}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500">
                          Specialties: {st.specialties.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: SCHEDULE & CLOSURES */}
              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-2xl text-stone-900">Studio Operating Schedule</h3>
                    <p className="text-xs text-stone-600 mt-1">
                      Configure regular weekly opening hours and special holiday closures.
                    </p>
                  </div>

                  {/* Weekly Hours Table */}
                  <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-700">
                      Weekly Opening Hours
                    </h4>
                    <div className="divide-y divide-stone-100">
                      {schedule.map((day, idx) => (
                        <div
                          key={day.dayOfWeek}
                          className="py-2.5 flex items-center justify-between text-xs"
                        >
                          <div className="w-28 font-medium text-stone-900">{day.dayName}</div>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={day.isOpen}
                                onChange={(e) => {
                                  const updated = [...schedule];
                                  updated[idx].isOpen = e.target.checked;
                                  setSchedule(updated);
                                }}
                                className="rounded text-stone-900"
                              />
                              <span>Open</span>
                            </label>

                            {day.isOpen && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="time"
                                  value={day.openTime}
                                  onChange={(e) => {
                                    const updated = [...schedule];
                                    updated[idx].openTime = e.target.value;
                                    setSchedule(updated);
                                  }}
                                  className="px-2 py-1 border rounded text-xs"
                                />
                                <span>to</span>
                                <input
                                  type="time"
                                  value={day.closeTime}
                                  onChange={(e) => {
                                    const updated = [...schedule];
                                    updated[idx].closeTime = e.target.value;
                                    setSchedule(updated);
                                  }}
                                  className="px-2 py-1 border rounded text-xs"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Holiday Closures */}
                  <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-700">
                      Special Closures & Holidays
                    </h4>

                    <form onSubmit={handleAddHoliday} className="flex flex-wrap gap-2">
                      <input
                        type="date"
                        value={newHolidayDate}
                        onChange={(e) => setNewHolidayDate(e.target.value)}
                        className="px-3 py-1.5 border rounded-lg text-xs"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Reason (e.g. Annual Sanitization)"
                        value={newHolidayReason}
                        onChange={(e) => setNewHolidayReason(e.target.value)}
                        className="px-3 py-1.5 border rounded-lg text-xs flex-1"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold uppercase cursor-pointer"
                      >
                        Add Closure
                      </button>
                    </form>

                    {holidays.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">No special closures currently logged.</p>
                    ) : (
                      <div className="space-y-2 pt-2">
                        {holidays.map((hol) => (
                          <div
                            key={hol.id}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs"
                          >
                            <span>
                              <strong>{hol.date}:</strong> {hol.reason}
                            </span>
                            <button
                              onClick={() => handleDeleteHoliday(hol.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div>
                    <h3 className="font-serif text-2xl text-stone-900">Studio Identity & Policy Configuration</h3>
                    <p className="text-xs text-stone-600 mt-1">
                      Customize your verified brand name, locality coordinates, booking lead times, and terms.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Official Studio Name *
                        </label>
                        <input
                          type="text"
                          value={settings.name}
                          onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Industry / Category
                        </label>
                        <input
                          type="text"
                          value={settings.category}
                          onChange={(e) => setSettings({ ...settings, category: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Contact Telephone *
                        </label>
                        <input
                          type="text"
                          value={settings.phone}
                          onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Concierge Email *
                        </label>
                        <input
                          type="email"
                          value={settings.email}
                          onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={settings.address.street}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              address: { ...settings.address, street: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          City, State, Postal Code
                        </label>
                        <input
                          type="text"
                          value={`${settings.address.city}, ${settings.address.state} ${settings.address.postalCode}`}
                          onChange={(e) => {
                            const parts = e.target.value.split(',');
                            setSettings({
                              ...settings,
                              address: {
                                ...settings.address,
                                city: parts[0]?.trim() || settings.address.city,
                              },
                            });
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Google Maps Web Link
                      </label>
                      <input
                        type="url"
                        value={settings.googleMapsUrl}
                        onChange={(e) =>
                          setSettings({ ...settings, googleMapsUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* Policies Configuration */}
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-stone-700">
                      Booking Policies & Windows
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Cancellation Window (Hours)
                        </label>
                        <input
                          type="number"
                          value={settings.cancellationWindowHours}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              cancellationWindowHours: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Sanctuary Buffer Window (Minutes)
                        </label>
                        <input
                          type="number"
                          value={settings.bufferMinutes}
                          onChange={(e) =>
                            setSettings({ ...settings, bufferMinutes: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Cancellation Policy Verbiage
                      </label>
                      <textarea
                        rows={2}
                        value={settings.policies.cancellation}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            policies: { ...settings.policies, cancellation: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 cursor-pointer shadow-sm"
                    >
                      Save All Studio Settings
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 7: NOTIFICATIONS & AUDIT */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-2xl text-stone-900">Notification Center & Audit Log</h3>
                    <p className="text-xs text-stone-600 mt-1">
                      Inspection logs of all confirmation and cancellation emails generated by the booking engine.
                    </p>
                  </div>

                  {/* Dev notification notice */}
                  <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-700 space-y-1">
                    <p className="font-semibold text-stone-900">
                      Transactional Email Engine: Dev Preview Mode Active
                    </p>
                    <p>
                      In this environment, outgoing confirmation messages are safely intercepted and captured to the local audit trail below. To connect live external email dispatch, set <code className="bg-white px-1 py-0.5 rounded">SMTP_HOST</code> or <code className="bg-white px-1 py-0.5 rounded">RESEND_API_KEY</code> in your environment secrets.
                    </p>
                  </div>

                  {/* Notification List */}
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-xs text-stone-400">
                      No notifications logged yet. Complete a booking to see automatic notifications generated.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => setPreviewNotification(notif)}
                          className="p-4 bg-white rounded-xl border border-stone-200 hover:border-stone-300 transition-colors cursor-pointer flex items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-stone-900">
                                {notif.appointmentReference}
                              </span>
                              <span className="text-xs text-stone-500">→ {notif.recipient}</span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
                                {notif.status}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-stone-800 mt-1">{notif.subject}</p>
                            <p className="text-[11px] text-stone-500 line-clamp-1">{notif.previewSnippet}</p>
                          </div>

                          <span className="text-[10px] text-stone-400 font-mono shrink-0">
                            {new Date(notif.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Preview Modal */}
                  {previewNotification && (
                    <div className="p-6 bg-white rounded-2xl border border-stone-300 shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b pb-3">
                        <div>
                          <h4 className="font-serif text-lg font-bold text-stone-900">Patient Email Message Record</h4>
                          <p className="text-xs text-stone-500">Official transactional message dispatched to patient</p>
                        </div>
                        <button
                          onClick={() => setPreviewNotification(null)}
                          className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
                        <div>
                          <span className="text-stone-500 font-medium">Appointment Number:</span>
                          <p className="font-mono font-bold text-blue-900 text-sm">#{previewNotification.appointmentReference || previewNotification.appointmentNumber}</p>
                        </div>
                        <div>
                          <span className="text-stone-500 font-medium">Status:</span>
                          <p className="font-bold uppercase tracking-wider text-sm text-emerald-700">
                            {previewNotification.status.toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <span className="text-stone-500 font-medium">Patient Email Recipient:</span>
                          <p className="font-semibold text-stone-900">{previewNotification.recipient}</p>
                        </div>
                        <div>
                          <span className="text-stone-500 font-medium">Appointment Schedule:</span>
                          <p className="font-semibold text-stone-900">{previewNotification.appointmentDate} at {previewNotification.appointmentTime}</p>
                        </div>
                        <div className="sm:col-span-2 pt-2 border-t border-stone-200">
                          <span className="text-stone-500 font-medium">Hospital Location Link:</span>
                          <div className="mt-1">
                            <a
                              href={previewNotification.locationLink || settings.googleMapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-700 underline font-medium hover:text-blue-900 break-all"
                            >
                              {previewNotification.locationLink || settings.googleMapsUrl}
                            </a>
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-stone-700">Email Subject:</span>
                        <p className="text-xs font-mono bg-stone-100 p-2.5 rounded-lg border border-stone-200 mt-1 text-stone-900">
                          {previewNotification.subject}
                        </p>
                      </div>

                      {previewNotification.textBody && (
                        <div>
                          <span className="text-xs font-semibold text-stone-700">Dispatched Plain Text Body:</span>
                          <pre className="text-[11px] font-mono bg-stone-900 text-stone-100 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap mt-1 max-h-48">
                            {previewNotification.textBody}
                          </pre>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/appointments/${previewNotification.appointmentReference}/resend-email`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ targetEmail: previewNotification.recipient }),
                              });
                              if (res.ok) {
                                setActionMessage(`Email message re-dispatched to ${previewNotification.recipient}`);
                                loadAllAdminData();
                              }
                            } catch {
                              setActionMessage('Failed to trigger email re-dispatch');
                            }
                          }}
                          className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-blue-800 transition-colors shadow-xs"
                        >
                          Resend Message to Patient Email
                        </button>

                        <button
                          onClick={() => setPreviewNotification(null)}
                          className="px-4 py-2 bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold uppercase hover:bg-stone-300"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
