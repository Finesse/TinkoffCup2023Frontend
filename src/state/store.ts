import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import { FLUSH, REHYDRATE,  PAUSE,  PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { Account, Category, State, Transaction } from '../types/entities'
import { makeId } from '../utils'
import { createDefaultCategories, createRandomTransactions } from './factories'
import { selectAccount, selectCategory, selectTransaction } from './selectors'

const appSlice = createSlice({
  name: 'app',
  initialState: (): State => {
    const accountId = makeId()
    const workCategoryId = makeId()
    const categories = createDefaultCategories(workCategoryId)
    return {
      accountId,
      accounts: [
        {
          id: accountId,
          name: 'Карманные деньги',
          icon: '😎',
          categories,
          transactions: [
            { id: makeId(), value: 10000, time: '2023-04-01T10:00:00.000Z', categoryId: workCategoryId, description: 'Зарплата' },
            ...createRandomTransactions(
              99,
              categories,
              new Date('2023-04-01T11:00:00.000Z'),
              new Date(),
              100,
              10000,
            ),
          ],
        },
      ],
    }
  },
  reducers: {
    accountSelect: (state, action: PayloadAction<string | null>) => {
      state.accountId = action.payload
    },
    accountCreate: (state, action: PayloadAction<Pick<Account, 'name' | 'icon'>>) => {
      state.accounts.push({
        id: makeId(),
        name: action.payload.name,
        icon: action.payload.icon,
        categories: createDefaultCategories(),
        transactions: [],
      })
    },
    accountEdit: (state, action: PayloadAction<{ id: string, fields: Partial<Account> }>) => {
      const account = selectAccount(state, action.payload.id)
      if (account) {
        Object.assign(account, action.payload.fields)
      }
    },
    accountDelete: (state, action: PayloadAction<string>) => {
      state.accounts = state.accounts.filter(account => account.id !== action.payload)
    },

    categoryCreate: (state, action: PayloadAction<{ accountId: string, fields: Omit<Category, 'id'> }>) => {
      const account = selectAccount(state, action.payload.accountId)
      if (account) {
        account.categories.push({
          id: makeId(),
          name: action.payload.fields.name,
          icon: action.payload.fields.icon,
          color: action.payload.fields.color,
        })
      }
    },
    categoryEdit: (state, action: PayloadAction<{ accountId: string, id: string, fields: Partial<Category> }>) => {
      const category = selectCategory(state, action.payload.accountId, action.payload.id)
      if (category) {
        Object.assign(category, action.payload.fields)
      }
    },
    categoryDelete: (state, action: PayloadAction<{ accountId: string, ids: string[], replaceWithId: string | null }>) => {
      const account = selectAccount(state, action.payload.accountId)
      if (account) {
        const idSet = new Set(action.payload.ids)
        account.categories = account.categories.filter(category => !idSet.has(category.id))

        for (const transaction of account.transactions) {
          if (transaction.categoryId !== null && idSet.has(transaction.categoryId)) {
            transaction.categoryId = action.payload.replaceWithId
          }
        }
      }
    },

    transactionCreate: (state, action: PayloadAction<{ accountId: string, fields: Omit<Transaction, 'id'> }>) => {
      const account = selectAccount(state, action.payload.accountId)
      if (account) {
        account.transactions.push({
          id: makeId(),
          value: action.payload.fields.value,
          time: action.payload.fields.time,
          categoryId: action.payload.fields.categoryId,
          description: action.payload.fields.description,
        })
      }
    },
    transactionEdit: (state, action: PayloadAction<{ accountId: string, id: string, fields: Partial<Transaction> }>) => {
      const transaction = selectTransaction(state, action.payload.accountId, action.payload.id)
      if (transaction) {
        Object.assign(transaction, action.payload.fields)
      }
    },
    transactionDelete: (state, action: PayloadAction<{ accountId: string, ids: string[] }>) => {
      const account = selectAccount(state, action.payload.accountId)
      if (account) {
        const idSet = new Set(action.payload.ids)
        account.transactions = account.transactions.filter(transaction => !idSet.has(transaction.id))
      }
    }
  }
})

const persistedReducer = persistReducer({
  key: 'appState',
  storage,
}, appSlice.reducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    // Костыль: https://github.com/rt2zz/redux-persist/issues/988#issuecomment-552242978
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export const actions = appSlice.actions
