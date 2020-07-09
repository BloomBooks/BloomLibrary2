import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as Sentry from "@sentry/browser";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { IntlProvider } from "react-intl";

// these two firebase imports are strange, but not an error. See https://github.com/firebase/firebase-js-sdk/issues/1832
import firebase from "firebase/app";
import "firebase/auth";

//import * as firebaseui from "firebaseui";
import { connectParseServer } from "./connection/ParseServerConnection";

try {
    // we're sending errors so long as we're not running on localhost
    if (window.location.hostname.indexOf("bloomlibrary.org") > -1) {
        Sentry.init({
            dsn:
                "https://f33c34679bd044ba93eebb6fdf2132e3@sentry.keyman.com/18",
            environment: window.location.hostname,
            attachStacktrace: true,
        });
    }
} catch (error) {
    console.error(error);
}

const firebaseConfig = {
    apiKey: "AIzaSyACJ7fi7_Rg_bFgTIacZef6OQckr6QKoTY",
    authDomain: "sil-bloomlibrary.firebaseapp.com",
    databaseURL: "https://sil-bloomlibrary.firebaseio.com",
    projectId: "sil-bloomlibrary",
    storageBucket: "sil-bloomlibrary.appspot.com",
    messagingSenderId: "481016061476",
    appId: "1:481016061476:web:8c9905ffec02e8579b82b1",
};

firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged(() => {
    const user = firebase.auth().currentUser;
    if (!user || !user.emailVerified || !user.email) {
        return;
    }
    user.getIdToken().then((idToken: string) => {
        connectParseServer(idToken, user.email!)
            // .then(result =>
            //     console.log("ConnectParseServer resolved with " + result)
            // )
            .catch((err) => {
                console.log(
                    "*** Signing out of firebase because of an error connecting to ParseServer"
                );
                firebase.auth().signOut();
            });
    });
});

// const translationsForUsersLocale = defineMessages({
//   collectionStatisticsHeader: {
//     id: 'app.home.greeting',
//     description: 'Bloom Collection Statistics',
//     defaultMessage: 'Bloom Collection Statistics',
//   },
// });

const spanish = {
    "stats.header": "Bloom Collection Statistics_es",

    "stats.overview": "Overview_es",
    books: "Libros",
    topics: "Topics_es",
    devices: "Aparatos",
    "stats.devices.info":
        "Count of devices where we received notice where at least on book from this collection had been loaded._es",
    "stats.devices.bloomReader": "con Bloom Reader",
    "stats.devices.mobile": "Mobile_es",
    "stats.devices.pc": "PC_es",
    "stats.reads": "Reads_es",
    "stats.reads.web": "Web_es",
    "stats.reads.apps": "Apps_es",
    bloomReader: "Bloom Reader_es",
    downloads: "Downloads_es",
    "downloads.forTranslation": "For Translation_es",

    "stats.bloomReaderSessions": "Sesiones de Bloom Reader",

    "stats.booksRead": "Libros leídos",
    language: "Idioma",
    languages: "Idiomas",
    "stats.booksRead.finishedCount": "Terminado",
    "stats.booksRead.startedCount": "Empezado",

    // comprehension
    "stats.comprehensionQuestions": "Preguntas de comprensión",
    bookTitle: "Título del libro",
    branding: "Marcación",
    "stats.questions": "Preguntas",
    "stats.quizzesTaken": "Pruebas realizadas",
    "stats.meanCorrect": "Media",
    "stats.medianCorrect": "Mediana",

    "rangePicker.allTime": "All Time_es",
    "rangePicker.today": "Today_es",
    "rangePicker.to": "To_es",
    "rangePicker.from": "Include Events From_es",
    "rangePicker.custom": "Custom_es",
};

function getUserLanguageFromBrowser() {
    return navigator.languages && navigator.languages.length
        ? navigator.languages[0]
        : navigator.language ?? "en";
}

ReactDOM.render(
    <IntlProvider locale={getUserLanguageFromBrowser()} messages={spanish}>
        <App />
    </IntlProvider>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
