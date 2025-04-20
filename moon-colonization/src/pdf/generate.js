// Import required dependencies
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { feature_mono } from './base64.js';
import { parsing } from './parse.js';
import { pngBase64 } from './logotype.js';

let padding = 4;
let posY = 2;
let widthPage = 0;
let heightPage = 0;
const fontName = 'feature_mono_Regular';
let countPage = 1;
let tables_info;

// 2. Генерация PDF
function generatePDF(success, userInfo, stat) {

    try {
        const doc = new jsPDF();
        
        widthPage = doc.internal.pageSize.getWidth();
        heightPage = doc.internal.pageSize.getHeight();
        
        // Добавляем шрифт
        doc.addFileToVFS(`${fontName}.ttf`, feature_mono);
        doc.addFont(`${fontName}.ttf`, fontName, 'normal');
        doc.setFont(fontName);
        tables_info = parsing(success, userInfo, stat);
        
        //-----------Шапка---------------------
        posY = createHeader(doc);

        //--------Успешность + Ресурсы + Связь-----------------------
        firstPage(doc);
        createFootor(doc);
        doc.addPage();
        createHeader(doc);
        secondPage(doc);
        createFootor(doc);

        for(let i = 3; i < tables_info.tables.length; i += 2){
            doc.addPage();
            createHeader(doc);
            nextPage(doc, i);
            createFootor(doc);
        }
        
        doc.save('result.pdf');
        //alert('PDF успешно создан!');
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка: ' + error.message);
    }
}

function secondPage(doc){
    let Ypos = posY;
    doc.setTextColor(0);
    doc.text(tables_info.tables[2].name, padding, posY);
    posY += 3;
    autoTable(doc, {
        head: [tables_info.tables[2].headers],
        body: tables_info.tables[2].body,
        startY: posY,
        margin: { left: padding, right: padding }, // Уменьшаем поля
        tableWidth: 'wrap',
        styles: {
            font: fontName
        },
        headStyles: {
            textColor: '#A3A3A3',
            fillColor: 255
        },
        didDrawPage: function(data) {
            Ypos = data.cursor.y;
        }
    });

    posY = Ypos;
    posY += 8;

    doc.setDrawColor('#A3A3A3');  
    doc.setLineWidth(0.5);
    doc.line(padding, posY, widthPage - padding, posY);
    posY += 8;
}

function createHeader(doc){
    //-----------Шапка---------------------
    posY = 2;
    doc.addImage(pngBase64, 'PNG', padding, posY, 73, 11);
    posY += 11;

    doc.setFontSize(12);
    doc.setTextColor('#A3A3A3');

    let un = tables_info.userName
    if (un.length > 20) {
        un = un.substring(0, 20) + "...";
    }
    doc.text("Сделал пользователь " + un, widthPage - padding, posY - 5, {
        align: "right"
    });
    doc.text("за внутриигровых дней: " + tables_info.countDay, widthPage - padding, posY, {
        align: "right"
    });
    posY += 3;

    doc.setDrawColor('#A3A3A3');  
    doc.setLineWidth(0.5); // Толщина линии в мм
    doc.line(padding, posY, widthPage - padding, posY);
    posY += 12;
    return posY;
}

function firstPage(doc){
    let Ypos = posY;
    for(let i = 0; i < 2; i++){
        doc.setTextColor(0);
        doc.text(tables_info.tables[i].name, padding, posY);
        posY += 3;
        autoTable(doc, {
            //head: [tables_info.tables[0].headers],
            body: tables_info.tables[i].body,
            startY: posY,
            margin: { left: padding, right: padding }, // Уменьшаем поля
            tableWidth: 'wrap',
            styles: {
                font: fontName
            },
            didDrawPage: function(data) {
                Ypos = data.cursor.y;
            }
        });
        

        posY = Ypos;
        posY += 8;

        doc.setDrawColor('#A3A3A3');  
        doc.setLineWidth(0.5);
        doc.line(padding, posY, widthPage - padding, posY);
        posY += 8;
    }
    
}


function nextPage(doc, j){
    for(let i = 0; i < 2; i++){
        doc.setTextColor(0);
        doc.text(tables_info.tables[i + j].name, padding, posY);
        posY += 3;
        let Ypos = posY;
        let startPage = doc.internal.getNumberOfPages();
        autoTable(doc,{
            head: [tables_info.tables[i + j].headers],
            body: tables_info.tables[i + j].body,
            startY: Ypos,
            margin: { left: padding, right: padding, top: 25, bottom:16 }, // Уменьшаем поля
            tableWidth: 'wrap',
            //pageBreak: 'false', // Автоматический перенос
            styles: {
                font: fontName
            },
            headStyles: {
                textColor: '#A3A3A3',
                fillColor: 255
            },
            didDrawPage: function(data) {
                if(doc.internal.getNumberOfPages() > startPage){
                    createHeader(doc);
                }
                Ypos = data.cursor.y;
                // Дополнительная проверка
                const remaining = heightPage - Ypos;
                if (remaining < 16 + 10) {
                    createFootor(doc);
                    data.table.pageBreak = true;
                    Ypos = 25;
                }
                if(Ypos < 20){
                    createHeader(doc)
                }
            }
        });
        posY = Ypos;
        posY += 8;
    
        doc.setDrawColor('#A3A3A3');  
        doc.setLineWidth(0.5);
        doc.line(padding, posY, widthPage - padding, posY);
        posY += 8;
    }
}

function createFootor(doc){
    posY = heightPage - 16;

    doc.setDrawColor('#A3A3A3');  
    doc.setLineWidth(0.5); // Толщина линии в мм
    doc.line(padding, posY, widthPage - padding, posY);
    posY += 12;

    let text = '' + countPage;
    if(countPage < 10) text = '0' + text;
    doc.setFontSize(12);
    doc.setTextColor('#A3A3A3');
    doc.text("Страница", padding, posY, );
    doc.text(text, widthPage - padding, posY, {align: "right"});

    countPage += 1;
}

// Export the function so it can be imported in other files
export { generatePDF };
