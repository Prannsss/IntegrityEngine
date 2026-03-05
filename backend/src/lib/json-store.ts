import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(__dirname, '../../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Singleton registry — ensures one in-memory instance per file so all
// modules that reference the same table share the same data.
const _registry = new Map<string, JsonStore<any>>();

export class JsonStore<T extends Record<string, any>> {
  private filePath!: string;
  private data: T[] = [];
  private nextId: number = 1;
  private idField!: string;
  private useUuid!: boolean;

  constructor(filename: string, options?: { useUuid?: boolean; idField?: string }) {
    // Return the cached instance if one already exists for this file
    if (_registry.has(filename)) {
      return _registry.get(filename) as JsonStore<T>;
    }

    this.filePath = path.join(DATA_DIR, filename);
    this.idField = options?.idField || 'id';
    this.useUuid = options?.useUuid || false;
    this.load();

    _registry.set(filename, this);
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.useUuid && this.data.length > 0) {
          const maxId = Math.max(...this.data.map(r => Number(r[this.idField]) || 0));
          this.nextId = maxId + 1;
        }
      }
    } catch {
      this.data = [];
    }
  }

  private save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  getAll(): T[] {
    return [...this.data];
  }

  find(filters: Partial<T>): T[] {
    return this.data.filter(row =>
      Object.entries(filters).every(([k, v]) => row[k] === v)
    );
  }

  findOne(filters: Partial<T>): T | null {
    return this.data.find(row =>
      Object.entries(filters).every(([k, v]) => row[k] === v)
    ) || null;
  }

  findByIds(ids: (string | number)[]): T[] {
    const idSet = new Set(ids.map(String));
    return this.data.filter(row => idSet.has(String(row[this.idField])));
  }

  findIn(field: string, values: (string | number)[]): T[] {
    const valSet = new Set(values.map(String));
    return this.data.filter(row => valSet.has(String(row[field])));
  }

  insert(record: Omit<T, 'id'> & Partial<Pick<T, 'id'>>): T {
    const now = new Date().toISOString();
    const newRecord = {
      ...record,
      [this.idField]: this.useUuid ? (record as any)[this.idField] : this.nextId++,
      created_at: (record as any).created_at || now,
      updated_at: (record as any).updated_at || now,
    } as unknown as T;
    this.data.push(newRecord);
    this.save();
    return newRecord;
  }

  insertMany(records: (Omit<T, 'id'> & Partial<Pick<T, 'id'>>)[]): T[] {
    return records.map(r => this.insert(r));
  }

  update(filters: Partial<T>, updates: Partial<T>): T[] {
    const updated: T[] = [];
    this.data = this.data.map(row => {
      const match = Object.entries(filters).every(([k, v]) => row[k] === v);
      if (match) {
        const newRow = { ...row, ...updates, updated_at: new Date().toISOString() };
        updated.push(newRow);
        return newRow;
      }
      return row;
    });
    if (updated.length > 0) this.save();
    return updated;
  }

  upsert(record: Partial<T>, conflictKeys: string[]): T {
    const existing = this.data.find(row =>
      conflictKeys.every(k => row[k] === (record as any)[k])
    );
    if (existing) {
      const idx = this.data.indexOf(existing);
      this.data[idx] = { ...existing, ...record, updated_at: new Date().toISOString() };
      this.save();
      return this.data[idx];
    }
    return this.insert(record as any);
  }

  delete(filters: Partial<T>): number {
    const before = this.data.length;
    this.data = this.data.filter(row =>
      !Object.entries(filters).every(([k, v]) => row[k] === v)
    );
    const removed = before - this.data.length;
    if (removed > 0) this.save();
    return removed;
  }

  /** Query builder for more complex queries */
  query(): QueryBuilder<T> {
    return new QueryBuilder([...this.data]);
  }

  count(filters?: Partial<T>): number {
    if (!filters) return this.data.length;
    return this.find(filters).length;
  }

  /** Direct access for seeding — replaces all data */
  seed(records: T[]) {
    this.data = records;
    if (!this.useUuid && this.data.length > 0) {
      const maxId = Math.max(...this.data.map(r => Number(r[this.idField]) || 0));
      this.nextId = maxId + 1;
    }
    this.save();
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }
}

export class QueryBuilder<T extends Record<string, any>> {
  private rows: T[];

  constructor(rows: T[]) {
    this.rows = rows;
  }

  eq(field: string, value: any): QueryBuilder<T> {
    this.rows = this.rows.filter(r => r[field] === value);
    return this;
  }

  neq(field: string, value: any): QueryBuilder<T> {
    this.rows = this.rows.filter(r => r[field] !== value);
    return this;
  }

  in(field: string, values: any[]): QueryBuilder<T> {
    const valSet = new Set(values.map(String));
    this.rows = this.rows.filter(r => valSet.has(String(r[field])));
    return this;
  }

  gte(field: string, value: number): QueryBuilder<T> {
    this.rows = this.rows.filter(r => Number(r[field]) >= value);
    return this;
  }

  lte(field: string, value: number): QueryBuilder<T> {
    this.rows = this.rows.filter(r => Number(r[field]) <= value);
    return this;
  }

  order(field: string, ascending = true): QueryBuilder<T> {
    this.rows.sort((a, b) => {
      const av = a[field], bv = b[field];
      if (av == null && bv == null) return 0;
      if (av == null) return ascending ? 1 : -1;
      if (bv == null) return ascending ? -1 : 1;
      if (av < bv) return ascending ? -1 : 1;
      if (av > bv) return ascending ? 1 : -1;
      return 0;
    });
    return this;
  }

  limit(n: number): QueryBuilder<T> {
    this.rows = this.rows.slice(0, n);
    return this;
  }

  select(..._fields: string[]): QueryBuilder<T> {
    // For simplicity, return full objects (field selection is cosmetic in a JSON store)
    return this;
  }

  single(): T | null {
    return this.rows[0] || null;
  }

  results(): T[] {
    return this.rows;
  }
}
