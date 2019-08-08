browser.commands.onCommand.addListener(command => {
    if (command === "screenshot-all") {
        if (tabsToScreenshot === 0) {
            browser.windows.getCurrent({populate: true}).then(screenshotAll);
        }
    }
});

let urls= [];
let tabsToScreenshot = 0;
let pendingDeleteUrls = 0;

browser.downloads.onChanged.addListener(downloadFinishedListener);

function screenshotAll(windowInfo) {
    tabsToScreenshot = windowInfo.tabs.length;
    console.log("screenshotting " + tabsToScreenshot + " tabs");

    for (let tabInfo of windowInfo.tabs) {
        browser.tabs.captureTab(tabInfo.id).then(function(imageUri) {onCaptured(imageUri, tabInfo)}, onError);
    }
}

function onCaptured(imageUri, tabInfo) {
    let url = URL.createObjectURL(dataURItoBlob(imageUri));
    urls.push(url);
    let filename = tabInfo.title.replace(/[\/:*?"<>|]/, "");
    browser.downloads.download({
        url: url,
        saveAs: false,
        filename: "screenshot-all/" + filename + ".png",
        conflictAction: "uniquify"
    }).then();
}

function onError(error) {
    console.log(`Error: ${error}`);
}

function downloadFinishedListener(downloadDelta) {
    if (downloadDelta.state.current === "complete") {
        pendingDeleteUrls++;
        console.log("download completed ("+ pendingDeleteUrls + "/" + tabsToScreenshot + ")");
        if (pendingDeleteUrls === tabsToScreenshot) {
            deleteUrls();
        }
    }
}

function deleteUrls() {
    for (let url of urls) {
        URL.revokeObjectURL(url);
        console.log("url revoked");
        pendingDeleteUrls--;
    }
    tabsToScreenshot = 0;
    console.log("pendingDeleteUrls:", pendingDeleteUrls);
    console.log("tabsToScreenshot:", tabsToScreenshot);
}

function dataURItoBlob(dataURI) {
    //Convert base64/URLEncoded data component to raw binary data held in a string
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    //Separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    //Write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}