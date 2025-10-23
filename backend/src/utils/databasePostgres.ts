import { Pool } from 'pg';
import { User } from '../types';

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

class DatabasePostgres {
  async initialize() {
    // Create table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        personal_number VARCHAR(11) NOT NULL,
        phone_number VARCHAR(50) NOT NULL,
        category_code INTEGER NOT NULL,
        category_name VARCHAR(255) NOT NULL,
        center_id INTEGER NOT NULL,
        center_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        telegram_chat_id VARCHAR(100),
        last_checked TIMESTAMP,
        notified BOOLEAN DEFAULT FALSE,
        notified_date VARCHAR(50),
        notified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await pool.query(createTableQuery);
      console.log('✅ PostgreSQL table initialized');
    } catch (error) {
      console.error('Failed to initialize table:', error);
      throw error;
    }
  }

  async addUser(user: User) {
    // Remove existing user with same personal number and category
    await pool.query(
      'DELETE FROM users WHERE personal_number = $1 AND category_code = $2',
      [user.personalNumber, user.categoryCode]
    );

    // Insert new user
    await pool.query(
      `INSERT INTO users (
        id, personal_number, phone_number, category_code, category_name,
        center_id, center_name, email, telegram_chat_id, last_checked, notified,
        notified_date, notified_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        user.id,
        user.personalNumber,
        user.phoneNumber,
        user.categoryCode,
        user.categoryName,
        user.centerId,
        user.centerName,
        user.email || null,
        user.telegramChatId || null,
        user.lastChecked ? new Date(user.lastChecked) : null,
        user.notified || false,
        user.notifiedDate || null,
        user.notifiedAt ? new Date(user.notifiedAt) : null,
      ]
    );
  }

  async getUsers(): Promise<User[]> {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');

    return result.rows.map(row => ({
      id: row.id,
      personalNumber: row.personal_number,
      phoneNumber: row.phone_number,
      categoryCode: row.category_code,
      categoryName: row.category_name,
      centerId: row.center_id,
      centerName: row.center_name,
      email: row.email,
      telegramChatId: row.telegram_chat_id,
      lastChecked: row.last_checked?.toISOString(),
      notified: row.notified,
      notifiedDate: row.notified_date,
      notifiedAt: row.notified_at?.toISOString(),
    }));
  }

  async updateUser(id: string, updates: Partial<User>) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.personalNumber !== undefined) {
      fields.push(`personal_number = $${paramCount++}`);
      values.push(updates.personalNumber);
    }
    if (updates.phoneNumber !== undefined) {
      fields.push(`phone_number = $${paramCount++}`);
      values.push(updates.phoneNumber);
    }
    if (updates.categoryCode !== undefined) {
      fields.push(`category_code = $${paramCount++}`);
      values.push(updates.categoryCode);
    }
    if (updates.categoryName !== undefined) {
      fields.push(`category_name = $${paramCount++}`);
      values.push(updates.categoryName);
    }
    if (updates.centerId !== undefined) {
      fields.push(`center_id = $${paramCount++}`);
      values.push(updates.centerId);
    }
    if (updates.centerName !== undefined) {
      fields.push(`center_name = $${paramCount++}`);
      values.push(updates.centerName);
    }
    if (updates.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(updates.email);
    }
    if (updates.telegramChatId !== undefined) {
      fields.push(`telegram_chat_id = $${paramCount++}`);
      values.push(updates.telegramChatId);
    }
    if (updates.lastChecked !== undefined) {
      fields.push(`last_checked = $${paramCount++}`);
      values.push(new Date(updates.lastChecked));
    }
    if (updates.notified !== undefined) {
      fields.push(`notified = $${paramCount++}`);
      values.push(updates.notified);
    }
    if (updates.notifiedDate !== undefined) {
      fields.push(`notified_date = $${paramCount++}`);
      values.push(updates.notifiedDate);
    }
    if (updates.notifiedAt !== undefined) {
      fields.push(`notified_at = $${paramCount++}`);
      values.push(updates.notifiedAt ? new Date(updates.notifiedAt) : null);
    }

    if (fields.length === 0) return;

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}`;

    await pool.query(query, values);
  }

  async removeUser(id: string) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  }

  async close() {
    await pool.end();
  }
}

export const dbPostgres = new DatabasePostgres();
