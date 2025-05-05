// src/components/evaluation/checkTableStructure.ts

export function checkTableStructure(doc: Document) {
    const suggestions: string[] = [];
    let score = 0;
  
    const table = doc.querySelector('table');
    if (!table) {
      suggestions.push("You might want to include a data table.");
      return { score, suggestions };
    }
  
    const rows = table.querySelectorAll('tr');
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent?.toLowerCase() || '');
    const hasAverage = headers.some(h => h.includes('average'));
    const hasTrial = headers.some(h => h.includes('trial'));
    const hasUnits = headers.some(h => /\(.*\)/.test(h)); // check for (unit)
  
    if (rows.length < 3) suggestions.push("Try adding at least 3 rows of data.");
    else score += 8.5;
  
    if (!hasAverage) suggestions.push("Consider adding a column for averages.");
    else score += 5;
  
    if (!hasTrial) suggestions.push("Try including multiple trials.");
    else score += 5;
  
    if (!hasUnits) suggestions.push("Include units in your table headers.");
    else score += 6.5;
  
    return { score, suggestions };
  }
  