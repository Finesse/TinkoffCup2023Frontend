import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { State } from '../../types/entities'

export default function Accounts() {
  const selectedAccountId = useSelector((state: State) => state.accountId)
  const navigate = useNavigate()
  const accounts = useSelector((state: State) => state.accounts)

  useEffect(() => {
    if (selectedAccountId) {
      navigate(`/${selectedAccountId}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ul>
      {accounts.map(account => (
        <li key={account.id}>
          {account.name}
        </li>
      ))}
    </ul>
  )
}
