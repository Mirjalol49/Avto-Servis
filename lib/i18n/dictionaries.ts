import type { JobStatus, UserRole } from "@prisma/client";

import type { Locale } from "@/lib/i18n/config";

export type Dictionary = {
  common: {
    appName: string;
    serviceCommand: string;
    serviceErp: string;
    operations: string;
    language: string;
    currentLanguage: string;
    useSystem: string;
    noSpecialization: string;
    jobs: string;
    roles: Record<UserRole, string>;
    languages: Record<Locale, string>;
  };
  nav: {
    dashboard: string;
    customers: string;
    cars: string;
    jobs: string;
    masters: string;
    parts: string;
    reports: string;
    settings: string;
  };
  auth: {
    signInSubtitle: string;
    phone: string;
    password: string;
    invalidCredentials: string;
    signingIn: string;
    signIn: string;
  };
  settings: {
    title: string;
    description: string;
    appearance: string;
    appearanceDescription: string;
    currentResolvedMode: string;
    systemRendersAs: string;
    interface: string;
    interfaceDescription: string;
    interfaceBody: string;
    access: string;
    accessDescription: string;
    manageUsers: string;
    nonAdminAccess: string;
    languageTitle: string;
    languageDescription: string;
    languageBody: string;
    themeOptions: {
      light: { label: string; description: string };
      dark: { label: string; description: string };
      system: { label: string; description: string };
    };
    resolvedModes: {
      light: string;
      dark: string;
    };
  };
  dashboard: {
    title: string;
    description: string;
    todaysJobs: string;
    todaysJobsSubtitle: string;
    activeJobs: string;
    activeJobsSubtitle: string;
    todaysRevenue: string;
    todaysRevenueSubtitle: string;
    monthRevenue: string;
    monthRevenueSubtitle: string;
    revenueLast30Days: string;
    jobsByStatus: string;
    revenue: string;
    topMastersThisMonth: string;
    recentJobOrders: string;
    noCompletedMasterJobs: string;
    noJobOrdersYet: string;
    stockAlert: string;
    stockAlertText: (count: number) => string;
    reviewInventory: string;
    highWorkload: string;
    highWorkloadText: (count: number) => string;
    completedJobsBadge: (count: number) => string;
    lastUpdated: string;
  };
  jobs: {
    statuses: Record<JobStatus, string>;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  uz: {
    common: {
      appName: "AutoServis",
      serviceCommand: "Servis boshqaruvi",
      serviceErp: "Servis ERP",
      operations: "Operatsiyalar",
      language: "Til",
      currentLanguage: "Joriy til",
      useSystem: "Tizimdan foydalanish",
      noSpecialization: "Mutaxassislik kiritilmagan",
      jobs: "ish",
      roles: {
        ADMIN: "Admin",
        RECEPTIONIST: "Qabulchi",
        MASTER: "Usta",
      },
      languages: {
        uz: "O'zbek",
        en: "English",
        ru: "Русский",
      },
    },
    nav: {
      dashboard: "Boshqaruv",
      customers: "Mijozlar",
      cars: "Avtomobillar",
      jobs: "Buyurtmalar",
      masters: "Ustalar",
      parts: "Ehtiyot qismlar",
      reports: "Hisobotlar",
      settings: "Sozlamalar",
    },
    auth: {
      signInSubtitle: "Servis operatsiyalarini boshqarish uchun tizimga kiring.",
      phone: "Telefon raqam",
      password: "Parol",
      invalidCredentials: "Email yoki parol noto'g'ri.",
      signingIn: "Kirilmoqda...",
      signIn: "Kirish",
    },
    settings: {
      title: "Sozlamalar",
      description: "Ko'rinish, kirish huquqi va ish muhiti sozlamalarini boshqaring.",
      appearance: "Ko'rinish",
      appearanceDescription: "AutoServis ushbu qurilmada qanday ko'rinishini tanlang.",
      currentResolvedMode: "Joriy ko'rinish rejimi",
      systemRendersAs: "Tizim sozlamasi hozir {mode} rejimida ko'rsatmoqda.",
      interface: "Interfeys",
      interfaceDescription: "Mavzu tanlovi ushbu brauzerda saqlanadi.",
      interfaceBody:
        "Yorug' rejim Indigo Insight Update palitrasidan, qorong'i rejim esa original Indigo Insight palitrasidan foydalanadi.",
      access: "Kirish huquqi",
      accessDescription: "Admin foydalanuvchi boshqaruvi Sozlamalar ichida qoladi.",
      manageUsers: "Foydalanuvchilarni boshqarish",
      nonAdminAccess: "Foydalanuvchilarni yaratish yoki ko'rish uchun admindan so'rang.",
      languageTitle: "Til",
      languageDescription: "Interfeys tilini tanlang.",
      languageBody: "Tanlangan til ushbu brauzerda saqlanadi. Standart til - o'zbek.",
      themeOptions: {
        light: {
          label: "Yorug'",
          description: "Kunduzgi ish uchun oq va aniq interfeys.",
        },
        dark: {
          label: "Qorong'i",
          description: "Kam yorug'lik muhitlari uchun chuqur indigo interfeys.",
        },
        system: {
          label: "Tizim",
          description: "Qurilma sozlamasiga avtomatik moslashadi.",
        },
      },
      resolvedModes: {
        light: "yorug'",
        dark: "qorong'i",
      },
    },
    dashboard: {
      title: "Boshqaruv",
      description: "Servis operatsiyalari, tushum, ish yuklamasi va ombor ogohlantirishlari.",
      todaysJobs: "Bugungi buyurtmalar",
      todaysJobsSubtitle: "Bugun ochilgan buyurtmalar",
      activeJobs: "Faol ishlar",
      activeJobsSubtitle: "Hozir servis jarayonida",
      todaysRevenue: "Bugungi tushum",
      todaysRevenueSubtitle: "Bugun to'langan hisoblar",
      monthRevenue: "Oylik tushum",
      monthRevenueSubtitle: "Ushbu oy",
      revenueLast30Days: "So'nggi 30 kun tushumi",
      jobsByStatus: "Holat bo'yicha ishlar",
      revenue: "Tushum",
      topMastersThisMonth: "Bu oy eng faol ustalar",
      recentJobOrders: "So'nggi buyurtmalar",
      noCompletedMasterJobs: "Bu oy yakunlangan usta ishlari yo'q.",
      noJobOrdersYet: "Hali buyurtmalar yo'q.",
      stockAlert: "Ombor ogohlantirishi",
      stockAlertText: (count) => `${count} ta ehtiyot qism kam qolgan.`,
      reviewInventory: "Omborni ko'rish",
      highWorkload: "Yuqori ish yuklamasi",
      highWorkloadText: (count) => `${count} ta ish hozir faol - yuklama yuqori`,
      completedJobsBadge: (count) => `${count} ish`,
      lastUpdated: "Oxirgi yangilanish",
    },
    jobs: {
      statuses: {
        WAITING: "Kutilmoqda",
        DIAGNOSED: "Diagnostika qilingan",
        APPROVED: "Tasdiqlangan",
        IN_PROGRESS: "Jarayonda",
        COMPLETED: "Yakunlangan",
        DELIVERED: "Topshirilgan",
      },
    },
  },
  en: {
    common: {
      appName: "AutoServis",
      serviceCommand: "Service Command",
      serviceErp: "Service ERP",
      operations: "Operations",
      language: "Language",
      currentLanguage: "Current language",
      useSystem: "Use system",
      noSpecialization: "No specialization",
      jobs: "jobs",
      roles: {
        ADMIN: "Admin",
        RECEPTIONIST: "Receptionist",
        MASTER: "Master",
      },
      languages: {
        uz: "O'zbek",
        en: "English",
        ru: "Русский",
      },
    },
    nav: {
      dashboard: "Dashboard",
      customers: "Customers",
      cars: "Cars",
      jobs: "Job Orders",
      masters: "Masters",
      parts: "Parts",
      reports: "Reports",
      settings: "Settings",
    },
    auth: {
      signInSubtitle: "Sign in to manage service operations.",
      phone: "Phone number",
      password: "Password",
      invalidCredentials: "Invalid email or password.",
      signingIn: "Signing in...",
      signIn: "Sign in",
    },
    settings: {
      title: "Settings",
      description: "Manage appearance, access, and workspace preferences.",
      appearance: "Appearance",
      appearanceDescription: "Choose how AutoServis looks on this device.",
      currentResolvedMode: "Current resolved mode",
      systemRendersAs: "System preference currently renders as {mode}.",
      interface: "Interface",
      interfaceDescription: "Theme choices are saved in this browser.",
      interfaceBody:
        "Light mode uses the Indigo Insight Update palette. Dark mode uses the original Indigo Insight palette.",
      access: "Access",
      accessDescription: "Admin-only user management stays under Settings.",
      manageUsers: "Manage users",
      nonAdminAccess: "Ask an admin to create, edit, or review user accounts.",
      languageTitle: "Language",
      languageDescription: "Choose the interface language.",
      languageBody: "The selected language is saved in this browser. Uzbek is the default.",
      themeOptions: {
        light: {
          label: "Light",
          description: "Paper-white workspace for daytime operations.",
        },
        dark: {
          label: "Dark",
          description: "Deep indigo workspace for low-light environments.",
        },
        system: {
          label: "System",
          description: "Follow this device automatically.",
        },
      },
      resolvedModes: {
        light: "Light",
        dark: "Dark",
      },
    },
    dashboard: {
      title: "Dashboard",
      description: "Service operations, revenue, workload, and inventory alerts.",
      todaysJobs: "Today's Jobs",
      todaysJobsSubtitle: "Job orders opened today",
      activeJobs: "Active Jobs",
      activeJobsSubtitle: "Currently in service",
      todaysRevenue: "Today's Revenue",
      todaysRevenueSubtitle: "Paid invoices today",
      monthRevenue: "Month Revenue",
      monthRevenueSubtitle: "This month",
      revenueLast30Days: "Revenue Last 30 Days",
      jobsByStatus: "Jobs by Status",
      revenue: "Revenue",
      topMastersThisMonth: "Top Masters This Month",
      recentJobOrders: "Recent Job Orders",
      noCompletedMasterJobs: "No completed master jobs this month.",
      noJobOrdersYet: "No job orders yet.",
      stockAlert: "Stock alert",
      stockAlertText: (count) => `${count} parts are running low on stock.`,
      reviewInventory: "Review inventory",
      highWorkload: "High workload",
      highWorkloadText: (count) => `${count} jobs currently active - high load`,
      completedJobsBadge: (count) => `${count} jobs`,
      lastUpdated: "Last updated",
    },
    jobs: {
      statuses: {
        WAITING: "Waiting",
        DIAGNOSED: "Diagnosed",
        APPROVED: "Approved",
        IN_PROGRESS: "In Progress",
        COMPLETED: "Completed",
        DELIVERED: "Delivered",
      },
    },
  },
  ru: {
    common: {
      appName: "AutoServis",
      serviceCommand: "Управление сервисом",
      serviceErp: "Сервис ERP",
      operations: "Операции",
      language: "Язык",
      currentLanguage: "Текущий язык",
      useSystem: "Использовать систему",
      noSpecialization: "Специализация не указана",
      jobs: "работ",
      roles: {
        ADMIN: "Админ",
        RECEPTIONIST: "Приемщик",
        MASTER: "Мастер",
      },
      languages: {
        uz: "O'zbek",
        en: "English",
        ru: "Русский",
      },
    },
    nav: {
      dashboard: "Панель",
      customers: "Клиенты",
      cars: "Автомобили",
      jobs: "Заказы",
      masters: "Мастера",
      parts: "Запчасти",
      reports: "Отчеты",
      settings: "Настройки",
    },
    auth: {
      signInSubtitle: "Войдите, чтобы управлять сервисными операциями.",
      phone: "Телефон",
      password: "Пароль",
      invalidCredentials: "Неверный email или пароль.",
      signingIn: "Вход...",
      signIn: "Войти",
    },
    settings: {
      title: "Настройки",
      description: "Управляйте видом, доступом и параметрами рабочей среды.",
      appearance: "Внешний вид",
      appearanceDescription: "Выберите, как AutoServis выглядит на этом устройстве.",
      currentResolvedMode: "Текущий режим",
      systemRendersAs: "Системная настройка сейчас отображается как {mode}.",
      interface: "Интерфейс",
      interfaceDescription: "Выбор темы сохраняется в этом браузере.",
      interfaceBody:
        "Светлый режим использует палитру Indigo Insight Update. Темный режим использует оригинальную палитру Indigo Insight.",
      access: "Доступ",
      accessDescription: "Управление пользователями для админа находится в Настройках.",
      manageUsers: "Управлять пользователями",
      nonAdminAccess: "Попросите админа создать, изменить или проверить учетные записи.",
      languageTitle: "Язык",
      languageDescription: "Выберите язык интерфейса.",
      languageBody: "Выбранный язык сохраняется в этом браузере. По умолчанию используется узбекский.",
      themeOptions: {
        light: {
          label: "Светлая",
          description: "Белый рабочий интерфейс для дневной работы.",
        },
        dark: {
          label: "Темная",
          description: "Глубокий индиго для работы при слабом освещении.",
        },
        system: {
          label: "Система",
          description: "Автоматически следует настройкам устройства.",
        },
      },
      resolvedModes: {
        light: "светлая",
        dark: "темная",
      },
    },
    dashboard: {
      title: "Панель",
      description: "Сервисные операции, выручка, загрузка и складские уведомления.",
      todaysJobs: "Заказы сегодня",
      todaysJobsSubtitle: "Заказы, открытые сегодня",
      activeJobs: "Активные работы",
      activeJobsSubtitle: "Сейчас в сервисе",
      todaysRevenue: "Выручка сегодня",
      todaysRevenueSubtitle: "Оплаченные счета сегодня",
      monthRevenue: "Выручка за месяц",
      monthRevenueSubtitle: "Этот месяц",
      revenueLast30Days: "Выручка за 30 дней",
      jobsByStatus: "Работы по статусам",
      revenue: "Выручка",
      topMastersThisMonth: "Лучшие мастера месяца",
      recentJobOrders: "Последние заказы",
      noCompletedMasterJobs: "В этом месяце нет завершенных работ мастеров.",
      noJobOrdersYet: "Заказов пока нет.",
      stockAlert: "Уведомление склада",
      stockAlertText: (count) => `${count} запчастей заканчиваются на складе.`,
      reviewInventory: "Проверить склад",
      highWorkload: "Высокая загрузка",
      highWorkloadText: (count) => `${count} активных работ - высокая загрузка`,
      completedJobsBadge: (count) => `${count} работ`,
      lastUpdated: "Обновлено",
    },
    jobs: {
      statuses: {
        WAITING: "Ожидает",
        DIAGNOSED: "Диагностирован",
        APPROVED: "Одобрен",
        IN_PROGRESS: "В работе",
        COMPLETED: "Завершен",
        DELIVERED: "Выдан",
      },
    },
  },
};
