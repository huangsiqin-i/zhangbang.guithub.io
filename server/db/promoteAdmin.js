const pool = require("./connection");

async function main() {
  const username = process.argv[2];
  if (!username) {
    console.error("Usage: node db/promoteAdmin.js <username>");
    process.exit(1);
  }

  await pool.query("UPDATE users SET role = 'admin' WHERE username = ?", [username]);
  const [rows] = await pool.query(
    "SELECT id, username, role FROM users WHERE username = ?",
    [username]
  );
  console.log(rows);
  await pool.end();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
