import React from 'react'
import { Switch, Tag } from "antd";
import { read, utils, writeFileXLSX } from 'xlsx';

export default class ExportUtils {
    public export2Word = (element, filename = '') => {
        var preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title><style>.pagebreak {page-break-before:always}</style></head><body>";
        var postHtml = "</body></html>";
        var html = preHtml + window.document.getElementById(element)?.innerHTML + postHtml;

        var blob = new Blob(['\ufeff', html], {
            type: 'application/msword'
        });

        // Specify link url
        var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);

        // Specify file name
        filename = filename ? filename + '.doc' : 'document.doc';

        // Create download link element
        var downloadLink = document.createElement("a");

        document.body.appendChild(downloadLink);

        if ((window.navigator as any).msSaveOrOpenBlob) {
            (window.navigator as any).msSaveOrOpenBlob(blob, filename);
        } else {
            // Create a link to the file
            downloadLink.href = url;

            // Setting the file name
            downloadLink.download = filename;

            //triggering the function
            downloadLink.click();
        }

        document.body.removeChild(downloadLink);
    }
    public export2Xls = (tableID, filename = '') => {
        var downloadLink;
        var dataType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        var tableSelect = document.getElementById(tableID);
        var tableHTML = tableSelect?.outerHTML.replace(/ /g, '%20');

        // Specify file name
        filename = filename ? filename + '.xlsx' : 'excel_data.xlsx';

        // Create download link element
        downloadLink = document.createElement("a");

        document.body.appendChild(downloadLink);

        if ((window.navigator as any).msSaveOrOpenBlob && tableHTML) {
            var blob = new Blob(['\ufeff', tableHTML], {
                type: dataType
            });
            (window.navigator as any).msSaveOrOpenBlob(blob, filename);
        } else {
            // Create a link to the file
            downloadLink.href = 'data:' + dataType + ', ' + tableHTML;

            // Setting the file name
            downloadLink.download = filename;

            //triggering the function
            downloadLink.click();
        }
    }
    public export2XLSX = (tableID, filename = 'idsdp_most') => {
        const data = document.getElementById(tableID);
        const wb = utils.table_to_book(data);
        writeFileXLSX(wb, filename + ".xlsx");
    }
}
