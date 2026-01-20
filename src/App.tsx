import React, { useState, useMemo } from 'react';
import { SEED_PRODUCTS, FAMILY_OPTIONS } from './constants';
import {
    ClipboardDocumentCheckIcon,
    PlusIcon,
    TrashIcon,
    ArrowRightCircleIcon,
    ShoppingBagIcon,
    IdentificationIcon,
    XMarkIcon,
    ClipboardIcon
} from '@heroicons/react/24/outline';

interface OrderLine {
    id: string;
    family: string;
    size: string;
    packing: string;
    qty: number;
}

const ShareModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    message: string;
    onCopy: () => void;
    copied: boolean;
}> = ({ isOpen, onClose, message, onCopy, copied }) => {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900">Ready to Share</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-500 font-medium">Review the order summary below before copying.</p>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-[40vh] overflow-y-auto">
                        {message}
                    </div>
                </div>
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex space-x-3">
                    <button onClick={onClose} className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">
                        Close
                    </button>
                    <button onClick={onCopy} className={`flex-[2] py-3 px-4 font-bold rounded-xl flex items-center justify-center space-x-2 transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                        {copied ? <ClipboardDocumentCheckIcon className="w-5 h-5" /> : <ClipboardIcon className="w-5 h-5" />}
                        <span>{copied ? 'COPIED!' : 'Copy to Clipboard'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [customerName, setCustomerName] = useState('');
    const [salesPerson, setSalesPerson] = useState('');
    const [poNumber, setPoNumber] = useState('');
    const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date
    const [lines, setLines] = useState<OrderLine[]>([]);
    const [copied, setCopied] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedFamily, setSelectedFamily] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedPacking, setSelectedPacking] = useState('');
    const [qty, setQty] = useState('');

    const packingDefaults: Record<string, string> = {
        '6013': '16kg CTN',
        '7018': 'Normal',
        '7018-1': 'Normal',
        '8018-C3': 'Normal',
        'Ni': 'Plastic Container',
        'NiFe': 'Plastic Container'
    };

    const isPackingDisabled = useMemo(() => {
        const onlyVacuum = ['7024', '8018-B2', '10018-M', '10018-G', '10018-D2', '8018-G'];
        return selectedFamily.startsWith('6013') || selectedFamily === 'Ni' || selectedFamily === 'NiFe' || onlyVacuum.includes(selectedFamily);
    }, [selectedFamily]);

    const availablePackingOptions = useMemo(() => {
        const dualOptions = ['7018', '7018-1', '8018-C3'];
        const onlyVacuum = ['7024', '8018-B2', '10018-M', '10018-G', '10018-D2', '8018-G'];
        if (dualOptions.some(f => selectedFamily.startsWith(f))) return ['Normal', 'Vacuum'];
        if (selectedFamily.startsWith('6013')) return ['16kg CTN'];
        if (selectedFamily === 'Ni' || selectedFamily === 'NiFe') return ['Plastic Container'];
        if (onlyVacuum.includes(selectedFamily)) return ['Vacuum'];
        return ['16kg CTN', 'Normal', 'Vacuum', 'Plastic Container'];
    }, [selectedFamily]);

    const currentPacking = useMemo(() => {
        if (isPackingDisabled) {
            if (['7024', '8018-B2', '10018-M', '10018-G', '10018-D2', '8018-G'].includes(selectedFamily)) return 'Vacuum';
            return packingDefaults[selectedFamily] || 'Normal';
        }
        return selectedPacking;
    }, [selectedFamily, selectedPacking, isPackingDisabled]);

    const availableSizes = useMemo(() => {
        if (!selectedFamily) return [];
        return SEED_PRODUCTS
            .filter(p => p.name.includes(selectedFamily))
            .map(p => `${parseFloat(p.diameter.toFixed(1))}mm x ${p.length}mm`)
            .filter((v, i, a) => a.indexOf(v) === i);
    }, [selectedFamily]);

    const addLine = () => {
        if (!selectedFamily || !selectedSize || !qty || (!isPackingDisabled && !selectedPacking)) return;
        setLines([...lines, {
            id: Math.random().toString(36).substr(2, 9),
            family: selectedFamily,
            size: selectedSize,
            packing: currentPacking,
            qty: parseFloat(qty)
        }]);
        setQty('');
        setSelectedPacking('');
    };

    const generateMessage = () => {
        const repLine = `Sales rep: ${salesPerson || 'N/A'}`;
        const coLine = `Co Name: ${(customerName || 'N/A').toUpperCase()}`;

        // Format date to DD-MM-YYYY for the message
        const formattedDate = poDate ? poDate.split('-').reverse().join('-') : 'If any';
        const poDateLine = `PO Date: ${formattedDate}`;

        const poNumLine = `PO Number: ${poNumber || 'If any'}`;
        const prodHeader = `Product:`;
        const itemLines = lines.map((l) => {
            let displayName = l.family;
            const onlyVacuum = ['7024', '8018-B2', '10018-M', '10018-G', '10018-D2', '8018-G'];
            if (l.packing === 'Vacuum' && (l.family.startsWith('7018') || onlyVacuum.includes(l.family))) displayName = `VACCUM ${l.family}`;
            else if (['6013', '7018', '7018-1', '8018-C3', 'Ni', 'NiFe'].includes(l.family)) displayName = `SPARKWELD ${l.family}`;
            return `${displayName} (${l.size}) - ${l.qty} kg`;
        }).join('\n');
        return `${repLine}\n${coLine}\n${poDateLine}\n${poNumLine}\n${prodHeader}\n${itemLines}\nTotal weight: ${lines.reduce((a, l) => a + l.qty, 0).toLocaleString()} kg`;
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                        <ShoppingBagIcon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Order Dispatch Helper</h1>
                    <p className="text-slate-500 text-sm">Create and share order details instantly</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center space-x-2 text-indigo-600 mb-2">
                        <IdentificationIcon className="w-5 h-5" />
                        <span className="font-bold text-sm uppercase tracking-wider">Order Information</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={salesPerson} onChange={(e) => setSalesPerson(e.target.value)} placeholder="Sales Representative Name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold" />
                        <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer / Co Name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold" />
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1">PO Date</label>
                            <input type="date" value={poDate} onChange={(e) => setPoDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1">PO Number</label>
                            <input value={poNumber} onChange={(e) => setPoNumber(e.target.value)} placeholder="PO Number (Optional)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center space-x-2 text-indigo-600 mb-2"><PlusIcon className="w-5 h-5" /><span className="font-bold text-sm uppercase tracking-wider">Select Product</span></div>
                    <div className="grid grid-cols-1 gap-4">
                        <select value={selectedFamily} onChange={(e) => { setSelectedFamily(e.target.value); setSelectedSize(''); setSelectedPacking(''); }} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none">
                            <option value="">Select Family...</option>{FAMILY_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <select value={currentPacking} disabled={isPackingDisabled || !selectedFamily} onChange={(e) => setSelectedPacking(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold disabled:opacity-60 outline-none">
                            {!isPackingDisabled && <option value="">Select packing style</option>}
                            {availablePackingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <select value={selectedSize} disabled={!selectedFamily} onChange={(e) => setSelectedSize(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold disabled:opacity-50 outline-none">
                            <option value="">Select Size...</option>{availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Quantity in KG" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none" />
                    </div>
                    <button onClick={addLine} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg"><PlusIcon className="w-5 h-5" /><span>Add to List</span></button>
                </div>
                {lines.length > 0 && (
                    <div className="space-y-4 pb-12">
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                            <div className="p-4 bg-slate-900 text-white flex justify-between items-center text-sm font-bold uppercase"><span>Current Selection</span><span className="text-indigo-400">{lines.reduce((a, l) => a + l.qty, 0).toLocaleString()} KG</span></div>
                            <div className="divide-y divide-slate-100">
                                {lines.map((l) => (
                                    <div key={l.id} className="p-4 flex justify-between items-center">
                                        <div><p className="font-bold text-slate-800">{l.family} <span className="text-indigo-600">({l.size})</span></p><p className="text-xs text-slate-500 font-medium">{l.qty}kg • {l.packing}</p></div>
                                        <button onClick={() => setLines(lines.filter(line => line.id !== l.id))} className="p-2 text-red-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-slate-50">
                                <button onClick={() => { if (!customerName) alert("Enter Co Name first."); else setIsModalOpen(true); }} className="w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center space-x-3 bg-indigo-600 text-white shadow-xl shadow-indigo-200"><ArrowRightCircleIcon className="w-6 h-6" /><span>PLACE ORDER</span></button>
                            </div>
                        </div>
                        <ShareModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} message={generateMessage()} onCopy={() => { navigator.clipboard.writeText(generateMessage()); setCopied(true); setTimeout(() => setCopied(false), 2000); }} copied={copied} />
                    </div>
                )}
            </div>
        </div>
    );
};
export default App;
