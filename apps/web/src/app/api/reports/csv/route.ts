import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { toCsv } from '@/lib/csv';

/** Spec §5.8 — Personal Report export. MVP ships CSV; full branded PDF is roadmapped. */
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new Response('Unauthorized', { status: 401 });

  const type = req.nextUrl.searchParams.get('type') ?? 'bg';

  if (type === 'bg') {
    const { data, error } = await supabase
      .from('bg_logs')
      .select('value, context, logged_at, notes')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false });
    if (error) return new Response(error.message, { status: 500 });

    const csv = toCsv(
      ['value_mg_dl', 'context', 'logged_at', 'notes'],
      (data ?? []).map((r) => [r.value, r.context, r.logged_at, r.notes ?? ''])
    );
    return csvResponse(csv, 'bg-logs.csv');
  }

  if (type === 'meals') {
    const { data, error } = await supabase
      .from('meal_logs')
      .select('meal_type, logged_at, total_carbs_g, total_calories, notes')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false });
    if (error) return new Response(error.message, { status: 500 });

    const csv = toCsv(
      ['meal_type', 'logged_at', 'total_carbs_g', 'total_calories', 'notes'],
      (data ?? []).map((r) => [r.meal_type, r.logged_at, r.total_carbs_g, r.total_calories, r.notes ?? ''])
    );
    return csvResponse(csv, 'meal-logs.csv');
  }

  if (type === 'medications') {
    const { data, error } = await supabase
      .from('medication_logs')
      .select('medication_name, dose_mg, taken, taken_at, scheduled_at')
      .eq('user_id', user.id)
      .order('taken_at', { ascending: false });
    if (error) return new Response(error.message, { status: 500 });

    const csv = toCsv(
      ['medication_name', 'dose_mg', 'taken', 'taken_at', 'scheduled_at'],
      (data ?? []).map((r) => [r.medication_name, r.dose_mg ?? '', r.taken, r.taken_at, r.scheduled_at ?? ''])
    );
    return csvResponse(csv, 'medication-logs.csv');
  }

  return new Response('Unknown report type', { status: 400 });
}

function csvResponse(csv: string, filename: string) {
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
