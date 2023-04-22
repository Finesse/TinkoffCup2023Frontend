import { State } from '../types/entities'

export function selectAccount(state: State, id: string) {
  return state.accounts.find(account => account.id === id) ?? null
}

export function selectCategory(state: State, accountId: string, id: string) {
  const account = selectAccount(state, accountId)
  return account?.categories.find(category => category.id === id) ?? null
}

export function selectTransaction(state: State, accountId: string, id: string) {
  const account = selectAccount(state, accountId)
  return account?.transactions.find(transaction => transaction.id === id) ?? null
}
