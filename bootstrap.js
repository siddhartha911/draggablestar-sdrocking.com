const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");

/* Function adapted from the extension "Restartless Restart" by Eric Vold */
(function(global) global.include = function include(src) {
  var o = {};
  Cu.import("resource://gre/modules/Services.jsm", o);
  var uri = o.Services.io.newURI(src, null, o.Services.io.newURI(__SCRIPT_URI_SPEC__, null, null));
  o.Services.scriptloader.loadSubScript(uri.spec, global);
})(this);

include("utils.js");

function printToLog(message) {
  Services.console.logStringMessage(message);
}

function changeUI(window) {
  let {document, gBrowser, gURLBar} = window;

  var starButton = null;
  var childNodes = document.getElementById("urlbar-icons").childNodes;
  for(var i = 0; i < childNodes.length; ++i) {
    if(childNodes[i].getAttribute("id") == "star-button") {
      starButton = childNodes[i];
      break;
    }
  }

  if(starButton == null) return;

  starButton.ondragstart = function (event) {
    if (gURLBar.getAttribute("pageproxystate") != "valid")
      return;

    let value = gBrowser.contentDocument.location;
    let urlString = value + "\n" + gBrowser.contentDocument.title;
    let htmlString = "<a href=\"" + value + "\">" + value + "</a>";

    let dt = event.dataTransfer;
    dt.setData("text/x-moz-url", urlString);
    dt.setData("text/uri-list", value);
    dt.setData("text/plain", value);
    dt.setData("text/html", htmlString);
    //printToLog("urlString = " + urlString + " | value = " + value + " | htmlString = " + htmlString);

    try {
      let panel = document.getElementById("identity-drag-panel");
      let panelLabel = panel.firstChild;
      let text = gBrowser.contentDocument.title || gBrowser.contentDocument.location;
      panelLabel.setAttribute("value", text);

      for each(var tab in gBrowser.tabs) {
        if (tab.linkedBrowser == gBrowser.selectedBrowser) {
          let faviconImage = document.getAnonymousElementByAttribute(tab, "class", "tab-icon-image");
          document.mozSetImageElement("dragFavicon", faviconImage);
          break;
        }
      }

      dt.setDragImage(panel, -1, -1);
    } catch(error) {}
  }

  unload(function() {
    starButton.ondragstart = null;
  });
}

function startup(data, reason) {
  watchWindows(changeUI);
}

function shutdown(data, reason) {
  if(reason == APP_SHUTDOWN) return;
  unload();
}

function install(data, reason) {}
function uninstall(data, reason) {}
