const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const addBtn = $(".add-btn");
const form = $("#addTaskModal");
const formData = $(".todo-app-form");
const titleInput = $("#taskTitle");
const edit = $(".task-menu");
const task = $(".task-grid");
const btnSubmit = $(".btn-primary");
const scrollForm = $(".modal");
const searchInput = $(".search-input");
const btnCompleted = $(".tab-button-complete");
const btnActive = $(".btn-active");
const alertBtn = $(".alert-close");
const closeAlert = $(".alert-toast");

const closeModal = $$(".modal-close");

// console.log(alertBtn);

const todoTask = JSON.parse(localStorage.getItem("localtasks")) ?? [];

// lọc các task đã hoàn thành
btnCompleted.onclick = function (e) {
    btnCompleted.classList.toggle("active");
    const marks = todoTask.filter((mark) => mark.isCompleted);
    if (marks) {
        renderTask(marks);
    }
};

// đóng warn thủ công
alertBtn.onclick = function () {
    closeAlert.classList.remove("turn-off");
};
btnActive.onclick = function () {
    renderTask();
};

searchInput.oninput = function (event) {
    // lưu giá trị input và xóa khoảng trắng
    const searchValue = event.target.value.trim().toLowerCase();
    // lấy ra title từng task
    const newTitle = todoTask.filter((task) =>
        task.title.includes(String(searchValue.toLowerCase()))
    );

    renderTask(newTitle);
};

let editIndex = null;

task.onclick = function (e) {
    const editBtn = e.target.closest(".edit-btn");
    const deleteBtn = e.target.closest(".delete");
    const completeBtn = e.target.closest(".complete");

    // edit
    if (editBtn) {
        const taskIndex = editBtn.dataset.index;
        const task = todoTask[taskIndex];
        editIndex = taskIndex;

        for (const key in task) {
            const value = task[key];
            const input = $(`[name="${key}"]`);
            if (input) {
                input.value = value;
            }
        }
        const formTitle = form.querySelector(".modal-title");
        if (formTitle) {
            formTitle.dataset.original = formTitle.textContent;

            formTitle.textContent = "Edit Task";
        }
        if (btnSubmit) {
            btnSubmit.dataset.original = btnSubmit.textContent;

            btnSubmit.textContent = "Edit Task";
        }
        openForm();
    }
    // delete
    if (deleteBtn) {
        const taskIndex = deleteBtn.dataset.index;
        const task = todoTask[taskIndex];

        if (confirm(`bạn chắc muốn xóa công việc ${task.title}?`)) {
            todoTask.splice(taskIndex, 1);
            saveTodoTask();
            renderTask();
        }
    }

    // complete
    if (completeBtn) {
        const taskIndex = completeBtn.dataset.index;
        const task = todoTask[taskIndex];
        task.isCompleted = !task.isCompleted;
        saveTodoTask();
        renderTask();
    }
};

// saveTask
function saveTodoTask() {
    // lưu task vào local storage
    localStorage.setItem("localtasks", JSON.stringify(todoTask));
}

// add Task
formData.onsubmit = function (e) {
    e.preventDefault();

    const inputTitle = $(".form-input");
    // lấy dữ liệu từ form
    const newTask = Object.fromEntries(new FormData(formData));
    // lọc ra title có sẵn đễ kiểm tra xem có trùng không
    const allTitle = todoTask.map((task) => task.title.toLowerCase());
    // lấy dữ liệu title để kiểm tra xem có trùng không
    const value = inputTitle.value.toLowerCase();
    // duyện qua các key và value
    const checkInput = Object.entries(newTask);
    // lọc các key có value rỗng
    const missValue = checkInput.filter(([key, value]) => value === "".trim());
    // in ra thông báo nếu chưa nhập đủ trường
    console.log(missValue);
    if (missValue.length > 0) {
        // xóa thông báo cũ
        const oldAlert = document.querySelector(".alert-miss");
        if (oldAlert) oldAlert.remove();
        const html = missValue
            .map(
                (key) => `<div class="alert-content">
                        <strong>⚠️ Cảnh báo:</strong> thiếu ${key} kìa bạn
                        <button class="alert-close">×</button>
                    </div>
                `
            )
            .join("");
        const body = document.body;
        const div = document.createElement("div");
        div.className = "alert-miss";
        div.innerHTML = html;
        body.append(div);
        const missAlert = $(".alert-miss");
        missAlert.classList.add("turn-off");

        return setTimeout(() => missAlert.classList.remove("turn-off"), 3000);
    }
    // thông báo nếu trung title
    if (allTitle.includes(value)) {
        closeAlert.classList.add("turn-off");
        return setTimeout(() => closeAlert.classList.remove("turn-off"), 3000);
    }
    //  nếu có index tức đang sửa form
    if (editIndex) {
        todoTask[editIndex] = newTask;
    } else {
        // mặc định chưa hoàn thành
        newTask.isCompleted = false;
        // thêm task vào đầu danh sách
        todoTask.unshift(newTask);
    }

    saveTodoTask();
    closeForm();
    renderTask();
};

// escapese HTML
function escapeseHTML(html) {
    const div = document.createElement("div");
    div.textContent = html;
    return div.innerHTML;
}

// render task
function renderTask(data = todoTask) {
    if (!data.length) {
        return (task.innerHTML = `<p>Không có task nào</p>`);
    }
    const html = data
        .map(
            (task, index) =>
                `<div class="task-card ${escapeseHTML(task.color)} ${
                    task.isCompleted ? "completed" : ""
                }">
                    <div class="task-header">
                        <h3 class="task-title">${escapeseHTML(task.title)}</h3>
                        <button class="task-menu">
                            <i class="fa-solid fa-ellipsis fa-icon"></i>
                            <div class="dropdown-menu">
                                <div class="dropdown-item edit-btn" data-index=${index}>
                                    <i
                                        class="fa-solid fa-pen-to-square fa-icon"
                                    ></i>
                                    Edit
                                </div>
                                <div class="dropdown-item complete" data-index=${index}>
                                    <i class="fa-solid fa-check fa-icon"></i>
                                    ${
                                        task.isCompleted
                                            ? "Mark as Active"
                                            : "Mark as Complete"
                                    }
                                </div>
                                <div class="dropdown-item delete" data-index=${index}>
                                    <i class="fa-solid fa-trash fa-icon"></i>
                                    Delete
                                </div>
                            </div>
                        </button>
                    </div>
                    <p class="task-description">${escapeseHTML(
                        task.description
                    )}
                    </p>
                    <div class="task-time">${escapeseHTML(
                        task.start
                    )} - ${escapeseHTML(task.end)}</div>
                </div>`
        )
        .join("");
    task.innerHTML = html;
}

// show modal
function openForm() {
    form.classList.add("show");
    // forcus form

    setTimeout(() => titleInput.focus(), 100);
}

// close form
function closeForm() {
    const formTitle = form.querySelector(".modal-title");
    if (formTitle) {
        formTitle.textContent =
            formTitle.dataset.original || formTitle.textContent;
        delete formTitle.dataset.original;
    }
    if (btnSubmit) {
        btnSubmit.textContent =
            btnSubmit.dataset.original || btnSubmit.textContent;
        delete btnSubmit.dataset.original;
    }
    form.classList.remove("show");

    // reset form
    formData.reset();

    // cuộn lên đầu form
    setTimeout(() => (scrollForm.scrollTop = 0), 300);
    // đóng form sửa
    editIndex = null;
}

addBtn.onclick = function () {
    openForm();
};

closeModal.forEach(
    (item) =>
        (item.onclick = function () {
            closeForm();
        })
);

// render lần đầu để lấy dữ liệu từ local storage
renderTask();
