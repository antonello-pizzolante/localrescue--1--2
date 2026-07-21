import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, AlertTriangle, Car, Check, Search } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { RevisioneMezzo } from '../types';

export function ScadenzeMezzi() {
  const [scadenze, setScadenze] = useState<RevisioneMezzo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RevisioneMezzo | null>(null);
  
  const [formData, setFormData] = useState({
    vehicleCode: '',
    type: 'revisione' as const,
    expiryDate: '',
    lastPerformedDate: '',
    km: '',
    notes: ''
  });

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'REVISIONE_MEZZI'), orderBy('expiryDate', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RevisioneMezzo[];
      setScadenze(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching scadenze:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    try {
      const dataToSave = {
        vehicleCode: formData.vehicleCode.toUpperCase(),
        type: formData.type,
        expiryDate: formData.expiryDate,
        lastPerformedDate: formData.lastPerformedDate || null,
        km: formData.km ? parseInt(formData.km) : null,
        notes: formData.notes,
        updatedAt: serverTimestamp()
      };

      if (editingItem) {
        await updateDoc(doc(db, 'REVISIONE_MEZZI', editingItem.id), dataToSave);
      } else {
        await addDoc(collection(db, 'REVISIONE_MEZZI'), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving scadenza:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'REVISIONE_MEZZI', id));
    } catch (error) {
      console.error("Error deleting scadenza:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleCode: '',
      type: 'revisione',
      expiryDate: '',
      lastPerformedDate: '',
      km: '',
      notes: ''
    });
    setEditingItem(null);
  };

  const openEditModal = (item: RevisioneMezzo) => {
    setEditingItem(item);
    setFormData({
      vehicleCode: item.vehicleCode,
      type: item.type,
      expiryDate: item.expiryDate,
      lastPerformedDate: item.lastPerformedDate || '',
      km: item.km?.toString() || '',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const getStatusColor = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(dateString);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-500 bg-red-500/10 border-red-500/20'; // Scaduto
    if (diffDays <= 30) return 'text-amber-500 bg-amber-500/10 border-amber-500/20'; // In scadenza (30 gg)
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'; // OK
  };

  const filteredScadenze = scadenze.filter(s => 
    s.vehicleCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cerca targa o tipo (es. revisione)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          />
        </div>
        
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-cyan-500/20 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Nuova Scadenza</span>
        </button>
      </div>

      {/* Table */}
      <div className="glass-card border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                <th className="p-4 font-bold">Targa / Mezzo</th>
                <th className="p-4 font-bold">Tipo</th>
                <th className="p-4 font-bold">Scadenza</th>
                <th className="p-4 font-bold">Ultimo Tagliando/Rev.</th>
                <th className="p-4 font-bold">Note</th>
                <th className="p-4 font-bold text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">Caricamento scadenze in corso...</td>
                </tr>
              ) : filteredScadenze.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Calendar className="w-8 h-8 text-slate-500 opacity-50" />
                      <p>Nessuna scadenza trovata.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredScadenze.map((item) => {
                  const statusClass = getStatusColor(item.expiryDate);
                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                            <Car className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="font-bold text-white uppercase tracking-wider">{item.vehicleCode}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-300 capitalize">{item.type}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${statusClass}`}>
                          {new Date(item.expiryDate).toLocaleDateString('it-IT')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-300">
                            {item.lastPerformedDate ? new Date(item.lastPerformedDate).toLocaleDateString('it-IT') : '-'}
                          </span>
                          {item.km && (
                            <span className="text-[10px] text-slate-500 font-mono">{item.km} km</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs text-slate-400 line-clamp-1 max-w-[200px]">{item.notes || '-'}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 bg-slate-900/50">
              <h2 className="text-xl font-bold text-white">
                {editingItem ? 'Modifica Scadenza' : 'Nuova Scadenza'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Inserisci i dati della revisione o del tagliando per il mezzo.
              </p>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Targa Mezzo *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.vehicleCode}
                    onChange={e => setFormData({...formData, vehicleCode: e.target.value.toUpperCase()})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors uppercase font-mono"
                    placeholder="Es. AB123CD"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tipo *</label>
                  <select 
                    required
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="revisione">Revisione</option>
                    <option value="tagliando">Tagliando</option>
                    <option value="assicurazione">Assicurazione</option>
                    <option value="bollo">Bollo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Data di Scadenza *</label>
                <input 
                  required
                  type="date" 
                  value={formData.expiryDate}
                  onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                  className="w-full bg-slate-900 border border-cyan-500/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ultimo Effettuato</label>
                  <input 
                    type="date" 
                    value={formData.lastPerformedDate}
                    onChange={e => setFormData({...formData, lastPerformedDate: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Km (Opzionale)</label>
                  <input 
                    type="number" 
                    value={formData.km}
                    onChange={e => setFormData({...formData, km: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                    placeholder="Es. 150000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Note aggiuntive</label>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none h-20"
                  placeholder="Note, officina, interventi fatti..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Annulla
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Salva Dati</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
