// --- 側邊選單與分頁切換邏輯 ---
const menuBtn = document.getElementById('menu-btn');
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const pageTitle = document.getElementById('page-title');

const pageHome = document.getElementById('page-home');
const pageNotes = document.getElementById('page-notes');

const navHome = document.getElementById('nav-home');
const navNotes = document.getElementById('nav-notes');

function toggleDrawer(open) {
	if (open) {
		drawer.classList.add('active');
		drawerOverlay.classList.add('active');
	} else {
		drawer.classList.remove('active');
		drawerOverlay.classList.remove('active');
	}
}

menuBtn.addEventListener('click', () => toggleDrawer(true));
drawerOverlay.addEventListener('click', () => toggleDrawer(false));

function switchPage(page) {
	if (page === 'home') {
		pageHome.classList.add('active');
		pageNotes.classList.remove('active');
		navHome.classList.add('active');
		navNotes.classList.remove('active');
		pageTitle.innerText = '主頁';
	} else if (page === 'notes') {
		pageHome.classList.remove('active');
		pageNotes.classList.add('active');
		navHome.classList.remove('active');
		navNotes.classList.add('active');
		pageTitle.innerText = '滑動便利貼';
		render(); // 切換到便利貼頁面時重新繪製卡片
	}
	toggleDrawer(false);
}

navHome.addEventListener('click', () => switchPage('home'));
navNotes.addEventListener('click', () => switchPage('notes'));


// --- 學測倒數計時邏輯 ---
function updateCountdown() {
	// 設定學測目標日期 (可自行依需求調整月份與日期)
	const targetDate = new Date('2027-01-20T00:00:00');
	const now = new Date();
	const diff = targetDate - now;

	const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
	const daysElement = document.getElementById('days-count');
	if (daysElement) {
		daysElement.innerText = days > 0 ? days : 0;
	}
}
updateCountdown();


// --- 滑動便利貼邏輯 ---
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
	if (!container) return;
	container.innerHTML = '';
	notes.forEach((note, index) => {
		const card = document.createElement('div');
		card.className = `note-card ${note.color === '#2d2d2d' ? 'dark' : ''}`;
		card.style.backgroundColor = note.color;
		
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

	if (indicator) {
		indicator.innerText = `${currentIndex + 1} / ${notes.length}`;
	}
	updateColorPicker();
}

// 觸控手勢
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
			currentIndex++;
		} else if (diffX > 0 && currentIndex > 0) {
			currentIndex--;
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

// 匯出與匯入
document.getElementById('export-btn').addEventListener('click', () => {
	if (notes.length === 0) {
		alert('目前沒有便利貼可以匯出！');
		return;
	}
	
	const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
	const downloadAnchor = document.createElement('a');
	const dateStr = new Date().toISOString().split('T')[0];
	
	downloadAnchor.setAttribute("href", dataStr);
	downloadAnchor.setAttribute("download", `sticker_backup_${dateStr}.json`);
	
	document.body.appendChild(downloadAnchor);
	downloadAnchor.click();
	downloadAnchor.remove();
});

const importFileInput = document.getElementById('import-file');

document.getElementById('import-btn').addEventListener('click', () => {
	importFileInput.click();
});

importFileInput.addEventListener('change', (e) => {
	const file = e.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = (event) => {
		try {
			const importedNotes = JSON.parse(event.target.result);
			if (Array.isArray(importedNotes)) {
				notes = importedNotes;
				currentIndex = 0;
				saveNotes();
				render();
				alert('便利貼匯入成功！');
			} else {
				alert('檔案格式不正確，無法匯入！');
			}
		} catch (err) {
			alert('讀取檔案失敗，請確定選擇的是正確的備份 JSON 檔案！');
		}
	};
	
	reader.readAsText(file);
	importFileInput.value = '';
});

// 初始渲染
render();

// 註冊 Service Worker
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('./sw.js');
}
