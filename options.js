const commandName = "screenshot-all";

const shortcutInput = document.querySelector('#shortcut');

async function updateUI() {
    let commands = await browser.commands.getAll();
    for (let command of commands) {
        if (command.name === commandName) {
            shortcutInput.value = command.shortcut;
        }
    }
}

async function updateShortcut() {
    await browser.commands.update({
        name: commandName,
        shortcut: document.querySelector('#shortcut').value
    });
}

async function resetShortcut() {
    await browser.commands.reset(commandName);
    await updateUI();
}

function readKeys(e) {
    let keyCombinationString = "";
    if (e.ctrlKey) {
        keyCombinationString += "Ctrl + ";
    }

    if (e.altKey) {
        keyCombinationString += "Alt + ";
    }

    if (e.shiftKey) {
        keyCombinationString += "Shift + ";
    }

    if (e.key.length === 1) {
        keyCombinationString += e.key.toUpperCase();
        shortcutInput.value = keyCombinationString;
    }
}

document.addEventListener('DOMContentLoaded', updateUI);

shortcutInput.onkeydown = readKeys;
document.querySelector('#update').onclick = updateShortcut;
document.querySelector('#reset').onclick = resetShortcut;