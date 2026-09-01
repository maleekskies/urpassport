interface ItineraryDay {
  date: string;
  items: { time: string; title: string; description: string; cost_ngn: number }[];
}
interface PlanJson {
  days: ItineraryDay[];
  estimated_total_ngn: number;
  packing_reminders: string[];
}

export function ItineraryView({
  destination,
  startDate,
  endDate,
  plan,
}: {
  destination: string;
  startDate: string | null;
  endDate: string | null;
  plan: PlanJson;
}) {
  return (
    <div className="bg-panel border border-line rounded-lg p-6">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
        <h2 className="font-display text-lg">{destination}</h2>
        <span className="text-xs font-mono text-ink-faint">
          {startDate} → {endDate}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div>
          <div className="font-display text-lg font-semibold">{plan.days?.length ?? 0}</div>
          <div className="text-xs text-ink-faint">Days planned</div>
        </div>
        <div>
          <div className="font-display text-lg font-semibold">
            ₦{(plan.estimated_total_ngn ?? 0).toLocaleString()}
          </div>
          <div className="text-xs text-ink-faint">Estimated total</div>
        </div>
        <div>
          <div className="font-display text-lg font-semibold">{plan.packing_reminders?.length ?? 0}</div>
          <div className="text-xs text-ink-faint">Reminders</div>
        </div>
      </div>

      {(plan.days || []).map((day, i) => (
        <div key={i} className="mb-5">
          <div className="font-mono text-xs text-ink-faint uppercase tracking-wide mb-2">
            {day.date}
          </div>
          {day.items.map((item, j) => (
            <div key={j} className="flex gap-4 py-3 border-b border-line last:border-0">
              <div className="font-mono text-xs text-ink-faint w-16 flex-shrink-0 pt-0.5">
                {item.time}
              </div>
              <div>
                <div className="font-semibold text-sm">{item.title}</div>
                <div className="text-ink-soft text-sm mt-0.5">{item.description}</div>
                {item.cost_ngn > 0 && (
                  <div className="text-gold font-mono text-xs mt-1">
                    ~₦{item.cost_ngn.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}

      {plan.packing_reminders?.length > 0 && (
        <div className="pt-4 border-t border-line">
          <h3 className="font-semibold text-sm mb-2.5">Packing &amp; document reminders</h3>
          {plan.packing_reminders.map((r, i) => (
            <div key={i} className="flex items-center gap-2.5 py-1.5 text-sm text-ink-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
