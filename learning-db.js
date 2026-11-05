const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');
const catalog = require('./catalog.json');
const dbFile = process.env.EDUGUIDE_LEARNING_DB || path.join(__dirname, 'data', 'learning.sqlite');
fs.mkdirSync(path.dirname(dbFile), { recursive: true });
const db = new DatabaseSync(dbFile);
fs.chmodSync(dbFile, 0o600);
db.exec(`PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS subjects (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS modules (id TEXT PRIMARY KEY, subject_id TEXT NOT NULL REFERENCES subjects(id), title TEXT NOT NULL, transcript TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS listening (id INTEGER PRIMARY KEY, account_id TEXT NOT NULL, module_id TEXT NOT NULL REFERENCES modules(id), seconds INTEGER NOT NULL, completed INTEGER NOT NULL, recorded_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS listening_account_date ON listening(account_id, recorded_at);`);
const addSubject = db.prepare('INSERT OR IGNORE INTO subjects VALUES (?, ?, ?)');
const addModule = db.prepare('INSERT OR IGNORE INTO modules VALUES (?, ?, ?, ?)');
for (const subject of catalog) {
    addSubject.run(subject.id, subject.name, subject.description);
    for (const module of subject.modules) addModule.run(module.id, subject.id, module.title, module.text);
}
function getCatalog() {
    return db.prepare('SELECT id, name, description FROM subjects ORDER BY name').all().map(subject => ({
        ...subject, modules: db.prepare('SELECT id, title, transcript FROM modules WHERE subject_id = ? ORDER BY title').all(subject.id)
    }));
}
function addListening(accountId, moduleId, seconds, completed) {
    if (!db.prepare('SELECT id FROM modules WHERE id = ?').get(moduleId)) return false;
    db.prepare('INSERT INTO listening (account_id, module_id, seconds, completed, recorded_at) VALUES (?, ?, ?, ?, ?)')
        .run(accountId, moduleId, seconds, completed ? 1 : 0, new Date().toISOString());
    return true;
}
function getListening(accountId, days) {
    const since = days ? new Date(Date.now() - days * 86400000).toISOString() : '0000';
    const stats = db.prepare('SELECT COUNT(*) AS sessions, COALESCE(SUM(seconds), 0) AS seconds, COALESCE(SUM(completed), 0) AS completed FROM listening WHERE account_id = ? AND recorded_at >= ?').get(accountId, since);
    const recent = db.prepare('SELECT modules.title, subjects.name AS subject, listening.seconds, listening.completed, listening.recorded_at AS date FROM listening JOIN modules ON modules.id = listening.module_id JOIN subjects ON subjects.id = modules.subject_id WHERE account_id = ? AND recorded_at >= ? ORDER BY listening.recorded_at DESC, listening.id DESC LIMIT 10').all(accountId, since);
    return { ...stats, recent };
}
module.exports = { getCatalog, addListening, getListening };
