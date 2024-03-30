import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "scafoldingcpp" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('scafoldingcpp.gettemplate', () => {
        vscode.window.showInputBox({ prompt: "Enter project name" }).then((projectName) => {
            if (projectName && vscode.workspace.workspaceFolders) {
                const ROOT_FOLDER = vscode.workspace.workspaceFolders;
                if (!ROOT_FOLDER || ROOT_FOLDER.length === 0) {
                    vscode.window.showErrorMessage('No workspace folder opened.');
                    return;
                }
                if (/^\d+$/.test(projectName)) {
                    vscode.window.showErrorMessage('Project name cannot consist only of numbers.');
                    return;
                }
                const _root = ROOT_FOLDER[0].uri.fsPath;
                // const _PROJECT_PATH = path.join(_root, projectName);

                // fs.mkdirSync(_PROJECT_PATH);

                //> SubFolder
                const _SUBFOLDER = ['build', 'include', 'src', 'tools', 'config'];
                _SUBFOLDER.forEach(folder => {
                    fs.mkdirSync(path.join(_root, folder));
                });

                //* Create main file
                createFile(_root, 'tools', 'main.cpp', getMainComp(projectName));

                //* Create header file
                createFile(_root, 'include', 'header.hpp', getHeaderCOmp(projectName));

                createFile(_root, 'src', 'header.cpp', getSrcFile(projectName));

                //* MakeFile
                getMake(_root, 'makefile', writeMake(projectName));
            }
        });
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Project created');
    });

    context.subscriptions.push(disposable);
}

function createFile(_rootPath: string, _folder: string, _filename: string, _content: string) {
    const _filePath = path.join(_rootPath, _folder, _filename);
    fs.writeFileSync(_filePath, _content, 'utf-8');
}

function getMainComp(_projectName: string): string {
    return `#include<iostream>
#include "header.hpp"
using namespace std;

int main(){
    ${_projectName} newProj;

    newProj.sayHello();

    return 0;
};
    `;
}

function getSrcFile(_projectName: string): string {
    return `#include "header.hpp"
#include <iostream>
${_projectName}::${_projectName}(){};
${_projectName}::~${_projectName}(){};

void ${_projectName}::sayHello(){
    cout << "Creato con successo" << endl;
};
    `;
}

function getHeaderCOmp(_projectNAme: string): string {
    return `#ifndef HEADER_HPP
#define HEADER_HPP

#include <iostream>
using namespace std;

class ${_projectNAme}{
    public:
        ${_projectNAme}();
        ~${_projectNAme}();

        void sayHello();
};

#endif //! HEADER_HPP
    `;
}

function getMake(_rootPath: string, _filename: string, _content: string) {
    const _filePath = path.join(_rootPath, _filename);
    fs.writeFileSync(_filePath, _content, 'utf-8');
}

function writeMake(_projectName: string): string {
    return `OPTION=-O3 -DNDEBUG -Wall -Wextra -w
all:build/${_projectName}

debug:OPTION=-O0 -g -w
debug:build/${_projectName}  

build/${_projectName}: build/header.o tools/main.cpp 
\tg++ ${"$"}{OPTION} tools/main.cpp -o build/${_projectName} -I include/ build/header.o
    
build/header.o: src/header.cpp include/header.hpp
\tg++ ${"$"}{OPTION} -c src/header.cpp -o build/header.o -I include/

clean:
\trm -rf build/*.o build/${_projectName}

run:
\t./build/${_projectName}
    `;
}
// This method is called when your extension is deactivated
export function deactivate() { }
