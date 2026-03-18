import { useEffect, useState } from "react";
import { CheckCircle, Download, FileSpreadsheet, FileText, Filter, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import ChartCard from "@/components/ChartCard";
import { Button } from "@/components/ui/button";
import { ReportItem, getReports } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const { toast } = useToast();

  const downloadBlob = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const buildSimplePdf = (lines: string[]) => {
    const escape = (value: string) => value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    const contentLines = lines.map((line) => `(${escape(line)}) Tj`);
    const stream = `BT\n/F1 10 Tf\n50 780 Td\n14 TL\n${contentLines.join("\nT*\n")}\nET`;
    const streamLength = stream.length;

    const objects = [
      "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
      "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
      "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
      "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
      `5 0 obj << /Length ${streamLength} >> stream\n${stream}\nendstream endobj`,
    ];

    let pdf = "%PDF-1.4\n";
    const offsets: number[] = [0];
    for (const obj of objects) {
      offsets.push(pdf.length);
      pdf += `${obj}\n`;
    }
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";
    for (let i = 1; i <= objects.length; i += 1) {
      pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return new Blob([pdf], { type: "application/pdf" });
  };

  const downloadPdfBlob = (filename: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const buildCsv = (items: ReportItem[]) => {
    const header = ["Report ID", "Name", "Type", "Date", "Status", "Size"];
    const rows = items.map((item) => [
      item.id,
      item.name,
      item.type,
      item.date,
      item.status,
      item.size,
    ]);
    return [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll("\"", "\"\"")}"`)
          .join(","),
      )
      .join("\n");
  };

  const handleGeneratePdf = () => {
    const lines = [
      "TalkMetrix Reports Summary",
      `Generated: ${new Date().toISOString()}`,
      "",
      ...reports.map((item) => `${item.id} | ${item.name} | ${item.type} | ${item.date} | ${item.status}`),
    ];
    const pdfBlob = buildSimplePdf(lines);
    downloadPdfBlob("talkmetrix-report-summary.pdf", pdfBlob);
    toast({
      title: "PDF generated",
      description: "Report summary has been downloaded.",
    });
  };

  const handleExportExcel = () => {
    const csv = buildCsv(reports);
    downloadBlob("talkmetrix-reports.csv", csv, "text/csv;charset=utf-8");
    toast({
      title: "Excel export ready",
      description: "Reports data has been downloaded as CSV.",
    });
  };

  const handleRowDownload = (report: ReportItem) => {
    const reportBody = [
      `Report ID: ${report.id}`,
      `Name: ${report.name}`,
      `Type: ${report.type}`,
      `Date: ${report.date}`,
      `Status: ${report.status}`,
      `Size: ${report.size}`,
    ].join("\n");
    downloadBlob(`${report.id}.txt`, reportBody, "text/plain;charset=utf-8");
    toast({
      title: `${report.id} downloaded`,
      description: "Report details were downloaded.",
    });
  };

  useEffect(() => {
    async function load() {
      const data = await getReports();
      setReports(data.items);
    }
    void load();
  }, []);

  return (
    <div className="py-6 md:py-8 space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and export quality audit reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleGeneratePdf}
            variant="outline"
            className="gap-2 text-sm border-border/60 text-foreground hover:bg-secondary"
          >
            <FileText className="w-4 h-4" /> Generate PDF
          </Button>
          <Button
            type="button"
            onClick={handleExportExcel}
            variant="outline"
            className="gap-2 text-sm border-border/60 text-foreground hover:bg-secondary"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-4 shadow-depth flex flex-wrap items-center gap-4"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>
        <select className="px-3 py-1.5 rounded-lg bg-secondary/60 border border-border/50 text-sm text-foreground outline-none">
          <option>All Agents</option>
        </select>
        <select className="px-3 py-1.5 rounded-lg bg-secondary/60 border border-border/50 text-sm text-foreground outline-none">
          <option>All Types</option>
          <option>Quality</option>
          <option>Compliance</option>
          <option>Performance</option>
          <option>Analytics</option>
        </select>
        <input
          type="date"
          className="px-3 py-1.5 rounded-lg bg-secondary/60 border border-border/50 text-sm text-foreground outline-none"
          defaultValue="2026-02-01"
        />
        <span className="text-muted-foreground text-sm">to</span>
        <input
          type="date"
          className="px-3 py-1.5 rounded-lg bg-secondary/60 border border-border/50 text-sm text-foreground outline-none"
          defaultValue="2026-03-03"
        />
      </motion.div>

      <ChartCard title="Report History" subtitle="Previously generated reports" delay={0.2}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {["Report ID", "Name", "Type", "Date", "Status", "Size", ""].map((h) => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((report, i) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
                >
                  <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{report.id}</td>
                  <td className="py-3 px-3 font-medium text-foreground">{report.name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                      {report.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">{report.date}</td>
                  <td className="py-3 px-3">
                    {report.status === "completed" ? (
                      <span className="flex items-center gap-1 text-xs text-success font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-warning font-medium">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">{report.size}</td>
                  <td className="py-3 px-3">
                    {report.status === "completed" && (
                      <Button
                        type="button"
                        onClick={() => handleRowDownload(report)}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-muted-foreground hover:text-foreground"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
};

export default Reports;
