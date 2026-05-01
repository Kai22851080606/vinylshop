// server/seed-artists.cjs
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const artistsData = [
  { name: 'Avenged Sevenfold', price: 1500000, image: '/img/artists/Avenged Sevenfold.jpg', description: 'Американская метал-группа из Хантингтон-Бич (Калифорния). Известна разнообразным рок-звучанием и драматическими образами на обложках альбомов и товарах.' },
  { name: 'Billy Talent', price: 1500000, image: '/img/artists/Billy Talent.jpg', description: 'Канадская рок-группа из Миссиссоги (Онтарио). Жанры — альтернативный рок, панк-рок.' },
  { name: 'Capital Cities', price: 1500000, image: '/img/artists/Capital Cities.jpg', description: 'Американский инди-поп-дуэт из Лос-Анджелеса (штат Калифорния). Участники — Райан Мерчант (вокал, клавишные, гитара) и Себу Симонян (вокал, клавишные).' },
  { name: 'David Guetta', price: 500000, image: '/img/artists/David Guetta.jpg', description: 'Французский диджей и продюсер.' },
  { name: 'DNCE', price: 1500000, image: '/img/artists/DNCE.jpg', description: 'Американская поп-группа в жанрах фанк, поп, поп-рок, дэнс-рок. Лейбл — Republic Records.' },
  { name: 'Ed Sheeran', price: 500000, image: '/img/artists/Ed Sheeran.jpg', description: 'Британский певец, автор песен, музыкант, звукозаписывающий продюсер, актёр и бизнесмен.' },
  { name: 'Eminem', price: 500000, image: '/img/artists/Eminem.jpg', description: 'Американский рэпер, автор-исполнитель, композитор, музыкальный продюсер и актёр. Также известен альтер эго — Слим Шейди (англ. Slim Shady).' },
  { name: 'Flo Rida', price: 500000, image: '/img/artists/Flo Rida.jpg', description: 'Американский рэпер, псевдоним — Трэмар Диллард. Известен стилем, сочетающим хип-хоп с элементами поп-музыки и электроники.' },
  { name: 'GAYAZOV$ BROTHER$', price: 1500000, image: '/img/artists/GAYAZOV$ BROTHER$.jpg', description: 'Российский музыкальный дуэт. Работает в жанрах современного попа, ритм-энд-блюза, рэпа, хип-хопа и дип-хауса.' },
  { name: 'Gorillaz', price: 1500000, image: '/img/artists/Gorillaz.jpg', description: 'Британская виртуальная группа. Проект включает в себя обширную вымышленную вселенную.' },
  { name: 'Imanbek', price: 500000, image: '/img/artists/Imanbek.jpg', description: 'Казахстанский диджей и музыкальный продюсер. Полное имя — Иманбек Маратович Зейкенов.' },
  { name: 'Kendrick Lamar', price: 500000, image: '/img/artists/Kendrick Lamar.jpg', description: 'Американский рэпер, автор песен и музыкальный продюсер. Считается одним из наиболее влиятельных представителей современного хип-хопа.' },
  { name: 'Linkin Park', price: 1500000, image: '/img/artists/Linkin Park.jpg', description: 'Американская рок-группа, исполняющая музыку в стилях альтернативный рок, ню-метал, альтернативный метал и другие.' },
  { name: 'Selena Gomez', price: 500000, image: '/img/artists/Selena Gomez.jpg', description: 'Американская певица, автор песен, актриса кино, телевидения и озвучивания, продюсер, предприниматель.' },
  { name: 'System of A Down', price: 15000000, image: '/img/artists/System of A Down.jpg', description: 'Армяно-американская альтернатив-метал-группа. Все участники имеют армянское происхождение.' },
  { name: 'TheFatRat', price: 500000, image: '/img/artists/TheFatRat.jpg', description: 'Немецкий продюсер и музыкант.' },
  { name: 'Бутырка', price: 1500000, image: '/img/artists/Бутырка.jpg', description: 'Российская музыкальная группа, исполняющая песни в жанрах русский шансон, блатная песня и городской романс.' },
  { name: 'СмешBand', price: 1500000, image: '/img/artists/СмешBand.jpg', description: 'Проект СмешBand создан в 2015 году композиторами «Смешариков» Мариной Ланда и Сергеем Васильевым.' }
];

console.log('🎤 Начинаем добавление артистов...');

db.serialize(() => {
  db.get('SELECT COUNT(*) as count FROM artists', (err, row) => {
    if (err) {
      console.error('Ошибка при проверке:', err);
      db.close();
      return;
    }
    
    if (row.count === 0) {
      const stmt = db.prepare('INSERT INTO artists (name, description, price, image) VALUES (?, ?, ?, ?)');
      artistsData.forEach((artist) => {
        stmt.run([artist.name, artist.description, artist.price, artist.image], function(err) {
          if (err) console.error('Ошибка добавления:', err);
          else console.log(`✅ Добавлен артист: ${artist.name}`);
        });
      });
      stmt.finalize();
      
      setTimeout(() => {
        db.get('SELECT COUNT(*) as count FROM artists', (err, row) => {
          console.log(`\n📊 Всего артистов в базе: ${row?.count || 0}`);
          db.close();
        });
      }, 1000);
    } else {
      console.log(`ℹ️ В базе уже есть артисты (${row.count}), пропускаем добавление`);
      db.close();
    }
  });
});