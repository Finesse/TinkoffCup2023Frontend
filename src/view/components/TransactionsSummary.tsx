import { memo, useMemo } from 'react'
import { Table } from 'antd'
import { Category, Transaction } from '../../types/entities'
import { getTransactionsIncome, getTransactionsOutcome, getTransactionsTotalByCategory } from '../../utils'
import styles from './TransactionsSummary.module.css'

interface Props {
  /** Отфильтрованные отсортированные транзакции */
  transactions: Transaction[],
  categories: Category[],
  showCategories?: boolean,
  showIncome?: boolean,
  showOutcome?: boolean,
  showBalance?: boolean,
}

export default memo(function TransactionsSummary({ transactions, showCategories, showIncome, showOutcome, showBalance, categories }: Props) {
  const totalIncome = useMemo(() => getTransactionsIncome(transactions), [transactions])
  const totalOutcome = useMemo(() => getTransactionsOutcome(transactions), [transactions])

  return (
    <div className={styles.root}>
      {showIncome && <div>Суммарный доход: {totalIncome}</div>}
      {showOutcome && <div>Суммарный расход: {totalOutcome}</div>}
      {showBalance && <div>Суммарный баланс: {totalIncome - totalOutcome}</div>}
      {showCategories && <ByCategory transactions={transactions} categories={categories} showOutcome={showOutcome} showIncome={showIncome} />}
    </div>
  )
})

interface ByCategoryProps {
  transactions: Transaction[],
  showIncome?: boolean,
  showOutcome?: boolean,
  categories: Category[],
}

const ByCategory = memo(function ByCategory({ transactions, showIncome, showOutcome, categories }: ByCategoryProps) {
  const byCategory = getTransactionsTotalByCategory(transactions)

  const columns = [
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
    },
  ]
  if (showIncome) {
    columns.push({
      title: 'Доходы',
      dataIndex: 'income',
      key: 'income',
    })
  }
  if (showOutcome) {
    columns.push({
      title: 'Расходы',
      dataIndex: 'outcome',
      key: 'outcome',
    })
  }

  const dataSource = categories.map(category => {
    const values = byCategory.get(category.id)
    return {
      key: category.id,
      category: category.name,
      income: values?.income ?? 0,
      outcome: values?.outcome ?? 0,
    }
  })

  return <Table dataSource={dataSource} columns={columns} />
})
