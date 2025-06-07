// src/app/services/report-generator.service.ts
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Transaction } from './transaction.service';

@Injectable({
  providedIn: 'root'
})
export class ReportGeneratorService {

  constructor() { }

  public generatePdf(transactions: Transaction[], accountName?: string): void {
    const doc = new jsPDF();
    const reportTitle = accountName
      ? `Informe de Transacciones - Cuenta: ${accountName}`
      : 'Informe General de Transacciones';

    doc.text(reportTitle, 14, 20);
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 26);

    const head = [['Fecha', 'Tipo', 'Descripción', 'Beneficiario', 'Monto (€)']];
    const body = transactions.map(t => [
      new Date(t.transaction_date).toLocaleDateString('es-ES'),
      this.capitalize(t.type),
      t.description,
      t.payee || '-',
      // 👇 LA CORRECCIÓN ESTÁ AQUÍ. Usamos Number() para convertir el string a número.
      { content: Number(t.amount).toFixed(2), styles: { halign: 'right' as const } }
    ]);

    autoTable(doc, {
      startY: 35,
      head: head,
      body: body,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const type = transactions[data.row.index].type;
          const amountColor = type === 'income' ? [39, 174, 96] : [192, 57, 43];
          doc.setTextColor(amountColor[0], amountColor[1], amountColor[2]);
        }
      }
    });

    doc.save(`InformeTransacciones_${this.getFormattedDate()}.pdf`);
  }

  public generateExcel(transactions: Transaction[]): void {
    // Para el excel, también es buena práctica asegurar que sea un número
    const dataForSheet = transactions.map(t => ({
      'Fecha': new Date(t.transaction_date).toLocaleDateString('es-ES'),
      'Tipo': this.capitalize(t.type),
      'Descripción': t.description,
      'Beneficiario': t.payee,
      'Notas': t.notes,
      'Monto': Number(t.amount) // Aseguramos que el tipo de dato sea numérico
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForSheet);
    ws['!cols'] = [
      { wch: 12 }, { wch: 10 }, { wch: 40 }, { wch: 25 }, { wch: 30 }, { wch: 15 }
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');
    XLSX.writeFile(wb, `InformeTransacciones_${this.getFormattedDate()}.xlsx`);
  }

  private getFormattedDate(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  private capitalize(s: string): string {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
