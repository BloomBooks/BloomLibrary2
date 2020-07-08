// handle passing on analytics information obtained from Bloom Player

import { track } from "./Analytics";

// one-time setup to receive messages (we're interested in ones from BloomPlayer,
// though others also arrive).
window.addEventListener("message", receiveMessage, false);

// Currently a pseudonym for the main track() method, but we've contemplated
// sending these events to the BloomReader Segment.io source instead.
// That would make analysis of BP events easier.
// However, it's hard to do: the segment.io load process adds a script to the
// document (see the "load" method in their snippets), and there is a mechanism
// for catching any events that happen while the script is loading and sending them
// before it terminates. This makes it hard to avoid normal events that happen
// while the BloomReader script is loading going to BR by mistake.
function trackForPlayer(data: any) {
    track(data.event, data.params);
}

// Holds the most recent updateBookProgressReport object sent by BloomPlayer, if any.
// If one is active when we move away from playing this book, we send it.
let bookProgressReport: any;

function receiveMessage(event: any) {
    try {
        const data = JSON.parse(event.data);
        switch (data.messageType) {
            case "sendAnalytics":
                trackForPlayer(data);
                break;
            case "updateBookProgressReport":
                bookProgressReport = data;
                break;
        }
    } catch (e) {}
}

export function startingBook() {
    bookProgressReport = undefined; // clear any data from an earlier book.
}

// Invoked when we're leaving the player page, if the user has gotten anywhere with
// reading the book we send the last progress report we got.
// If it becomes possible to "go back" from bloom player without triggering this
// (i.e., staying within the SPA without reloading it), we will need another
// way of calling this...compare the two ways the StaffPanel catches closing.
// But currently both ways of "going back" from ReadBookPage already trigger
// the unload event.
export function sendPlayerClosingAnalytics() {
    if (bookProgressReport) {
        trackForPlayer(bookProgressReport);
    }
}
