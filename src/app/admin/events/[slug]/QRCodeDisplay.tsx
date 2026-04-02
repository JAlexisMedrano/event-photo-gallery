"use client";

import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer } from 'lucide-react';
import { useRef } from 'react';

export default function QRCodeDisplay({ url, eventName }: { url: string; eventName: string }) {
  const qrRef = useRef<SVGSVGElement>(null);

  const handleDownload = () => {
    if (!qrRef.current) return;
    
    // Create an XML serialization of the SVG
    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    // Create a Blob from the SVG data string
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement("a");
    downloadLink.href = blobUrl;
    downloadLink.download = `QR-${eventName}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col sm:flex-row gap-8 items-center print:shadow-none print:border-none">
      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        <QRCodeSVG 
          value={url} 
          size={180} 
          level="H" 
          includeMargin={true}
          ref={qrRef}
          className="print:w-[400px] print:h-[400px]"
        />
      </div>
      <div className="flex-1 space-y-4 text-center sm:text-left print:hidden">
        <h2 className="text-xl font-bold text-neutral-800">QR de Acceso</h2>
        <p className="text-neutral-500 text-sm max-w-sm">
          Descarga o imprime este código QR para colocarlo en las mesas y pantallas del evento. Los invitados lo escanearán para entrar directamente a la galería.
        </p>
        <div className="flex justify-center sm:justify-start gap-4 pt-2">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 bg-neutral-800 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-black transition-colors"
          >
            <Download size={18} /> Descargar SVG
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-neutral-100 text-neutral-700 px-5 py-2.5 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
          >
            <Printer size={18} /> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
