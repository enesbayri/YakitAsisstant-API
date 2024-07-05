function copyContent() {
    /* Get the text field */
    var copyText = document.getElementById("apikey").innerText;

    const element = document.createElement('textarea');
    element.value = copyText;
    // Add it to the document so that it can be focused.
    document.body.appendChild(element);
    // Focus on the element so that it can be copied.
    element.focus();
    element.setSelectionRange(0, element.value.length);
    // Execute the copy command.
    document.execCommand('copy');
    // Remove the element to keep the document clear.
    document.body.removeChild(element);

    alert("API Key kopyalandı!");
}