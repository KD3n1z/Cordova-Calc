const build: number = 4;

//#region settings

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
    },
    "layout": {
        "css": "d",
        "raw": "d"
    }
};

let settings: any = {...defaultSettings};

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
        try{
            (document.getElementById("s_" + element) as HTMLInputElement).value = settings[element].raw;
        }catch{}
    });

    if(settings["layout"].raw == "d") {
        if(document.getElementById("full").classList.contains('hidden')) {
            document.getElementById("full").classList.remove('hidden');
            document.getElementById("slim").classList.add('hidden');
        }
    }else{
        if(document.getElementById("slim").classList.contains('hidden')) {
            document.getElementById("slim").classList.remove('hidden');
            document.getElementById("full").classList.add('hidden');
        }
    }
    
    let rgbHex = settings["body-back-color"].css.slice(1).match(/.{1,2}/g);

    let bgRgb: number[] = [
        parseInt(rgbHex[0], 16),
        parseInt(rgbHex[1], 16),
        parseInt(rgbHex[2], 16)
    ];

    rgbHex = settings["fore-accent-color"].css.slice(1).match(/.{1,2}/g);

    let accentRgb: number[] = [
        parseInt(rgbHex[0], 16),
        parseInt(rgbHex[1], 16),
        parseInt(rgbHex[2], 16)
    ];
    
    rootStyle.setProperty('--inverted-back-color', (bgRgb[0] + bgRgb[1] + bgRgb[2]) < 384 ? '#ffffff' : '#000000');
    rootStyle.setProperty('--inverted-accent-color', (accentRgb[0] + accentRgb[1] + accentRgb[2]) < 384 ? '#ffffff' : '#000000');
}

//#endregion

//#region menus

function openMenu(id: string, currentMenuId: string): void {
    let element: HTMLElement = document.getElementById(id);
    if(element.classList.contains('closed')) {
        element.classList.remove('closed');
        document.getElementById(currentMenuId).querySelector('.closeBtn').classList.add('closed');
        if(currentMenuId != 'main'){
            document.getElementById(currentMenuId).classList.add('hidden');
        }
    }
}

function closeMenu(id: string, parentMenuId: string): void {
    let element: HTMLElement = document.getElementById(id);
    if(!element.classList.contains('closed')) {
        element.classList.add('closed');
        document.getElementById(parentMenuId).querySelector('.closeBtn').classList.remove('closed');
        if(parentMenuId != 'main'){
            document.getElementById(parentMenuId).classList.remove('hidden');
        }
    }
}

//#endregion

//#region main calculator code

let expressionDisplay: HTMLElement = document.getElementById('expression');
let resultDisplay: HTMLElement = document.getElementById('result');

let expression: {
    "type": "number" | "oper",
    "value": string
}[] = [];

function clearCurrent(): void {
    if(expression.length > 0){
        expression = expression.slice(0, -1);
    }

    display();
}

function clearAll(): void {
    expression = [];

    display();
}

function remove(): void {
    if(expression.length > 0){
        if(expression[expression.length - 1].type == "oper") {
            expression = expression.slice(0, expression.length - 1);
        }else {
            expression[expression.length - 1].value = expression[expression.length - 1].value.slice(0, -1);
            if(expression[expression.length - 1].value.length <= 0) {
                expression = expression.slice(0, -1);
            }
        }
    }

    display();
}

let mem: string = "";

function copy(): void {
    if(expression.length > 0 && expression[expression.length - 1].type == "number") {
        mem = expression[expression.length - 1].value;
    }
}

function paste(): void {
    if(mem != ""){
        if(expression.length > 0 && expression[expression.length - 1].type == "number") {
            expression[expression.length - 1].value = mem;
        }else{
            expression.push({
                "value": mem,
                "type": "number"
            });
        }
    }
    display();
}

function changeSign(): void {
    if(expression.length <= 0 || expression[expression.length - 1].type == "oper"){
        expression.push({
            "type": "number",
            "value": "-"
        })
    }else if(expression[expression.length - 1].value[0] == '-') {
        expression[expression.length - 1].value = expression[expression.length - 1].value.slice(1);
        if(expression[expression.length - 1].value.length <= 0) {
            expression = expression.slice(0, -1);
        }
    }else{
        expression[expression.length - 1].value = '-' + expression[expression.length - 1].value;
    }

    display();
}


function percent(): void {
    if(expression.length > 0 && expression[expression.length - 1].type == "number") {
        expression[expression.length - 1].value = eval('(' + expression[expression.length - 1].value + ') / 100').toString();
    }

    display();
}

function root(): void {
    if(expression.length > 0 && expression[expression.length - 1].type == "number") {
        expression[expression.length - 1].value = Math.sqrt(eval('(' + expression[expression.length - 1].value + ')')).toString();
    }

    display();
}

function setOper(o: string): void {
    if(expression.length == 0)  {   // expression is empty
        expression.push({           // add number so expression always starts with number
            "type": "number",
            "value": o == '/' || o == '*' ? '1' : '0'
        });
        expression.push({           // add operator
            "type": "oper",
            "value": o
        });
    }else{
        if(expression[expression.length - 1].type == 'oper') {
            expression[expression.length - 1].value = o; // change operator
        }else{
            expression.push({ // add operator
                "type": "oper",
                "value": o
            });
        }
    }

    display();
}

function comma(): void {
    if(expression.length > 0 && expression[expression.length - 1].type == "number") {
        for(let i: number = 0; i < expression[expression.length - 1].value.length; i++) {
            if(expression[expression.length - 1].value[i] == '.') {
                return;
            }
        }
        
        expression[expression.length - 1].value += '.';
    }else{
        expression.push({
            "value": '0.',
            "type": "number"
        });
    }

    display();
}

function btn(e: HTMLElement) : void {
    if(expression.length > 0 && expression[expression.length - 1].type == "number") {
        expression[expression.length - 1].value += e.textContent;
    }else{
        expression.push({
            "value": e.textContent,
            "type": "number"
        });
    }

    display();
}

function calc(): void {
    let cExp: string = "";
    let expressionText: string = "";

    expression.forEach(element => {
        if(element.type == "number") {
            cExp += "(" + element.value + ")"
        }else{
            cExp += element.value;
        }
        expressionText += (element.type == "oper" ? (element.value == "/" ? "÷" : (element.value == "*" ? "×" : element.value)) : element.value) + " ";
    });

    console.log(cExp);

    expression = [{
        "type": "number",
        "value": eval(cExp).toString()
    }];

    display();

    expressionDisplay.textContent = expressionText + "=";
}

function display(): void {
    let number: string = expression.length > 0 && expression[expression.length - 1].type == "number" ? expression[expression.length - 1].value : "";
    let expressionText: string = "";

    expression.forEach(element => {
        expressionText += " " + (element.type == "oper" ? (element.value == "/" ? "÷" : (element.value == "*" ? "×" : element.value)) : element.value);
    });

    resultDisplay.textContent = number;
    expressionDisplay.textContent = expressionText;
}

//#endregion

function openLink(url: string): void {
    window.open(url, '_empty');
}

document.addEventListener("deviceready", () => {
    display();

    screen.orientation.lock('portrait');

    document.getElementById("buildNum").textContent = build.toString();

    let s = localStorage.getItem("settings");
    if(s != null) {
        settings = JSON.parse(s);
    }

    loadSettings();

    // check for updates
    fetch(
        'https://api.github.com/repos/KD3n1z/cordova-calc/releases/latest'
    ).then((response) => response.json())
    .then(
        (data) => {
            let latest: string = data.tag_name.slice(5);
            console.log('latest build on github: ' + latest);
            if(parseInt(latest) > build) {
                navigator.notification.confirm(
                    'Do you want to update? (b' + build + ' -> b' + latest + ')',
                    (choice: number) => {
                        if(choice == 1) {
                            openLink(data.assets[0].browser_download_url);
                        }
                    },
                    'Update available!',
                    ['Yes','No']
                );
            }
        }
    );

    let loading: HTMLElement = document.getElementById("loading");

    loading.classList.add("closed");    // start animation

    setTimeout(() => {
        loading.remove();               // remove the element after animation
    },400);
}, false);