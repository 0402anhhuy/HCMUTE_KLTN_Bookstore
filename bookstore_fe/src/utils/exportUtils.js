/**
 * Helper utility to export data to CSV/Excel with UTF-8 BOM encoding for Vietnamese support
 */
export const exportToCSV = (filename, headers, rows, showToast) => {
  try {
    const BOM = "\uFEFF";
    const headerRow = headers.join(",");
    const dataRows = rows.map(row => 
      row.map(cell => {
        if (cell === null || cell === undefined) return '""';
        const str = String(cell).replace(/"/g, '""');
        return `"${str}"`;
      }).join(",")
    );

    const csvContent = BOM + [headerRow, ...dataRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (showToast) {
      showToast(`Đã xuất file ${filename} thành công!`, "success");
    }
  } catch (error) {
    console.error("Export error:", error);
    if (showToast) {
      showToast("Lỗi khi xuất file!", "error");
    }
  }
};
