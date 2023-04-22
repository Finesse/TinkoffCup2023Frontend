import { Category } from '../types/entities'
import { makeId, randomUniversalColor } from '../utils'

export function createDefaultCategories(workCategoryId = makeId()): Category[] {
  return [
    { id: makeId(), name: 'Продукты', icon: '🥕', color: randomUniversalColor() },
    { id: makeId(), name: 'Развлечения', icon: '🍿', color: randomUniversalColor() },
    { id: makeId(), name: 'Транспорт', icon: '🚕', color: randomUniversalColor() },
    { id: workCategoryId, name: 'Работа', icon: '💼', color: randomUniversalColor() },
  ]
}