import { User } from '../types';
import { db as dbJson } from './database';
import { dbPostgres } from './databasePostgres';

// Hybrid database that uses PostgreSQL if DATABASE_URL is set, otherwise JSON
class DatabaseHybrid {
  private usePostgres: boolean;

  constructor() {
    this.usePostgres = !!process.env.DATABASE_URL;
    console.log(`📊 Using ${this.usePostgres ? 'PostgreSQL' : 'JSON file'} database`);
  }

  async load() {
    if (this.usePostgres) {
      await dbPostgres.initialize();
    } else {
      await dbJson.load();
    }
  }

  async addUser(user: User) {
    if (this.usePostgres) {
      await dbPostgres.addUser(user);
    } else {
      await dbJson.addUser(user);
    }
  }

  async getUsers(): Promise<User[]> {
    if (this.usePostgres) {
      return await dbPostgres.getUsers();
    } else {
      return await dbJson.getUsers();
    }
  }

  async updateUser(id: string, updates: Partial<User>) {
    if (this.usePostgres) {
      await dbPostgres.updateUser(id, updates);
    } else {
      await dbJson.updateUser(id, updates);
    }
  }

  async removeUser(id: string) {
    if (this.usePostgres) {
      await dbPostgres.removeUser(id);
    } else {
      await dbJson.removeUser(id);
    }
  }
}

export const db = new DatabaseHybrid();
