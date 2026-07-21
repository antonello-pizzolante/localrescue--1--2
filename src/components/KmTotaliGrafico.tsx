import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Map as MapIcon } from 'lucide-react';
import { MONTHS_IT } from '../data';

interface SheetDocument {
  id: string;
  postazione: string;
  targa: string;
  mezzo: string;
  mese: string;
  anno: number;
  interventi: Array<{
    kmPartenza: string;
    kmRientro: string;
  }>;
  lastUpdated: string;
}

export function KmTotaliGrafico() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKmData = async () => {
      try {
        const q = query(collection(db, 'fogli_di_marcia'));
        const querySnapshot = await getDocs(q);
        
        // Group by month and vehicle
        const kmMap = new Map<string, Map<string, number>>();
        
        querySnapshot.forEach((docSnap) => {
          const sheet = docSnap.data() as SheetDocument;
          const monthKey = `${sheet.mese} ${sheet.anno}`;
          
          let totalKm = 0;
          sheet.interventi.forEach(int => {
            const start = Number(int.kmPartenza);
            const end = Number(int.kmRientro);
            if (!isNaN(start) && !isNaN(end) && end >= start) {
              totalKm += (end - start);
            }
          });
          
          if (!kmMap.has(monthKey)) {
            kmMap.set(monthKey, new Map());
          }
          
          const vehicleMap = kmMap.get(monthKey)!;
          const currentTotal = vehicleMap.get(sheet.targa) || 0;
          vehicleMap.set(sheet.targa, currentTotal + totalKm);
        });

        // Convert to Recharts format
        const chartData = Array.from(kmMap.entries()).map(([month, vehicles]) => {
          const entry: any = { name: month };
          vehicles.forEach((km, targa) => {
            entry[targa] = km;
          });
          return entry;
        });

        setData(chartData);
      } catch (error) {
        console.error("Error fetching km data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKmData();
  }, []);

  // Get unique vehicles (keys for bars)
  const uniqueVehicles = new Set<string>();
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'name') uniqueVehicles.add(key);
    });
  });

  const vehicles = Array.from(uniqueVehicles);
  const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-lg mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
          <MapIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">Riepilogo Chilometri</h2>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Chilometri totali percorsi mensilmente per mezzo</p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-sm font-bold text-slate-500 animate-pulse">Caricamento dati...</div>
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2">
          <MapIcon className="w-8 h-8 text-slate-600" />
          <div className="text-sm font-bold text-slate-500">Nessun foglio di marcia trovato</div>
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickMargin={10} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickFormatter={(val) => `${val}km`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {vehicles.map((v, i) => (
                <Bar key={v} dataKey={v} name={`Mezzo ${v}`} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
