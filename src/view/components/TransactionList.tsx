import { memo, useDeferredValue, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DatePicker, Select } from 'antd'
import dayjs from 'dayjs'
import { Category, Transaction } from '../../types/entities'
import { groupTransactionsByDate, parseDateParam, stringifyDateParam } from '../../utils'
import TransactionLine from './TransactionLine'
import TransactionsSummary from './TransactionsSummary'

const enum FilterParamName {
  DateFrom = 'dateFrom',
  DateTo = 'dateTo',
  Direction = 'direction',
  CategoryId = 'categoryId',
}

const enum Direction {
  Income = 'income',
  Outcome = 'outcome',
}

interface Props {
  accountId: string
  transactions: Transaction[],
  categories: Category[],
}

export default memo(function TransactionList({ accountId, transactions, categories }: Props) {
  const filters = useFiltersFromUrl()
  const deferredFilters = useDeferredValue(filters)
  const filteredTransactions = useMemo(() => filterTransactions(transactions, deferredFilters), [transactions, deferredFilters])

  return (
    <div>
      <Filter categories={categories} />
      <TransactionsSummary
        transactions={filteredTransactions}
        showCategories={deferredFilters.categoryId === null}
        showIncome={deferredFilters.direction !== Direction.Outcome}
        showOutcome={deferredFilters.direction !== Direction.Income}
        showBalance={deferredFilters.categoryId === null && deferredFilters.direction === null}
        categories={categories}
      />
      <Transactions transactions={filteredTransactions} categories={categories} accountId={accountId} />
    </div>
  )
})

interface FilterProps {
  categories: Category[],
}

const Filter = memo(function Filter({ categories }: FilterProps) {
  const filters = useFiltersFromUrl()
  const location = useLocation()
  const navigate = useNavigate()

  function setSearchParam(name: FilterParamName, value: string | null) {
    const params = new URLSearchParams(location.search)
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    navigate(`${location.pathname}?${params.toString()}`)
  }

  const handleCategorySelect = (categoryId: string | null) => {
    setSearchParam(FilterParamName.CategoryId, categoryId)
  }

  const handleFromDateChange = (date: dayjs.Dayjs | null) => {
    setSearchParam(FilterParamName.DateFrom, date ? stringifyDateParam(date.toDate()) : null)
  }

  const handleToDateChange = (date: dayjs.Dayjs | null) => {
    setSearchParam(FilterParamName.DateTo, date ? stringifyDateParam(date.toDate()) : null)
  }

  const handleDirectionSelect = (direction: Direction | null) => {
    setSearchParam(FilterParamName.Direction, direction)
  }

  return (
    <div>
      Дата:
      <DatePicker
        value={filters.timeFrom ? dayjs(filters.timeFrom) : null}
        onChange={handleFromDateChange}
        placeholder="Выберите дату"
      />
      –
      <DatePicker
        value={filters.timeTo ? dayjs(filters.timeTo).subtract(1, 'day') : null}
        onChange={handleToDateChange}
        placeholder="Выберите дату"
      />
      {' '}
      Направление:
      <Select
        value={filters.direction}
        onChange={handleDirectionSelect}
        options={[
          { value: null, label: 'Любое' },
          { value: Direction.Income, label: 'Доход' },
          { value: Direction.Outcome, label: 'Расход' },
        ]}
        style={{ width: 100 }}
      />
      {' '}
      Категория:
      <Select
        value={filters.categoryId}
        onChange={handleCategorySelect}
        options={[
          { value: null, label: 'Любая' },
          ...categories.map(category => ({ value: category.id, label: `${category.icon && `${category.icon} `}${category.name}` })),
        ]}
        style={{ width: 200 }}
      />
    </div>
  )
})

interface TransactionsProps {
  /** Отфильтрованные отсортированные транзакции */
  transactions: Transaction[],
  categories: Category[],
  accountId: string,
}

const Transactions = memo(function Transactions({ transactions, categories, accountId }: TransactionsProps) {
  const transactionGroups = useMemo(() => groupTransactionsByDate(transactions), [transactions])
  const categoryMap = useMemo(() => makeCategoryMap(categories), [categories])

  return <>
    {transactionGroups.map((transactions, index) => (
      <div key={new Date(transactions[0].time).toDateString()}>
        <div>{new Date(transactions[0].time).toLocaleDateString()}</div>
        <ul>
          {transactions.map(transaction => (
            <TransactionLine
              key={transaction.id}
              transaction={transaction}
              categoryMap={categoryMap}
              accountId={accountId}
            />
          ))}
        </ul>
      </div>
    ))}
  </>
})

function makeCategoryMap(categories: Category[]) {
  const map = new Map<string, Category>()
  for (const category of categories) {
    map.set(category.id, category)
  }
  return map
}

function useFiltersFromUrl() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const timeFrom = parseDateParam(params.get(FilterParamName.DateFrom) ?? '')
  const timeTo = parseDateParam(params.get(FilterParamName.DateTo) ?? '')
  const direction = params.get(FilterParamName.Direction) as Direction
  const categoryId = params.get(FilterParamName.CategoryId)

  if (timeTo) {
    timeTo.setTime(timeTo.getTime() + 1000 * 60 * 60 * 24)
  }

  return useMemo(() => ({ timeFrom, timeTo, direction, categoryId }), [timeFrom, timeTo, direction, categoryId])
}

function filterTransactions(transactions: Transaction[], filters: ReturnType<typeof useFiltersFromUrl>) {
  // todo: Сортировать один раз, и затем только фильтровать (потому что порядок всегда одинаковый)
  return transactions
    .filter(transaction => !(
      (filters.categoryId !== null && transaction.categoryId !== filters.categoryId) ||
      (filters.direction === Direction.Income && transaction.value <= 0) ||
      (filters.direction === Direction.Outcome && transaction.value >= 0) ||
      (filters.timeFrom !== null && new Date(transaction.time).getTime() < filters.timeFrom.getTime()) ||
      (filters.timeTo !== null && new Date(transaction.time).getTime() >= filters.timeTo.getTime())
    ))
    .sort((t1, t2) => new Date(t2.time).getTime() - new Date(t1.time).getTime())
}
