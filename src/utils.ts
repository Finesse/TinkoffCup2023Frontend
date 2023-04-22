import { nanoid } from 'nanoid'
import { Transaction } from './types/entities'

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

export function groupTransactionsByDate(transactions: Transaction[]) {
  const groups: Transaction[][] = []
  let previousDate: string | undefined

  for (const transaction of transactions) {
    const date = new Date(transaction.time).toDateString()

    if (date === previousDate) {
      groups.at(-1)!.push(transaction)
    } else {
      groups.push([transaction])
    }

    previousDate = date
  }

  return groups
}

export function getTransactionsIncome(transactions: Transaction[]) {
  return transactions.reduce(
    (sum, transaction) => transaction.value > 0 ? sum + transaction.value : sum,
    0,
  )
}

export function getTransactionsOutcome(transactions: Transaction[]) {
  return transactions.reduce(
    (sum, transaction) => transaction.value < 0 ? sum - transaction.value : sum,
    0,
  )
}

export function getTransactionsTotalByCategory(transactions: Transaction[]) {
  const byCategory = new Map<string | null, { income: number, outcome: number }>()

  for (const transaction of transactions) {
    let values = byCategory.get(transaction.categoryId)

    if (!values) {
      values = { income: 0, outcome: 0 }
      byCategory.set(transaction.categoryId, values)
    }

    if (transaction.value > 0) {
      values.income += transaction.value
    } else {
      values.outcome -= transaction.value
    }
  }

  return byCategory
}
