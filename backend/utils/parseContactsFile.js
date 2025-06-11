// utils/parseContactsFile.js
const XLSX = require('xlsx');

async function parseContactsFile(file) {
  const contacts = [];
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv')) {
    const content = file.data.toString('utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.trim()) {
        let phone = line.split(',')[0].trim().replace(/\D/g, '');
        if (phone.length === 10) phone = '91' + phone;
        if (phone.length >= 11 && phone.length <= 15) contacts.push({ phone });
      }
    }
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    const workbook = XLSX.read(file.data, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    for (const row of rows) {
      if (row[0]) {
        let phone = String(row[0]).trim().replace(/\D/g, '');
        if (phone.length === 10) phone = '91' + phone;
        if (phone.length >= 11 && phone.length <= 15) contacts.push({ phone });
      }
    }
  } else {
    throw new Error('Unsupported file type. Use CSV or Excel');
  }

  return contacts;
}

module.exports = { parseContactsFile };
