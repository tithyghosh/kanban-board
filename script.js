const toDO = document.querySelector("#to-do");
const progress = document.querySelector("#in-progress");
const done = document.querySelector("#done");

const columns = [toDO, progress, done];

const modal = document.querySelector(".modal");
const modalBg = document.querySelector(".bg");

const toggleModalBtn = document.querySelector("#toggle-modal");
const addTaskBtn = document.querySelector("#add-task");

const taskTitleInput = document.querySelector("#task-title");
const taskDescInput = document.querySelector("#task-area");

let draggedItem = null;

// ---------------- COUNT ----------------

function updateCount() {
  columns.forEach((col) => {
    const count = col.querySelector(".right");
    const tasks = col.querySelectorAll(".task");

    count.innerText = tasks.length;
  });
}

// ---------------- DRAG ----------------

function enableDrag(task) {
  task.addEventListener("dragstart", () => {
    draggedItem = task;
  });
}

// ---------------- DROP LOGIC ----------------

columns.forEach((column) => {
  column.addEventListener("dragover", (e) => {
    e.preventDefault();
    column.classList.add("hover-over");

    const afterElement = getDragAfterElement(column, e.clientY);

    if (afterElement == null) {
      column.appendChild(draggedItem);
    } else {
      column.insertBefore(draggedItem, afterElement);
    }
  });

  column.addEventListener("dragleave", () => {
    column.classList.remove("hover-over");
  });

  column.addEventListener("drop", (e) => {
    e.preventDefault();
    column.classList.remove("hover-over");

    updateCount();
    saveTasks();
  });
});

// ---------- SORT POSITION ----------

function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll(".task")];

  return elements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}

// ---------------- MODAL ----------------

toggleModalBtn.addEventListener("click", () => {
  modal.classList.toggle("active");
});

modalBg.addEventListener("click", () => {
  modal.classList.remove("active");
});

// ---------------- CREATE TASK ----------------

function createTask(title, desc) {
  const div = document.createElement("div");

  div.classList.add("task");
  div.draggable = true;

  div.innerHTML = `
<h2>${title}</h2>
<p>${desc}</p>
<button class="delete-btn">Delete</button>
`;

  enableDrag(div);

  div.querySelector(".delete-btn").addEventListener("click", () => {
    div.remove();
    updateCount();
    saveTasks();
  });

  return div;
}

// ---------------- ADD TASK ----------------

addTaskBtn.addEventListener("click", () => {
  const title = taskTitleInput.value.trim();
  const desc = taskDescInput.value.trim();

  if (!title) return;

  const task = createTask(title, desc);

  toDO.appendChild(task);

  taskTitleInput.value = "";
  taskDescInput.value = "";

  modal.classList.remove("active");

  updateCount();
  saveTasks();
});

// ---------------- STORAGE ----------------

function saveTasks() {
  const data = {
    todo: [],
    progress: [],
    done: [],
  };

  columns.forEach((col, i) => {
    const tasks = col.querySelectorAll(".task");

    tasks.forEach((task) => {
      const obj = {
        title: task.querySelector("h2").innerText,
        desc: task.querySelector("p").innerText,
      };

      if (i === 0) data.todo.push(obj);
      if (i === 1) data.progress.push(obj);
      if (i === 2) data.done.push(obj);
    });
  });

  localStorage.setItem("kanbanTasks", JSON.stringify(data));
}

function loadTasks() {
  const data = JSON.parse(localStorage.getItem("kanbanTasks"));

  if (!data) return;

  data.todo.forEach((t) => {
    toDO.appendChild(createTask(t.title, t.desc));
  });

  data.progress.forEach((t) => {
    progress.appendChild(createTask(t.title, t.desc));
  });

  data.done.forEach((t) => {
    done.appendChild(createTask(t.title, t.desc));
  });

  updateCount();
}

// initial load
loadTasks();
