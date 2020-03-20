import { axios } from "@use-hooks/axios";
import { getConnection } from "./ParseServerConnection";

export function updateBook(
    bookId: string,
    params: object,
    currentSession?: string
): void {
    if (!bookId || !params) {
        return;
    }

    const headers = getConnection().headers;
    // currentSession is for old BloomLibrary code. In BL2, the login
    // process includes putting a session token into the headers that getConnection() returns.
    if (currentSession) {
        Object.assign(headers, {
            "X-Parse-Session-Token": currentSession
        });
    }

    // Without this, the code assumes the update comes from an upload from BloomDesktop
    // and certain unwanted changes would be made to the book record
    Object.assign(params, { updateSource: "libraryUserControl" });

    axios
        .put(`${getConnection().url}classes/books/${bookId}`, params, {
            headers
        })
        .catch(error => {
            alert(error);
        });
}

// FROM ANGULAR BLORG
/*   // This function is invoked with an array of the ids of the books that should be put
        // into a group of related books. All will be removed from any other related-books groups.
        this.relateBooksById = function(idsOfBooksToRelate) {
            //Since it might be possible for the user to click a second book
            //faster than the server can process the request, I'm using an IIFE
            // which captures the current array in its argument.
            (function(idsOfBooksToRelate) {
                // Will become the list of ids of books to group as related, including ones already related to
                // the original idsOfBooksToRelate.
                var relatedBooks = [];

                var baseRelatedBooks = restangular.withConfig(authService.config()).all('classes/relatedBooks');

                var i = 0;

                // We want to loop over all IDs. But dealing with each one requires a query to parse.com, and we need
                // the results of all of them before we go on, which requires that the next iteration be in
                // a 'then' function of the post call. This is achieved with a recursive function,
                // which is called once to handle the first ID, and calls itself recursively from
                // inside 'then' to handle the others.
                // Fortunately, we don't expect massively large groups of related books.
                function handleOneId() {
                    //Base case, out of arguments: we now have the relatedBooks list we wanted,
                    // so we can process it by actually creating the new relationship.
                    if(i >= idsOfBooksToRelate.length) {
                        //Only create new relationship if two or more books are involved
                        if(relatedBooks.length > 1) {
                            //Create new entry with relationship
                            baseRelatedBooks.post({"books": relatedBooks});
                        }
                    }
                    else {
                        //Add this book pointer to the list we want to make into a related group.
                        relatedBooks.push({
                            "__type": "Pointer",
                            "className": "books",
                            "objectId": idsOfBooksToRelate[i]
                        });
                        // Also remove it from any related books group it is already in.
                        baseRelatedBooks.getList({
                            'where': {
                                'books': {
                                    "__type": "Pointer",
                                    "className": "books",
                                    "objectId": idsOfBooksToRelate[i]
                                }
                            }
                        }).then(function (results) { // results are ids of books related to idsOfBooksToRelate[i], including itself
                            if (results.length > 0) {
                                //For some reason, I was unable to use results[0].remove()
                                // I (JohnT) don't fully understand this, but somehow I think it removes idsOfBooksToRelate[i]
                                // from the related-books group it was already part of.
                                restangular.withConfig(authService.config()).one('classes/relatedBooks', results[0].objectId).remove().then(function () {
                                    i++;
                                    handleOneId();
                                });
                            }
                            else {
                                i++;
                                handleOneId();
                            }
                        });
                    }
                }

                //Begin the recursive-function loop by calling it once.
                handleOneId();
            } (idsOfBooksToRelate)); // here the IIFE is invoked with the original function's list of ids.
        };
        */
