(() => {
    const el = id => document.getElementById(id);
    let subjects = [], current = null, utterance = null, started = 0, elapsed = 0, paused = false, hasStarted = false;
    const controls = () => {
        el('play-lesson').disabled = !current || Boolean(utterance) || !('speechSynthesis' in window);
        el('pause-lesson').disabled = !utterance;
        el('stop-lesson').disabled = !utterance;
        el('pause-lesson').textContent = paused ? 'Resume' : 'Pause';
    };
    function finish(completed) {
        if (!utterance) return;
        if (!paused && started) elapsed += performance.now() - started;
        const moduleId = current.id;
        utterance = null; started = 0; paused = false;
        const seconds = Math.min(3600, Math.round(elapsed / 1000));
        elapsed = 0;
        if (hasStarted) document.dispatchEvent(new CustomEvent('eduguide:listened', { detail: { moduleId, seconds, completed } }));
        hasStarted = false;
        el('lesson-status').textContent = completed ? 'Lesson completed.' : 'Lesson stopped.';
        controls();
    }
    function stop() { if (utterance) { finish(false); speechSynthesis.cancel(); } }
    function showModule() {
        stop();
        const subject = subjects.find(s => s.id === el('subject-select').value);
        current = subject?.modules.find(m => m.id === el('module-select').value) || null;
        el('lesson-title').textContent = current?.title || 'Choose a lesson';
        el('lesson-transcript').textContent = current?.transcript || '';
        el('lesson-status').textContent = 'speechSynthesis' in window ? 'Ready to listen.' : 'Audio is unavailable in this browser. You can read the transcript below.';
        controls();
    }
    function showSubject() {
        const subject = subjects.find(s => s.id === el('subject-select').value);
        el('subject-description').textContent = subject?.description || '';
        el('module-select').replaceChildren(...(subject?.modules || []).map(m => new Option(m.title, m.id)));
        showModule();
    }
    el('subject-select').addEventListener('change', showSubject);
    el('module-select').addEventListener('change', showModule);
    el('play-lesson').addEventListener('click', () => {
        if (!current || utterance) return;
        const speech = new SpeechSynthesisUtterance(current.transcript);
        speech.lang = 'en-ZA';
        utterance = speech; elapsed = 0; started = 0;
        speech.onstart = () => { if (utterance === speech) { started = performance.now(); hasStarted = true; el('lesson-status').textContent = 'Playing lesson.'; } };
        speech.onend = () => { if (utterance === speech) finish(true); };
        speech.onerror = () => { if (utterance === speech) { finish(false); el('lesson-status').textContent = 'Audio could not play. You can read the transcript.'; } };
        speechSynthesis.speak(speech); controls();
    });
    el('pause-lesson').addEventListener('click', () => {
        if (!utterance || !started) return;
        if (paused) { speechSynthesis.resume(); started = performance.now(); paused = false; el('lesson-status').textContent = 'Playing lesson.'; }
        else { speechSynthesis.pause(); elapsed += performance.now() - started; started = 0; paused = true; el('lesson-status').textContent = 'Paused.'; }
        controls();
    });
    el('stop-lesson').addEventListener('click', stop);
    document.addEventListener('eduguide:signing-out', stop);
    fetch('/api/catalog').then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(data => {
        subjects = data;
        el('subject-select').replaceChildren(...subjects.map(s => new Option(s.name, s.id)));
        showSubject();
    }).catch(() => { el('lesson-status').textContent = 'Lessons could not be loaded. Please try again later.'; });
})();
