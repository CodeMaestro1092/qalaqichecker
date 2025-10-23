import fs from 'fs/promises';
import path from 'path';
import { User } from '../types';

const DB_PATH = path.join(__dirname, '../../db.json');

interface DatabaseData {
  users: User[];
}

class Database {
  private data: DatabaseData = { users: [] };

  async load() {
    try {
      const content = await fs.readFile(DB_PATH, 'utf-8');
      this.data = JSON.parse(content);
    } catch (error) {
      // File doesn't exist yet, use empty data
      this.data = { users: [] };
      await this.save();
    }
  }

  async save() {
    await fs.writeFile(DB_PATH, JSON.stringify(this.data, null, 2));
  }

  async addUser(user: User) {
    // Remove existing user with same personal number and category
    this.data.users = this.data.users.filter(
      u => !(u.personalNumber === user.personalNumber && u.categoryCode === user.categoryCode)
    );
    this.data.users.push(user);
    await this.save();
  }

  async getUsers(): Promise<User[]> {
    return this.data.users;
  }

  async updateUser(id: string, updates: Partial<User>) {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.data.users[index] = { ...this.data.users[index], ...updates };
      await this.save();
    }
  }

  async removeUser(id: string) {
    this.data.users = this.data.users.filter(u => u.id !== id);
    await this.save();
  }
}

export const db = new Database();
