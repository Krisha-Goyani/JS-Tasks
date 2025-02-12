const searchInput = document.getElementById("search");
const taskList = document.getElementById("task-list");
const newTaskInput = document.getElementById("new-task");
const submitButton = document.getElementById("submit");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

function animateProgress() {
  let progress = 0;
  let interval = setInterval(() => {
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        progressBar.style.width = "0%";
        progressText.innerText = "0%";
      }, 500);
    } else {
      progress += 5;
      progressBar.style.width = progress + "%";
      progressBar.style.border = "1px solid black";
      progressText.innerText = progress + "%";
    }
  }, 100);
}

searchInput.addEventListener("input", function () {
  let filter = searchInput.value.toLowerCase();
  let rows = taskList.getElementsByTagName("tr");
  for (let row of rows) {
    let taskText = row.cells[0].innerText.toLowerCase();
    row.style.display = taskText.includes(filter) ? "" : "none";
  }
});

submitButton.addEventListener("click", function () {
  if (newTaskInput.value.trim() !== "") {
    let newRow = document.createElement("tr");
    newRow.innerHTML = `<td contenteditable="false" style="text-align: start;">${newTaskInput.value} <button class="update">Update</button></td>
                <td><div class="btns">                              
                    <button class="edit"><b>Edit</b></button> 
                    <button class="delete"><b>Delete</b></button>
                </div></td>`;
    taskList.appendChild(newRow);
    newTaskInput.value = "";
    animateProgress();
  }
});

taskList.addEventListener("click", function (event) {
  const clickedElement = event.target;
  const deleteButton = clickedElement.closest(".delete");
  const editButton = clickedElement.closest(".edit");
  const updateButton = clickedElement.closest(".update");
  
  const row = clickedElement.closest("tr");

  if (deleteButton && row) {
    // Handle delete
    row.remove();
  } else if (editButton && row) {
    // Handle edit
    let taskCell = row.cells[0];
    let updateButton = taskCell.querySelector(".update");
    taskCell.contentEditable = "true";
    taskCell.focus();
    updateButton.style.display = "inline-block";
  } else if (updateButton && row) {
    // Handle update
    let taskCell = row.cells[0];
    taskCell.contentEditable = "false";
    updateButton.style.display = "none";
  }
});
