import { nanoid } from 'nanoid'

export function makeId(length = 8) {
  return nanoid(8)
}

export function randomUniversalColor() {
  return `hsl(${Math.floor(Math.random() * 360)}deg 30% 60%)`
}
