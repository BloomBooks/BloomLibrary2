/* Use this script if you want visitors to be able to share, bookmark locations within the library, or
refresh without losing their place.
It will add a "blorg=" search parameter to the url. */

window.onload = function () {
    // restore the location within the embedded library if the url parameters contain that information
    const searchParams = new URLSearchParams(window.location.search);

    var libraryLocation = searchParams.get("blorg");
    if (libraryLocation) {
        // typical locations passed in don't include a full URL, just the pathname.
        // e.g. enabling-writers/nigeria (a collection)
        // book/abcdfg (a book's details)
        // player/abdfg (reading the book)
        libraryLocation = decodeURIComponent(libraryLocation);
        var libraryIFrame = document.getElementById("bloomlibrary");
        // the original src of the iframe is typically something like https://embed.bloomlibrary.org/rise-png
        var segments = libraryIFrame.src.split("/");
        // drop the last segment which should be the collection name (it will be replaced by what came from the blorg
        // search param, which may or may not start with the same collection name).
        // Note that this won't necessarily work right if the src has more than one element after the host, e.g.,
        // if src is https://embed.bloomlibrary.org/enabling-writers/ew-nabu and libraryLocation is player/bookId,
        // this process will produce https://embed.bloomlibrary.org/enabling-writers/player/bookId, which won't work.
        // However, there's no obvious reason for embed URLs with more than a single collection ID.
        segments.splice(segments.length - 1, 1);

        searchParams.delete("blorg");
        let iframeSrc = segments.join("/") + "/" + libraryLocation;
        const searchString = searchParams.toString();
        if (searchString) {
            iframeSrc += "?" + searchString;
        }
        libraryIFrame.src = iframeSrc;
        console.log("Set iframe src to " + libraryIFrame.src);
    }
    window.addEventListener("message", receiveBloomLibraryMessage, false);
};

function receiveBloomLibraryMessage(e) {
    // Add information on where we are within the embedded library so that visitors can
    // bookmark and share a url to certain place, for example a certain book.
    if (e.data.event === "addBloomLibraryLocationToUrl") {
        // e.data.data should be a string consisting of the path plus the URL query component too
        // e.g. path = "collectionName", queryComponent="?param1=value1", data="collectionName?param1=value1"

        if (e.data.data.startsWith("embed/")) {
            // some timing thing seems to cause this sometimes; better not to save
            // inner location than to save one that will break.
            console.error(
                "called receiveBloomLibraryMessage with " + e.data.data
            );
            return;
        }

        const { path, search } = parseAddBlorgLocationToUrlData(e.data.data);

        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set("blorg", path);

        // In addition to what was originally in the address bar,
        // add on query parameters specified by the event
        const searchParamsFromData = new URLSearchParams(search);
        searchParamsFromData.forEach((value, key) => {
            // Parameters beginning with "bl-" are defined as those to be forwarded
            // (also ensure not to repeat the "blorg" one again)
            if (key.startsWith("bl-") && key !== "blorg") {
                searchParams.set(key, value);
            }
        });

        window.history.replaceState(null, null, "?" + searchParams.toString());
    }
}

// Given the event data (which should be a string representing a URL),
// returns a tuple with:
//   path = the part before the question mark, and
//   search = the part including and after the question mark
// Example: Given data = "education-for-life-org/EFL-Community-Books?bl-domain=mytalkingbooks.org"
//   returns {
//     path: "education-for-life-org/EFL-Community-Books",
//     search: "?bl-domain=mytalkingbooks.org"
//   }
function parseAddBlorgLocationToUrlData(data) {
    const url = data;
    const questionMarkIndex = data.indexOf("?");

    let path = url;
    let search = "";
    if (questionMarkIndex >= 0) {
        path = data.substring(0, questionMarkIndex);
        search = data.substring(questionMarkIndex);
    }

    return {
        path,
        search,
    };
}
