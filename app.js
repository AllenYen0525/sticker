let notes = JSON.parse(localStorage.getItem('swipe_notes')) || [
  { id: Date.now(), content: '歡迎使用便利貼！左右滑動切換卡片。', color: '#fff3a0' }
];

let currentIndex = 0;
let startX = 0;
let currentX = 0;
let isDragging = false;

const container = document.getElementById('card-container');
const indicator = document.getElementById('card-indicator');

function saveNotes() {
  localStorage.setItem('swipe_notes', JSON.stringify(notes));
}

function render() {
  container.innerHTML = '';
  notes.forEach((note, index) => {
    const card = document.createElement('div');
    card.className = `note-card ${note.color === '#2d2d2d' ? 'dark' : ''}`;
    card.style.backgroundColor = note.color;
    
    // 計算卡片疊加位置
    const offset = index - currentIndex;
    card.style.transform = `translateX(${offset * 105}%) scale(${offset === 0 ? 1 : 0.95})`;
    card.style.zIndex = notes.length - Math.abs(offset);
    card.style.opacity = Math.abs(offset) > 1 ? '0' : '1';

    const textarea = document.createElement('textarea');
    textarea.value = note.content;
    textarea.placeholder = '點擊這裡輸入記事...';
    
    textarea.addEventListener('input', (e) => {
      notes[index].content = e.target.value;
      saveNotes();
    });

    card.appendChild(textarea);
    container.appendChild(card);
  });

  indicator.innerText = `${currentIndex + 1} / ${notes.length}`;
  updateColorPicker();
}

// 觸控手勢滑動邏輯
container.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
  isDragging = true;
});

container.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  currentX = e.touches[0].clientX;
});

container.addEventListener('touchend', () => {
  if (!isDragging) return;
  const diffX = currentX - startX;
  
  if (Math.abs(diffX) > 50) {
    if (diffX < 0 && currentIndex < notes.length - 1) {
      currentIndex++; // 向左滑，下一張
    } else if (diffX > 0 && currentIndex > 0) {
      currentIndex--; // 向右滑，上一張
    }
    render();
  }
  isDragging = false;
  startX = 0;
  currentX = 0;
});

// 按鈕功能
document.getElementById('add-btn').addEventListener('click', () => {
  const newNote = { id: Date.now(), content: '', color: '#fff3a0' };
  notes.push(newNote);
  currentIndex = notes.length - 1;
  saveNotes();
  render();
});

document.getElementById('delete-btn').addEventListener('click', () => {
  if (notes.length === 1) {
    notes[0].content = '';
    saveNotes();
    render();
    return;
  }
  notes.splice(currentIndex, 1);
  if (currentIndex >= notes.length) currentIndex = notes.length - 1;
  saveNotes();
  render();
});

// 顏色切換
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const selectedColor = e.target.dataset.color;
    notes[currentIndex].color = selectedColor;
    saveNotes();
    render();
  });
});

function updateColorPicker() {
  const currentColor = notes[currentIndex]?.color || '#fff3a0';
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color === currentColor);
  });
}

render();

// 註冊 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}
