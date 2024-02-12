import ToDoList from "./todolist.js";
import ToDoItem from "./todoitem.js";

const toDoList = new ToDoList();

// Launch app
document.addEventListener("readystatechange", (event) => {
    if (event.target.readyState === "complete") {
        initApp();
    }
});

function initApp() {
    // Add listeners
    const itemEntryForm = document.getElementById("itemEntryForm");
    itemEntryForm.addEventListener("submit", (event) => {
        event.preventDefault();
        processSubmission();
    });

    const clearItems = document.getElementById("clearItems");
    clearItems.addEventListener("click", (event) => {
        const list = toDoList.getList();
        if (list.length) {
            const confirmed = confirm("Are you sure you want to clear the entire list?");
            if (confirmed) {
                toDoList.clearList();
                updatePersistentData(toDoList.getList());
                refreshPage();
            }
        }
    });

    // Procedural
    loadListObject();
    refreshPage();
}

function loadListObject() {
    const storedList = localStorage.getItem("myToDoList");
    if (typeof storedList !== "string") {
        return;
    } else {
        const parsedList = JSON.parse(storedList);
        parsedList.forEach(item => {
            const newToDoItem = createNewItem(item._id, item._item);
            toDoList.addItemToList(newToDoItem);
        })
    }
}

function refreshPage() {
    clearListDisplay();
    renderList();
    clearItemEntryField();
    setFocusOnItemEntry();
}

function clearListDisplay() {
    const parentElement = document.getElementById("listItems");
    deleteContents(parentElement);
}

function deleteContents(element) {
    let child = element.lastElementChild;
    while (child) {
        element.removeChild(child);
        child = element.lastElementChild;
    }
}

function renderList() {
    const list = toDoList.getList();
    list.forEach(item => {
        buildListItem(item);
    });
}

function buildListItem(item) {
   const div = document.createElement("div");
   div.className = "item";
   const check = document.createElement("input");
   check.type = "checkbox";
   check.id = item.getId();//"item_" + item.getId();
   check.tabIndex = 0;
   addClickListenerToCheckbox(check);
   const label = document.createElement("label");
   label.htmlFor = check.id;
   label.textContent = item.getItem();
   div.appendChild(check);
   div.appendChild(label);
   const container = document.getElementById("listItems");
   container.appendChild(div);
}

function addClickListenerToCheckbox(checkbox) {
    checkbox.addEventListener("click", (event) => {
        toDoList.removeItemFromList(checkbox.id);        
        updatePersistentData(toDoList.getList());
        const removedText = getLabelText(checkbox.id);
        updateConfirmation(removedText, "removed from list");
        setTimeout(() => {
            refreshPage();
        }, 1000);
    });
}

function getLabelText(id) {
    return document.getElementById(id).nextElementSibling().textContent;
}

function updatePersistentData(listArray) {
    localStorage.setItem("myToDoList", JSON.stringify(listArray));
}

function clearItemEntryField() {
    document.getElementById("newItem").value = "";
}

function setFocusOnItemEntry() {
    document.getElementById("newItem").focus();
}

function processSubmission() {
    const newEntryText = getNewEntry();
    if (!newEntryText.length) {
        return;
    }
    const nextItemId = calcNextItemId();
    const toDoItem = createNewItem(nextItemId, newEntryText);
    toDoList.addItemToList(toDoItem);
    updatePersistentData(toDoList.getList());
    updateConfirmation(newEntryText, "added");
    refreshPage();
}

function getNewEntry() {
    return document.getElementById("newItem").value.trim();
}

function calcNextItemId() {
    let nextItemId = 1;
    const list = toDoList.getList();
    if (list.length > 0) {
        nextItemId = list[list.length - 1].getId() + 1;
    }
    return nextItemId;
}

function createNewItem(id, text) {
    const toDo = new ToDoItem();
    toDo.setId(id);
    toDo.setItem(text);
    return toDo;
}

function updateConfirmation(newEntryText, actionVerb) {
    document.getElementById("confirmation").textContent = `${newEntryText} ${actionVerb}.`;
}