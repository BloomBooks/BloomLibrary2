/* Use this script if you want visitors to be able to share, bookmark locations within the library, or
refresh without losing their place.
It will add a "blorg=" search parameter to the url. */

window.onload = function () {
    // restore the location within the embedded library if the url parameters contain that information
    var libraryLocation = window.location.search.split("blorg=")[1];
    if (libraryLocation) {
        // typical locations passed in don't include /embed/embed-settings-name
        // e.g. enabling-writers/nigeria (a collection)
        // enabling-writers/nigeria/book/abcdfg (a book's details)
        // player/abdfg (reading the book)
        libraryLocation = decodeURIComponent(libraryLocation);
        var libraryIFrame = document.getElementById("bloomlibrary");
        // the original src of the iframe is typically something like /embed/embed-test/rise-png
        var segments = libraryIFrame.src.split("/");
        // drop the initial collection segment (it will be replaced by what came from the blorg search param)
        segments.splice(segments.length - 1, 1);
        if (segments[0] === "embed") {
            console.error(
                "window loaded with blorg param unexpectedly starting with 'embed': " +
                    libraryLocation
            );
        } else {
            // normal operation, add on what we have
            libraryIFrame.src = segments.join("/") + "/" + libraryLocation;
            console.log("Set iframe src to " + libraryIFrame.src);
        }
    }
    window.addEventListener("message", receiveBloomLibraryMessage, false);
};

function receiveBloomLibraryMessage(e) {
    // Add information on where we are within the embedded library so that visitors can
    // bookmark and share a url to certain place, for example a certain book.
    if (e.data.event === "addBloomLibraryLocationToUrl") {
        var searchParams = new URLSearchParams(window.location.search);
        if (e.data.data.startsWith("embed/")) {
            // some timing thing seems to cause this sometimes; better not to save
            // inner location than to save one that will break.
            console.error(
                "called receiveBloomLibraryMessage with " + e.data.data
            );
            return;
        }
        searchParams.set("blorg", e.data.data);
        window.history.replaceState(null, null, "?" + searchParams.toString());
    }
}
