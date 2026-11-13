export interface UserAccount {
  name: string;
  email: string;
  passwordHash?: string; // з'являється після переходу за посиланням з листа
  isActivated: boolean;
  activationToken?: string;
}

// Отримати всіх користувачів
export const getAllUsers = (): Record<string, UserAccount> => {
  return JSON.parse(localStorage.getItem('fitlog_users_db') || '{}');
};

// Зберегти базу
const saveAllUsers = (users: Record<string, UserAccount>) => {
  localStorage.setItem('fitlog_users_db', JSON.stringify(users));
};

// 1. Крок реєстрації: створення акаунта і "надсилання" листа з посиланням
export const registerNewUser = (name: string, email: string): string | null => {
  const users = getAllUsers();
  const normalizedEmail = email.toLowerCase().trim();

  if (users[normalizedEmail]) {
    return null; // вже існує
  }

  // Генеруємо унікальний токен для посилання в листі
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

  users[normalizedEmail] = {
    name,
    email: normalizedEmail,
    isActivated: false,
    activationToken: token,
  };

  saveAllUsers(users);

  // Симуляція відправки листа в консоль (з посиланням активації)
  const activationLink = `http://localhost:5173/?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;
  console.log(`[Email Service] Лист надіслано на ${normalizedEmail}`);
  console.log(`[Email Service] Перейдіть за посиланням для завершення реєстрації: ${activationLink}`);

  return token;
};

// Знайти юзера за токеном активації
const getUserByToken = (token: string): UserAccount | null => {
  const users = getAllUsers();
  const found = Object.values(users).find(u => u.activationToken === token);
  return found || null;
};

// 2. Завершення реєстрації: встановлення пароля за токеном з листа
export const completeRegistration = (token: string, password: string):boolean => {
  const users = getAllUsers();
  const user = getUserByToken(token);

  if (!user) return false;

  user.passwordHash = password; // У реальному проєкті тут має бути хешування
  user.isActivated = true;
  delete user.activationToken; // Токен одноразовий

  users[user.email] = user;
  saveAllUsers(users);
  return true;
};

// 3. Перевірка при вході (пошта + пароль)
export const validateLogin = (email: string, password: string): string | null => {
  const users = getAllUsers();
  const normalizedEmail = email.toLowerCase().trim();
  const user = users[normalizedEmail];

  if (!user || !user.isActivated || user.passwordHash !== password) {
    return null; // невірні дані або акаунт не активовано
  }

  return user.name;
};