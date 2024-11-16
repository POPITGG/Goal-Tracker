// Load tasks from local storage on page load
document.addEventListener('DOMContentLoaded', loadTasks);

// Add event listeners for buttons
document.getElementById('daily-btn').addEventListener('click', () => showSection('daily'));
document.getElementById('medium-btn').addEventListener('click', () => showSection('medium'));
document.getElementById('long-btn').addEventListener('click', () => showSection('long'));
document.getElementById('show-all-btn').addEventListener('click', showAllGoals);

// Handle key press for adding goals
document.getElementById('daily-input').addEventListener('keydown', (event) => handleKeyPress(event, 'daily'));
document.getElementById('medium-input').addEventListener('keydown', (event) => handleKeyPress(event, 'medium'));
document.getElementById('long-input').addEventListener('keydown', (event) => handleKeyPress(event, 'long'));

// Show specific section
function showSection(section) {
  document.querySelectorAll('.goal-section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(`${section}-section`).classList.remove('hidden');
}

// Show all goals (across categories)
function showAllGoals() {
  document.querySelectorAll('.goal-section').forEach(sec => sec.classList.remove('hidden'));
}

// Handle "Enter" key press for adding goals
function handleKeyPress(event, type) {
  if (event.key === 'Enter') {
    addGoal(type);
  }
}

function addGoal(type) {
  const input = document.getElementById(`${type}-input`);
  const deadline = document.getElementById(`${type}-deadline`);
  const goalsList = document.getElementById(`${type}-goals`);

  // Make sure goal is not empty
  if (!input.value.trim()) {
    alert('Please enter a goal!');
    return;
  }

  // Make sure Medium and Long goals have a deadline
  if ((type === 'medium' || type === 'long') && !deadline.value) {
    alert('Please add a date for your goal!');
    return;
  }

  const goal = {
    text: input.value.trim(),
    deadline: type !== 'daily' && deadline?.value ? deadline.value : null,
    type: type
  };

  // Add goal to local storage
  saveTaskToLocalStorage(goal);

  const li = document.createElement('li');
  li.className = 'goal-item';
  li.draggable = true;
  li.innerHTML = `
    <span>${goal.text} ${goal.deadline ? `(Deadline: ${goal.deadline})` : ''}</span>
  `;

  li.addEventListener('click', () => deleteGoal(li, goal));
  li.addEventListener('dragstart', (e) => dragStart(e));
  li.addEventListener('dragover', (e) => dragOver(e));
  li.addEventListener('dragenter', (e) => dragEnter(e));
  li.addEventListener('dragleave', (e) => dragLeave(e));
  li.addEventListener('drop', (e) => drop(e));
  li.addEventListener('dragend', (e) => dragEnd(e));

  goalsList.appendChild(li);
  input.value = '';
  if (deadline) deadline.value = '';  // Clear the deadline input after adding the goal
}

function deleteGoal(listItem, goal) {
  // Add the 'fade-out' class to start the animation
  listItem.classList.add('fade-out');

  // After the animation ends (1 second), remove the item from the DOM
  setTimeout(() => {
    listItem.remove();
    // Remove the goal from local storage
    removeTaskFromLocalStorage(goal);
  }, 1000); // This matches the duration of the fade-out animation
}

let draggedItem = null;

function dragStart(e) {
  draggedItem = e.target;
  e.target.style.opacity = 0.5;
}

function dragEnd(e) {
  e.target.style.opacity = '';  // Reset opacity when dragging ends
  draggedItem = null;
}

function dragOver(e) {
  e.preventDefault(); // Necessary to allow drop
}

function dragEnter(e) {
  e.preventDefault();
  const target = e.target;
  if (target && target !== draggedItem && target.nodeName === 'LI') {
    target.style.border = '2px dashed #4caf50'; // Visual indicator
  }
}

function dragLeave(e) {
  e.target.style.border = '';  // Reset border style
}

function drop(e) {
  e.preventDefault();
  const target = e.target;

  if (target && target !== draggedItem && target.nodeName === 'LI') {
    // Swap the dragged item with the target item
    const goalList = target.parentElement;
    const allItems = [...goalList.querySelectorAll('li')];
    const draggedIndex = allItems.indexOf(draggedItem);
    const targetIndex = allItems.indexOf(target);

    if (draggedIndex < targetIndex) {
      goalList.insertBefore(draggedItem, target.nextSibling);
    } else {
      goalList.insertBefore(draggedItem, target);
    }
  }

  e.target.style.border = ''; // Remove the dashed border
}

// Save task to local storage
function saveTaskToLocalStorage(goal) {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push(goal);
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Remove task from local storage
function removeTaskFromLocalStorage(goal) {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks = tasks.filter(task => task.text !== goal.text);  // Remove task by its text
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from local storage when the page loads
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  tasks.forEach(task => {
    const goalsList = document.getElementById(`${task.type}-goals`);
    const li = document.createElement('li');
    li.className = 'goal-item';
    li.draggable = true;
    li.innerHTML = `
      <span>${task.text} ${task.deadline ? `(Deadline: ${task.deadline})` : ''}</span>
    `;

    li.addEventListener('click', () => deleteGoal(li, task));
    li.addEventListener('dragstart', (e) => dragStart(e));
    li.addEventListener('dragover', (e) => dragOver(e));
    li.addEventListener('dragenter', (e) => dragEnter(e));
    li.addEventListener('dragleave', (e) => dragLeave(e));
    li.addEventListener('drop', (e) => drop(e));
    li.addEventListener('dragend', (e) => dragEnd(e));

    goalsList.appendChild(li);
  });
}

