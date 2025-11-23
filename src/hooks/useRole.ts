import { useState } from 'react';
import { UserRole } from '../types';

export const useRole = () => {
  const [role, setRoleState] = useState<UserRole | null>(() => {
    const stored = localStorage.getItem('userRole');
    return stored ? (stored as UserRole) : null;
  });

  const setRole = (newRole: UserRole | null) => {
    // Update localStorage synchronously before state update
    if (newRole) {
      localStorage.setItem('userRole', newRole);
    } else {
      localStorage.removeItem('userRole');
    }
    setRoleState(newRole);
  };

  return { role, setRole };
};
