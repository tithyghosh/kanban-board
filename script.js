const columns = {
  todo: document.querySelector("#to-do"),
  progress: document.querySelector("#in-progress"),
  done: document.querySelector("#done"),
};

const modal = document.querySelector(".modal");
const modalBg = document.querySelector(".bg");

const titleInput = document.querySelector("#task-title");
const descInput = document.querySelector("#task-desc");

let draggedItem = null;

// ---------- STORAGE ----------
function saveTasks() {
  const data = {
    todo: [],
    progress: [],
    done: [],
  };

  Object.keys(columns).forEach((key) => {
    const tasks = columns[key].querySelectorAll(".task");

    tasks.forEach((task) => {
      data[key].push({
        title: task.querySelector("h2").innerText,
        desc: task.querySelector("p").innerText,
      });
    });
  });

  localStorage.setItem("kanbanTasks", JSON.stringify(data));
}

function loadTasks() {
  const data = JSON.parse(localStorage.getItem("kanbanTasks"));
  if (!data) return;

  Object.keys(data).forEach((col) => {
    data[col].forEach((task) => {
      const newTask = createTask(task.title, task.desc);
      columns[col].appendChild(newTask);
    });
  });

  updateCount();
}

// ---------- TASK ----------
function createTask(title, desc) {
  const div = document.createElement("div");

  div.className = "task";
  div.draggable = true;

  div.innerHTML = `
        <h2>${title}</h2>
        <p>${desc}</p>
        <button>Delete</button>
    `;

  div.addEventListener("dragstart", () => {
    draggedItem = div;
  });

  div.querySelector("button").addEventListener("click", () => {
    div.remove();
    updateCount();
    saveTasks();
  });

  return div;
}

// ---------- COUNT ----------
function updateCount() {
  Object.values(columns).forEach((col) => {
    const count = col.querySelector(".right");
    count.innerText = col.querySelectorAll(".task").length;
  });
}

// ---------- DRAG ----------
Object.values(columns).forEach((col) => {
  col.addEventListener("dragover", (e) => {
    e.preventDefault();
    col.classList.add("hover-over");
  });

  col.addEventListener("dragleave", () => {
    col.classList.remove("hover-over");
  });

  col.addEventListener("drop", (e) => {
    e.preventDefault();

    col.appendChild(draggedItem);

    col.classList.remove("hover-over");

    updateCount();
    saveTasks();
  });
});

// ---------- MODAL ----------
document.querySelector("#toggle-modal").onclick = () => {
  modal.classList.toggle("active");
};

modalBg.onclick = () => {
  modal.classList.remove("active");
};

// ---------- ADD TASK ----------
document.querySelector("#add-task").onclick = () => {
  const title = titleInput.value.trim();
  const desc = descInput.value.trim();

  if (!title) return;

  const task = createTask(title, desc);

  columns.todo.appendChild(task);

  titleInput.value = "";
  descInput.value = "";

  modal.classList.remove("active");

  updateCount();
  saveTasks();
};

// load tasks
loadTasks();
