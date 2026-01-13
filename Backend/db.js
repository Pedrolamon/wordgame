import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

// Criar tabelas se não existirem
const schema = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
db.exec(schema);

export default db;
