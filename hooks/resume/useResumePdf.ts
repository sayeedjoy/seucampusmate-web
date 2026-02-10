"use client";

import { useCallback, useMemo, useState } from "react";
import type { RefObject } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { ResumeData } from "@/lib/resume/types";
function nextFrame(): Promise<void> {
  return new Promise((res) =>
    requestAnimationFrame(() => requestAnimationFrame(() => res()))
  );
}

export function useResumePdf(
  printRootRef: RefObject<HTMLDivElement | null>,
  data: ResumeData
) {
  const [isGenerating, setIsGenerating] = useState(false);

  const pdfFileName = useMemo(() => {
    const base = (data.name || "Resume").trim().replace(/\s+/g, "_");
    return `${base || "Resume"}_A4.pdf`;
  }, [data.name]);

  const downloadPDF = useCallback(async () => {
    const el = printRootRef.current;
    if (!el) return;

    setIsGenerating(true);

    try {
      await nextFrame();

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        foreignObjectRendering: false,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement("style");
          style.innerHTML = `
            html, body { background: #fff !important; color: #000 !important; }
            #resume-print-root { background: #fff !important; color: #000 !important; font-family: Arial, Helvetica, sans-serif !important; }
            #resume-print-root, #resume-print-root * {
              color: #000 !important;
              background: transparent !important;
              border-color: #000 !important;
              box-shadow: none !important;
              filter: none !important;
              text-shadow: none !important;
            }
            #resume-print-root svg { color: #000 !important; fill: currentColor !important; stroke: currentColor !important; }
          `;
          clonedDoc.head.appendChild(style);

          const root = clonedDoc.getElementById("resume-print-root") as HTMLDivElement | null;
          if (root) {
            root.style.backgroundColor = "#ffffff";
            root.style.color = "#000000";
            root.style.fontFamily = "Arial, Helvetica, sans-serif";
          }
        },
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const pxPerMm = canvas.width / pageW;
      const pxPageH = Math.floor(pageH * pxPerMm);

      const pageCanvas = document.createElement("canvas");
      const pageCtx = pageCanvas.getContext("2d");
      if (!pageCtx) throw new Error("Canvas context not found");

      pageCanvas.width = canvas.width;

      let y = 0;
      let pageIndex = 0;

      while (y < canvas.height - 2) {
        const remaining = canvas.height - y;
        const slice = Math.min(pxPageH, remaining);
        if (slice < 8) break;

        pageCanvas.height = slice;
        pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(canvas, 0, y, canvas.width, slice, 0, 0, canvas.width, slice);

        const img = pageCanvas.toDataURL("image/png", 1.0);
        const sliceMm = slice / pxPerMm;

        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(img, "PNG", 0, 0, pageW, sliceMm);

        y += slice;
        pageIndex += 1;
      }

      pdf.save(pdfFileName);
    } catch (e) {
      console.error(e);
      alert("PDF generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }, [printRootRef, pdfFileName]);

  return { downloadPDF, isGenerating, pdfFileName };
}
