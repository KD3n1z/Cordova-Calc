//#region menus and other

const rootStyle: CSSStyleDeclaration = (document.querySelector(':root') as HTMLElement).style;

let settings: any = {
    "spacing": "3px",
    "radius": "0px"
};

function setSetting(setting: string, e: HTMLInputElement): void {
    switch(setting) {
        case 'spacing':
            settings["spacing"] = {"css": e.value + "px", "raw": e.value};
            break;
        case 'radius':
            settings["radius"] = {"css": e.value + "px", "raw": e.value};
            break;
    }

    localStorage.setItem("settings", JSON.stringify(settings));

    loadSettings();
}

function loadSettings(): void {
    Object.keys(settings).forEach(element => {
        rootStyle.setProperty('--' + element, settings[element].css);
        (document.getElementById("s_" + element) as HTMLInputElement).value = settings[element].raw;
    });
}

document.addEventListener("deviceready", () => {
    let s = localStorage.getItem("settings");
    if(s != null) {
        settings = JSON.parse(s);
    }

    loadSettings();
}, false);

// menu interactions

let menuBtn: HTMLElement = document.getElementById('menuBtn');

function openMenu(id): void {
    let element: HTMLElement = document.getElementById(id);
    if(element.classList.contains('closed')) {
        element.classList.remove('closed');
        menuBtn.classList.add('closed');
    }
}

function closeMenu(id): void {
    let element: HTMLElement = document.getElementById(id);
    if(!element.classList.contains('closed')) {
        element.classList.add('closed');
        menuBtn.classList.remove('closed');
    }
}

//#endregion

// main calculator code

let expressionDisplay: HTMLElement = document.getElementById('expression');
let resultDisplay: HTMLElement = document.getElementById('result');

let expression: string = "";
let number: string = "";

function clearCurrent(): void {
    number = "";

    display();
}

function clearAll(): void {
    expression = "";
    number = "";

    display();
}

function remove(): void {
    if(number.length > 0) {
        number = number.slice(0, -1);
    }

    display();
}

let mem: string = "";

function copy(): void {
    if(lastEx != "") {
        mem = result;
        return;
    }
    mem = number;
}

function paste(): void {
    number = mem;
    display();
}

function changeSign(): void {
    if(lastEx != "") {
        number = result;
    }

    if(number.length > 0 && number[0] == '-') {
        number = number.slice(1);
    }else{
        number = '-' + number;
    }

    display();
}


function percent(): void {
    number = (parseFloat(number) / 100).toString();

    if(number == "NaN") {
        number = "";
    }

    display();
}

function root(): void {
    number = Math.sqrt(parseFloat(number)).toString();

    if(number == "NaN") {
        number = "";
    }

    display();
}

function setOper(o: string): void {
    if(lastEx != "") {
        expression = result + " " + o;

        display();
        return;
    }

    if(includes(expression, '+') || includes(expression, '-') || includes(expression, '/') || includes(expression, '*')) {
        if(number == ""){
            expression = expression.slice(0, -1) + o;
            display();
            return;
        }else{
            number = eval(expression + number);
        }
    }
    expression = number + " " + o;

    number = "";

    display();
}

function comma(): void {
    if(number == "") {
        number = "0.";
    }else if(!includes(number, ".")) {
        number += ".";
    }

    display();
}

function includes(s: string, e: string) {
    for(let i: number = 0; i < s.length; i++) {
        if(s[i] == e) {
            return true;
        }
    }
    return false;
}

function btn(e: HTMLElement) : void {
    number += e.textContent.trim();
    display();
}

let result: string = "";
let lastNum: string = "";
let lastEx: string = "";

function calc(): void {
    if(lastEx != ""){
        expression = lastEx;
        number = lastNum;
    }
    if(number != ""){
        
        expressionDisplay.textContent = expression + " " + number + " =";
        result = eval(expression + number).toString();
        resultDisplay.textContent = result;
        lastEx = result + " " + expression[expression.length - 1];
        lastNum = number;

        expression = number = "";
    }
}

function display(): void {
    lastEx = "";

    expressionDisplay.textContent = expression;
    resultDisplay.textContent = number;
}

display();