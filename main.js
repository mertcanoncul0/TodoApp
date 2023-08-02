const listsContainer = document.querySelector('[data-lists]');
const listForm = document.querySelector('[data-lists-form]');
const listInput = document.querySelector('[data-list-input]');
const tasksDisplay = document.querySelector('[data-tasks-display]');
const listTitle = document.querySelector('[data-list-title]');
const listTaskCount = document.querySelector('[data-list-count]');
const taskForm = document.querySelector('[data-tasks-form]');
const taskInput = document.querySelector('[data-task-input]');
const tasksContainer = document.querySelector('[data-tasks]');
const getCompleteBtn = document.querySelector('[data-get-tasks-complete]');
const listTemplate = document.querySelector('[data-list-template]');
const taskTemplate = document.querySelector('[data-task-template]');

let lists = JSON.parse(localStorage.getItem('lists')) || [];
let selectedListId = localStorage.getItem('selectedListId') || '';

function listsHandler(e) {
  if (e.target.tagName.toLowerCase() === 'li' || e.target.tagName.toLowerCase() === 'span') {
    selectedListId = e.target.dataset.listId;
    saveAndRender();
  }
}

function getCompleteHandler() {
  this.parentElement.querySelectorAll('.tasks > .task').forEach(task => {
    let taskChecked = task.querySelector('input');
    
    if (!taskChecked.checked) {
      task.classList.add('hidden');
    }
  });
} 

getCompleteBtn.addEventListener('click', getCompleteHandler); 

function createList(listName) {
  return { id: Date.now().toString(), name: listName, tasks: []}
}

function listSubmitHandler(e) {
  e.preventDefault();

  if (listInput.value === '' || listInput.value === null) { return; }
  
  lists.push(createList(listInput.value));
  listInput.value = '';
  listInput.focus();
  saveAndRender();
}

function createTask(taskName) {
  return { id: Date.now().toString(), name: taskName, isComplete: false }
}

function taskFormHandler(e) {
  e.preventDefault();

  if (taskInput.value === '' || taskInput.value === null) { return; }
  selectedList().tasks.push(createTask(taskInput.value));
  taskInput.value = '';
  taskInput.focus();
  saveAndRender(); 
}

function followTasksComplete(e) {
  if (e.target.tagName.toLowerCase() === 'input') {
    const selectedTask = selectedList().tasks.find(task => task.id === e.target.id);
    selectedTask.isComplete = e.target.checked;
    save();
    renderTaskCount(selectedList());
  }
}

// events
listsContainer.addEventListener('click', listsHandler);
listForm.addEventListener('submit', listSubmitHandler);
taskForm.addEventListener('submit', taskFormHandler);
tasksContainer.addEventListener('click', followTasksComplete)

function deleteListHandler() {
  const clickedListId = this.parentElement.parentElement.dataset.listId;

  lists.filter(list => {
    if (list.id === clickedListId) {
      lists.splice(lists.indexOf(list), 1);
      
      // set selectedListId empty
      selectedListId = '';
      saveAndRender();
    }
  });
}

function deleteTaskHandler() {
  const parentElement = this.parentElement.parentElement;
  const parentElementId = parentElement.querySelector('input').id;

  selectedList().tasks.filter(task => {
    if (task.id === parentElementId) {
      selectedList().tasks.splice(selectedList().tasks.indexOf(task), 1);
      
      saveAndRender();
    }
  });
}

function editListHandler() {
  const parentElements = this.parentElement.querySelectorAll('*');
  parentElements.forEach(element => {
    element.classList.add('hidden');
  });

  const editInput = document.createElement('input');
  const editButton = document.createElement('button');
  editButton.innerHTML = '+'
  editButton.classList.add('lists-btn');
  editInput.classList.add('lists-input');
  editInput.placeholder = 'enter new list name';
  this.parentElement.appendChild(editButton);
  this.parentElement.appendChild(editInput);
  editInput.focus();

  editInput.addEventListener('keydown', () => {
    if (e.key === 'Enter') {
      const clickedListId = this.parentElement.parentElement.dataset.listId;

      lists.filter(list => {
        if (list.id === clickedListId) {
          list.name = editInput.value !== '' ? editInput.value : list.name;
          saveAndRender();
        }
      })
    }
  });

  editButton.addEventListener('click', () => {
      const clickedListId = this.parentElement.parentElement.dataset.listId;

      lists.filter(list => {
        if (list.id === clickedListId) {
          list.name = editInput.value !== '' ? editInput.value : list.name;
          saveAndRender();
        }
      })
    }
  );
}

function editTaskHandler() {
  const parentElement = this.parentElement.parentElement;
  const editButton = document.createElement('button');
  editButton.innerHTML = '+'
  editButton.classList.add('lists-btn');

  const label = parentElement.querySelector('label');
  const div = parentElement.querySelector('div');
  div.classList.add('hidden');
  label.classList.add('hidden');

  const editInput = document.createElement('input');
  editInput.classList.add('lists-input');
  editInput.placeholder = 'enter new task name';
  this.parentElement.parentElement.appendChild(editInput);
  this.parentElement.parentElement.appendChild(editButton);
  editInput.focus();

  editInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const clickedListId = parentElement.querySelector('label').htmlFor;

      selectedList().tasks.filter(task => {
        if (task.id === clickedListId) {
          task.name = editInput.value !== '' ? editInput.value : task.name;
          saveAndRender();
        }
      });
    }
  });

  editButton.addEventListener('click', () => {
    const clickedListId = parentElement.querySelector('label').htmlFor;

    selectedList().tasks.filter(task => {
      if (task.id === clickedListId) {
        task.name = editInput.value !== '' ? editInput.value : task.name;
        saveAndRender();
      }
    });
  })
}

function renderLists() {
  lists.forEach(list => {
    const listElementTemplate = document.importNode(listTemplate.content, true);
    
    // list element
    const listElement = listElementTemplate.querySelector('li');
    listElement.dataset.listId = list.id;
    if (list.id === selectedListId) { listElement.classList.add('active-list'); }

    // list name
    const listName = listElementTemplate.querySelector('.list-name');
    listName.innerHTML = list.name;
    listName.dataset.listId = list.id;

    // buttons
    const editButton = listElementTemplate.querySelector('.edit-list-btn');
    const deleteButton  = listElementTemplate.querySelector('.delete-list-btn');

    // events
    deleteButton.addEventListener('click', deleteListHandler);
    editButton.addEventListener('click', editListHandler);

    // append
    listsContainer.appendChild(listElementTemplate);
  });
}

function renderTasks() {
  selectedList().tasks.forEach(task => {
    // task element
    const taskElement = document.importNode(taskTemplate.content, true);

    // checkbox element
    const checkboxElement = taskElement.querySelector('input');
    checkboxElement.id = task.id;
    checkboxElement.checked = task.isComplete;

    // label and span element
    const labelElement = taskElement.querySelector('label');
    labelElement.htmlFor = task.id;

    const spanElementName = taskElement.querySelector('.task-name');
    spanElementName.innerHTML = task.name

    // buttons
    const deleteButton = taskElement.querySelector('.delete-list-btn');
    const editButton = taskElement.querySelector('.edit-list-btn');

    // events
    editButton.addEventListener('click', editTaskHandler);
    deleteButton.addEventListener('click', deleteTaskHandler);

    // * appends
    tasksContainer.appendChild(taskElement);
  })
} 

function renderTaskCount(selectedList) {
  const inCompleteTaskCount = selectedList.tasks.filter(task => !task.isComplete).length;
  listTaskCount.innerHTML = `${inCompleteTaskCount} ${inCompleteTaskCount <= 1 ? 'task' : 'tasks'} remaining`
}

function render() {
  clearLists(listsContainer);
  renderLists();

  if (selectedListId === '') {
    tasksDisplay.classList.add('hidden');
  } else {
    tasksDisplay.classList.remove('hidden');
    listTitle.innerHTML = selectedList().name
    renderTaskCount(selectedList());
    clearLists(tasksContainer)
    renderTasks()
  }
} 

function save() {
  localStorage.setItem('lists', JSON.stringify(lists));
  localStorage.setItem('selectedListId', selectedListId);
}

function saveAndRender() {
  save();
  render();
}

function selectedList() {
  return lists.find(list => list.id === selectedListId);
}

function clearLists(listsContainer) {
  while (listsContainer.firstChild) {
    listsContainer.removeChild(listsContainer.firstChild);
  }
}

render();