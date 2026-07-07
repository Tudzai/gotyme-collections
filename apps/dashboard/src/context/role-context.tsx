import { createContext, useContext, useState } from 'react'
import type { UserRole } from '../data/types'

interface User {
  name: string
  initials: string
  role: UserRole
}

const USERS: User[] = [
  { name: 'TDAT', initials: 'TD', role: 'director' },
  { name: 'Anh Tu', initials: 'AT', role: 'manager' },
  { name: 'Mike', initials: 'MK', role: 'analyst' },
]

type Action = 'approve' | 'propose' | 'view_all' | 'bulk_action'

const ROLE_PERMISSIONS: Record<UserRole, Action[]> = {
  director: ['approve', 'propose', 'view_all', 'bulk_action'],
  manager:  ['propose', 'view_all', 'bulk_action'],
  analyst:  ['view_all'],
  admin:    ['approve', 'propose', 'view_all', 'bulk_action'],
}

interface RoleContextValue {
  currentUser: User
  setUser: (name: string) => void
  can: (action: Action) => boolean
  users: User[]
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(USERS[0])

  function setUser(name: string) {
    const user = USERS.find(u => u.name === name)
    if (user) setCurrentUser(user)
  }

  function can(action: Action): boolean {
    return ROLE_PERMISSIONS[currentUser.role]?.includes(action) ?? false
  }

  return (
    <RoleContext.Provider value={{ currentUser, setUser, can, users: USERS }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
