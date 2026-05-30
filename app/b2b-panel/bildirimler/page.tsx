import { Bell } from 'lucide-react';

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
        <Bell size={28} className="text-amber-500" />
      </div>
      <h1 className="text-xl font-bold text-slate-900">Bildirişlər</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        Bu bölmə hazırlanır. Tezliklə istifadəyə veriləcək.
      </p>
    </div>
  );
}
