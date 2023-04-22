import { memo } from 'react'
import { useDispatch } from 'react-redux'
import { Button, Popconfirm } from 'antd'
import { Category, Transaction } from '../../types/entities'
import { actions } from '../../state/store'

interface Props {
  transaction: Transaction,
  categoryMap: Map<string, Category>,
  accountId: string,
}

export default memo(function TransactionLine({ transaction, categoryMap, accountId }: Props) {
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
        <Button type="link" danger>Удалить</Button>
      </Popconfirm>
    </li>
  )
})
