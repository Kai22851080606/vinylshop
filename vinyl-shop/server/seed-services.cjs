// server/seed-services.cjs
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const servicesData = [
  {
    name: 'Заказать артиста на мероприятие',
    description: 'Пригласите любого артиста из нашего каталога на ваше мероприятие. Мы организуем полный цикл: от переговоров до технического райдера.',
    price: 'от 500 000 ₽'
  }
];

console.log('🎵 Начинаем добавление услуги...');

db.serialize(() => {
  db.get('SELECT COUNT(*) as count FROM services', (err, row) => {
    if (err) {
      console.error('Ошибка при проверке:', err);
      db.close();
      return;
    }
    
    if (row.count === 0) {
      const stmt = db.prepare('INSERT INTO services (name, description, price) VALUES (?, ?, ?)');
      servicesData.forEach((service) => {
        stmt.run([service.name, service.description, service.price], function(err) {
          if (err) console.error('Ошибка добавления:', err);
          else console.log(`✅ Добавлена услуга: ${service.name}`);
        });
      });
      stmt.finalize();
      
      setTimeout(() => {
        db.get('SELECT COUNT(*) as count FROM services', (err, row) => {
          console.log(`\n📊 Всего услуг в базе: ${row?.count || 0}`);
          db.close();
        });
      }, 1000);
    } else {
      console.log(`ℹ️ В базе уже есть услуги (${row.count}), пропускаем добавление`);
      db.close();
    }
  });
});