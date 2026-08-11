// --- SCREEN ROUTING VARIABLES ---
const hubScreen = document.getElementById('hub-screen');
const terminalScreen = document.getElementById('terminal-screen');
const burpScreen = document.getElementById('burp-screen'); 

// --- TERMINAL VARIABLES ---
const outputDiv = document.getElementById('terminal-output');
const inputField = document.getElementById('command-input');
const promptText = document.getElementById('prompt-text');
let isRoot = false; 
let currentLevel = 0; 
let commandHistory = [];
let historyIndex = -1;

// --- BURP SUITE VARIABLES ---
const interceptorTextarea = document.getElementById('interceptor-textarea');
const websiteResponse = document.getElementById('website-response');
const fakeUsername = document.getElementById('fake-username');

// --- HUB CONTROL LOGIC ---
function startLevel(levelNumber) {
    currentLevel = levelNumber; 
    hubScreen.style.display = 'none';
    terminalScreen.style.display = 'none';
    burpScreen.style.display = 'none';
    
    if (currentLevel === 1 || currentLevel === 2) {
        terminalScreen.style.display = 'flex';
        outputDiv.innerHTML = '';
        isRoot = false;
        commandHistory = [];
        historyIndex = -1;
        updatePrompt();
        printOutput(`Initializing Exercise ${currentLevel}... Type 'help' to see your tools. Type 'exit' to return to the Hub.\n`);
        setTimeout(() => inputField.focus(), 10);
    } 
    else if (currentLevel === 3) {
        burpScreen.style.display = 'flex';
        interceptorTextarea.value = '';
        websiteResponse.innerText = '';
    }
}

function exitToHub() {
    terminalScreen.style.display = 'none';
    burpScreen.style.display = 'none'; 
    hubScreen.style.display = 'flex';
}

function updatePrompt() { promptText.textContent = isRoot ? "root@target:~#" : "player@kali:~#"; }

// --- BURP SUITE LOGIC ---
function triggerIntercept() {
    const user = fakeUsername.value;
    const fakeHttpRequest = 
`POST /api/login HTTP/1.1
Host: secure-portal.local
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0

username=${user}&password=guest123&role=user`;

    interceptorTextarea.value = fakeHttpRequest;
    websiteResponse.innerText = "Request intercepted! Modifying data in proxy...";
}

function forwardRequest() {
    const modifiedRequest = interceptorTextarea.value;
    if (modifiedRequest === '') {
        websiteResponse.innerText = "Error: No request to forward.";
        return;
    }
    if (modifiedRequest.includes('role=admin')) {
        websiteResponse.style.color = "#00ff00";
        websiteResponse.innerText = "SUCCESS! Flag: CTF{param_t4mp3r1ng_m4st3r}\nWelcome, Administrator.";
    } else {
        websiteResponse.style.color = "red";
        websiteResponse.innerText = "Access Denied. You are logged in as a normal user. You need admin rights to see the flag.";
    }
    interceptorTextarea.value = ''; 
}

function dropRequest() {
    interceptorTextarea.value = '';
    websiteResponse.style.color = "yellow";
    websiteResponse.innerText = "Request dropped by proxy.";
}

// --- TERMINAL LOGIC ---
inputField.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const command = inputField.value.trim();
        if (command !== '') { commandHistory.push(command); }
        historyIndex = commandHistory.length;
        printOutput((isRoot ? "root@target:~# " : "player@kali:~# ") + command);
        processCommand(command);
        inputField.value = '';
        outputDiv.scrollTop = outputDiv.scrollHeight; 
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) { historyIndex--; inputField.value = commandHistory[historyIndex]; }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) { historyIndex++; inputField.value = commandHistory[historyIndex];
        } else { historyIndex = commandHistory.length; inputField.value = ''; }
    }
});

function printOutput(text) {
    const newLine = document.createElement('div');
    newLine.textContent = text;
    outputDiv.appendChild(newLine);
}

function processCommand(cmd) {
    const args = cmd.split(' ');
    const baseCommand = args[0].toLowerCase();
    switch(baseCommand) {
        case 'help': printOutput("Available commands: help, clear, ls, cat, nmap, ssh, whoami, pwd, grep, submit, exit"); break;
        case 'clear': outputDiv.innerHTML = ''; break;
        case 'exit': exitToHub(); break;
        case 'whoami': printOutput(isRoot ? "root" : "player"); break;
        case 'pwd': printOutput(isRoot ? "/root" : "/home/player"); break;
        case 'ls':
            if (currentLevel === 1) {
                printOutput("target_ips.txt   mission_brief.md   flag.txt");
            } else if (currentLevel === 2) {
                printOutput("instructions.txt   server_logs.txt");
            } else {
                printOutput("Directory is empty or unavailable.");
            }
            break;
            
        case 'cat':
            if (currentLevel === 1) {
                if (args[1] === "flag.txt") {
                    if (isRoot) printOutput("CTF{y0u_h4ck3d_th3_m41nfr4m3}\nCONGRATULATIONS! You beat Exercise 1!");
                    else printOutput("Permission denied. You must escalate privileges.");
                } else if (args[1] === "target_ips.txt") printOutput("192.168.1.100\n192.168.1.101");
                else if (args[1] === "mission_brief.md") printOutput("MISSION: Infiltrate the target server.\nINTEL: The admins often use the default password 'admin123' for SSH.");
                else printOutput("cat: missing or invalid file name.");
            } else if (currentLevel === 2) {
                if (args[1] === "instructions.txt") {
                    printOutput("MISSION: A hacker breached our system. Analyze server_logs.txt to find their IP address.");
                    printOutput("Submit the IP to the firewall using the command: submit [IP_ADDRESS]");
                } else if (args[1] === "server_logs.txt") {
                    printOutput("[INFO] User admin logged in from 10.0.0.5");
                    printOutput("[INFO] Failed login attempt for user root from 192.168.1.50");
                    printOutput("[WARN] Multiple failed logins from 192.168.1.50");
                    printOutput("[CRITICAL] Unauthorized access detected from 203.0.113.42");
                    printOutput("[INFO] System backup completed successfully");
                } else {
                    printOutput("cat: missing or invalid file name.");
                }
            } else {
                printOutput("cat: missing or invalid file name.");
            }
            break;
            
        case 'nmap':
            if (currentLevel !== 1) {
                printOutput("nmap: command not found or network unavailable.");
                break;
            }
            const fullCommand = args.join(' ');
            const targetIP = "192.168.1.100";
            if (!fullCommand.includes(targetIP)) {
                printOutput("Usage: nmap [flags] [target_ip]");
                printOutput("Hint: Did you check your target_ips.txt file?");
                break;
            }
            const usedVersionFlag = fullCommand.includes('-sV');
            printOutput(`Starting Nmap scan on ${targetIP}...`);
            setTimeout(() => {
                if (usedVersionFlag) {
                    printOutput(`PORT   STATE SERVICE VERSION`);
                    printOutput(`22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5`);
                    printOutput(`80/tcp open  http    Apache httpd 2.4.41`);
                } else {
                    printOutput(`PORT   STATE SERVICE`);
                    printOutput(`22/tcp open  ssh`);
                    printOutput(`80/tcp open  http`);
                    printOutput(`\nHint: Try using the '-sV' flag to determine the service versions!`);
                }
                outputDiv.scrollTop = outputDiv.scrollHeight; 
            }, 1500);
            break;
            
        case 'ssh':
            if (currentLevel === 1 && args[1] === "root@192.168.1.100" && args[2] === "admin123") {
                isRoot = true; updatePrompt(); printOutput("Authentication successful. Welcome, root.");
            } else printOutput("Usage: ssh [user]@[ip] [password]");
            break;
            
        case 'grep':
            if (currentLevel === 1 && args[2] === "mission_brief.md") {
                const fileContent = "MISSION: Infiltrate the target server.\nINTEL: The admins often use the default password 'admin123' for SSH.";
                const match = fileContent.split('\n').find(line => line.toLowerCase().includes(args[1].toLowerCase()));
                if (match) printOutput(match); 
            } else if (currentLevel === 2 && args[2] === "server_logs.txt") {
                const logContent = "[INFO] User admin logged in from 10.0.0.5\n[INFO] Failed login attempt for user root from 192.168.1.50\n[WARN] Multiple failed logins from 192.168.1.50\n[CRITICAL] Unauthorized access detected from 203.0.113.42\n[INFO] System backup completed successfully";
                const matches = logContent.split('\n').filter(line => line.toLowerCase().includes(args[1].toLowerCase()));
                if (matches.length > 0) matches.forEach(match => printOutput(match));
                else printOutput("grep: no matches found.");
            } else {
                printOutput("grep: Invalid usage or file.");
            }
            break;
            
        case 'submit':
            if (currentLevel === 2) {
                if (args[1] === "203.0.113.42") {
                    printOutput("IP Address accepted. Firewall rule applied.");
                    printOutput("SUCCESS! Flag: CTF{l0g_4n4lys1s_pr0}");
                } else if (!args[1]) {
                    printOutput("Usage: submit [IP_ADDRESS]");
                } else {
                    printOutput("Incorrect IP address. Access denied.");
                }
            } else {
                printOutput("submit: command not found");
            }
            break;

        // NEW: This is the missing piece that handles unknown commands!
        case '': break; 
        default: printOutput(`bash: ${baseCommand}: command not found`);
    }
}
