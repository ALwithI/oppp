import mysql from 'mysql2/promise';

const database = mysql.createPool({
    host: 'localhost', // Change if using a different host
    user: 'root',
    password: '',
    database: 'todolist',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default database;