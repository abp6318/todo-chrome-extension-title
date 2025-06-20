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
    console.error('File container not found');
    return;
  }

  // create a new contianer element to add the TODOs to within the file container
  const existingTodoListElement = document.querySelector('#todo-list');
  if (existingTodoListElement) {
    existingTodoListElement.innerHTML = '';
  } else {
    const newTodoListElement = document.createElement('div');
    newTodoListElement.id = 'todo-list';
    fileContainer.prepend(newTodoListElement);
  }

  const todoListElement = document.querySelector('#todo-list');
  const tableElement = document.createElement('calcite-table');
  tableElement.setAttribute('striped', 'true');
  tableElement.setAttribute('page-size', '5');
  renderTableRows(tableElement);
  todoListElement.appendChild(tableElement);
}

function renderTableRows(tableElement) {
  // create the header row
  // const headerRow = document.createElement('calcite-table-row');
  // headerRow.innerHTML = `
  //   <calcite-table-header heading="Status"></calcite-table-header>
  //   <calcite-table-header heading="File name"></calcite-table-header>
  //   <calcite-table-header heading="Line number"></calcite-table-header>
  // `;
  Array.from(document.querySelectorAll('tr'))
    .filter(row => {
      if (row.innerText.toLowerCase().includes('todo')){
        const tableRowElement = document.createElement('tr');
        tableRowElement.className = 'todo-item';
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
        tableRowElement.innerHTML = `
          <td>${rowInformation.status}</td>
          <td><a href="#${rowInformation.anchor}">${rowInformation.shortFileName}</a></td>
          <td>${rowInformation.tdText}</td>
        `;

        tableElement.appendChild(tableRowElement);
      }
    });
}