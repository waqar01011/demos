 
/**
 * You're going to need an API key to access data from Google Sheets.
 * To generate a new key, follow these steps:
 * 
 *   - 1: Go to https://console.developers.google.com and either create a new
 *        or switch to an existing project.
 * 
 *   - 2: Go to "credentials" and generate an API key. Try to keep the key as 
 *        restrictive as possible to prevent other people from using it. It has
 *        to be an API key though and not an oAuth key, because that would require
 *        the user to authenticate, which we're trying to avoid.
 */
 var apiKey     = "AIzaSyC5kIkeVOxGN5w8oDj9C8qNrReodKGoYBA";
 var sheetID    = "1Y4GCK0iS5Ppv96I-LRYa4e8dC2Vbb2GXphNSuLCHz4o";
 var sheetName  = "Sheet1";
 var sheetURL   = "https://sheets.googleapis.com/v4/spreadsheets/" + sheetID + "/values/" + sheetName + "?key=" + apiKey;


/**
 * Loading the sheet data in JSON format.
 */
function loadJSON(callback) {   

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', sheetURL, true); 
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            callback(JSON.parse(xobj.responseText));
          }
    };
    xobj.send(null);  
}
loadJSON(buildSite);


/**
 * Function to populate the site with the content. This is of course dependant
 * on the way you have formatted the data in your Google Sheet, and how you 
 * have set up the site's DOM structure.
 *
 * For this demo, this is what's happening in this function:
 * 
 *   - 1: populating a "content" object with the data from the sheet
 *   - 2: populating the DOM elements with the content. at this point they're still hidden through css
 */
function buildSite(data) {

    var i;
    var content = {};
    var elements = document.getElementsByClassName("demo");

    // parse the data - I'm ignoring the first row here, since I used it to label the columns
    for (i = 1; i < data.values.length; i++) {
        content[data.values[i][0]] = data.values[i][1];
    }

    // populate the elements
    for (i = 0; i < elements.length; i++) {
        var el = elements[i];
        var id = el.getAttribute('data-contentID');

        // special treatment for lists
        if (el.tagName.toLowerCase() == 'ul') {

            // find all content ids that start with the lists content id
            for (var key in content) {
                if (key.indexOf(id) == 0) {
                    el.innerHTML += content[key];
                }
            }

        // regular objects: just add the content via innerHTML
        } else {
            el.innerHTML = content[id];
        }
    }

  
}


