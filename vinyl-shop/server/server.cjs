// server/server.cjs
const express = require('express');
const cors = require('cors');
const { vinyls, news, artists, services, promotions, users, orders, favorites, favoriteNews, sessions, passwordResets, reviews, ratings, db } = require('./db.cjs');
const emailjs = require('@emailjs/nodejs'); // Используйте require для .cjs

emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});


const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ===== Корневой маршрут =====
app.get('/', (req, res) => {
  res.json({ message: 'vinyl-shop API работает!' });
});

// ===== Функция форматирования даты =====
function formatDateInTimeZone(timestamp, timeZone) {
  const date = new Date(timestamp);
  const dateOptions = {
    timeZone: timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const timeOptions = {
    timeZone: timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  const formattedDate = date.toLocaleDateString('ru-RU', dateOptions);
  const formattedTime = date.toLocaleTimeString('ru-RU', timeOptions);
  return `${formattedDate} ${formattedTime}`;
}

// ===== Функция генерации HTML для письма с кнопкой подтверждения заказа =====
function generateOrderEmail(orderData, orderId) {
  const { type, items, customer, delivery, event, total, payment, clientTimestamp, clientTimeZone } = orderData;
  
  const orderTime = clientTimestamp && clientTimeZone 
    ? formatDateInTimeZone(clientTimestamp, clientTimeZone)
    : new Date().toLocaleString('ru-RU', { 
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
      });
  
  const orderNumber = orderId || Date.now().toString().slice(-8);
  const confirmUrl = `/confirm-order/${orderNumber}`;
  
  const isServiceOrder = type === 'service';
  const columnHeader = isServiceOrder ? 'Услуга' : 'Товар';
  
  const itemsHtml = items.map(item => {
    const quantity = item.quantity || 1;
    const itemPrice = item.price || 0;
    const totalItemPrice = itemPrice * quantity;
    
    if (type === 'vinyl') {
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
            <div style="display: flex; align-items: flex-start; gap: 15px;">
              <span style="font-size: 24px;">💿</span>
              <div>
                <div style="font-weight: 600; color: #1e293b;">${escapeHtml(item.title)}</div>
                <div style="color: #64748b; font-size: 14px; margin-bottom: 8px;">${escapeHtml(item.artist)}</div>
                <div style="background: #eff6ff; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-top: 4px;">
                  <span style="color: #2563eb; font-weight: 600; font-size: 13px;">Количество: ${quantity} шт.</span>
                </div>
              </div>
            </div>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; vertical-align: top;">
            <div style="font-weight: 700; color: #2563eb; font-size: 18px;">${totalItemPrice} ₽</div>
            <div style="color: #64748b; font-size: 12px; margin-top: 4px;">${itemPrice} ₽ × ${quantity}</div>
          </td>
        </tr>
      `;
    } else {
      const isArtist = item.artist && item.artist.trim() !== '';
      const itemTitle = isArtist 
        ? `Заказать на мероприятие артиста ${escapeHtml(item.name)}`
        : escapeHtml(item.name || 'Услуга');
      const itemType = isArtist ? 'Услуга артиста' : 'Услуга';
      
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
            <div style="display: flex; align-items: center; gap: 15px;">
              <span style="font-size: 24px;">🎤</span>
              <div>
                <div style="font-weight: 600; color: #1e293b;">${itemTitle}</div>
                <div style="color: #64748b; font-size: 14px;">${itemType}</div>
              </div>
            </div>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600; color: #2563eb;">
            ${itemPrice} ₽
          </td>
        </tr>
      `;
    }
  }).join('');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
        .content { padding: 30px; }
        .badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; margin-bottom: 20px; }
        .order-time { text-align: center; color: #64748b; font-size: 14px; margin-bottom: 20px; padding: 10px; background: #f8fafc; border-radius: 8px; }
        .section-title { font-size: 18px; font-weight: 700; color: #1e293b; margin: 25px 0 15px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .info-box { background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; }
        .info-box.full-width { grid-column: span 2; }
        .label { color: #64748b; font-size: 13px; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { color: #1e293b; font-weight: 600; font-size: 16px; }
        .total-box { background: #dbeafe; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center; }
        .total-label { color: #1e40af; font-size: 16px; margin-bottom: 5px; }
        .total-price { font-size: 36px; font-weight: 800; color: #1e40af; }
        .footer { text-align: center; padding: 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; color: #64748b; }
        .footer p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; }
        .confirm-box { background: #f0fdf4; padding: 25px; border-radius: 10px; margin: 25px 0; border: 2px solid #22c55e; text-align: center; }
        .confirm-box h3 { color: #166534; margin: 0 0 15px; font-size: 20px; }
        .confirm-box p { color: #166534; margin: 0 0 20px; }
        .confirm-button { display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 15px 40px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 18px; box-shadow: 0 4px 10px rgba(34, 197, 94, 0.3); transition: all 0.3s; }
        .confirm-button:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(34, 197, 94, 0.4); }
        .warning-box { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fbbf24; text-align: center; }
        .warning-box p { color: #92400e; margin: 0; font-size: 14px; }
        .pickup-info { background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
        .pickup-info p { color: #475569; margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 vinyl-shop</h1>
          <p>Ваш заказ ожидает подтверждения</p>
        </div>
        
        <div class="content">
          <div style="text-align: center;">
            <span class="badge">Заказ #${orderNumber}</span>
          </div>
          
          <div class="warning-box">
            <p>⚠️ Заказ будет обработан только после подтверждения!</p>
          </div>
          
          <div class="confirm-box">
            <h3>✅ ПОДТВЕРДИТЕ ЗАКАЗ</h3>
            <p>Нажмите на кнопку ниже, чтобы подтвердить ваш заказ:</p>
            <a href="${confirmUrl}" class="confirm-button">ПОДТВЕРДИТЬ ЗАКАЗ</a>
          </div>
          
          <div class="order-time">
            🕐 Дата и время заказа: <strong>${orderTime}</strong>
          </div>

          <div class="section-title">🛒 Состав заказа</div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 12px; background: #f1f5f9; color: #475569; font-weight: 600;">${columnHeader}</th>
                <th style="text-align: right; padding: 12px; background: #f1f5f9; color: #475569; font-weight: 600;">Сумма</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total-box">
            <div class="total-label">Итого к оплате</div>
            <div class="total-price">${total} ₽</div>
          </div>

          <div class="section-title">👤 Данные получателя</div>
          <div class="info-grid">
            <div class="info-box">
              <div class="label">Имя</div>
              <div class="value">${escapeHtml(customer.firstName)} ${escapeHtml(customer.lastName)}</div>
            </div>
            <div class="info-box">
              <div class="label">Email</div>
              <div class="value">${escapeHtml(customer.email)}</div>
            </div>
          </div>

          ${delivery && delivery.method === 'delivery' ? `
            <div class="section-title">📦 Адрес доставки</div>
            <div class="info-box full-width">
              <div class="label">Адрес</div>
              <div class="value">${escapeHtml(delivery.address)}</div>
              <div style="color: #64748b; margin-top: 8px;">${escapeHtml(delivery.city)}, ${escapeHtml(delivery.country)}, ${escapeHtml(delivery.zipCode)}</div>
            </div>
          ` : ''}
          
          ${delivery && delivery.method === 'pickup' ? `
            <div class="section-title">📍 Самовывоз</div>
            <div class="pickup-info">
              <p><strong>Магазин vinyl-shop</strong></p>
              <p>Москва, ул. Пушкина, д. 9</p>
              <p style="font-size: 13px; color: #64748b;">Ежедневно с 10:00 до 22:00</p>
            </div>
          ` : ''}

          ${event ? `
            <div class="section-title">🎪 Детали мероприятия</div>
            <div class="info-grid">
              <div class="info-box full-width">
                <div class="label">Адрес проведения</div>
                <div class="value">${escapeHtml(event.address)}</div>
              </div>
              <div class="info-box">
                <div class="label">Дата</div>
                <div class="value">${escapeHtml(event.date)}</div>
              </div>
              <div class="info-box">
                <div class="label">Время</div>
                <div class="value">${escapeHtml(event.time)}</div>
              </div>
            </div>
          ` : ''}

          <div class="section-title">💳 Платёжные данные</div>
          <div class="info-grid">
            <div class="info-box">
              <div class="label">Способ оплаты</div>
              <div class="value">${payment?.method === 'card' ? 'Банковская карта' : 'Наличными при получении'}</div>
            </div>
            ${payment?.method === 'card' ? `
            <div class="info-box">
              <div class="label">Карта</div>
              <div class="value">**** **** **** ${payment?.card_last4 || payment?.cardNumber || '0000'}</div>
            </div>
            ` : ''}
          </div>

          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #93c5fd;">
            <p style="color: #1e40af; margin: 0; text-align: center; font-weight: 500;">
              📧 После подтверждения заказа мы начнём его обработку.
            </p>
          </div>
        </div>

        <div class="footer">
          <p>Спасибо, что выбрали vinyl-shop! 💿</p>
          <p style="font-size: 12px;">Это письмо сформировано автоматически. Для подтверждения заказа нажмите на кнопку выше.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ===== Функция генерации HTML для письма восстановления пароля =====
function generateResetPasswordEmail(resetUrl, login) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
        .content { padding: 30px; }
        .warning-box { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fbbf24; text-align: center; }
        .warning-box p { color: #92400e; margin: 0; font-size: 14px; }
        .reset-box { background: #f0fdf4; padding: 25px; border-radius: 10px; margin: 25px 0; border: 2px solid #22c55e; text-align: center; }
        .reset-box h3 { color: #166534; margin: 0 0 15px; font-size: 20px; }
        .reset-box p { color: #166534; margin: 0 0 20px; }
        .reset-button { display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 15px 40px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 18px; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3); transition: all 0.3s; }
        .reset-button:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(245, 158, 11, 0.4); }
        .footer { text-align: center; padding: 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; color: #64748b; }
        .footer p { margin: 5px 0; }
        .expire-notice { text-align: center; color: #64748b; font-size: 13px; margin: 15px 0; padding: 10px; background: #f8fafc; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 vinyl-shop</h1>
          <p>Восстановление пароля</p>
        </div>
        
        <div class="content">
          <div class="warning-box">
            <p>⚠️ Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.</p>
          </div>
          
          <div class="reset-box">
            <h3>🔑 СБРОС ПАРОЛЯ</h3>
            <p>Для аккаунта <strong>${escapeHtml(login)}</strong></p>
            <p>Нажмите на кнопку ниже, чтобы установить новый пароль:</p>
            <a href="${resetUrl}" class="reset-button">СМЕНИТЬ ПАРОЛЬ</a>
          </div>
          
          <div class="expire-notice">
            ⏰ Ссылка действительна в течение <strong>1 часа</strong>
          </div>

          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #93c5fd;">
            <p style="color: #1e40af; margin: 0; text-align: center; font-weight: 500;">
              📧 После смены пароля вы сможете войти в аккаунт с новым паролем.
            </p>
          </div>
        </div>

        <div class="footer">
          <p>Спасибо, что выбрали vinyl-shop! 💿</p>
          <p style="font-size: 12px;">Это письмо сформировано автоматически. Отвечать на него не нужно.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===== Функция отправки email для заказа =====
async function sendOrderEmail(orderData, userEmail, orderId) {
  try {
    console.log(`📧 Попытка отправки письма заказа на: ${userEmail}`);

    if (!userEmail || !orderId || !orderData) {
      throw new Error('Missing required parameters for order email');
    }
    
    // orderNumber = orderId (просто используем orderId напрямую)
    
    let itemsHtml = '';
    try {
      const items = orderData.items || [];
        
      if (items.length > 0) {
        itemsHtml = items.map(item => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
              ${item.title || 'Пластинка'} — ${item.artist || 'Артист'}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600;">
              ${(item.price || 0) * (item.quantity || 1)} ₽
            </td>
          </tr>
        `).join('');
      } else {
        itemsHtml = '<tr><td colspan="2" style="padding: 12px; text-align: center;">Детали заказа уточняются</td></tr>';
      }
    } catch (e) {
      console.error('Ошибка парсинга товаров:', e);
      itemsHtml = '<tr><td colspan="2" style="padding: 12px; text-align: center;">Ошибка обработки списка товаров</td></tr>';
    }

    const isCash = orderData.payment?.method === 'cash' || !orderData.payment?.method;
    const paymentMethodText = isCash ? 'Наличными при получении' : 'Банковская карта';
    const cardInfoText = isCash ? 'Не требуется' : (orderData.payment?.card_last4 ? `**** **** **** ${orderData.payment.card_last4}` : 'Карта не указана');

    const response = await emailjs.send(
      'service_7fk0keo',
      'template_nidbyz6',
      {
        to_email: userEmail,
        order_id: orderId,
        confirm_url: `https://vinyl-shop-pea6.onrender.com/api/orders/confirm/${orderId}`,
        order_time: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }),
        column_header: 'Наименование товара',
        items_html: itemsHtml,
        total: orderData.total || 0,
        customer_name: `${orderData.customer?.firstName || ''} ${orderData.customer?.lastName || ''}`.trim() || 'Уважаемый клиент',
        customer_email: userEmail,
        payment_method: paymentMethodText,
        card_info: cardInfoText
      }
    );

    console.log('✅ Email успешно отправлен!');
    return { success: true };
  } catch (error) {
    const errorMsg = error?.text || error?.message || 'Unknown EmailJS Error';
    console.error('❌ Ошибка EmailJS (Заказ):', errorMsg);
    return { success: false, error: errorMsg };
  }
}

// ===== Функция отправки email для восстановления пароля =====
async function sendResetPasswordEmail(userEmail, resetUrl, login) {
  try {
    console.log(`📧 Попытка отправки письма восстановления на: ${userEmail}`);

    if (!userEmail || !resetUrl || !login) {
      throw new Error('Missing required parameters for reset email');
    }

    // Формируем полную ссылку для кнопки
    const fullResetUrl = `https://vinyl-shop-pea6.onrender.com/reset-password?token=${resetUrl}`;

    const response = await emailjs.send(
      'service_7fk0keo',
      'template_26u1aya',
      {
        to_email: userEmail,
        user_login: login,
        reset_link: fullResetUrl,
        subject: '🔐 vinyl-shop: восстановление пароля',
        button_url: fullResetUrl  // отдельная переменная для кнопки
      }
    );

    console.log('✅ Письмо восстановления отправлено!');
    return { success: true };
  } catch (error) {
    const errorMsg = error?.text || error?.message || 'Unknown EmailJS Error';
    console.error('❌ Ошибка EmailJS (Пароль):', errorMsg);
    return { success: false, error: errorMsg };
  }
}

// ===== Пластинки =====
app.get('/api/vinyls', async (req, res) => {
  try {
    const data = await vinyls.getAll(false);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/vinyls/deleted', async (req, res) => {
  try {
    const data = await vinyls.getDeleted();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/vinyls/:id', async (req, res) => {
  try {
    const vinyl = await vinyls.getById(req.params.id);
    vinyl ? res.json(vinyl) : res.status(404).json({ error: 'Not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vinyls', async (req, res) => {
  try {
    const vinyl = await vinyls.create(req.body);
    res.json(vinyl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/vinyls/:id', async (req, res) => {
  try {
    const vinylData = req.body;
    const result = await vinyls.update(req.params.id, vinylData);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vinyls/:id', async (req, res) => {
  try {
    const result = await vinyls.softDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vinyls/:id/restore', async (req, res) => {
  try {
    const result = await vinyls.restore(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vinyls/:id/permanent', async (req, res) => {
  try {
    const result = await vinyls.permanentDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Новости =====
app.get('/api/news', async (req, res) => {
  try {
    const data = await news.getAll(false);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/news/deleted', async (req, res) => {
  try {
    const data = await news.getDeleted();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/news/:id', async (req, res) => {
  try {
    const singleNews = await news.getById(req.params.id);
    if (singleNews) {
      res.json(singleNews);
    } else {
      res.status(404).json({ error: 'News not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/news', async (req, res) => {
  try {
    const item = await news.create(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/news/:id', async (req, res) => {
  try {
    const newsData = req.body;
    console.log('📝 Обновление новости ID:', req.params.id);
    const result = await news.update(req.params.id, newsData);
    res.json(result);
  } catch (err) {
    console.error('❌ Ошибка обновления новости:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/news/:id', async (req, res) => {
  try {
    const result = await news.softDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/news/:id/restore', async (req, res) => {
  try {
    const result = await news.restore(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/news/:id/permanent', async (req, res) => {
  try {
    const result = await news.permanentDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Артисты =====
app.get('/api/artists', async (req, res) => {
  try {
    const data = await artists.getAll(false);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/artists/deleted', async (req, res) => {
  try {
    const data = await artists.getDeleted();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/artists/:id', async (req, res) => {
  try {
    const artist = await artists.getById(req.params.id);
    artist ? res.json(artist) : res.status(404).json({ error: 'Not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/artists', async (req, res) => {
  try {
    const artist = await artists.create(req.body);
    res.json(artist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/artists/:id', async (req, res) => {
  try {
    const artistData = req.body;
    const result = await artists.update(req.params.id, artistData);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/artists/:id', async (req, res) => {
  try {
    const result = await artists.softDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/artists/:id/restore', async (req, res) => {
  try {
    const result = await artists.restore(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/artists/:id/permanent', async (req, res) => {
  try {
    const result = await artists.permanentDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/news/:id/view', async (req, res) => {
  try {
    await news.incrementViews(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Услуги =====
app.get('/api/services', async (req, res) => {
  try {
    const data = await services.getAll(false);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/services/deleted', async (req, res) => {
  try {
    const data = await services.getDeleted();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/services/:id', async (req, res) => {
  try {
    const service = await services.getById(req.params.id);
    service ? res.json(service) : res.status(404).json({ error: 'Not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const service = await services.create(req.body);
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const serviceData = req.body;
    const result = await services.update(req.params.id, serviceData);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const result = await services.softDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/services/:id/restore', async (req, res) => {
  try {
    const result = await services.restore(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/services/:id/permanent', async (req, res) => {
  try {
    const result = await services.permanentDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== АКЦИИ =====
app.get('/api/promotions', async (req, res) => {
  try {
    const data = await promotions.getAll(false);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/promotions/active', async (req, res) => {
  try {
    const data = await promotions.getActive();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/promotions/deleted', async (req, res) => {
  try {
    const data = await promotions.getDeleted();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/promotions/:id', async (req, res) => {
  try {
    const promotion = await promotions.getById(req.params.id);
    promotion ? res.json(promotion) : res.status(404).json({ error: 'Not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/promotions', async (req, res) => {
  try {
    const promotion = await promotions.create(req.body);
    res.json(promotion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/promotions/:id', async (req, res) => {
  try {
    const promotionData = req.body;
    const result = await promotions.update(req.params.id, promotionData);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/promotions/:id', async (req, res) => {
  try {
    const result = await promotions.softDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/promotions/:id/restore', async (req, res) => {
  try {
    const result = await promotions.restore(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/promotions/:id/permanent', async (req, res) => {
  try {
    const result = await promotions.permanentDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ОТЗЫВЫ (МОДЕРАЦИЯ) =====
app.get('/api/reviews/pending', async (req, res) => {
  try {
    db.all('SELECT * FROM reviews WHERE is_approved = 0 ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        console.error('Ошибка получения отзывов:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reviews/approved', async (req, res) => {
  try {
    db.all('SELECT * FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        console.error('Ошибка получения одобренных отзывов:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reviews/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    db.all(
      'SELECT * FROM reviews WHERE entity_type = ? AND entity_id = ? AND is_approved = 1 ORDER BY created_at DESC',
      [entityType, entityId],
      (err, rows) => {
        if (err) {
          console.error('Ошибка получения отзывов:', err);
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { entity_type, entity_id, user_id, user_name, rating, comment } = req.body;
    
    db.run(
      'INSERT INTO reviews (entity_type, entity_id, user_id, user_name, rating, comment, is_approved) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [entity_type, entity_id, user_id, user_name, rating, comment],
      function(err) {
        if (err) {
          console.error('Ошибка создания отзыва:', err);
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID, message: 'Отзыв отправлен на модерацию' });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    db.run('UPDATE reviews SET is_approved = 1 WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Ошибка одобрения отзыва:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Отзыв одобрен' });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reviews/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    db.run('DELETE FROM reviews WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Ошибка отклонения отзыва:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Отзыв отклонён и удалён' });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Авторизация и пользователи =====
app.post('/api/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    console.log('🔐 Попытка входа:', { login, password });
    
    const user = await users.getByUsername(login);
    
    if (!user) {
      console.log('❌ Пользователь не найден:', login);
      return res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
    }
    
    console.log('👤 Найден пользователь:', user.username);
    console.log('🔑 Пароль в БД:', user.password);
    console.log('🔑 Введенный пароль:', password);
    
    const isValidPassword = (password === user.password);
    
    console.log('✅ Пароль верный?', isValidPassword);
    
    if (isValidPassword) {
      const { password, ...userWithoutPassword } = user;
      
      await users.updateLastLogin(user.id);
      
      try {
        const deviceInfo = req.headers['user-agent'] || 'Unknown';
        const ipAddress = req.ip || req.socket.remoteAddress || 'Unknown';
        
        console.log('📝 Создаем новый сеанс для пользователя:', user.id);
        console.log('   Устройство:', deviceInfo);
        console.log('   IP:', ipAddress);
        
        await sessions.create(user.id, {
          deviceInfo: deviceInfo,
          ipAddress: ipAddress
        });
        
        console.log('✅ Новый сеанс создан');
      } catch (sessionErr) {
        console.error('❌ Ошибка создания сеанса:', sessionErr.message);
      }
      
      console.log('✅ Вход выполнен успешно для:', user.username);
      res.json({ success: true, user: userWithoutPassword });
    } else {
      console.log('❌ Неверный пароль для:', user.username);
      res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
    }
  } catch (err) {
    console.error('❌ Ошибка при входе:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, middle_name, nickname, birth_date, gender, avatar } = req.body;
    
    const existingUsername = await users.getByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Логин уже занят' });
    }
    
    const existingEmail = await users.getByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email уже зарегистрирован' });
    }
    
    const user = await users.create({ 
      username, password, email, first_name, last_name, middle_name, 
      nickname, birth_date, gender, avatar, role: 'user' 
    });
    res.json({ success: true, user });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await users.getById(req.params.id);
    user ? res.json(user) : res.status(404).json({ error: 'User not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { birth_date, bio, avatar, first_name, last_name, middle_name, nickname, gender } = req.body;
    const updatedUser = await users.update(req.params.id, { 
      birth_date, bio, avatar, first_name, last_name, middle_name, nickname, gender 
    });
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const allUsers = await users.getAll();
    res.json(allUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Избранные новости =====
app.get('/api/favorite-news/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const newsList = await favoriteNews.getUserFavoriteNews(userId);
    res.json(newsList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/favorite-news', async (req, res) => {
  try {
    const { userId, newsId } = req.body;
    const result = await favoriteNews.add(userId, newsId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/favorite-news', async (req, res) => {
  try {
    const { userId, newsId } = req.body;
    const result = await favoriteNews.remove(userId, newsId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Сеансы пользователя =====
app.get('/api/user-sessions/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('📊 Запрос сеансов для пользователя:', userId);
    const userSessions = await sessions.getUserSessions(userId);
    console.log(`✅ Найдено сеансов: ${userSessions.length}`);
    res.json(userSessions);
  } catch (err) {
    console.error('❌ Ошибка получения сеансов:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/create-session', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId обязателен' });
    }
    
    const user = await users.getById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }
    
    const deviceInfo = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.socket.remoteAddress || 'Unknown';
    
    console.log('🔄 Автоматическое создание сеанса для пользователя:', userId);
    console.log('   Устройство:', deviceInfo);
    console.log('   IP:', ipAddress);
    
    await sessions.create(userId, {
      deviceInfo: deviceInfo,
      ipAddress: ipAddress
    });
    
    console.log('✅ Сеанс создан при загрузке страницы');
    res.json({ success: true, message: 'Сеанс создан' });
    
  } catch (err) {
    console.error('❌ Ошибка создания сеанса:', err);
    res.status(500).json({ error: err.message });
  }
});

// Восстановление пароля — поиск по ЛОГИНУ, отправка на введённый email
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { login, email } = req.body;
    console.log('🔑 Запрос на восстановление пароля:', { login, email });
    
    // Ищем пользователя по логину
    const user = await users.getByUsername(login);
    
    if (!user) {
      console.log('❌ Пользователь не найден по логину:', login);
      return res.json({ success: false, message: 'Пользователь с таким логином не найден' });
    }
    
    console.log('👤 Найден пользователь:', user.username);
    
    // Генерируем токен
    const token = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 3600000).toISOString();
    
    // Сохраняем email и ЛОГИН
    await passwordResets.create(email, token, expiresAt, login);
    
    const resetUrl = `/reset-password?token=${token}`;
    console.log(`🔐 Ссылка для восстановления: ${resetUrl}`);
    
    // Отправляем письмо
    sendResetPasswordEmail(email, resetUrl, login)
      .then(() => console.log('✅ Письмо восстановления отправлено'))
      .catch(err => console.error('❌ Ошибка отправки письма:', err));
    
    res.json({ 
      success: true, 
      message: `Инструкции отправлены на ${email}` 
    });
  } catch (err) {
    console.error('❌ Ошибка:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    console.log('🔑 Запрос на смену пароля с токеном:', token);
    
    // Получаем запись о восстановлении
    const reset = await passwordResets.getByToken(token);
    if (!reset) {
      console.log('❌ Токен не найден или просрочен');
      return res.json({ success: false, message: 'Недействительная или просроченная ссылка' });
    }
    
    console.log('✅ Токен найден, login:', reset.login, 'email:', reset.email);
    
    // Ищем пользователя по ЛОГИНУ из password_resets
    const user = await users.getByUsername(reset.login);
    
    if (!user) {
      console.log('❌ Пользователь с логином не найден:', reset.login);
      return res.json({ success: false, message: 'Пользователь не найден' });
    }
    
    console.log('👤 Найден пользователь:', user.username, 'ID:', user.id);
    
    // Обновляем пароль по логину (username)
    await new Promise((resolve, reject) => {
      db.run('UPDATE users SET password = ? WHERE username = ?', [newPassword, user.username], function(err) {
        if (err) {
          console.error('❌ Ошибка обновления пароля:', err);
          reject(err);
        } else {
          console.log('✅ Обновлено строк:', this.changes);
          console.log('✅ Пароль изменён для пользователя:', user.username);
          resolve();
        }
      });
    });
    
    // Помечаем токен как использованный
    await passwordResets.markUsed(token);
    
    res.json({ success: true, message: 'Пароль успешно изменён' });
  } catch (err) {
    console.error('❌ Ошибка:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== Заказы =====
app.get('/api/orders', async (req, res) => {
  try {
    const ordersList = await orders.getAll();
    res.json(ordersList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ВАЖНО: /api/orders/confirmed ДОЛЖЕН быть перед /api/orders/:id
app.get('/api/orders/confirmed', async (req, res) => {
  try {
    db.all(
      "SELECT * FROM orders WHERE confirmed = 1 OR status = 'confirmed' ORDER BY created_at DESC",
      [],
      (err, rows) => {
        if (err) {
          console.error('❌ Ошибка получения подтверждённых заказов:', err);
          return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Загружено подтверждённых заказов: ${rows.length}`);
        res.json(rows);
      }
    );
  } catch (err) {
    console.error('❌ Ошибка:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/user/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    console.log('📦 API: Запрос заказов для email:', email);
    db.all(
      'SELECT * FROM orders WHERE user_email = ? OR customer_email = ? ORDER BY created_at DESC',
      [email, email],
      (err, rows) => {
        if (err) {
          console.error('❌ Ошибка SQL:', err);
          return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Найдено заказов: ${rows.length}`);
        res.json(rows);
      }
    );
  } catch (err) {
    console.error('❌ Ошибка при получении заказов пользователя:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await orders.getById(req.params.id);
    order ? res.json(order) : res.status(404).json({ error: 'Order not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Избранное (пластинки) =====
app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('📦 Получение избранного для пользователя:', userId);
    const favoritesList = await favorites.getUserFavorites(userId);
    console.log('✅ Найдено избранных пластинок:', favoritesList.length);
    res.json(favoritesList);
  } catch (err) {
    console.error('❌ Ошибка получения избранного:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/favorites', async (req, res) => {
  try {
    const { userId, vinylId } = req.body;
    console.log('📦 Добавление в избранное:', { userId, vinylId });
    const result = await favorites.add(userId, vinylId);
    res.json(result);
  } catch (err) {
    console.error('❌ Ошибка добавления в избранное:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/favorites', async (req, res) => {
  try {
    const { userId, vinylId } = req.body;
    console.log('📦 Удаление из избранного:', { userId, vinylId });
    const result = await favorites.remove(userId, vinylId);
    res.json(result);
  } catch (err) {
    console.error('❌ Ошибка удаления из избранного:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/favorites/check/:userId/:vinylId', async (req, res) => {
  try {
    const { userId, vinylId } = req.params;
    const isFavorite = await favorites.isFavorite(userId, vinylId);
    res.json({ isFavorite });
  } catch (err) {
    console.error('❌ Ошибка проверки избранного:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== Рейтинги =====
app.post('/api/ratings', async (req, res) => {
  try {
    const { entity_type, entity_id, user_id, rating } = req.body;
    const result = await ratings.addOrUpdate(entity_type, entity_id, user_id, rating);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ratings/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const result = await ratings.getAverage(entityType, entityId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Создание заказа =====
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    console.log('📦 Получен новый заказ:', JSON.stringify(orderData, null, 2));
    
    if (orderData.type === 'vinyl') {
      for (const item of orderData.items) {
        const vinyl = await vinyls.getById(item.id);
        const requestedQty = item.quantity || 1;
        if (!vinyl || vinyl.stock < requestedQty) {
          return res.status(400).json({
            success: false,
            message: `Товара "${item.title}" доступно только ${vinyl?.stock || 0} шт.`
          });
        }
      }
    }
    
    const result = await orders.create(orderData);
    
    if (orderData.type === 'vinyl') {
      for (const item of orderData.items) {
        const requestedQty = item.quantity || 1;
        await vinyls.decreaseStock(item.id, requestedQty);
        await vinyls.increaseOrderCount(item.id, requestedQty);
      }
    }
    
    res.json({ success: true, id: result.id, message: 'Заказ успешно оформлен!' });
    
    sendOrderEmail(orderData, orderData.customer.email, result.id)
      .then(() => console.log('✅ Email успешно отправлен в фоне'))
      .catch(err => console.error('❌ Ошибка отправки email в фоне:', err));
    
  } catch (err) {
    console.error('❌ Ошибка при создании заказа:', err);
    res.status(500).json({ success: false, message: 'Ошибка при оформлении заказа: ' + err.message });
  }
});

// ===== Подтверждение заказа =====
app.get('/api/orders/confirm/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('📦 Запрос на подтверждение заказа #' + orderId);
    
    db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, order) => {
      if (err) {
        console.error('❌ Ошибка поиска заказа:', err);
        return res.status(500).json({ success: false, message: 'Ошибка сервера' });
      }
      
      if (!order) {
        console.log('❌ Заказ не найден:', orderId);
        return res.status(404).json({ success: false, message: 'Заказ не найден' });
      }
      
      if (order.confirmed) {
        console.log('ℹ️ Заказ уже подтверждён:', orderId);
        return res.json({ success: true, alreadyConfirmed: true });
      }
      
      db.run('UPDATE orders SET confirmed = 1, confirmed_at = CURRENT_TIMESTAMP, status = ? WHERE id = ?', 
        ['confirmed', orderId], 
        function(err) {
          if (err) {
            console.error('❌ Ошибка подтверждения заказа:', err);
            return res.status(500).json({ success: false, message: 'Ошибка подтверждения' });
          }
          
          console.log('✅ Заказ #' + orderId + ' подтверждён!');
          res.json({ success: true, confirmed: true });
        });
    });
  } catch (err) {
    console.error('❌ Ошибка:', err);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// ===== Корректное завершение сервера =====
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Получен сигнал ${signal}. Закрываем соединения...`);
  
  db.close((err) => {
    if (err) {
      console.error('❌ Ошибка при закрытии БД:', err);
    } else {
      console.log('✅ База данных закрыта. Все данные сохранены.');
    }
    process.exit(0);
  });
  
  setTimeout(() => {
    console.error('⚠️ Таймаут закрытия БД. Принудительное завершение.');
    process.exit(1);
  }, 5000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`📁 База данных: server/database.sqlite`);
  console.log(`📧 Email через EmailJS`);
  console.log(`🚀 Сервер работает на порту ${PORT}`);
});
