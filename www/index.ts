//#region menus and other

const rootStyle: CSSStyleDeclaration = (document.querySelector(':root') as HTMLElement).style;

const defaultSettings = {
    "spacing": {
        "css": "3px",
        "raw": "3"
    },
    "radius": {
        "css": "0px",
        "raw": "0"
    },
    "font-size": {
        "css": "30px",
        "raw": "30"
    },
    "font-weight": {
        "css": "400",
        "raw": "4"
    },
    "fore-color": {
        "css": "#ffffff",
        "raw": "#ffffff"
    },
    "back-color": {
        "css": "#353535",
        "raw": "#353535"
    },
    "body-back-color": {
        "css": "#000000",
        "raw": "#000000"
    },
    "fore-accent-color": {
        "css": "#ffa500",
        "raw": "#ffa500"
    },
    "screen-lines": {
        "css": "0.5",
        "raw": "0.5"
    }
};

let settings: any = defaultSettings;

function resetSettings(): void{
    settings = {...defaultSettings};

    localStorage.setItem("settings", JSON.stringify(settings));

    loadSettings();
}

function setSetting(setting: string, e: HTMLInputElement): void {
    switch(setting) {
        case 'spacing':
            settings["spacing"] = {"css": e.value + "px", "raw": e.value};
            break;
        case 'radius':
            settings["radius"] = {"css": e.value + "px", "raw": e.value};
            break;
        case 'font-size':
            settings["font-size"] = {"css": e.value + "px", "raw": e.value};
            break;
        case 'font-weight':
            settings["font-weight"] = {"css": (parseInt(e.value) * 100).toString(), "raw": e.value};
            break;
        default:
            settings[setting] = {"css": e.value, "raw": e.value};
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
    screen.orientation.lock('portrait');

    let s = localStorage.getItem("settings");
    if(s != null) {
        settings = JSON.parse(s);
    }

    loadSettings();

    let loading: HTMLElement = document.getElementById("loading");

    loading.classList.add("closed");

    setTimeout(() => {
        loading.remove();
    },400);
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