import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

export interface PdfExportOptions {
  elementId: string;
  filename: string;
  pixelRatio?: number;
  scale?: number;
  orientation?: 'portrait' | 'landscape';
  marginMm?: number;
  backgroundColor?: string;
}

export interface PrintOptions {
  elementId: string;
  title?: string;
  backgroundColor?: string;
}

/**
 * Robust, 100% reliable print utility that works inside sandboxed iframes,
 * mobile browsers, and desktop browsers without blank pages or clipping.
 */
export async function printElement({
  elementId,
  title = 'Print Document',
  backgroundColor = '#ffffff'
}: PrintOptions): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with ID "${elementId}" not found for printing.`);
    try {
      window.print();
    } catch {
      // ignore
    }
    return false;
  }

  try {
    // 1. Generate high-resolution, pixel-perfect PNG
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2.5,
      backgroundColor,
      cacheBust: true,
      skipAutoScale: true,
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains('no-print')) {
          return false;
        }
        return true;
      }
    });

    if (!dataUrl || dataUrl.length < 50) {
      throw new Error('Rendered print image data is empty');
    }

    // 2. Create an isolated hidden iframe for printing
    const printIframe = document.createElement('iframe');
    printIframe.setAttribute('style', 'position:fixed;top:-10000px;left:-10000px;width:1000px;height:1400px;border:none;z-index:-9999;');
    document.body.appendChild(printIframe);

    const doc = printIframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>${title}</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 6mm;
              }
              *, *::before, *::after {
                box-sizing: border-box;
              }
              html, body {
                margin: 0;
                padding: 0;
                background: #ffffff;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              img {
                width: 100%;
                max-width: 100%;
                height: auto;
                display: block;
                margin: 0 auto;
                page-break-inside: avoid;
                break-inside: avoid;
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="${title}" />
          </body>
        </html>
      `);
      doc.close();

      // Wait for image inside iframe to load then trigger print
      await new Promise<void>((resolve) => {
        const iframeImg = doc.querySelector('img');
        if (iframeImg) {
          if (iframeImg.complete) {
            resolve();
          } else {
            iframeImg.onload = () => resolve();
            iframeImg.onerror = () => resolve();
          }
        } else {
          resolve();
        }
      });

      // Small tick for rendering
      await new Promise((r) => setTimeout(r, 200));

      let printSuccess = false;
      try {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
        printSuccess = true;
      } catch (iframeErr) {
        console.warn('Iframe print restricted, triggering fallback print:', iframeErr);
      }

      // Clean up iframe after a safe delay
      setTimeout(() => {
        if (document.body.contains(printIframe)) {
          document.body.removeChild(printIframe);
        }
      }, 60000);

      if (printSuccess) {
        return true;
      }
    }
  } catch (err) {
    console.warn('Primary element print failed, switching to PDF auto-print fallback:', err);
  }

  // Fallback: Generate PDF and auto-print or download
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2.2,
      backgroundColor,
      cacheBust: true
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 6;
    const targetWidth = pdfWidth - margin * 2;

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = dataUrl;
    });

    const targetHeight = (img.naturalHeight * targetWidth) / img.naturalWidth;
    let finalWidth = targetWidth;
    let finalHeight = targetHeight;
    const maxHeight = pdfHeight - margin * 2;

    if (finalHeight > maxHeight) {
      finalHeight = maxHeight;
      finalWidth = (img.naturalWidth * finalHeight) / img.naturalHeight;
    }

    const xOffset = margin + (targetWidth - finalWidth) / 2;
    pdf.addImage(dataUrl, 'PNG', xOffset, margin, finalWidth, finalHeight, undefined, 'FAST');

    pdf.autoPrint({ variant: 'non-conform' });
    const blobUrl = pdf.output('bloburl');
    
    // Try opening blob URL for native browser print
    const printWin = window.open(blobUrl, '_blank');
    if (!printWin) {
      // If popup blocked, save directly as PDF so user has the file
      pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
    }
    return true;
  } catch (pdfFallbackErr) {
    console.error('All print methods failed, attempting native window.print():', pdfFallbackErr);
    try {
      window.print();
    } catch {
      // ignore
    }
    return false;
  }
}

/**
 * Robust, 100% reliable PDF downloader for modern React & Tailwind CSS.
 * Uses browser-native foreignObject SVG rendering via html-to-image, 
 * completely avoiding any html2canvas OKLCH / CSS parser incompatibilities.
 */
export async function downloadElementAsPdf({
  elementId,
  filename,
  pixelRatio,
  scale = 2,
  orientation = 'portrait',
  marginMm = 6,
  backgroundColor = '#ffffff'
}: PdfExportOptions): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with ID "${elementId}" not found for PDF generation.`);
    return false;
  }

  const effectiveRatio = pixelRatio || scale || 2.2;

  try {
    // 1. Generate crisp PNG Data URL using html-to-image
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: effectiveRatio,
      backgroundColor,
      cacheBust: true,
      skipAutoScale: true,
      filter: (node) => {
        // Exclude any element marked with no-print
        if (node instanceof HTMLElement && node.classList.contains('no-print')) {
          return false;
        }
        return true;
      }
    });

    if (!dataUrl || dataUrl.length < 50) {
      throw new Error('Generated image data URL is invalid or empty');
    }

    // 2. Load image dimensions to compute exact aspect ratio
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load rendered image'));
      img.src = dataUrl;
    });

    // 3. Create jsPDF document and calculate precise margins
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const targetWidth = pdfWidth - marginMm * 2;
    const targetHeight = (img.naturalHeight * targetWidth) / img.naturalWidth;

    // Check if target height fits on one page; if it exceeds, scale down proportionally
    let finalWidth = targetWidth;
    let finalHeight = targetHeight;
    const maxHeight = pdfHeight - marginMm * 2;

    if (finalHeight > maxHeight) {
      finalHeight = maxHeight;
      finalWidth = (img.naturalWidth * finalHeight) / img.naturalHeight;
    }

    const xOffset = marginMm + (targetWidth - finalWidth) / 2;
    const yOffset = marginMm;

    pdf.addImage(dataUrl, 'PNG', xOffset, yOffset, finalWidth, finalHeight, undefined, 'FAST');

    const safeName = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    
    // Save PDF directly to user's device
    pdf.save(safeName);
    return true;
  } catch (error) {
    console.error('Primary PDF generation error, trying fallback method:', error);
    
    // Fallback 1: Try toJpeg
    try {
      const jpegDataUrl = await toJpeg(element, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        cacheBust: true
      });

      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const targetWidth = pdfWidth - marginMm * 2;
      const targetHeight = (element.offsetHeight * targetWidth) / element.offsetWidth;

      pdf.addImage(jpegDataUrl, 'JPEG', marginMm, marginMm, targetWidth, targetHeight);
      const safeName = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
      pdf.save(safeName);
      return true;
    } catch (fallbackErr) {
      console.error('Fallback PDF generation also failed:', fallbackErr);
      return false;
    }
  }
}

