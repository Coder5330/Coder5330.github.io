const output = document.getElementById('output');
const input = document.getElementById('cmd-input');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const GH_USER = 'Coder5330';

function scrollToBottom() {
    output.scrollTop = output.scrollHeight;
}

function appendLine(text, cls) {
    const div = document.createElement('div');
    div.className = 'line ' + (cls || 'out');
    div.textContent = text;
    output.appendChild(div);
    scrollToBottom();
    return div;
}

function appendHTML(html, cls) {
    const div = document.createElement('div');
    div.className = 'line ' + (cls || 'out');
    div.innerHTML = html;
    output.appendChild(div);
    scrollToBottom();
    return div;
}

function appendCommandEcho(cmd) {
    const div = document.createElement('div');
    div.className = 'line cmd';
    div.textContent = cmd;
    output.appendChild(div);
    scrollToBottom();
}

function appendBanner() {
    const pre = document.createElement('pre');
    pre.className = 'banner';
    pre.textContent =
        '┌──────────────────┐\n' +
        '│    CODER5330     │\n' +
        '└──────────────────┘';
    output.appendChild(pre);
    scrollToBottom();
}

function sleep(ms) {
    return new Promise(res => setTimeout(res, reduceMotion ? 0 : ms));
}

const HELP = [
    'about       who this is',
    'projects    pull recent repos from github, live',
    'contact     mail / discord / github',
    'ls          list sections',
    'banner      reprint the header',
    'clear       clear the screen',
    'help        show this list',
];

async function cmdProjects() {
    const loading = appendLine('fetching from github…', 'dim');

    try {
        const res = await fetch(`https://api.github.com/users/${GH_USER}/repos?sort=pushed&per_page=6`);
        if (!res.ok) throw new Error('bad response');

        const repos = await res.json();
        loading.remove();

        if (!Array.isArray(repos) || repos.length === 0) {
            appendLine('no public repos found.', 'dim');
            return;
        }

        repos.forEach(r => {
            const lang = r.language ? `  [${r.language}]` : '';
            appendLine(`${r.name}${lang}`, 'bright');
            if (r.description) appendLine(`  ${r.description}`, 'dim');
            appendLine(`  ★ ${r.stargazers_count}   updated ${new Date(r.pushed_at).toISOString().slice(0, 10)}`, 'dim2');
            appendHTML(`  <a href="${r.html_url}" target="_blank" rel="noopener">${r.html_url}</a>`, 'out');
        });
    } catch (e) {
        loading.remove();
        appendLine('could not reach the github api. try again, or go straight to:', 'error');
        appendHTML(`  <a href="https://github.com/${GH_USER}" target="_blank" rel="noopener">github.com/${GH_USER}</a>`, 'out');
    }
}

function cmdContact() {
    appendLine('mail      hello@jldev.me', 'out');
    appendLine('discord   i_cant_find_an_unused_username', 'out');
    appendHTML('github    <a href="https://github.com/Coder5330" target="_blank" rel="noopener">github.com/Coder5330</a>', 'out');
}

function cmdAbout() {
    appendLine('Most of what I make lives on GitHub, not on this page.', 'out');
    appendLine('This site is deliberately small. Type `projects` to see what I\'ve', 'out');
    appendLine('actually been building, pulled live — no copy-pasted portfolio to go stale.', 'out');
}

function cmdLs() {
    ['about.txt', 'projects.txt', 'contact.txt', 'README.md'].forEach(f => appendLine(f, 'out'));
}

function cmdReadme() {
    appendLine('Building things, mostly on GitHub.');
}

const COMMANDS = {
    help: () => HELP.forEach(l => appendLine(l, 'out')),
    'cat about.txt': cmdAbout,
    'cat projects.txt': cmdProjects,
    'cat contact.txt': cmdContact,
    'cat readme.md': cmdReadme,
    ls: cmdLs,
    banner: appendBanner,
    whoami: () => appendLine('guest', 'out'),
    clear: () => { output.innerHTML = ''; },
};

function handleSudo() {
    appendLine('Permission denied.', 'error');
}

const history = [];
let historyIndex = -1;

function runCommand(raw) {
    const cmd = raw.trim();
    if (cmd.length === 0) return;

    appendCommandEcho(cmd);
    history.push(cmd);
    historyIndex = history.length;

    const lower = cmd.toLowerCase();

    if (lower.startsWith('sudo')) {
        handleSudo();
        return;
    }

    if (COMMANDS[lower]) {
        COMMANDS[lower]();
        return;
    }

    appendLine(`command not found: ${cmd}  (try \`help\`)`, 'error');
}

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const val = input.value;
        input.value = '';
        runCommand(val);
    } else if (e.key === 'ArrowUp') {
        if (history.length === 0) return;
        e.preventDefault();
        historyIndex = Math.max(0, historyIndex - 1);
        input.value = history[historyIndex] || '';
    } else if (e.key === 'ArrowDown') {
        if (history.length === 0) return;
        e.preventDefault();
        historyIndex = Math.min(history.length, historyIndex + 1);
        input.value = history[historyIndex] || '';
    }
});

document.querySelector('.terminal').addEventListener('click', () => input.focus());

async function boot() {
    appendBanner();
    await sleep(150);

    appendCommandEcho('whoami');
    await sleep(120);
    appendLine('Coder5330', 'bright');
    await sleep(300);

    appendCommandEcho('cat README.md');
    await sleep(120);
    cmdReadme();
    appendLine('Type `help` to see what it can do.', 'dim');
    await sleep(200);

    input.focus();
}

boot();
