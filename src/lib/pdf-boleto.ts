// src/lib/pdf-boleto.ts
import jsPDF from 'jspdf';

interface InfoBoleto {
  evento: {
    nombre: string;
    fecha: string;
    lugar: string;
  };
  entradas: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
  numeroOrden: number;
  reservaId: string;
  fechaCompra: string;
  total: number;
  qrDataURL: string;
  metodoPago: string;
}

export function generarPDFBoleto(info: InfoBoleto) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Fondo con gradiente simulado
  doc.setFillColor(20, 20, 40);
  doc.rect(0, 0, pageWidth, 60, 'F');

  // Título principal
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('BOLETO ELECTRÓNICO', pageWidth / 2, 25, { align: 'center' });

  // Número de orden
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text(`Orden #${info.numeroOrden}`, pageWidth / 2, 35, { align: 'center' });

  // Información del evento
  doc.setFillColor(245, 245, 250);
  doc.rect(15, 70, pageWidth - 30, 45, 'F');

  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(info.evento.nombre, 20, 85);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  // Ícono de fecha simulado con texto
  doc.text('📅', 20, 95);
  doc.text(new Date(info.evento.fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }), 30, 95);

  // Ícono de ubicación simulado
  doc.text('📍', 20, 105);
  doc.text(info.evento.lugar, 30, 105);

  // Línea divisoria
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 125, pageWidth - 15, 125);

  // Sección de entradas
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalles de las Entradas', 20, 140);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let yPos = 150;

  info.entradas.forEach((entrada) => {
    doc.text(`${entrada.cantidad}x ${entrada.nombre}`, 20, yPos);
    doc.text(`$${entrada.precio.toLocaleString('es-CO')} c/u`, pageWidth - 50, yPos, { align: 'right' });
    yPos += 7;
  });

  // Total
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Pagado:', 20, yPos);
  doc.text(`$${info.total.toLocaleString('es-CO')} COP`, pageWidth - 20, yPos, { align: 'right' });

  // Código QR
  const qrSize = 60;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = yPos + 15;

  doc.addImage(info.qrDataURL, 'PNG', qrX, qrY, qrSize, qrSize);

  // Código de reserva
  doc.setFontSize(9);
  doc.setFont('courier', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(info.reservaId, pageWidth / 2, qrY + qrSize + 8, { align: 'center' });

  // Instrucciones
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  const instruccionY = qrY + qrSize + 20;
  doc.text('Presenta este código QR en la entrada del evento', pageWidth / 2, instruccionY, { align: 'center' });
  doc.text('No se aceptarán boletos duplicados o alterados', pageWidth / 2, instruccionY + 5, { align: 'center' });

  // Footer
  doc.setDrawColor(200, 200, 200);
  doc.line(15, pageHeight - 30, pageWidth - 15, pageHeight - 30);

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Fecha de compra: ${new Date(info.fechaCompra).toLocaleString('es-ES')}`, 20, pageHeight - 20);
  doc.text(`Método de pago: ${info.metodoPago}`, 20, pageHeight - 15);

  // Logo o marca
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 80, 180);
  doc.text('EventPlatform', pageWidth - 20, pageHeight - 20, { align: 'right' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('https://eventos-app-nu.vercel.app/', pageWidth - 20, pageHeight - 15, { align: 'right' });

  // Descarga el PDF
  doc.save(`boleto-${info.reservaId}.pdf`);
}
