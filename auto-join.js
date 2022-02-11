// ==UserScript==
// @name         Stud.IP Auto-Join
// @namespace    https://github.com/Robinatus/studip-auto-join/
// @version      1.0
// @description  Automatically join a Stud.IP course at a specific time.
// @author       Robinatus
// @match        https://*/dispatch.php/course/*
// @grant        none
// @license      Beerware
// ==/UserScript==

(function() {
    'use strict';

    let refreshTime = localStorage.getItem("auto-join");

    // UI Elements
    let input;
    let label;
    let start;

    function reset() {
        label.textContent = "Not Running";
        start.textContent = "Start";
        start.removeAttribute("timeout");
        localStorage.removeItem("auto-join");
    }

    // create minimalistic UI
    function createUI() {
        let div = document.createElement("div");
        div.style.position = "fixed";
        div.style.right = "0";
        div.style.bottom = "0";

        input = document.createElement("input");
        input.type = "time";
        input.value = refreshTime;

        label = document.createElement("label");
        label.textContent = refreshTime ? "Running" : "Not Running";

        start = document.createElement("button");

        start.onclick = () => {
            if (localStorage.getItem("auto-join")) {
                // "Stop"
                let oldTimeout = start.getAttribute("timeout");
                clearTimeout(oldTimeout);
                reset();
                return;
            }
            if (!input.value) return;

            let reloadTime = input.value.split(':');
            let now = new Date();
            let nowHours = now.getHours();
            let remainingHours = reloadTime[0] - nowHours;

            // invalid remainingHours
            if (remainingHours < 0) return;

            let nowMinutes = now.getMinutes();
            let remainingMinutes = reloadTime[1] - nowMinutes - 1;
            // invalid remainingMinutes
            if (remainingHours === 0 && remainingMinutes < 0) return;

            // reload at defined time
            let timeout = setTimeout(() => {
                location.reload();
            }, (remainingHours * 3600 + remainingMinutes * 60 + (60 - now.getSeconds())) * 1000 )

            start.setAttribute("timeout", timeout);
            label.textContent = "running";
            localStorage.setItem("auto-join", input.value);
            start.textContent = "Stop";
        }
        start.textContent = refreshTime ? "Stop" : "Start";

        div.append(input);
        div.append(label);
        div.append(start);

        document.body.append(div);
    }

    // should only be triggered after the automatic refresh
    if (refreshTime) {
        const xpath = "//a[text()='Zugang zur Veranstaltung']";
        const matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (!matchingElement) return;

        matchingElement.click();

        if ((document.documentElement.textContent || document.documentElement.innerText).indexOf('Bitte bestätigen Sie die Aktion') > -1) {
            let button = document.getElementsByClassName("accept")[0];
            button.click();
            reset();
        }

        reset();
    }

    createUI();
})();