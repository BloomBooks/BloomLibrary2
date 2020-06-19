/* Use this script if you want visitors to be able to share, bookmark locations within the library, or
refresh without losing their place.
It will add a "blorg=" search parameter to the url. */

window.onload = function () {
    // restore the location within the embedded library if the url parameters contain that information
    var libraryLocation = window.location.search.split("blorg=")[1];
    if (libraryLocation) {
        libraryLocation = decodeURIComponent(libraryLocation);
        var libraryIFrame = document.getElementById("bloomlibrary");
        // drop the initial collection parameter (it will be replaced by what we have)
        var segments = libraryIFrame.src.split("/");
        segments.splice(segments.length - 1, 1);
        // add on what we have
        libraryIFrame.src = segments.join("/") + "/" + libraryLocation;
        console.log("Set iframe src to " + libraryIFrame.src);
    }
    window.addEventListener("message", receiveBloomLibraryMessage, false);
};

function receiveBloomLibraryMessage(e) {
    // Add information on where we are within the embedded library so that visitors can
    // bookmark and share a url to certain place, for example a certain book.
    if (e.data.event === "addBloomLibraryLocationToUrl") {
        var searchParams = new URLSearchParams(window.location.search);
        searchParams.set("blorg", e.data.data);
        window.history.replaceState(null, null, "?" + searchParams.toString());
    }
}
