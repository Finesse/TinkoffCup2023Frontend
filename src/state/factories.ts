import { Category, Transaction } from '../types/entities'
import { makeId, randomUniversalColor } from '../utils'

export function createDefaultCategories(workCategoryId = makeId()): Category[] {
  return [
    { id: makeId(), name: 'Продукты', icon: '🥕', color: randomUniversalColor() },
    { id: makeId(), name: 'Развлечения', icon: '🍿', color: randomUniversalColor() },
    { id: makeId(), name: 'Транспорт', icon: '🚕', color: randomUniversalColor() },
    { id: workCategoryId, name: 'Работа', icon: '💼', color: randomUniversalColor() },
  ]
}

export function createRandomTransactions(
  count: number,
  categories: Category[],
  minDate: Date,
  maxDate: Date,
  minValue: number,
  maxValue: number,
): Transaction[] {
  const categoryIds = [null, ...categories.map(category => category.id)]
  return [...Array(count)].map(() => ({
    id: makeId(),
    value: (Math.random() < 0.5 ? -1 : 1) * Math.round(minValue + Math.random() * (maxValue - minValue)),
    time: new Date(minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime())).toISOString(),
    categoryId: categoryIds[Math.floor(Math.random() * categoryIds.length)],
    description: Math.random() < 0.5 ? '' : 'Пример описания',
  }))
}
