import { memo, useDeferredValue, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Button, DatePicker, Popconfirm } from 'antd'
import dayjs from 'dayjs'
import { Category, Transaction } from '../../types/entities'
import { parseDateParam, stringifyDateParam } from '../../utils'
import { actions } from '../../state/store'

const enum FilterParamName {
  DateFrom = 'dateFrom',
  DateTo = 'dateTo',
  CategoryId = 'categoryId',
}

interface Props {
  accountId: string
  transactions: Transaction[],
  categories: Category[],
}

export default memo(function TransactionList({ accountId, transactions, categories }: Props) {
  return (
    <div>
      <Filter categories={categories} />
      <Transactions transactions={transactions} categories={categories} accountId={accountId} />
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

  const handleCategorySelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParam(FilterParamName.CategoryId, event.target.value)
  }

  const handleFromDateChange = (date: dayjs.Dayjs | null) => {
    setSearchParam(FilterParamName.DateFrom, date ? stringifyDateParam(date.toDate()) : null)
  }

  const handleToDateChange = (date: dayjs.Dayjs | null) => {
    setSearchParam(FilterParamName.DateTo, date ? stringifyDateParam(date.toDate()) : null)
  }

  return (
    <div>
      <div>
        Категория:
        <select value={filters.categoryId ?? ''} onChange={handleCategorySelect}>
          <option value="">Любая</option>
          {categories.map(category => (
            <option value={category.id} key={category.id}>{category.icon && `${category.icon} `}{category.name}</option>
          ))}
        </select>
      </div>
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
      </div>
    </div>
  )
})

interface TransactionsProps {
  transactions: Transaction[],
  categories: Category[],
  accountId: string,
}

const Transactions = memo(function Transactions({ transactions, categories, accountId }: TransactionsProps) {
  const filters = useFiltersFromUrl()
  const deferredFilters = useDeferredValue(filters)
  const filteredTransactions = useMemo(() => filterTransactions(transactions, deferredFilters), [transactions, deferredFilters])
  const transactionGroups = useMemo(() => groupTransactionsByDate(filteredTransactions), [filteredTransactions])
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

interface TransactionLineProps {
  transaction: Transaction,
  categoryMap: Map<string, Category>,
  accountId: string,
}

const TransactionLine = memo(function TransactionLine({ transaction, categoryMap, accountId }: TransactionLineProps) {
  const dispatch = useDispatch()

  const handleDelete = () => dispatch(actions.transactionDelete({ accountId, ids: [transaction.id] }))

  return (
    <li key={transaction.id}>
      {transaction.value < 0 ? '−' : '+'}{Math.abs(transaction.value)}
      {' | '}
      {new Date(transaction.time).toLocaleString()}
      {' | '}
      {transaction.categoryId ? (categoryMap.get(transaction.categoryId)?.name ?? '(удалённая категория)') : '(без категории)'}
      {' | '}
      {transaction.description}
      {' | '}
      <Popconfirm
        title={`Вы действительно хотите удалить этот ${transaction.value > 0 ? 'доход' : 'расход'}?`}
        description="Это действие нельзя отменить (пока что)"
        okText="Да"
        cancelText="Нет"
        onConfirm={handleDelete}
      >
        <Button type="link">Удалить</Button>
      </Popconfirm>
    </li>
  )
})

function makeCategoryMap(categories: Category[]) {
  const map = new Map<string, Category>()
  for (const category of categories) {
    map.set(category.id, category)
  }
  return map
}

function groupTransactionsByDate(transactions: Transaction[]) {
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

function useFiltersFromUrl() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const timeFrom = parseDateParam(params.get(FilterParamName.DateFrom) ?? '')
  const timeTo = parseDateParam(params.get(FilterParamName.DateTo) ?? '')
  const categoryId = params.get(FilterParamName.CategoryId)

  if (timeTo) {
    timeTo.setTime(timeTo.getTime() + 1000 * 60 * 60 * 24)
  }

  return useMemo(() => ({ timeFrom, timeTo, categoryId }), [timeFrom, timeTo, categoryId])
}

function filterTransactions(transactions: Transaction[], filters: ReturnType<typeof useFiltersFromUrl>) {
  // todo: Сортировать один раз, и затем только фильтровать (потому что порядок всегда одинаковый)
  return transactions
    .filter(transaction => !(
      (filters.categoryId !== null && transaction.categoryId !== filters.categoryId) ||
      (filters.timeFrom !== null && new Date(transaction.time).getTime() < filters.timeFrom.getTime()) ||
      (filters.timeTo !== null && new Date(transaction.time).getTime() >= filters.timeTo.getTime())
    ))
    .sort((t1, t2) => new Date(t2.time).getTime() - new Date(t1.time).getTime())
}
