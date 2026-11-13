export interface UserAccount {
  email: string;
  passwordHash: string;
}

export const getAllUsers = (): Record<string, UserAccount> => {
  return JSON.parse(localStorage.getItem('fitlog_users_db') || '{}');
};

const saveAllUsers = (users: Record<string, UserAccount>) => {
  localStorage.setItem('fitlog_users_db', JSON.stringify(users));
};

// Реєстрація: збереження пошти та пароля
export const registerUserDirectly = (email: string, password: string):boolean => {
  const users = getAllUsers();
  const normalizedEmail = email.toLowerCase().trim();

  if (users[normalizedEmail]) {
    return false; // вже існує
  }

  users[normalizedEmail] = {
    email: normalizedEmail,
    passwordHash: password,
  };

  saveAllUsers(users);
  return true;
};

// Вхід: перевірка пошти та пароля
export const validateLoginDirectly = (email: string, password: string): boolean => {
  const users = getAllUsers();
  const normalizedEmail = email.toLowerCase().trim();
  const user = users[normalizedEmail];

  if (!user || user.passwordHash !== password) {
    return false;
  }

  return true;
};