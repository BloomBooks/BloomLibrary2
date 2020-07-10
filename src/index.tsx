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
    "stats.header": "Estadísticas de la colección Bloom",

    "stats.overview": "Resumen",
    books: "Libros",
    topics: "Temas",
    devices: "Aparatos",
    "stats.devices.info":
        "Conteo de aparatos para los cuales recibimos la noticia de que al menos un libro de esta colección había sido cargado.",
    "stats.devices.bloomReader": "con Bloom Reader",
    "stats.devices.mobile": "Móviles",
    "stats.devices.pc": "PC",
    "stats.reads": "Leídos",
    "stats.reads.web": "Web",
    "stats.reads.apps": "Apps",
    bloomReader: "Bloom Reader",
    downloads: "Descargas",
    "downloads.forTranslation": "Para traducir",

    "stats.bloomReaderSessions": "Sesiones de Bloom Reader",

    "stats.booksRead": "Libros leídos",
    language: "Idioma",
    languages: "Idiomas",
    "stats.booksRead.finishedCount": "Termindado(s)",
    "stats.booksRead.startedCount": "Empezado",

    // comprehension
    "stats.comprehensionQuestions": "Preguntas de comprensión",
    bookTitle: "Título del libro",
    branding: "Marcación",
    "stats.questions": "Preguntas",
    "stats.quizzesTaken": "Pruebas realizadas",
    "stats.meanCorrect": "Media",
    "stats.medianCorrect": "Mediana",

    // query description
    "stats.queryDescription.underCountingNote":
        "Note that the events that devices and browsers try to send to us are sometimes stopped by various network firewalls. Therefore we may be under counting._es",
    "stats.queryDescription.about": "About this data",
    "stats.queryDescription.intro":
        "These statistics are from events we received which fit the following criteria:",
    "stats.queryDescription.collection": "Books currently in the collection:",
    "stats.queryDescription.branding": "Books with branding:",
    "stats.queryDescription.country": "From users inside of country:",
    "stats.queryDescription.dateRange": "Date range:",

    // range picker
    "rangePicker.allTime": "Todas las fechas",
    "rangePicker.today": "Hoy día",
    "rangePicker.to": "Hasta",
    "rangePicker.from": "Incluir los eventos desde",
    "rangePicker.custom": "Personalizado",
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
