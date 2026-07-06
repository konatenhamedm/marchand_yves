'use client';
import { useMagasin } from '@/context/MagasinContext';
import { useCurrency } from '@/hooks/useCurrency';

export default function DebugCurrencyPage() {
    const { magasin, magasins, devise } = useMagasin();
    const { formatAmount } = useCurrency();

    return (
        <div className="p-10 space-y-6">
            <h1 className="text-2xl font-bold">Debug Currency & Magasin</h1>
            
            <div className="bg-slate-50 p-4 rounded-xl border">
                <h2 className="font-bold mb-2">Magasin Actif</h2>
                <pre className="text-xs bg-slate-900 text-green-400 p-4 rounded overflow-auto">
                    {JSON.stringify(magasin, null, 2)}
                </pre>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border">
                <h2 className="font-bold mb-2">Devise (depuis Context)</h2>
                <pre className="text-xs bg-slate-900 text-blue-400 p-4 rounded overflow-auto">
                    {JSON.stringify(devise, null, 2)}
                </pre>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border">
                <h2 className="font-bold mb-2">Test Format Amount (5000)</h2>
                <div className="text-4xl font-black text-[#0052cc]">
                    {formatAmount(5000)}
                </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border">
                <h2 className="font-bold mb-2">Liste des Magasins (Brut)</h2>
                <pre className="text-xs bg-slate-900 text-orange-400 p-4 rounded overflow-auto max-h-60">
                    {JSON.stringify(magasins, null, 2)}
                </pre>
            </div>
        </div>
    );
}
