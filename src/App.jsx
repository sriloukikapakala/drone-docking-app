import React, { useState, useEffect } from 'react';
import { 
  Cpu, LayoutDashboard, Radio, Anchor, Settings, Power, 
  Search, Sun, Moon, Bell, BatteryCharging, Zap, Compass, 
  Wind, MapPin, Camera, Crosshair, CheckCircle, AlertTriangle, 
  Target, ShieldCheck, Mail, Lock, Plus, Trash2, Navigation, User, Sliders
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

const customIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
}

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Main Dashboard States
  const [user, setUser] = useState({ name: '', email: '', role: 'Drone Administrator' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Settings States
  const [settings, setSettings] = useState({
    autoDockBatteryLimit: 20,
    refreshInterval: 3,
    pythonApiUrl: 'http://localhost:8000',
    enableNotifications: true
  });

  // Dynamic Telemetry Data
  const [drones, setDrones] = useState([
    { id: 'DRONE-AI-101', name: 'AeroHawk Alpha', category: 'Surveillance', status: 'In-Flight', battery: 18, speed: 38, lat: 17.3850, lng: 78.4867, dockId: 'DOCK-HYD-01' },
    { id: 'DRONE-AI-102', name: 'SkyCargo Beta', category: 'Delivery', status: 'Charging', battery: 92, speed: 0, lat: 17.3890, lng: 78.4890, dockId: 'DOCK-HYD-01' },
    { id: 'DRONE-AI-103', name: 'AeroInspector X', category: 'Inspection', status: 'Docked', battery: 100, speed: 0, lat: 17.3910, lng: 78.4821, dockId: 'DOCK-HYD-02' }
  ]);

  const [docks, setDocks] = useState([
    { id: 'DOCK-HYD-01', name: 'Hyderabad North Station', lat: 17.3852, lng: 78.4868, status: 'Operational', powerSupply: 'Solar + Grid (400W)', capacity: '2/2 Drones' },
    { id: 'DOCK-HYD-02', name: 'Hyderabad Central Hub', lat: 17.3910, lng: 78.4821, status: 'Operational', powerSupply: 'Grid Fast Charge (800W)', capacity: '1/2 Drones' }
  ]);

  const [selectedDroneId, setSelectedDroneId] = useState(drones[0]?.id || '');
  const selectedDrone = drones.find(d => d.id === selectedDroneId) || drones[0] || {};

  // Modals
  const [showAddDroneModal, setShowAddDroneModal] = useState(false);
  const [showAddDockModal, setShowAddDockModal] = useState(false);
  const [newDrone, setNewDrone] = useState({ id: '', name: '', category: 'Surveillance', status: 'In-Flight', battery: 100, speed: 0, lat: 17.3850, lng: 78.4867, dockId: 'DOCK-HYD-01' });
  const [newDock, setNewDock] = useState({ id: '', name: '', lat: 17.3850, lng: 78.4867, status: 'Operational', powerSupply: 'Solar Fast Charge', capacity: '0/2' });

  // 🔔 1. BROWSER PUSH NOTIFICATIONS INITIALIZATION
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Helper Function for Desktop Popup Alert
  const sendPushNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: body,
        icon: "/favicon.ico",
      });
    }
  };

  // 🔔 2. AUTOMATIC BATTERY MONITOR & ALERT TRIGGER
  useEffect(() => {
    drones.forEach((drone) => {
      // Low Battery Alert
      if (drone.battery <= settings.autoDockBatteryLimit && drone.status === "In-Flight") {
        sendPushNotification(
          `🚨 CRITICAL LOW BATTERY: ${drone.name}`,
          `Battery level dropped to ${drone.battery}%. Initiating automatic dock return!`
        );
      }

      // Charge Complete Alert
      if (drone.battery === 100 && drone.status === "Charging") {
        sendPushNotification(
          `🔋 CHARGING COMPLETED: ${drone.name}`,
          `Drone is 100% charged and ready for mission operations!`
        );
      }
    });
  }, [drones, settings.autoDockBatteryLimit]);

  // Handlers
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.email) {
      const extractedName = loginForm.email.split('@')[0];
      const formattedName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1) + ' Operator';
      
      setUser(prev => ({
        ...prev,
        name: formattedName,
        email: loginForm.email
      }));

      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => setIsAuthenticated(false);

  const handleAddDrone = (e) => {
    e.preventDefault();
    if (!newDrone.id || !newDrone.name) return;
    setDrones([...drones, { ...newDrone, battery: Number(newDrone.battery), speed: Number(newDrone.speed) }]);
    setSelectedDroneId(newDrone.id);
    setShowAddDroneModal(false);
  };

  const handleDeleteDrone = (id) => {
    const updated = drones.filter(d => d.id !== id);
    setDrones(updated);
    if (selectedDroneId === id && updated.length > 0) setSelectedDroneId(updated[0].id);
  };

  const handleAddDock = (e) => {
    e.preventDefault();
    if (!newDock.id || !newDock.name) return;
    setDocks([...docks, newDock]);
    setShowAddDockModal(false);
  };

  const handleDeleteDock = (id) => setDocks(docks.filter(d => d.id !== id));

  const handleUpdateBattery = (delta) => {
    setDrones(drones.map(d => d.id === selectedDrone.id ? { ...d, battery: Math.min(100, Math.max(0, d.battery + delta)) } : d));
  };

  // 1. LOGIN SCREEN RENDER
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30 mb-2">
              <Cpu className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">DOCK AI</h1>
            <p className="text-xs text-slate-400">Autonomous Dock Management</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Operator Email</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-slate-500" />
                <input 
                  type="email" 
                  required 
                  value={loginForm.email} 
                  onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-blue-500" 
                  placeholder="operator@dronedock.ai"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-slate-500" />
                <input 
                  type="password" 
                  required 
                  value={loginForm.password} 
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-blue-500" 
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition">
              Authenticate Operations Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. MAIN DASHBOARD RENDER
  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
      
      {/* Sidebar */}
      <aside className={`w-64 border-r p-6 flex flex-col justify-between h-screen sticky top-0 ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold tracking-wider text-sm">DRONE</h1>
              <p className="text-[10px] text-blue-400 font-mono tracking-widest">AUTONOMOUS DOCKING</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard View', icon: LayoutDashboard },
              { id: 'fleet', label: 'Drone Fleet', icon: Radio },
              { id: 'docks', label: 'Dock Stations', icon: Anchor },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-400">Active Operator</p>
            <p className="text-sm font-bold text-blue-400">{user.name}</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition">
            <Power className="w-4 h-4" /> Disconnect Session
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Header */}
        <header className={`sticky top-0 z-30 border-b px-8 py-4 flex items-center justify-between backdrop-blur-md ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
          <div className="w-96 relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search Drones or Stations..." 
              className={`w-full border rounded-xl pl-10 pr-4 py-2 text-xs outline-none ${darkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`} 
            />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Content Tabs */}
        <main className="p-8 space-y-8">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && selectedDrone.id && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {drones.map(d => (
                    <button 
                      key={d.id} 
                      onClick={() => setSelectedDroneId(d.id)}
                      className={`px-4 py-3 rounded-2xl border text-left transition shrink-0 ${
                        selectedDrone.id === d.id 
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30' 
                          : darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <p className="text-xs font-bold">{d.id}</p>
                      <p className="text-[10px] opacity-80">{d.name}</p>
                    </button>
                  ))}
                </div>

                <button onClick={() => setShowAddDroneModal(true)} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Drone Target
                </button>
              </div>

              {/* Drone Overview Details & Telemetry Adjuster */}
              <div className={`p-6 rounded-3xl border space-y-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between border-b pb-4 border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold">{selectedDrone.name} ({selectedDrone.id})</h2>
                    <p className="text-xs text-slate-400">Category: {selectedDrone.category} | Dock Match: {selectedDrone.dockId}</p>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                    <span className="text-xs text-slate-400">Test Notification Trigger (-5% / +5%):</span>
                    <button onClick={() => handleUpdateBattery(-5)} className="px-2 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded text-xs font-bold hover:bg-red-600 hover:text-white">-5%</button>
                    <button onClick={() => handleUpdateBattery(5)} className="px-2 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold hover:bg-emerald-600 hover:text-white">+5%</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-xs text-slate-400">Battery Level</span>
                    <p className={`text-2xl font-bold ${selectedDrone.battery <= settings.autoDockBatteryLimit ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>{selectedDrone.battery}%</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-xs text-slate-400">Speed</span>
                    <p className="text-2xl font-bold">{selectedDrone.speed} km/h</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-xs text-slate-400">Latitude</span>
                    <p className="text-lg font-mono font-bold">{selectedDrone.lat}</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-xs text-slate-400">Longitude</span>
                    <p className="text-lg font-mono font-bold">{selectedDrone.lng}</p>
                  </div>
                </div>
              </div>

              {/* REAL LIVE GPS MAP */}
              <div className={`p-6 rounded-3xl border space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2"><Navigation className="w-5 h-5 text-blue-500" /> GPS Map Location Tracking</h3>
                  <span className="text-xs font-mono text-emerald-400">Live Satellite Lock Active</span>
                </div>

                <div className="h-96 rounded-2xl overflow-hidden border border-slate-800">
                  <MapContainer center={[selectedDrone.lat, selectedDrone.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <RecenterMap lat={selectedDrone.lat} lng={selectedDrone.lng} />
                    
                    <Marker position={[selectedDrone.lat, selectedDrone.lng]} icon={customIcon}>
                      <Popup>
                        <strong>{selectedDrone.name} ({selectedDrone.id})</strong><br />
                        Battery: {selectedDrone.battery}%<br />
                        Status: {selectedDrone.status}
                      </Popup>
                    </Marker>

                    {docks.map(dock => (
                      <Marker key={dock.id} position={[dock.lat, dock.lng]} icon={customIcon}>
                        <Popup>
                          <strong>Dock Station: {dock.name}</strong><br />
                          Capacity: {dock.capacity}
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            </div>
          )}

          {/* FLEET TAB */}
          {activeTab === 'fleet' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Drone Fleet Directory</h2>
                <button onClick={() => setShowAddDroneModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add New Drone
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drones.map(d => (
                  <div key={d.id} className={`p-6 rounded-3xl border space-y-4 relative ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <button onClick={() => handleDeleteDrone(d.id)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div>
                      <h3 className="font-bold text-lg">{d.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">{d.id}</p>
                    </div>
                    <div className="text-xs space-y-1 text-slate-400">
                      <p>Category: {d.category}</p>
                      <p>Assigned Dock: {d.dockId}</p>
                      <p>GPS: {d.lat}, {d.lng}</p>
                    </div>
                    <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                      <span className="text-xs font-bold text-emerald-400">{d.battery}% Battery</span>
                      <span className="px-2.5 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full text-[10px] font-bold">{d.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DOCKS TAB */}
          {activeTab === 'docks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Dock Stations Directory</h2>
                <button onClick={() => setShowAddDockModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Dock Station
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {docks.map(dock => (
                  <div key={dock.id} className={`p-6 rounded-3xl border space-y-4 relative ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <button onClick={() => handleDeleteDock(dock.id)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div>
                      <h3 className="font-bold text-lg">{dock.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">{dock.id}</p>
                    </div>
                    <div className="text-xs space-y-1 text-slate-400">
                      <p>Power Source: {dock.powerSupply}</p>
                      <p>Station Capacity: {dock.capacity}</p>
                      <p>GPS: {dock.lat}, {dock.lng}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-xl font-bold">System Operations & Settings</h2>

              <div className={`p-6 rounded-3xl border space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="font-bold flex items-center gap-2 text-sm text-blue-400"><User className="w-4 h-4" /> Operator Profile Details</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400">Operator Name</label>
                    <input type="text" value={user.name} onChange={e => setUser({...user, name: e.target.value})} className="w-full mt-1 p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white" />
                  </div>
                  <div>
                    <label className="text-slate-400">Role</label>
                    <input type="text" value={user.role} readOnly className="w-full mt-1 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-400 cursor-not-allowed" />
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-3xl border space-y-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="font-bold flex items-center gap-2 text-sm text-blue-400"><Sliders className="w-4 h-4" /> Autonomous Docking Parameters</h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-slate-400">Auto-Dock Trigger Battery Threshold: <strong className="text-blue-400">{settings.autoDockBatteryLimit}%</strong></label>
                    <input type="range" min="10" max="40" value={settings.autoDockBatteryLimit} onChange={e => setSettings({...settings, autoDockBatteryLimit: Number(e.target.value)})} className="w-full mt-2" />
                  </div>
                  <div>
                    <label className="text-slate-400">Python Backend API Endpoint URL</label>
                    <input type="text" value={settings.pythonApiUrl} onChange={e => setSettings({...settings, pythonApiUrl: e.target.value})} className="w-full mt-1 p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono" />
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Add Drone Modal */}
      {showAddDroneModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white'} space-y-4`}>
            <h3 className="font-bold text-lg">Add New Drone</h3>
            <form onSubmit={handleAddDrone} className="space-y-3">
              <input type="text" placeholder="Drone ID (e.g., DRONE-HYD-99)" required value={newDrone.id} onChange={e => setNewDrone({...newDrone, id: e.target.value})} className="w-full p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-xs text-white" />
              <input type="text" placeholder="Drone Name" required value={newDrone.name} onChange={e => setNewDrone({...newDrone, name: e.target.value})} className="w-full p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-xs text-white" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" step="0.0001" placeholder="Latitude" required value={newDrone.lat} onChange={e => setNewDrone({...newDrone, lat: parseFloat(e.target.value)})} className="p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-xs text-white" />
                <input type="number" step="0.0001" placeholder="Longitude" required value={newDrone.lng} onChange={e => setNewDrone({...newDrone, lng: parseFloat(e.target.value)})} className="p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-xs text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddDroneModal(false)} className="px-4 py-2 rounded-xl text-xs bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs bg-blue-600 text-white font-bold">Register Drone</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Dock Modal */}
      {showAddDockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white'} space-y-4`}>
            <h3 className="font-bold text-lg">Add Dock Station</h3>
            <form onSubmit={handleAddDock} className="space-y-3">
              <input type="text" placeholder="Dock ID" required value={newDock.id} onChange={e => setNewDock({...newDock, id: e.target.value})} className="w-full p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-xs text-white" />
              <input type="text" placeholder="Station Name" required value={newDock.name} onChange={e => setNewDock({...newDock, name: e.target.value})} className="w-full p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-xs text-white" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" step="0.0001" placeholder="Latitude" required value={newDock.lat} onChange={e => setNewDock({...newDock, lat: parseFloat(e.target.value)})} className="p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-xs text-white" />
                <input type="number" step="0.0001" placeholder="Longitude" required value={newDock.lng} onChange={e => setNewDock({...newDock, lng: parseFloat(e.target.value)})} className="p-2.5 rounded-xl border bg-slate-800 border-slate-700 text-xs text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddDockModal(false)} className="px-4 py-2 rounded-xl text-xs bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs bg-blue-600 text-white font-bold">Create Dock</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}