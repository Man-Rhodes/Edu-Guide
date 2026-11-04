const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const port = Number(process.env.PORT || 3000);
const dataFile = process.env.EDUGUIDE_DATA_FILE || path.join(__dirname, 'data', 'accounts.json');
const sessions = new Map();
const sessionLifetime = 24 * 60 * 60 * 1000;
const files = { '/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'], '/style.css': ['style.css', 'text/css'], '/script.js': ['script.js', 'text/javascript'], '/auth.js': ['auth.js', 'text/javascript'] };

function readAccounts() {
    try { return JSON.parse(fs.readFileSync(dataFile, 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}
function writeAccounts(accounts) {
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    const temporary = dataFile + '.tmp';
    fs.writeFileSync(temporary, JSON.stringify(accounts), { mode: 0o600 });
    fs.renameSync(temporary, dataFile);
}
function respond(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(body));
}
function getSession(req) {
    const token = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('session='))?.slice(8);
    const session = sessions.get(token);
    if (!session || session.expires <= Date.now()) { if (token) sessions.delete(token); return null; }
    return session;
}
function summary(account, previousLogin) {
    return { name: account.name, previousLogin, questionCount: account.questionCount, recentQuestions: account.recentQuestions };
}
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => { data += chunk; if (data.length > 8192) { reject(new Error('Request too large')); req.destroy(); } });
        req.on('end', () => { try { resolve(JSON.parse(data)); } catch { reject(new Error('Invalid request')); } });
        req.on('error', reject);
    });
}
async function handle(req, res) {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && files[url.pathname]) {
        const [file, type] = files[url.pathname];
        res.writeHead(200, { 'Content-Type': type + '; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
        return fs.createReadStream(path.join(__dirname, file)).pipe(res);
    }
    if (req.method === 'GET' && url.pathname === '/api/session') {
        const session = getSession(req);
        const account = session && readAccounts().find(a => a.id === session.id);
        return respond(res, 200, account ? summary(account, session.previousLogin) : null);
    }
    if (req.method !== 'POST' || !url.pathname.startsWith('/api/')) return respond(res, 404, { error: 'Not found.' });
    // JSON requests cannot be sent by a cross-site HTML form; browsers preflight cross-origin JSON.
    if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return respond(res, 415, { error: 'Expected JSON.' });
    const body = await parseBody(req);
    if (url.pathname === '/api/register' || url.pathname === '/api/login') {
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
        const password = typeof body.password === 'string' ? body.password : '';
        const accounts = readAccounts();
        let account = accounts.find(a => a.email === email);
        if (url.pathname === '/api/register') {
            const name = typeof body.name === 'string' ? body.name.trim() : '';
            if (!name || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || password.length < 8 || password.length > 128) return respond(res, 400, { error: 'Enter your name, a valid email and a password of 8 to 128 characters.' });
            if (account) return respond(res, 409, { error: 'An account with this email already exists.' });
            const salt = crypto.randomBytes(16).toString('hex');
            account = { id: crypto.randomUUID(), name, email, salt, passwordHash: crypto.scryptSync(password, salt, 64).toString('hex'), lastLogin: null, questionCount: 0, recentQuestions: [] };
            accounts.push(account);
        } else {
            const hash = crypto.scryptSync(password.slice(0, 128), account?.salt || 'unknown-account', 64);
            if (!account || password.length > 128 || !crypto.timingSafeEqual(hash, Buffer.from(account.passwordHash, 'hex'))) return respond(res, 401, { error: 'Incorrect email or password.' });
        }
        const previousLogin = account.lastLogin;
        account.lastLogin = new Date().toISOString();
        writeAccounts(accounts);
        const token = crypto.randomBytes(32).toString('hex');
        const existingToken = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('session='))?.slice(8);
        if (existingToken) sessions.delete(existingToken);
        sessions.set(token, { id: account.id, previousLogin, expires: Date.now() + sessionLifetime });
        res.setHeader('Set-Cookie', `session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${req.socket.encrypted ? '; Secure' : ''}`);
        return respond(res, 200, summary(account, previousLogin));
    }
    const session = getSession(req);
    if (url.pathname === '/api/logout') {
        const token = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('session='))?.slice(8);
        if (token) sessions.delete(token);
        res.setHeader('Set-Cookie', 'session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
        return respond(res, 200, { ok: true });
    }
    if (!session) return respond(res, 401, { error: 'Please sign in first.' });
    if (url.pathname === '/api/activity') {
        const question = typeof body.question === 'string' ? body.question.trim() : '';
        if (!question || question.length > 2000) return respond(res, 400, { error: 'Question must be between 1 and 2000 characters.' });
        const accounts = readAccounts();
        const account = accounts.find(a => a.id === session.id);
        if (!account) return respond(res, 401, { error: 'Please sign in first.' });
        account.questionCount++;
        account.recentQuestions.unshift({ question, date: new Date().toISOString() });
        account.recentQuestions = account.recentQuestions.slice(0, 5);
        writeAccounts(accounts);
        return respond(res, 200, summary(account, session.previousLogin));
    }
    return respond(res, 404, { error: 'Not found.' });
}
http.createServer((req, res) => { handle(req, res).catch(error => { console.error(error); if (!res.headersSent) respond(res, 500, { error: 'Something went wrong. Please try again.' }); }); }).listen(port, () => console.log(`EduGuide running on http://localhost:${port}`));
