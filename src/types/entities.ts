/**
 * Транзакция (доход/расход)
 */
export interface Transaction {
  /** Уникальный идентификатор */
  id: string
  /** + доход, - расход */
  value: number
  /** Дата-время (ISO-8601) */
  time: string
  /** Идентификатор категории */
  categoryId: string | null
  /** Краткое описание */
  description: string
}

/**
 * Категория доходов/расходов
 */
export interface Category {
  /** Уникальный идентификатор */
  id: string
  /** Название */
  name: string
  /** Иконка (эмодзи или пустая строка) */
  icon: string
  /** Цвет (CSS) */
  color: string
}

/**
 * Пользовательский аккаунт
 */
export interface Account {
  /** Уникальный идентификатор */
  id: string
  /** Название */
  name: string
  /** Иконка (эмодзи или пустая строка) */
  icon: string
  /** Категории */
  categories: Category[]
  /** Транзакции */
  transactions: Transaction[]
}

/**
 * Redux-состояние
 */
export interface State {
  /** Последний выбранные аккаунт. Null, если ни одного аккаунта нет. */
  accountId: string | null,
  accounts: Account[]
}
