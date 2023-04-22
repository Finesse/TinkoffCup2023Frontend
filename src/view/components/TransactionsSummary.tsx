import { memo, useMemo } from 'react'
import { Category, Transaction } from '../../types/entities'
import { getTransactionsIncome, getTransactionsOutcome } from '../../utils'

interface Props {
  /** Отфильтрованные отсортированные транзакции */
  transactions: Transaction[],
  categories: Category[],
  showCategories?: boolean,
  showIncome?: boolean,
  showOutcome?: boolean,
  showBalance?: boolean,
}

export default memo(function TransactionsSummary({ transactions, showCategories, showIncome, showOutcome, showBalance }: Props) {
  const totalIncome = useMemo(() => getTransactionsIncome(transactions), [transactions])
  const totalOutcome = useMemo(() => getTransactionsOutcome(transactions), [transactions])
  // const byCategory = useMemo(() => getTransactionsTotalByCategory(transactions), [transactions])

  return (
    <div>
      {showIncome && <div>Суммарный доход: {totalIncome}</div>}
      {showOutcome && <div>Суммарный расход: {totalOutcome}</div>}
      {showBalance && <div>Суммарный баланс: {totalIncome - totalOutcome}</div>}
    </div>
  )
})
