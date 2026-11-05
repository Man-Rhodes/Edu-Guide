(() => {
    const byId = id => document.getElementById(id);
    const form = byId('auth-form');
    let registering = false;
    let signedIn = false;
    let pendingActivity = Promise.resolve();

    async function request(url, body) {
        const response = await fetch(url, body === undefined ? {} : {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Please try again.');
        return data;
    }
    async function refreshListening() {
        if (!signedIn) return;
        try {
            const data = await request('/api/listening?range=' + byId('activity-range').value);
            if (!signedIn) return;
            byId('listen-sessions').textContent = data.sessions;
            byId('listen-time').textContent = data.seconds < 60 ? data.seconds + ' sec' : (data.seconds / 60).toFixed(1) + ' min';
            byId('listen-completed').textContent = data.completed;
            const list = byId('listening-history'); list.replaceChildren();
            data.recent.forEach(item => {
                const li = document.createElement('li');
                const title = document.createElement('span');
                title.textContent = `${item.subject}: ${item.title} (${item.completed ? 'completed' : 'stopped'})`;
                const date = document.createElement('time'); date.dateTime = item.date; date.textContent = new Date(item.date).toLocaleDateString();
                li.append(title, date); list.appendChild(li);
            });
            byId('listening-empty').hidden = data.recent.length > 0;
        } catch { byId('activity-error').textContent = 'Could not load listening activity. Please try again.'; }
    }
    byId('activity-range').addEventListener('change', refreshListening);
    function showSummary(data) {
        signedIn = Boolean(data);
        byId('auth-panel').hidden = signedIn;
        byId('activity-panel').hidden = !signedIn;
        if (!data) return;
        byId('activity-name').textContent = `Hello, ${data.name}`;
        byId('last-login').textContent = data.previousLogin
            ? `Last signed in ${new Date(data.previousLogin).toLocaleString()}`
            : 'Welcome to your new profile.';
        byId('question-count').textContent = data.questionCount;
        const list = byId('recent-questions');
        list.replaceChildren();
        data.recentQuestions.forEach(item => {
            const li = document.createElement('li');
            const question = document.createElement('span');
            question.textContent = item.question;
            const date = document.createElement('time');
            date.dateTime = item.date;
            date.textContent = new Date(item.date).toLocaleDateString();
            li.append(question, date);
            list.appendChild(li);
        });
        byId('activity-empty').hidden = data.recentQuestions.length > 0;
        refreshListening();
    }
    byId('auth-switch').addEventListener('click', () => {
        registering = !registering;
        byId('name-field').hidden = !registering;
        byId('profile-name').required = registering;
        byId('profile-password').autocomplete = registering ? 'new-password' : 'current-password';
        byId('auth-title').textContent = registering ? 'Create your account' : 'Welcome back';
        byId('auth-description').textContent = registering ? 'Save your questions and return to your activity later.' : 'Sign in to see your activity summary.';
        byId('auth-submit').textContent = registering ? 'Create account' : 'Sign in';
        byId('auth-switch-text').textContent = registering ? 'Already have an account?' : 'New to EduGuide?';
        byId('auth-switch').textContent = registering ? 'Sign in' : 'Create an account';
        byId('auth-error').textContent = '';
    });
    form.addEventListener('submit', async event => {
        event.preventDefault();
        document.dispatchEvent(new Event('eduguide:signing-out'));
        const button = byId('auth-submit');
        button.disabled = true;
        byId('auth-error').textContent = '';
        try {
            const data = await request(registering ? '/api/register' : '/api/login', {
                name: byId('profile-name').value, email: byId('profile-email').value, password: byId('profile-password').value
            });
            form.reset();
            showSummary(data);
        } catch (error) { byId('auth-error').textContent = error.message; }
        finally { button.disabled = false; }
    });
    byId('sign-out').addEventListener('click', async () => {
        try { document.dispatchEvent(new Event('eduguide:signing-out')); await pendingActivity; await request('/api/logout', {}); showSummary(null); if (registering) byId('auth-switch').click(); }
        catch (error) { byId('activity-error').textContent = 'Could not sign out. Please try again.'; }
    });
    document.addEventListener('eduguide:listened', event => {
        if (!signedIn) return;
        pendingActivity = pendingActivity.then(async () => {
            try { await request('/api/listening', event.detail); await refreshListening(); }
            catch { byId('activity-error').textContent = 'Could not save your listening activity. Please check your connection.'; }
        });
    });
    document.addEventListener('eduguide:question', event => {
        if (!signedIn) return;
        pendingActivity = pendingActivity.then(async () => {
            try { showSummary(await request('/api/activity', { question: event.detail })); byId('activity-error').textContent = ''; }
            catch (error) { byId('activity-error').textContent = 'Could not save your question to your profile. Please check your connection.'; }
        });
    });
    request('/api/session').then(showSummary).catch(() => { byId('auth-error').textContent = 'Could not connect to your profile. Please try again later.'; });
})();
