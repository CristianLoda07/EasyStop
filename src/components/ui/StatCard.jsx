import { Card, CardContent } from '@/components/ui/card';

/**
 * Card statistica riutilizzabile.
 *
 * @param {React.ElementType} icon   - Icona lucide-react
 * @param {string}            label  - Etichetta descrittiva sotto il valore
 * @param {string|number}     value  - Valore principale (grande)
 * @param {string}            [sub]  - Testo secondario opzionale (es. "3 oggi")
 * @param {string}            color  - Classi Tailwind per colore icona e sfondo
 *                                     (es. "text-blue-600 bg-blue-50")
 */
export default function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold leading-tight">{value}</p>
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            {sub && <p className="text-xs text-primary font-medium">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
