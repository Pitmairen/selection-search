
chrome.runtime.onMessage.addListener(handleMessages);


async function handleMessages(message) {

    if (message.target !== 'offscreen-doc') {
        return;
    }

    // Dispatch the message to an appropriate handler.
    switch (message.type) {
        case 'copy-data-to-clipboard':
            await copyToClipboard(message.data);
            break;
        default:
            console.warn(`Unexpected message type received: '${message.type}'.`);
    }
}

async function copyToClipboard(data) {
    try {
        //await navigator.clipboard.writeText(data);
        var copyDiv = document.createElement('div');
        copyDiv.contentEditable = true;
        document.body.appendChild(copyDiv);
        copyDiv.innerText = data;
        copyDiv.unselectable = "off";
        copyDiv.focus();
        document.execCommand('SelectAll');
        document.execCommand("Copy", false, null);
        document.body.removeChild(copyDiv);
    } finally {
        window.close()
    }
}