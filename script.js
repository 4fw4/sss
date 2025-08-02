
function format(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

let currentSession = '';

function newChat() {
  currentSession = 'chat_' + Date.now();
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
  list.forEach(id => {
    const div = document.createElement('div');
    div.innerText = id.replace('chat_', 'Chat ');
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
  newChat();
  loadSidebar();
};
