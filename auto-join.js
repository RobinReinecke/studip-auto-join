// ==UserScript==
// @name         Stud.IP Auto-Join
// @namespace    https://github.com/Robinatus/studip-auto-join/
// @version      1.0
// @description  Automatically join a Stud.IP course at a specific time.
// @author       Robinatus
// @match        https://studip.tu-braunschweig.de/dispatch.php/course/*
// @grant        none
// @license      Beerware
// ==/UserScript==

(function() {
    'use strict';

    // thanks to https://www.w3schools.com/js/js_cookies.asp
    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
            }
        return "";
    }

    let isRunning = getCookie("auto-join");

    // UI Elements
    let input;
    let label;
    let start;

    function reset() {
        label.textContent = "Not Running";
        start.textContent = "Start";
        start.removeAttribute("timeout");
        document.cookie = "auto-join=; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
    }

    // create minimalistic UI
    function createUI() {
        let div = document.createElement("div");
        div.style.position = "absolute";
        div.style.right = "0";
        div.style.bottom = "0";

        input = document.createElement("input");
        input.type = "time";
        input.value = isRunning;

        label = document.createElement("label");
        label.textContent = isRunning ? "Running" : "Not Running";

        start = document.createElement("button");

        start.onclick = () => {
            let timeout = start.getAttribute("timeout");
            if (getCookie("auto-join")) {
                clearTimeout(timeout);
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
            if (remainingHours == 0 && remainingMinutes < 0) return;

            // reload at defined time
            timeout = setTimeout(() => {
                location.reload();
            }, (remainingHours * 3600 + remainingMinutes * 60 + (60 - now.getSeconds())) * 1000 )

            start.setAttribute("timeout", timeout);
            start.setAttribute("time", reloadTime);
            label.textContent = "running";
            document.cookie = "auto-join=" + input.value;
            start.textContent = "Stop";
        }
        start.textContent = isRunning ? "Stop" : "Start";

        div.append(input);
        div.append(label);
        div.append(start);

        document.body.append(div);
    }

    if (isRunning) {
        if ((document.documentElement.textContent || document.documentElement.innerText).indexOf('Bitte bestätigen Sie die Aktion') > -1) {
            let button = document.getElementsByClassName("accept")[0];
            button.click();
            reset();
        }

        var xpath = "//a[text()='Zugang zur Veranstaltung']";
        var matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (matchingElement)
        {
            matchingElement.click();
        }
    }

    createUI();
})();