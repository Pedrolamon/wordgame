import { Pool, QueryResult } from 'pg';
import 'dotenv/config';

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