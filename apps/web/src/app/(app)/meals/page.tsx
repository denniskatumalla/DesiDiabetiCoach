'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button, Card, Field, Select } from '@desidiabeticoach/ui';
import { calculateGl, type MealItemInput, type MealType } from '@desidiabeticoach/shared';
import { trpc } from '@/lib/trpc/client';

export default function MealsPage() {
  const utils = trpc.useUtils();
  const { data: meals, isLoading } = trpc.meals.list.useQuery({ limit: 20 });
  const [query, setQuery] = useState('');
  const { data: searchResults } = trpc.meals.searchFoods.useQuery({ query }, { enabled: query.length > 1 });

  const [selectedItems, setSelectedItems] = useState<(MealItemInput & { name: string })[]>([]);
  const [mealType, setMealType] = useState<MealType>('lunch');

  const createMutation = trpc.meals.create.useMutation({
    onSuccess: () => {
      utils.meals.list.invalidate();
      setSelectedItems([]);
      setQuery('');
    },
  });

  function addFood(food: { id: string; name_en: string; carbs_g: number; calories: number | null }) {
    setSelectedItems((items) => [
      ...items,
      {
        foodId: food.id,
        name: food.name_en,
        quantity: 1,
        servingUnit: 'katori',
        carbsG: food.carbs_g,
        calories: food.calories ?? 0,
      },
    ]);
    setQuery('');
  }

  function handleLogMeal() {
    if (selectedItems.length === 0) return;
    createMutation.mutate({
      mealType,
      items: selectedItems.map(({ name, ...item }) => item),
    });
  }

  return (
    <div>
      <p className="eyebrow text-accent">What you ate</p>
      <h1 className="mt-2 font-display text-display-md font-bold text-fg">Log Meal</h1>
      <p className="mt-2 max-w-xl text-sm text-fg/60">
        Meal photo scanning is available on the DesiDiabetiCoach mobile app. Search and log
        manually here, or review AI-scanned meals captured on your phone below.
      </p>

      <Card className="mt-6 max-w-lg">
        <h2 className="eyebrow mb-3 text-fg/45">
          Search Foods
        </h2>
        <Select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType)}
          className="mb-3"
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
          <option value="drink">Drink</option>
        </Select>
        <Field
          placeholder="Search e.g. dosa, sambar, biryani…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {searchResults && searchResults.length > 0 && (
          <ul className="mt-2 divide-y divide-ink-rule rounded-control border border-ink-rule">
            {searchResults.map((food) => (
              <li key={food.id}>
                <button
                  onClick={() => addFood(food)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-fg/10"
                >
                  <span>
                    {food.name_en}
                    {food.name_regional ? ` (${food.name_regional})` : ''}
                  </span>
                  <span className="text-xs text-fg/50">
                    {food.serving_desc} · GL {calculateGl(food.gi_score ?? 0, food.carbs_g)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {selectedItems.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium text-fg">This meal</h3>
            {selectedItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span>{item.name}</span>
                <Field
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={item.quantity}
                  onChange={(e) =>
                    setSelectedItems((items) =>
                      items.map((it, idx) => (idx === i ? { ...it, quantity: Number(e.target.value) } : it))
                    )
                  }
                  className="w-20"
                />
              </div>
            ))}
            <Button onClick={handleLogMeal} disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? 'Logging…' : 'Log Meal'}
            </Button>
          </div>
        )}
      </Card>

      <div className="mt-8 space-y-3">
        <h2 className="eyebrow mb-3 text-fg/45">
          Recent Meals
        </h2>
        {isLoading ? (
          <p className="text-sm text-fg/60">Loading…</p>
        ) : (
          (meals ?? []).map((meal) => (
            <div key={meal.id} className="flex gap-4 rounded-card border border-ink-rule bg-ink-raised p-3.5">
              {meal.photo_signed_url && (
                <Image
                  src={meal.photo_signed_url}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-control object-cover"
                />
              )}
              <div>
                <p className="font-medium capitalize text-fg">{meal.meal_type}</p>
                <p className="text-xs text-fg/50">
                  {new Date(meal.logged_at).toLocaleString()} · {meal.total_carbs_g}g carbs ·{' '}
                  {meal.total_calories} cal
                  {meal.ai_analysis !== null ? ' · scanned via mobile' : ''}
                </p>
              </div>
            </div>
          ))
        )}
        {meals?.length === 0 && <p className="text-sm text-fg/60">No meals logged yet.</p>}
      </div>
    </div>
  );
}
