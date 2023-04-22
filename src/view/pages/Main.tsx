import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { State } from '../../types/entities'
import { selectAccount } from '../../state/selectors'
import TransactionList from '../components/TransactionList'

export default function Main() {
  const { accountId } = useParams() as { accountId: string }
  const account = useSelector((state: State) => selectAccount(state, accountId))

  if (!account) {
    return <div>Аккаунт с идентификатором {accountId} не существует. <Link to="/">Вернуться ↩︎</Link></div>
  }

  return (
    <TransactionList accountId={accountId} transactions={account.transactions} categories={account.categories} />
  )
}
