// server/seed.cjs
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Все 40 пластинок с типами и случайным количеством
const allVinyls = [
  ['Get The Knack (альбом)', 'The Knack', 1500, '/img/The Knack - Get The Knack.jpg', 'album', 12],
  ['Levels (EP)', 'Avicii', 1000, '/img/Avicii - Levels.jpg', 'ep', 8],
  ['Billy Tallent II (альбом)', 'Billy Tallent', 1500, '/img/Billy Tallent - Billy Tallent II.jpg', 'album', 5],
  ['In a Tidal Wave of Mystery (альбом)', 'Capital Cities', 1500, '/img/Capital Cities - In a Tidal Wave of Mystery.jpg', 'album', 3],
  ['Nothing But the Beat Ultimate (альбом)', 'David Guetta', 1500, '/img/David Guetta - Nothing But the Beat Ultimate.jpg', 'album', 10],
  ['÷ (альбом)', 'Ed Sheeran', 1500, '/img/Ed Sheeran - ÷.jpg', 'album', 15],
  ['The Death of Slim Shady (Coup de Grâce) (альбом)', 'Eminem', 1500, '/img/Eminem - The Death of Slim Shady (Coup de Grâce).jpg', 'album', 7],
  ['Good Feeling (сингл)', 'Flo Rida', 500, '/img/Flo Rida - Good Feeling.jpg', 'single', 20],
  ['Faceless (альбом)', 'Godsmack', 1500, '/img/Godsmack - Faceless.jpg', 'album', 4],
  ['Demon Days (альбом)', 'Gorillaz', 1500, '/img/Gorillaz - Demon Days.jpg', 'album', 6],
  ['Belly Dancer (сингл)', 'Imanbek, BYOR', 500, '/img/Imanbek, BYOR - Belly Dancer.jpg', 'single', 18],
  ['DAMN. (альбом)', 'Kendrick Lamar', 1500, '/img/Kendrick Lamar - DAMN..jpg', 'album', 9],
  ['Meteora (альбом)', 'Linkin Park', 1500, '/img/Linkin Park - Meteora.jpg', 'album', 2],
  ['Minutes to Midnight (альбом)', 'Linkin Park', 1500, '/img/Linkin Park - Minutes to Midnight.jpg', 'album', 1],
  ['Genius (EP)', 'TheFatRat, Shiah Maisel', 1000, '/img/TheFatRat, Shiah Maisel - Genius.jpg', 'ep', 11],
  ['The Calling (сингл)', 'TheFatRat feat. Laura Brehm', 500, '/img/TheFatRat feat. Laura Brehm - The Calling.jpg', 'single', 14],
  ['Save Me, San Francisco (Golden Gate Edition) (альбом)', 'Train', 1500, '/img/Train - Save Me, San Francisco (Golden Gate Edition).jpg', 'album', 3],
  ['All Hope Is Gone (альбом)', 'Slipknot', 1500, '/img/Slipknot - All Hope Is Gone.jpg', 'album', 0],
  ['Three Nil (альбом)', 'Slipknot', 1500, '/img/Slipknot - Three Nil.jpg', 'album', 5],
  ['Avenged Sevenfold (альбом)', 'Avenged Sevenfold', 1500, '/img/Avenged Sevenfold - Avenged Sevenfold.jpg', 'album', 8],
  ['DNCE (альбом)', 'DNCE', 1500, '/img/DNCE - DNCE.jpg', 'album', 12],
  ['Raising Hell (альбом)', 'Run-D.M.C.', 1500, '/img/Run-D.M.C. - Raising Hell.jpg', 'album', 4],
  ['Весточка (альбом)', 'Бутырка', 1500, '/img/Бутырка - Весточка.jpg', 'album', 7],
  ['А для вас я никто (альбом)', 'Бутырка', 1500, '/img/Бутырка - А для вас я никто.jpg', 'album', 2],
  ['Кредо (альбом)', 'GAYAZOV$ BROTHER$', 1500, '/img/GAYAZOV$ BROTHER$ - Кредо.jpg', 'album', 9],
  ['Recovery (альбом)', 'Eminem', 1500, '/img/Eminem - Recovery.jpg', 'album', 6],
  ['Made in Germany (альбом)', 'Rammstein', 1500, '/img/Rammstein - Made in Germany.jpg', 'album', 10],
  ['Rammstein (альбом)', 'Rammstein', 1500, '/img/Rammstein - Rammstein.jpg', 'album', 13],
  ['Thriller (альбом)', 'Michael Jackson', 1500, '/img/Michael Jackson - Thriller.jpg', 'album', 20],
  ['Gentleman (сингл)', 'PSY', 500, '/img/PSY - Gentleman.jpg', 'single', 25],
  ['News of the World (альбом)', 'Queen', 1500, '/img/Queen - News of the World.jpg', 'album', 8],
  ['Ля (EP)', 'Смешарики', 1000, '/img/Смешарики - Ля.jpg', 'ep', 15],
  ['Ремиксы III (альбом)', 'Смешарики', 1500, '/img/Смешарики - Ремиксы III.jpg', 'album', 12],
  ['Calm Down (сингл)', 'Rema, Selena Gomez', 500, '/img/Rema, Selena Gomez - Calm Down.jpg', 'single', 30],
  ['The Perfect Crime (сингл)', 'zebrahead', 500, '/img/zebrahead - The Perfect Crime.jpg', 'single', 22],
  ['Welcome To The Internet (EP)', 'Oliver Tree, Little Big', 1000, '/img/Oliver Tree, Little Big - Welcome To The Internet.jpg', 'ep', 17],
  ['Toxicity (альбом)', 'System of A Down', 1500, '/img/System of A Down - Toxicity.jpg', 'album', 0],
  ['Sleeping With the Past (альбом)', 'Elton John', 1500, '/img/Elton John - Sleeping With the Past.jpg', 'album', 5],
  ['Dynasty (альбом)', 'Kiss', 1500, '/img/Kiss - Dynasty.jpg', 'album', 3],
  ['After Hours (альбом)', 'The Weeknd', 1500, '/img/The Weeknd - After Hours.jpg', 'album', 11]
];

console.log('🚀 Начинаем заполнение базы данных...');

db.serialize(() => {
  // Создаем таблицу vinyls с полями type и stock
  db.run(`
    CREATE TABLE IF NOT EXISTS vinyls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      price INTEGER NOT NULL,
      image TEXT,
      type TEXT DEFAULT 'album',
      stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Очищаем таблицу
  db.run('DELETE FROM vinyls', function(err) {
    if (err) console.error('Ошибка при очистке:', err);
    else console.log('✅ Таблица очищена');
  });
  
  // Добавляем все 40 пластинок с количеством
  const stmt = db.prepare('INSERT INTO vinyls (title, artist, price, image, type, stock) VALUES (?, ?, ?, ?, ?, ?)');
  
  allVinyls.forEach((vinyl, index) => {
    stmt.run(vinyl, function(err) {
      if (err) console.error(`Ошибка при добавлении ${index + 1}:`, err);
    });
  });
  
  // Проверяем сколько добавилось
  setTimeout(() => {
    db.get('SELECT COUNT(*) as count FROM vinyls', (err, row) => {
      if (err) console.error('Ошибка при подсчете:', err);
      else console.log(`✅ Добавлено ${row.count} пластинок в базу данных`);
    });
    
    // Показываем распределение по типам
    db.all("SELECT type, COUNT(*) as count FROM vinyls GROUP BY type", (err, rows) => {
      if (err) console.error('Ошибка при проверке типов:', err);
      else {
        console.log('\n📊 Распределение по типам:');
        rows.forEach(row => console.log(`  ${row.type}: ${row.count}`));
      }
    });

    // Показываем статистику по наличию
    db.all("SELECT SUM(stock) as total, COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock FROM vinyls", (err, rows) => {
      if (err) console.error('Ошибка при проверке наличия:', err);
      else {
        console.log('\n📦 Статистика наличия:');
        console.log(`  Всего пластинок на складе: ${rows[0].total} шт.`);
        console.log(`  Нет в наличии: ${rows[0].out_of_stock} шт.`);
      }
    });
  }, 500);
});

setTimeout(() => {
  db.close();
  console.log('\n✅ База данных успешно создана!');
}, 2000);