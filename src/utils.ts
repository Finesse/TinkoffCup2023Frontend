import { nanoid } from 'nanoid'

export function makeId(length = 8) {
  return nanoid(8)
}

export function randomUniversalColor() {
  return `hsl(${Math.floor(Math.random() * 360)}deg 30% 60%)`
}

export function stringifyDateParam(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function parseDateParam(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) {
    return null;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 0, 0, 0, 0)
}
