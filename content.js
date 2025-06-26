window.addEventListener('load', function () {
  console.log('"// TODO: Chrome extension title" is running in the background.\n\nTo disable it, go to your Chrome extensions page (chrome://extensions/) and disable or remove it. This extension does not save, modify, or distribute your code in any way.');

  const observer = new MutationObserver(() => {
    observer.disconnect(); // Disconnect the observer before modifying the DOM
    renderTable();
    observer.observe(document.body, { childList: true, subtree: true }); // Reconnect the observer after modifications
  });

  observer.observe(document.body, { childList: true, subtree: true });
});

function renderTable() {
  // get the file container element made by GitHub
  const fileContainer = document.querySelector('#files');
  if (!fileContainer) {
    return;
  }

  // create a new contianer element to add the TODOs to within the file container
  const existingTodoListContainerElement = document.querySelector('.todo-container');
  if (existingTodoListContainerElement) {
    existingTodoListContainerElement.innerHTML = '';
  } else {
    const newTodoListContainerElement = document.createElement('div');
    newTodoListContainerElement.className = 'todo-container';
    fileContainer.prepend(newTodoListContainerElement);
  }

  const todoListContainerElement = document.querySelector('.todo-container');
  const tableElement = createTodoTable();
  todoListContainerElement.appendChild(tableElement);
}

function createTodoTable() {
  // create the table element
  const tableElement = document.createElement('calcite-table');
  tableElement.className = 'todo-table';

  // create the header row
  const headerRow = document.createElement('tr');
  headerRow.className = 'todo-tr';
  headerRow.innerHTML = `
    <th class="todo-th">TODO Status</th>
    <th class="todo-th">File name</th>
    <th class="todo-th">Line number</th>
  `;
  tableElement.appendChild(headerRow);
  Array.from(document.querySelectorAll('tr'))
    .filter(row => {
      if (row.innerText.toLowerCase().includes('todo')){
        // break down the row's information into an object
        const rowInformation = {
          oldLineNumber: row.children[0].getAttribute('data-line-number'),
          existsInOld: row.children[1].innerText.toLowerCase().includes('todo'),
          newLineNumber: row.children[2].getAttribute('data-line-number'),
          existsInNew: row.children[3].innerText.toLowerCase().includes('todo'),
          fullFileName: row.closest('copilot-diff-entry').getAttribute('data-file-path'),
          shortFileName: row.closest('copilot-diff-entry').getAttribute('data-file-path').split('/').pop(),
        }

        if (rowInformation.existsInOld && rowInformation.existsInNew) {
          rowInformation.status = 'carry-over';
          rowInformation.tdText = 'Old line ' + rowInformation.oldLineNumber + ' / New line ' + rowInformation.newLineNumber;
          rowInformation.anchor = row.children[0].id;
        } else if (rowInformation.existsInOld) {
          rowInformation.status = 'removed';
          rowInformation.tdText = 'Old line ' + rowInformation.oldLineNumber;
          rowInformation.anchor = row.children[0].id;
        } else if (rowInformation.existsInNew) {
          rowInformation.status = 'added';
          rowInformation.tdText = 'New line ' + rowInformation.newLineNumber;
          rowInformation.anchor = row.children[2].id;
        }

        // create the table row element and populate it with the information
        const tableRowElement = document.createElement('tr');
        tableRowElement.className = 'todo-tr';
        tableRowElement.innerHTML = `
          <td class="todo-td">${rowInformation.status}</td>
          <td class="todo-td"><a href="#${rowInformation.anchor}">${rowInformation.shortFileName}</a></td>
          <td class="todo-td">${rowInformation.tdText}</td>
        `;

        tableElement.appendChild(tableRowElement);
      }
    });
  return tableElement;
}