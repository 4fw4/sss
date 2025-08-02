
function format(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

let currentSession = '';
let username = '';

function detectDevice() {
  const ua = navigator.userAgent;
  return /Mobile|Android|iPhone|iPad/i.test(ua) ? "Mobile" : "Desktop";
}

function showLogin() {
  const name = prompt("Enter your name to start:");
  username = name || "Guest";
  document.title = `evade.ai | ${username}`;
}

function newChat() {
  const device = detectDevice();
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const title = `${username} (${device}) - ${time}`;
  currentSession = 'chat_' + Date.now();
  localStorage.setItem(currentSession + '_title', title);
  document.getElementById('chat').innerHTML = '';
  saveSessionList(currentSession);
  loadSidebar();
}

function saveSessionList(id) {
  let list = JSON.parse(localStorage.getItem('session_list') || '[]');
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem('session_list', JSON.stringify(list));
  }
}

function loadSidebar() {
  const list = JSON.parse(localStorage.getItem('session_list') || '[]');
  const container = document.getElementById('chatList');
  container.innerHTML = '';

  const clearBtn = document.createElement('button');
  clearBtn.textContent = "🗑 Clear All";
  clearBtn.style.marginBottom = "10px";
  clearBtn.onclick = clearChats;
  container.appendChild(clearBtn);

  list.forEach(id => {
    const div = document.createElement('div');
    const title = localStorage.getItem(id + '_title') || id.replace('chat_', 'Chat ');
    div.innerText = title;
    div.onclick = () => loadChat(id);
    container.appendChild(div);
  });
}

function loadChat(id) {
  currentSession = id;
  const saved = localStorage.getItem(currentSession);
  document.getElementById('chat').innerHTML = saved || '';
}

function saveChatHistory() {
  if (currentSession) {
    const chat = document.getElementById('chat').innerHTML;
    localStorage.setItem(currentSession, chat);
  }
}

function clearChats() {
  if (confirm("Clear all saved chats?")) {
    const list = JSON.parse(localStorage.getItem('session_list') || '[]');
    list.forEach(id => {
      localStorage.removeItem(id);
      localStorage.removeItem(id + '_title');
    });
    localStorage.removeItem('session_list');
    loadSidebar();
    document.getElementById('chat').innerHTML = '';
  }
}

async function send() {
  const msg = document.getElementById('msg');
  const chat = document.getElementById('chat');
  const val = msg.value.trim();
  if (!val) return;
  chat.innerHTML += `<div class="bubble user">${format(val)}</div>`;
  saveChatHistory();
  msg.value = '';
  document.getElementById('typing').style.display = 'block';
  chat.scrollTop = chat.scrollHeight;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer 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',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
      messages: [{ role: 'user', content: val }]
    })
  });

  const json = await res.json();
  const reply = json.choices?.[0]?.message?.content || 'error';
  chat.innerHTML += `<div class="bubble bot">${format(reply)}</div>`;
  document.getElementById('typing').style.display = 'none';
  saveChatHistory();
  chat.scrollTop = chat.scrollHeight;
}

window.onload = () => {
  showLogin();
  newChat();
  loadSidebar();
};
