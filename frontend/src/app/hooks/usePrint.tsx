import * as React from "react";
import '../components/Print/Print.scss';

export const usePrint = () => {
    const print = (elementId) => {
        const element = document.getElementById(`${elementId}`);
        if (!element) return;
        const domClone = element.cloneNode(true) as HTMLElement;

        let printSection = document.getElementById("printSection");

        if (!printSection) {
            printSection = document.createElement("div");
            printSection.id = "printSection";
            document.body.appendChild(printSection);
        }

        printSection.innerHTML = "";
        printSection.appendChild(domClone);
        window.print();
    };

    const printWindow = (elementId) => {
        const printContent: any = document.getElementById(`${elementId}`);
        const WindowPrt: any = window.open('', 'PRINT', 'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0');

        try {
            WindowPrt.document.write(printContent.innerHTML);

            WindowPrt.focus();
            WindowPrt.print();
            WindowPrt.close();
        }
        catch (error) {
            console.log('error');
        }
    }

    return { print, printWindow }
};
