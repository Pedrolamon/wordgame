import { Pool, QueryResult} from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Recriando __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
    throw new Error('DATABASE_URL não está definido no ambiente.');
}

const pool = new Pool({
    connectionString: connectionString,
    max: 20, 
    idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no cliente ocioso do pool', err);
  process.exit(-1); 
});

console.log('Pool de conexão com o PostgreSQL inicializado.');

// Função utilitária para executar consultas
export const query = (text: string, params?: any[]): Promise<QueryResult> => {
    console.log('EXECUTANDO QUERY:', text, params);
    return pool.query(text, params);
};

export const connectDB = async () => {
    try {
        await pool.query('SELECT 1');
        console.log('✅ Conexão com o PostgreSQL bem-sucedida!');
    } catch (err) {
        console.error('❌ Falha na conexão com o PostgreSQL:', err);
        throw err;
    }
};
export const closeDB = () => {
    pool.end();
    console.log('Pool de conexão do PostgreSQL encerrado.');
};

export const setupDatabase = async () => {
    try {
        const sqlFilePath = path.join(__dirname, './database.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log(' Criando tabelas...');
        await pool.query(sql);
        console.log('✅ Tabelas criadas/verificadas com sucesso!');
    } catch (err) {
        console.error('❌ Erro ao criar tabelas:', err);
    }
};