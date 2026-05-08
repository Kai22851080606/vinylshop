// server/db.cjs
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.run('PRAGMA foreign_keys = ON');

db.serialize(() => {
  // Таблица пользователей
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'user',
      avatar TEXT,
      bio TEXT,
      first_name TEXT,
      last_name TEXT,
      middle_name TEXT,
      nickname TEXT,
      birth_date TEXT,
      gender TEXT,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    )
  `);

  // Таблица для сеансов пользователей
  db.run(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      device_info TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Таблица для восстановления пароля
  db.run(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      token TEXT NOT NULL,
      login TEXT,
      expires_at DATETIME,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица избранных новостей
  db.run(`
    CREATE TABLE IF NOT EXISTS favorite_news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      news_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
      UNIQUE(user_id, news_id)
    )
  `);

  // Таблица пластинок
  db.run(`
    CREATE TABLE IF NOT EXISTS vinyls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      price INTEGER NOT NULL,
      image TEXT,
      type TEXT DEFAULT 'album',
      stock INTEGER DEFAULT 0,
      orders_count INTEGER DEFAULT 0,
      release_year INTEGER,
      genre TEXT,
      description TEXT,
      tracklist TEXT,
      deleted INTEGER DEFAULT 0,
      deleted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица новостей
  db.run(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      image TEXT,
      views INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0,
      deleted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица артистов
  db.run(`
    CREATE TABLE IF NOT EXISTS artists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      image TEXT,
      orders_count INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0,
      deleted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица услуг
  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price TEXT,
      orders_count INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0,
      deleted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица акций
  db.run(`
    CREATE TABLE IF NOT EXISTS promotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'discount',
      discount_type TEXT DEFAULT 'percentage',
      discount_value INTEGER DEFAULT 0,
      buy_quantity INTEGER DEFAULT 1,
      get_quantity INTEGER DEFAULT 1,
      cashback_percent INTEGER DEFAULT 0,
      target_type TEXT DEFAULT 'all',
      target_ids TEXT,
      image TEXT,
      start_date DATETIME,
      end_date DATETIME,
      active INTEGER DEFAULT 1,
      deleted INTEGER DEFAULT 0,
      deleted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    )
  `);

  // Таблица заказов
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_type TEXT NOT NULL,
      item_title TEXT NOT NULL,
      items_json TEXT NOT NULL,
      order_data TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_lastname TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      delivery_json TEXT,
      event_json TEXT,
      card_last4 TEXT NOT NULL,
      card_holder TEXT NOT NULL,
      total_price INTEGER NOT NULL,
      user_email TEXT,
      confirmed INTEGER DEFAULT 0,
      confirmed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица избранного (пластинки)
  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      vinyl_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (vinyl_id) REFERENCES vinyls(id) ON DELETE CASCADE,
      UNIQUE(user_id, vinyl_id)
    )
  `);

  // Таблица отзывов
  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      is_approved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Таблица рейтингов
  db.run(`
    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(entity_type, entity_id, user_id)
    )
  `);
 
  // ===== КОРЗИНА =====
db.run(`
  CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_type TEXT NOT NULL CHECK(item_type IN ('vinyl', 'service')),
    item_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, item_type, item_id)
  )
`, (err) => {
  if (err) {
    console.error('❌ Ошибка создания таблицы cart:', err.message);
  } else {
    console.log('✅ Таблица cart готова');
  }
});

// ===== ПРОСМОТРЫ =====
db.run(`
  CREATE TABLE IF NOT EXISTS views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_type TEXT NOT NULL CHECK(item_type IN ('vinyl', 'news', 'service', 'artist')),
    item_id INTEGER NOT NULL,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, item_type, item_id)
  )
`, (err) => {
  if (err) {
    console.error('❌ Ошибка создания таблицы views:', err.message);
  } else {
    console.log('✅ Таблица views готова');
  }
});
  
});

// Добавляем недостающие колонки в users
db.all("PRAGMA table_info(users)", (err, columns) => {
  if (err) {
    console.error('Ошибка при проверке структуры users:', err);
    return;
  }

  const columnNames = columns.map(col => col.name);
  console.log('📊 Текущие колонки users:', columnNames.join(', '));

  const columnsToAdd = [
    { name: 'first_name', type: 'TEXT' },
    { name: 'last_name', type: 'TEXT' },
    { name: 'middle_name', type: 'TEXT' },
    { name: 'nickname', type: 'TEXT' },
    { name: 'birth_date', type: 'TEXT' },
    { name: 'gender', type: 'TEXT' },
    { name: 'last_login', type: 'DATETIME' },
    { name: 'updated_at', type: 'DATETIME' }
  ];

  columnsToAdd.forEach(col => {
    if (!columnNames.includes(col.name)) {
      console.log(`📌 Добавляем колонку ${col.name}...`);
      db.run(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`, (err) => {
        if (err) console.error(`Ошибка добавления ${col.name}:`, err);
        else console.log(`✅ Колонка ${col.name} добавлена`);
      });
    }
  });
});

// Добавляем недостающие колонки в orders
db.all("PRAGMA table_info(orders)", (err, columns) => {
  if (err) {
    console.error('Ошибка при проверке структуры orders:', err);
    return;
  }

  const columnNames = columns.map(col => col.name);
  console.log('📊 Текущие колонки orders:', columnNames.join(', '));

  const columnsToAdd = [
    { name: 'user_email', type: 'TEXT' },
    { name: 'confirmed', type: 'INTEGER DEFAULT 0' },
    { name: 'confirmed_at', type: 'DATETIME' }
  ];

  columnsToAdd.forEach(col => {
    if (!columnNames.includes(col.name)) {
      console.log(`📌 Добавляем колонку ${col.name} в orders...`);
      db.run(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.type}`, (err) => {
        if (err) console.error(`❌ Ошибка добавления ${col.name}:`, err);
        else console.log(`✅ Колонка ${col.name} добавлена в orders`);
      });
    }
  });
});

// Добавляем колонку login в password_resets если нет
db.all("PRAGMA table_info(password_resets)", (err, columns) => {
  if (err) {
    console.error('Ошибка при проверке структуры password_resets:', err);
    return;
  }

  const columnNames = columns.map(col => col.name);
  
  if (!columnNames.includes('login')) {
    console.log('📌 Добавляем колонку login в password_resets...');
    db.run("ALTER TABLE password_resets ADD COLUMN login TEXT", (err) => {
      if (err) console.error('Ошибка добавления login:', err);
      else console.log('✅ Колонка login добавлена в password_resets');
    });
  }
});

// Добавляем колонки в vinyls если нет
db.all("PRAGMA table_info(vinyls)", (err, columns) => {
  if (err) {
    console.error('Ошибка при проверке структуры vinyls:', err);
    return;
  }

  const columnNames = columns.map(col => col.name);
  
  if (!columnNames.includes('stock')) {
    console.log('📌 Добавляем колонку stock...');
    db.run("ALTER TABLE vinyls ADD COLUMN stock INTEGER DEFAULT 0", (err) => {
      if (err) console.error('Ошибка добавления stock:', err);
      else console.log('✅ Колонка stock добавлена');
    });
  }
  if (!columnNames.includes('orders_count')) {
    console.log('📌 Добавляем колонку orders_count...');
    db.run("ALTER TABLE vinyls ADD COLUMN orders_count INTEGER DEFAULT 0", (err) => {
      if (err) console.error('Ошибка добавления orders_count:', err);
      else console.log('✅ Колонка orders_count добавлена');
    });
  }
  if (!columnNames.includes('deleted')) {
    console.log('📌 Добавляем колонку deleted...');
    db.run("ALTER TABLE vinyls ADD COLUMN deleted INTEGER DEFAULT 0", (err) => {
      if (err) console.error('Ошибка добавления deleted:', err);
      else console.log('✅ Колонка deleted добавлена');
    });
  }
  if (!columnNames.includes('deleted_at')) {
    console.log('📌 Добавляем колонку deleted_at...');
    db.run("ALTER TABLE vinyls ADD COLUMN deleted_at DATETIME", (err) => {
      if (err) console.error('Ошибка добавления deleted_at:', err);
      else console.log('✅ Колонка deleted_at добавлена');
    });
  }
  if (!columnNames.includes('release_year')) {
    console.log('📌 Добавляем колонку release_year...');
    db.run("ALTER TABLE vinyls ADD COLUMN release_year INTEGER", (err) => {
      if (err) console.error('Ошибка добавления release_year:', err);
      else console.log('✅ Колонка release_year добавлена');
    });
  }
  if (!columnNames.includes('genre')) {
    console.log('📌 Добавляем колонку genre...');
    db.run("ALTER TABLE vinyls ADD COLUMN genre TEXT", (err) => {
      if (err) console.error('Ошибка добавления genre:', err);
      else console.log('✅ Колонка genre добавлена');
    });
  }
  if (!columnNames.includes('description')) {
    console.log('📌 Добавляем колонку description...');
    db.run("ALTER TABLE vinyls ADD COLUMN description TEXT", (err) => {
      if (err) console.error('Ошибка добавления description:', err);
      else console.log('✅ Колонка description добавлена');
    });
  }
  if (!columnNames.includes('tracklist')) {
    console.log('📌 Добавляем колонку tracklist...');
    db.run("ALTER TABLE vinyls ADD COLUMN tracklist TEXT", (err) => {
      if (err) console.error('Ошибка добавления tracklist:', err);
      else console.log('✅ Колонка tracklist добавлена');
    });
  }
});

// Добавляем колонки в artists если нет
db.all("PRAGMA table_info(artists)", (err, columns) => {
  if (err) {
    console.error('Ошибка при проверке структуры artists:', err);
    return;
  }

  const columnNames = columns.map(col => col.name);
  
  if (!columnNames.includes('deleted')) {
    console.log('📌 Добавляем колонку deleted в artists...');
    db.run("ALTER TABLE artists ADD COLUMN deleted INTEGER DEFAULT 0", (err) => {
      if (err) console.error('Ошибка добавления deleted:', err);
      else console.log('✅ Колонка deleted добавлена в artists');
    });
  }
  if (!columnNames.includes('deleted_at')) {
    console.log('📌 Добавляем колонку deleted_at в artists...');
    db.run("ALTER TABLE artists ADD COLUMN deleted_at DATETIME", (err) => {
      if (err) console.error('Ошибка добавления deleted_at:', err);
      else console.log('✅ Колонка deleted_at добавлена в artists');
    });
  }
  if (!columnNames.includes('orders_count')) {
    console.log('📌 Добавляем колонку orders_count в artists...');
    db.run("ALTER TABLE artists ADD COLUMN orders_count INTEGER DEFAULT 0", (err) => {
      if (err) console.error('Ошибка добавления orders_count:', err);
      else console.log('✅ Колонка orders_count добавлена в artists');
    });
  }
});

// Добавляем колонки в services если нет
db.all("PRAGMA table_info(services)", (err, columns) => {
  if (err) {
    console.error('Ошибка при проверке структуры services:', err);
    return;
  }

  const columnNames = columns.map(col => col.name);
  
  if (!columnNames.includes('deleted')) {
    console.log('📌 Добавляем колонку deleted в services...');
    db.run("ALTER TABLE services ADD COLUMN deleted INTEGER DEFAULT 0", (err) => {
      if (err) console.error('Ошибка добавления deleted:', err);
      else console.log('✅ Колонка deleted добавлена в services');
    });
  }
  if (!columnNames.includes('deleted_at')) {
    console.log('📌 Добавляем колонку deleted_at в services...');
    db.run("ALTER TABLE services ADD COLUMN deleted_at DATETIME", (err) => {
      if (err) console.error('Ошибка добавления deleted_at:', err);
      else console.log('✅ Колонка deleted_at добавлена в services');
    });
  }
  if (!columnNames.includes('orders_count')) {
    console.log('📌 Добавляем колонку orders_count в services...');
    db.run("ALTER TABLE services ADD COLUMN orders_count INTEGER DEFAULT 0", (err) => {
      if (err) console.error('Ошибка добавления orders_count:', err);
      else console.log('✅ Колонка orders_count добавлена в services');
    });
  }
});

// Добавляем колонки в promotions если нет
db.all("PRAGMA table_info(promotions)", (err, columns) => {
  if (err) {
    console.error('Ошибка при проверке структуры promotions:', err);
    return;
  }

  const columnNames = columns.map(col => col.name);
  
  if (!columnNames.includes('deleted')) {
    console.log('📌 Добавляем колонку deleted в promotions...');
    db.run("ALTER TABLE promotions ADD COLUMN deleted INTEGER DEFAULT 0", (err) => {
      if (err) console.error('Ошибка добавления deleted:', err);
      else console.log('✅ Колонка deleted добавлена в promotions');
    });
  }
  if (!columnNames.includes('deleted_at')) {
    console.log('📌 Добавляем колонку deleted_at в promotions...');
    db.run("ALTER TABLE promotions ADD COLUMN deleted_at DATETIME", (err) => {
      if (err) console.error('Ошибка добавления deleted_at:', err);
      else console.log('✅ Колонка deleted_at добавлена в promotions');
    });
  }
  if (!columnNames.includes('updated_at')) {
    console.log('📌 Добавляем колонку updated_at в promotions...');
    db.run("ALTER TABLE promotions ADD COLUMN updated_at DATETIME", (err) => {
      if (err) console.error('Ошибка добавления updated_at:', err);
      else console.log('✅ Колонка updated_at добавлена в promotions');
    });
  }
});

// Добавляем колонки в news если нет
db.all("PRAGMA table_info(news)", (err, columns) => {
  if (err) {
    console.error('Ошибка при проверке структуры news:', err);
    return;
  }

  const columnNames = columns.map(col => col.name);
  
  if (!columnNames.includes('views')) {
    console.log('📌 Добавляем колонку views в news...');
    db.run("ALTER TABLE news ADD COLUMN views INTEGER DEFAULT 0", (err) => {
      if (err) console.error('Ошибка добавления views:', err);
      else console.log('✅ Колонка views добавлена в news');
    });
  }
  if (!columnNames.includes('deleted')) {
    console.log('📌 Добавляем колонку deleted в news...');
    db.run("ALTER TABLE news ADD COLUMN deleted INTEGER DEFAULT 0", (err) => {
      if (err) console.error('Ошибка добавления deleted:', err);
      else console.log('✅ Колонка deleted добавлена в news');
    });
  }
  if (!columnNames.includes('deleted_at')) {
    console.log('📌 Добавляем колонку deleted_at в news...');
    db.run("ALTER TABLE news ADD COLUMN deleted_at DATETIME", (err) => {
      if (err) console.error('Ошибка добавления deleted_at:', err);
      else console.log('✅ Колонка deleted_at добавлена в news');
    });
  }
});

// Создание тестовой акции, если её нет
setTimeout(() => {
  db.get('SELECT COUNT(*) as count FROM promotions', (err, row) => {
    if (err) {
      console.error('Ошибка при проверке promotions:', err);
      return;
    }
    if (row.count === 0) {
      console.log('📝 Создаем тестовую акцию...');
      db.run(`
        INSERT INTO promotions (name, description, type, discount_type, discount_value, target_type, active, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now', '+30 days'))
      `, [
        'Скидка 20% на все пластинки',
        'Скидка 20% на весь ассортимент виниловых пластинок',
        'discount',
        'percentage',
        20,
        'all',
        1
      ], function(err) {
        if (err) console.error('❌ Ошибка создания тестовой акции:', err);
        else console.log('✅ Тестовая акция создана');
      });
    } else {
      console.log('👑 Акции уже существуют');
    }
  });
}, 500);

// ===== СОЗДАНИЕ АДМИНА =====
setTimeout(() => {
  db.get('SELECT * FROM users WHERE username = ? OR email = ?', ['Kai22851', 'admin@vinyl-shop.ru'], (err, existing) => {
    if (err) {
      console.error('Ошибка при проверке админа:', err);
      return;
    }
    
    if (!existing) {
      console.log('📝 Создаем администратора...');
      db.run(`
        INSERT INTO users (username, password, email, role, first_name, last_name, nickname)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, ['Kai22851', 'Kai22851isadmin', 'admin@vinyl-shop.ru', 'admin', 'Реналь', 'Ахияров', 'Kai22851'], function(err) {
        if (err) {
          console.error('❌ Ошибка при создании админа:', err);
        } else {
          console.log('\n=========================================');
          console.log('✅✅✅ АДМИН УСПЕШНО СОЗДАН! ✅✅✅');
          console.log('=========================================');
          console.log('🔐 ДАННЫЕ ДЛЯ ВХОДА:');
          console.log('   Логин (username): Kai22851');
          console.log('   Пароль: Kai22851isadmin');
          console.log('   Email: admin@vinyl-shop.ru');
          console.log('=========================================\n');
        }
      });
    } else {
      console.log('👑 Администратор уже существует');
    }
  });
}, 500);

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ПЛАСТИНКАМИ =====
const vinyls = {
  getAll: (includeDeleted = false) => new Promise((resolve, reject) => {
    const query = includeDeleted 
      ? 'SELECT * FROM vinyls ORDER BY id'
      : 'SELECT * FROM vinyls WHERE deleted = 0 ORDER BY id';
    db.all(query, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  }),
  
  getDeleted: () => new Promise((resolve, reject) => {
    db.all('SELECT * FROM vinyls WHERE deleted = 1 ORDER BY deleted_at DESC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  }),
  
  getById: (id) => new Promise((resolve, reject) => {
    db.get('SELECT * FROM vinyls WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  }),
  
  create: (vinyl) => new Promise((resolve, reject) => {
    const { title, artist, price, image, type, stock = 0, release_year, genre, description, tracklist } = vinyl;
    db.run(`INSERT INTO vinyls (title, artist, price, image, type, stock, release_year, genre, description, tracklist) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, artist, price, image, type || 'album', stock, release_year || null, genre || null, description || null, tracklist || null],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...vinyl, stock, orders_count: 0, deleted: 0 });
      });
  }),
  
  update: (id, vinylData) => new Promise((resolve, reject) => {
    const { title, artist, price, image, type, stock, release_year, genre, description, tracklist } = vinylData;
    db.run(
      `UPDATE vinyls SET title = ?, artist = ?, price = ?, image = ?, type = ?, stock = ?, 
       release_year = ?, genre = ?, description = ?, tracklist = ? WHERE id = ?`,
      [title, artist, price, image, type || 'album', stock, release_year || null, genre || null, description || null, tracklist || null, id],
      function(err) {
        if (err) reject(err);
        else resolve({ id, ...vinylData });
      }
    );
  }),
  
  decreaseStock: (id, quantity = 1) => new Promise((resolve, reject) => {
    db.run(
      'UPDATE vinyls SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [quantity, id, quantity],
      function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      }
    );
  }),
  
  increaseOrderCount: (id, quantity = 1) => new Promise((resolve, reject) => {
    db.run(
      'UPDATE vinyls SET orders_count = orders_count + ? WHERE id = ?',
      [quantity, id],
      function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      }
    );
  }),
  
  softDelete: (id) => new Promise((resolve, reject) => {
    db.run('UPDATE vinyls SET deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ success: true, changes: this.changes });
    });
  }),
  
  restore: (id) => new Promise((resolve, reject) => {
    db.run('UPDATE vinyls SET deleted = 0, deleted_at = NULL WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ success: true, changes: this.changes });
    });
  }),
  
  permanentDelete: (id) => new Promise((resolve, reject) => {
    db.run('DELETE FROM vinyls WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ success: true, changes: this.changes });
    });
  })
};

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С НОВОСТЯМИ =====
const news = {
  getAll: (includeDeleted = false) => new Promise((resolve, reject) => {
    const query = includeDeleted 
      ? 'SELECT * FROM news ORDER BY created_at DESC'
      : 'SELECT * FROM news WHERE deleted = 0 ORDER BY created_at DESC';
    db.all(query, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  }),
  
  getDeleted: () => new Promise((resolve, reject) => {
    db.all('SELECT * FROM news WHERE deleted = 1 ORDER BY deleted_at DESC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  }),
  
  getById: (id) => new Promise((resolve, reject) => {
    db.get('SELECT * FROM news WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  }),
  
  incrementViews: (id) => new Promise((resolve, reject) => {
    db.run('UPDATE news SET views = views + 1 WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ success: true });
    });
  }),
  
  create: (item) => new Promise((resolve, reject) => {
    const { title, content, date, category, image } = item;
    db.run('INSERT INTO news (title, content, date, category, image, views) VALUES (?, ?, ?, ?, ?, 0)',
      [title, content, date, category, image],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...item, views: 0, deleted: 0 });
      });
  }),
  
  update: (id, itemData) => new Promise((resolve, reject) => {
    const { title, content, date, category, image } = itemData;
    db.run(
      'UPDATE news SET title = ?, content = ?, date = ?, category = ?, image = ? WHERE id = ?',
      [title, content, date, category, image, id],
      function(err) {
        if (err) reject(err);
        else resolve({ id, ...itemData });
      }
    );
  }),
  
  softDelete: (id) => new Promise((resolve, reject) => {
    db.run('UPDATE news SET deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ success: true, changes: this.changes });
    });
  }),
  
  restore: (id) => new Promise((resolve, reject) => {
    db.run('UPDATE news SET deleted = 0, deleted_at = NULL WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ success: true, changes: this.changes });
    });
  }),
  
  permanentDelete: (id) => new Promise((resolve, reject) => {
    db.run('DELETE FROM news WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ success: true, changes: this.changes });
    });
  })
};

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С АРТИСТАМИ =====
const artists = {
  getAll: (includeDeleted = false) => new Promise((resolve, reject) => {
    const query = includeDeleted 
      ? 'SELECT * FROM artists ORDER BY id'
      : 'SELECT * FROM artists WHERE deleted = 0 ORDER BY id';
    db.all(query, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  }),
  
  getDeleted: () => new Promise((resolve, reject) => {
    db.all('SELECT * FROM artists WHERE deleted = 1 ORDER BY deleted_at DESC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  }),
  
  getById: (id) => new Promise((resolve, reject) => {
    db.get('SELECT * FROM artists WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  }),
  
  create: (artist) => new Promise((resolve, reject) => {
    const { name, description, price, image } = artist;
    db.run('INSERT INTO artists (name, description, price, image) VALUES (?, ?, ?, ?)',
      [name, description || null, price, image || null],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...artist, orders_count: 0, deleted: 0 });
      });
  }),
  
  update: (id, artistData) => new Promise((resolve, reject) => {
    const { name, description, price, image } = artistData;
    db.run(
      'UPDATE artists SET name = ?, description = ?, price = ?, image = ? WHERE id = ?',
      [name, description || null, price, image || null, id],
      function(err) {
        if (err) reject(err);
        else resolve({ id, ...artistData });
      }
    );
  }),
  
  increaseOrderCount: (id, quantity = 1) => new Promise((resolve, reject) => {
    db.run(
      'UPDATE artists SET orders_count = orders_count + ? WHERE id = ?',
      [quantity, id],
      function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      }
    );
  }),
  
  softDelete: (id) => new Promise((resolve, reject) => {
    db.run('UPDATE artists SET deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ success: true, changes: this.changes });
    });
  }),
  
  restore: (id) => new Promise((resolve, reject) => {
    db.run('UPDATE artists SET deleted = 0, deleted_at = NULL WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ success: true, changes: this.changes });
    });
  }),
  
  permanentDelete: (id) => new Promise((resolve, reject) => {
    db.run('DELETE FROM artists WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ success: true, changes: this.changes });
    });
  })
};

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С УСЛУГАМИ =====
const services = {
  getAll: (includeDeleted = false) => new Promise((resolve, reject) => {
    const query = includeDeleted 
      ? 'SELECT * FROM services ORDER BY id'
      : 'SELECT * FROM services WHERE deleted = 0 ORDER BY id';
    db.all(query, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  }),
  
  getDeleted: () => new Promise((resolve, reject) => {
    db.all('SELECT * FROM services WHERE deleted = 1 ORDER BY deleted_at DESC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  }),
  
  getById: (id) => new Promise((resolve, reject) => {
    db.get('SELECT * FROM services WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  }),
  
  create: (service) => new Promise((resolve, reject) => {
    const { name, description, price } = service;
    db.run('INSERT INTO services (name, description, price) VALUES (?, ?, ?)',
      [name, description || null, price],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...service, orders_count: 0, deleted: 0 });
      });
  }),
  
  update: (id, serviceData) => new Promise((resolve, reject) => {
    const { name, description, price } = serviceData;
    db.run(
      'UPDATE services SET name = ?, description = ?, price = ? WHERE id = ?',
      [name, description || null, price, id],
      function(err) {
        if (err) reject(err);
        else resolve({ id, ...serviceData });
      }
    );
  }),
  
  increaseOrderCount: (id, quantity = 1) => new Promise((resolve, reject) => {
    db.run(
      'UPDATE services SET orders_count = orders_count + ? WHERE id = ?',
      [quantity, id],
      function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      }
    );
  }),
  
  softDelete: (id) => new Promise((resolve, reject) => {
    db.run('UPDATE services SET deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ success: true, changes: this.changes });
    });
  }),
  
  restore: (id) => new Promise((resolve, reject) => {
    db.run('UPDATE services SET deleted = 0, deleted_at = NULL WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ success: true, changes: this.changes });
    });
  }),
  
  permanentDelete: (id) => new Promise((resolve, reject) => {
    db.run('DELETE FROM services WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ success: true, changes: this.changes });
    });
  })
};

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С АКЦИЯМИ =====
const promotions = {
  getAll: (includeDeleted = false) => new Promise((resolve, reject) => {
    // Автоматически деактивируем просроченные акции
    const now = new Date().toISOString();
    db.run(`
      UPDATE promotions 
      SET active = 0 
      WHERE end_date IS NOT NULL AND end_date < ? AND active = 1
    `, [now], (err) => {
      if (err) console.error('Ошибка деактивации акций:', err);
    });
    
    const query = includeDeleted 
      ? 'SELECT * FROM promotions ORDER BY id'
      : 'SELECT * FROM promotions WHERE deleted = 0 ORDER BY id';
    db.all(query, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  }),
  
  getDeleted: () => new Promise((resolve, reject) => {
    db.all('SELECT * FROM promotions WHERE deleted = 1 ORDER BY deleted_at DESC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  }),
  
  getById: (id) => new Promise((resolve, reject) => {
    db.get('SELECT * FROM promotions WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  }),
  
  getActive: () => new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    // Автоматически деактивируем просроченные акции
    db.run(`
      UPDATE promotions 
      SET active = 0 
      WHERE end_date IS NOT NULL AND end_date < ? AND active = 1
    `, [now]);
    
    db.all(`
      SELECT * FROM promotions 
      WHERE deleted = 0 
        AND active = 1 
        AND (start_date IS NULL OR start_date <= ?)
        AND (end_date IS NULL OR end_date >= ?)
      ORDER BY id
    `, [now, now], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  }),
  
  create: (promotion) => new Promise((resolve, reject) => {
    const { 
      name, description, type, discount_type, discount_value, 
      buy_quantity, get_quantity, cashback_percent, target_type, 
      target_ids, image, start_date, end_date, active 
    } = promotion;
    db.run(`
      INSERT INTO promotions (
        name, description, type, discount_type, discount_value,
        buy_quantity, get_quantity, cashback_percent, target_type,
        target_ids, image, start_date, end_date, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, description || null, type || 'discount', discount_type || 'percentage', discount_value || 0,
      buy_quantity || 1, get_quantity || 1, cashback_percent || 0, target_type || 'all',
      target_ids || null, image || null, start_date || null, end_date || null, active !== undefined ? active : 1
    ], function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, ...promotion, deleted: 0 });
    });
  }),
  
  update: (id, promotionData) => new Promise((resolve, reject) => {
    const { 
      name, description, type, discount_type, discount_value,
      buy_quantity, get_quantity, cashback_percent, target_type,
      target_ids, image, start_date, end_date, active 
    } = promotionData;
    db.run(`
      UPDATE promotions SET 
        name = ?, description = ?, type = ?, discount_type = ?, discount_value = ?,
        buy_quantity = ?, get_quantity = ?, cashback_percent = ?, target_type = ?,
        target_ids = ?, image = ?, start_date = ?, end_date = ?, active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name, description || null, type || 'discount', discount_type || 'percentage', discount_value || 0,
      buy_quantity || 1, get_quantity || 1, cashback_percent || 0, target_type || 'all',
      target_ids || null, image || null, start_date || null, end_date || null, active !== undefined ? active : 1,
      id
    ], function(err) {
      if (err) reject(err);
      else resolve({ id, ...promotionData });
    });
  }),
  
  softDelete: (id) => new Promise((resolve, reject) => {
    db.run('UPDATE promotions SET deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ success: true, changes: this.changes });
    });
  }),
  
  restore: (id) => new Promise((resolve, reject) => {
    db.run('UPDATE promotions SET deleted = 0, deleted_at = NULL WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ success: true, changes: this.changes });
    });
  }),
  
  permanentDelete: (id) => new Promise((resolve, reject) => {
    db.run('DELETE FROM promotions WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ success: true, changes: this.changes });
    });
  })
};

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ПОЛЬЗОВАТЕЛЯМИ =====
const users = {
  getAll: () => new Promise((resolve, reject) => {
    db.all('SELECT id, username, email, role, avatar, bio, first_name, last_name, middle_name, nickname, birth_date, gender, last_login, created_at FROM users', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  }),
  
  getById: (id) => new Promise((resolve, reject) => {
    db.get('SELECT id, username, email, role, avatar, bio, first_name, last_name, middle_name, nickname, birth_date, gender, last_login, created_at FROM users WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  }),
  
  getByUsername: (username) => new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  }),
  
  getByEmail: (email) => new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  }),
  
  create: (user) => new Promise((resolve, reject) => {
    const { username, password, email, first_name, last_name, middle_name, nickname, birth_date, gender, avatar, role = 'user' } = user;
    db.run(`
      INSERT INTO users (username, password, email, role, avatar, first_name, last_name, middle_name, nickname, birth_date, gender)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      username, password, email, role, avatar || null,
      first_name || null, last_name || null, middle_name || null,
      nickname || username, birth_date || null, gender || null
    ], function(err) {
      if (err) reject(err);
      else {
        users.getById(this.lastID).then(resolve).catch(reject);
      }
    });
  }),
  
  update: (id, data) => new Promise((resolve, reject) => {
    const { avatar, bio, first_name, last_name, middle_name, nickname, birth_date, gender } = data;
    db.run(`
      UPDATE users SET 
        avatar = ?, bio = ?, first_name = ?, last_name = ?, 
        middle_name = ?, nickname = ?, birth_date = ?, gender = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [avatar || null, bio || null, first_name || null, last_name || null,
       middle_name || null, nickname || null, birth_date || null, gender || null, id],
      function(err) {
        if (err) reject(err);
        else {
          users.getById(id).then(resolve).catch(reject);
        }
      });
  }),
  
  updateLastLogin: (id) => new Promise((resolve, reject) => {
    db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve({ success: true });
    });
  })
};

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ЗАКАЗАМИ =====
const orders = {
  getAll: () => new Promise((resolve, reject) => {
    db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        console.error('❌ Ошибка получения заказов:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  }),

  getByUserEmail: (email) => new Promise((resolve, reject) => {
    db.all('SELECT * FROM orders WHERE user_email = ? ORDER BY created_at DESC', [email], (err, rows) => {
      if (err) {
        console.error('❌ Ошибка получения заказов пользователя:', err);
        reject(err);
      } else {
        console.log(`📦 Найдено заказов для ${email}: ${rows.length}`);
        resolve(rows);
      }
    });
  }),

  getById: (id) => new Promise((resolve, reject) => {
    db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('❌ Ошибка получения заказа:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  }),

  create: (order) => new Promise((resolve, reject) => {
    const {
      type, items, customer, delivery, event,
      payment, total, user_email
    } = order;

    const itemsJson = JSON.stringify(items);
    const deliveryJson = delivery ? JSON.stringify(delivery) : null;
    const eventJson = event ? JSON.stringify(event) : null;
    const orderData = JSON.stringify(order);
    
    const firstItem = items && items.length > 0 ? items[0] : {};
    const itemTitle = firstItem.title || firstItem.name || 'Заказ';
    const finalUserEmail = user_email || customer.email;
    
    const cardLast4 = payment.card_last4 || payment.cardNumber || '0000';
    const cardHolder = payment.card_holder || payment.cardHolder || 'Не указан';
    
    console.log('📝 Сохраняем заказ в БД:', {
      type,
      itemTitle,
      itemsCount: items.length,
      userEmail: finalUserEmail,
      notificationEmail: customer.email,
      total,
      cardLast4,
      cardHolder
    });

    db.all("PRAGMA table_info(orders)", (err, columns) => {
      if (err) {
        reject(err);
        return;
      }

      const columnNames = columns.map(col => col.name);
      const hasUserEmail = columnNames.includes('user_email');

      if (hasUserEmail) {
        db.run(`
          INSERT INTO orders (
            order_type, item_title, items_json, order_data,
            user_email,
            customer_name, customer_lastname, customer_email,
            delivery_json, event_json,
            card_last4, card_holder, total_price
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          type,
          itemTitle,
          itemsJson,
          orderData,
          finalUserEmail,
          customer.firstName,
          customer.lastName,
          customer.email,
          deliveryJson,
          eventJson,
          cardLast4,
          cardHolder,
          total
        ], function(err) {
          if (err) {
            console.error('❌ Ошибка SQL:', err);
            reject(err);
          } else {
            console.log('✅ Заказ сохранен с ID:', this.lastID);
            resolve({ id: this.lastID, ...order });
          }
        });
      } else {
        const enhancedOrderData = JSON.stringify({
          ...order,
          _userEmail: finalUserEmail
        });
        
        db.run(`
          INSERT INTO orders (
            order_type, item_title, items_json, order_data,
            customer_name, customer_lastname, customer_email,
            delivery_json, event_json,
            card_last4, card_holder, total_price
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          type,
          itemTitle,
          itemsJson,
          enhancedOrderData,
          customer.firstName,
          customer.lastName,
          customer.email,
          deliveryJson,
          eventJson,
          cardLast4,
          cardHolder,
          total
        ], function(err) {
          if (err) {
            console.error('❌ Ошибка SQL:', err);
            reject(err);
          } else {
            console.log('✅ Заказ сохранен с ID:', this.lastID);
            console.log('⚠️ Колонка user_email отсутствует, email сохранен в order_data');
            resolve({ id: this.lastID, ...order });
          }
        });
      }
    });
  })
};

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ИЗБРАННЫМ (пластинки) =====
const favorites = {
  getUserFavorites: (userId) => new Promise((resolve, reject) => {
    db.all(`
      SELECT v.* FROM vinyls v
      JOIN favorites f ON f.vinyl_id = v.id
      WHERE f.user_id = ? AND v.deleted = 0
      ORDER BY f.created_at DESC
    `, [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  }),

  add: (userId, vinylId) => new Promise((resolve, reject) => {
    db.run(
      'INSERT OR IGNORE INTO favorites (user_id, vinyl_id) VALUES (?, ?)',
      [userId, vinylId],
      function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      }
    );
  }),

  remove: (userId, vinylId) => new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM favorites WHERE user_id = ? AND vinyl_id = ?',
      [userId, vinylId],
      function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      }
    );
  }),

  isFavorite: (userId, vinylId) => new Promise((resolve, reject) => {
    db.get(
      'SELECT 1 FROM favorites WHERE user_id = ? AND vinyl_id = ?',
      [userId, vinylId],
      (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      }
    );
  })
};

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ИЗБРАННЫМИ НОВОСТЯМИ =====
const favoriteNews = {
  getUserFavoriteNews: (userId) => new Promise((resolve, reject) => {
    db.all(`
      SELECT n.* FROM news n
      JOIN favorite_news fn ON fn.news_id = n.id
      WHERE fn.user_id = ? AND n.deleted = 0
      ORDER BY fn.created_at DESC
    `, [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  }),

  add: (userId, newsId) => new Promise((resolve, reject) => {
    db.run(
      'INSERT OR IGNORE INTO favorite_news (user_id, news_id) VALUES (?, ?)',
      [userId, newsId],
      function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      }
    );
  }),

  remove: (userId, newsId) => new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM favorite_news WHERE user_id = ? AND news_id = ?',
      [userId, newsId],
      function(err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      }
    );
  })
};

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С СЕАНСАМИ =====
const sessions = {
  create: (userId, sessionData) => new Promise((resolve, reject) => {
    const { deviceInfo, ipAddress } = sessionData;
    db.run(
      'INSERT INTO user_sessions (user_id, device_info, ip_address) VALUES (?, ?, ?)',
      [userId, deviceInfo || null, ipAddress || null],
      function(err) {
        if (err) {
          console.error('❌ Ошибка создания сеанса:', err);
          reject(err);
        } else {
          console.log(`✅ Создан новый сеанс ID: ${this.lastID} для пользователя ${userId}`);
          resolve({ id: this.lastID });
        }
      }
    );
  }),

  getUserSessions: (userId) => new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM user_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId],
      (err, rows) => {
        if (err) {
          console.error('❌ Ошибка получения сеансов:', err);
          reject(err);
        } else {
          console.log(`📊 Получено ${rows.length} сеансов для пользователя ${userId}`);
          resolve(rows);
        }
      }
    );
  })
};

// ===== ФУНКЦИИ ДЛЯ ВОССТАНОВЛЕНИЯ ПАРОЛЯ =====
const passwordResets = {
  create: (email, token, expiresAt, login) => new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO password_resets (email, token, expires_at, login) VALUES (?, ?, ?, ?)',
      [email, token, expiresAt, login || null],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      }
    );
  }),

  getByToken: (token) => new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > CURRENT_TIMESTAMP',
      [token],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  }),

  markUsed: (token) => new Promise((resolve, reject) => {
    db.run(
      'UPDATE password_resets SET used = 1 WHERE token = ?',
      [token],
      function(err) {
        if (err) reject(err);
        else resolve({ success: true });
      }
    );
  })
};

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ОТЗЫВАМИ =====
const reviews = {
  create: (review) => new Promise((resolve, reject) => {
    const { entity_type, entity_id, user_id, user_name, rating, comment } = review;
    db.run(
      'INSERT INTO reviews (entity_type, entity_id, user_id, user_name, rating, comment, is_approved) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [entity_type, entity_id, user_id, user_name, rating, comment],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...review });
      }
    );
  }),

  getByEntity: (entity_type, entity_id) => new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM reviews WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC',
      [entity_type, entity_id],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  })
};

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С РЕЙТИНГАМИ =====
const ratings = {
  addOrUpdate: (entity_type, entity_id, user_id, rating) => new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO ratings (entity_type, entity_id, user_id, rating) 
       VALUES (?, ?, ?, ?) 
       ON CONFLICT(entity_type, entity_id, user_id) 
       DO UPDATE SET rating = ?`,
      [entity_type, entity_id, user_id, rating, rating],
      function(err) {
        if (err) reject(err);
        else resolve({ success: true });
      }
    );
  }),

  getAverage: (entity_type, entity_id) => new Promise((resolve, reject) => {
    db.get(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM ratings WHERE entity_type = ? AND entity_id = ?',
      [entity_type, entity_id],
      (err, row) => {
        if (err) reject(err);
        else resolve({ avg_rating: row?.avg_rating || 0, count: row?.count || 0 });
      }
    );
  })
};


const https = require('https');
const fs = require('fs');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'Kai22851080606/vinylshop';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GITHUB_FILE_PATH = 'vinyl-shop/server/database.sqlite';

function saveDatabaseToGitHub() {
  if (!GITHUB_TOKEN) {
    console.log('⚠️ GITHUB_TOKEN не настроен');
    return;
  }

  try {
    const dbPath = path.join(__dirname, 'database.sqlite');
    const dbBuffer = fs.readFileSync(dbPath);
    const dbBase64 = dbBuffer.toString('base64');

    const getFileOptions = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'vinyl-shop'
      }
    };

    const getReq = https.request(getFileOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        let sha = null;
        if (res.statusCode === 200) {
          try { sha = JSON.parse(body).sha; } catch (e) {}
        }

        const putData = JSON.stringify({
          message: `auto: database backup ${new Date().toISOString()}`,
          content: dbBase64,
          branch: GITHUB_BRANCH,
          ...(sha && { sha: sha })
        });

        const putOptions = {
          hostname: 'api.github.com',
          path: `/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
          method: 'PUT',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(putData),
            'User-Agent': 'vinyl-shop'
          }
        };

        const putReq = https.request(putOptions, (putRes) => {
          if (putRes.statusCode === 200 || putRes.statusCode === 201) {
            console.log('💾 База сохранена в GitHub!');
          }
        });

        putReq.on('error', (e) => console.error('Ошибка:', e.message));
        putReq.write(putData);
        putReq.end();
      });
    });

    getReq.on('error', (e) => console.error('Ошибка:', e.message));
    getReq.end();

  } catch (e) {
    console.error('Ошибка сохранения:', e.message);
  }
}

function restoreDatabaseFromGitHub() {
  const dbPath = path.join(__dirname, 'database.sqlite');
  
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    if (stats.size > 1000) {
      console.log('📦 Локальная база существует');
      return;
    }
  }
  
  if (!GITHUB_TOKEN) {
    console.log('⚠️ GITHUB_TOKEN не настроен');
    return;
  }
  
  console.log('📥 Загружаем базу из GitHub...');
  
  const options = {
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`,
    method: 'GET',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'vinyl-shop'
    }
  };
  
  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const data = JSON.parse(body);
          if (data.content) {
            fs.writeFileSync(dbPath, Buffer.from(data.content, 'base64'));
            console.log('✅ База восстановлена из GitHub!');
          }
        } catch (e) {
          console.error('Ошибка:', e.message);
        }
      }
    });
  });
  
  req.on('error', (e) => console.error('Ошибка:', e.message));
  req.end();
}

// Сохраняем каждые 5 минут
setInterval(saveDatabaseToGitHub, 60000);
// Первое сохранение через 30 секунд
setTimeout(saveDatabaseToGitHub, 30000);
// Восстановление при старте через 1 секунду
setTimeout(restoreDatabaseFromGitHub, 1000);

process.on('SIGTERM', () => { 
  console.log('🛑 Сервер останавливается, сохраняем базу...');
  saveDatabaseToGitHub(); 
  setTimeout(() => process.exit(0), 2000);
});

process.on('SIGINT', () => { 
  console.log('🛑 Сервер останавливается, сохраняем базу...');
  saveDatabaseToGitHub(); 
  setTimeout(() => process.exit(0), 2000);
});

module.exports = { vinyls, news, artists, services, promotions, users, orders, favorites, favoriteNews, sessions, passwordResets, reviews, ratings, db };
