import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';


const client = createClient({
  url: 'file:./fami.db',
});

async function exportTableToCsv(tableName) {
  try {
    const result = await client.execute(`SELECT * FROM ${tableName}`);
    if (result.rows.length === 0) {
      console.log(`Table ${tableName} is empty.`);
      return;
    }
    
    const columns = result.columns.join(',');
    const rows = result.rows.map(row => 
      result.columns.map(col => {
        let val = row[col];
        if (val === null) return '';
        // Escape quotes and wrap in quotes if there's a comma
        let strVal = String(val).replace(/"/g, '""');
        if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
          strVal = `"${strVal}"`;
        }
        return strVal;
      }).join(',')
    );
    
    const csvContent = [columns, ...rows].join('\n');
    const outputPath = path.resolve(process.cwd(), `../${tableName}.csv`);
    fs.writeFileSync(outputPath, csvContent);
    console.log(`Exported ${tableName} to ${outputPath}`);
  } catch (err) {
    console.error(`Error exporting ${tableName}:`, err.message);
  }
}

async function main() {
  const tables = ['categories', 'products', 'users', 'blog_posts'];
  for (const table of tables) {
    await exportTableToCsv(table);
  }
}

main();
