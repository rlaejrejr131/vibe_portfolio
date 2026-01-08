// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove, set } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByiHMNSitn0MYJhRLwgLaev2KazxdWwGc",
  authDomain: "vibe-todo-33409.firebaseapp.com",
  projectId: "vibe-todo-33409",
  storageBucket: "vibe-todo-33409.firebasestorage.app",
  messagingSenderId: "900098118080",
  appId: "1:900098118080:web:380c1df30aae832dbd3825",
  databaseURL: "https://vibe-todo-33409-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const todosRef = ref(db, "todos");

let todos = [];
let editingId = null; // 현재 수정 중인 할 일 ID

const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');

// 할 일 추가
async function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') {
        alert('할 일을 입력해주세요!');
        return;
    }

    try {
        await push(todosRef, {
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        });
        todoInput.value = '';
    } catch (error) {
        console.error("할 일 추가 오류:", error);
        alert('할 일 추가 중 오류가 발생했습니다.');
    }
}

// 할 일 완료 토글
async function toggleTodo(id) {
    try {
        const todoRef = ref(db, `todos/${id}`);
        const todo = todos.find(t => t.id === id);
        if (todo) {
            await update(todoRef, {
                completed: !todo.completed
            });
        }
    } catch (error) {
        console.error("할 일 상태 변경 오류:", error);
        alert('할 일 상태 변경 중 오류가 발생했습니다.');
    }
}

// 할 일 삭제
async function deleteTodo(id) {
    try {
        const todoRef = ref(db, `todos/${id}`);
        await remove(todoRef);
    } catch (error) {
        console.error("할 일 삭제 오류:", error);
        alert('할 일 삭제 중 오류가 발생했습니다.');
    }
}

// 할 일 수정 모드 진입
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo && todo.completed) {
        alert('완료된 할 일은 수정할 수 없습니다!');
        return;
    }
    editingId = id;
    renderTodos();
}

// 할 일 수정 저장
async function saveEdit(id, newText) {
    if (newText.trim() === '') {
        alert('할 일 내용을 입력해주세요!');
        return;
    }
    
    // 먼저 수정 모드 종료 (onValue 리스너가 호출되기 전에)
    editingId = null;
    renderTodos(); // 즉시 일반 모드로 전환
    
    try {
        const todoRef = ref(db, `todos/${id}`);
        await update(todoRef, {
            text: newText.trim()
        });
        // onValue 리스너가 자동으로 renderTodos()를 호출하므로 여기서는 추가 렌더링 불필요
    } catch (error) {
        console.error("할 일 수정 오류:", error);
        alert('할 일 수정 중 오류가 발생했습니다.');
        // 오류 발생 시 다시 수정 모드로 돌아가지는 않음
    }
}

// 할 일 수정 취소
function cancelEdit() {
    editingId = null;
    renderTodos();
}

// 할 일 목록 렌더링
function renderTodos() {
    todoList.innerHTML = '';

    if (todos.length === 0) {
        const emptyMsg = document.createElement('li');
        emptyMsg.className = 'empty-message';
        emptyMsg.textContent = '할 일이 없습니다. 새로운 할 일을 추가해보세요!';
        todoList.appendChild(emptyMsg);
        return;
    }

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.disabled = editingId === todo.id; // 수정 중일 때 체크박스 비활성화
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        // 수정 모드인 경우
        if (editingId === todo.id) {
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.className = 'edit-input';
            editInput.value = todo.text;
            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveEdit(todo.id, editInput.value);
                } else if (e.key === 'Escape') {
                    cancelEdit();
                }
            });

            const saveBtn = document.createElement('button');
            saveBtn.className = 'save-btn';
            saveBtn.textContent = '저장';
            saveBtn.addEventListener('click', () => saveEdit(todo.id, editInput.value));

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'cancel-btn';
            cancelBtn.textContent = '취소';
            cancelBtn.addEventListener('click', cancelEdit);

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'edit-buttons';
            buttonContainer.appendChild(saveBtn);
            buttonContainer.appendChild(cancelBtn);

            li.appendChild(checkbox);
            li.appendChild(editInput);
            li.appendChild(buttonContainer);
        } else {
            // 일반 모드인 경우
            const span = document.createElement('span');
            span.className = 'todo-text';
            span.textContent = todo.text;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '삭제';
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'todo-buttons';
            
            // 완료되지 않은 할 일만 수정 버튼 표시
            if (!todo.completed) {
                const editBtn = document.createElement('button');
                editBtn.className = 'edit-btn';
                editBtn.textContent = '수정';
                editBtn.addEventListener('click', () => editTodo(todo.id));
                buttonContainer.appendChild(editBtn);
            }
            
            buttonContainer.appendChild(deleteBtn);

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(buttonContainer);
        }

        todoList.appendChild(li);
    });

    // 수정 모드일 때 입력 필드에 포커스
    if (editingId !== null) {
        const editInput = document.querySelector('.edit-input');
        if (editInput) {
            editInput.focus();
            editInput.select();
        }
    }
}

// 이벤트 리스너
addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Realtime Database에서 할 일 목록 실시간 동기화
onValue(todosRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        todos = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));
    } else {
        todos = [];
    }
    renderTodos();
}, (error) => {
    console.error("할 일 목록 동기화 오류:", error);
});
