const mysql = require('mysql2/promise');

async function testPassword(password) {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: password,
      connectTimeout: 2000
    });
    console.log(`SUCCESS! The root password is: "${password}"`);
    await conn.end();
    return true;
  } catch (err) {
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log(`Failed: "${password}"`);
    } else {
      console.log(`Error connecting with "${password}": ${err.message}`);
    }
    return false;
  }
}

async function run() {
  const passwords = ['', 'root', 'password', 'admin', 'mysql', 'admin123', 'YourActualMysqlRootPassword'];
  for (const pw of passwords) {
    if (await testPassword(pw)) {
      process.exit(0);
    }
  }
  console.log('None of the common passwords worked.');
}

run();
