import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agent-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-table.html',
  styleUrls: ['./agent-table.css'],
})
export class AgentTable {
  @Input() columns: string[] = [];
  @Input() data: any[] = [];

  searchTerm: string = '';
  sortKey: string = '';
  sortAsc: boolean = true;

  get filteredData() {
    let filtered = this.data;

    // 🔍 Search filter
    if (this.searchTerm.trim()) {
      const lowerTerm = this.searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(lowerTerm)
        )
      );
    }

    // 🔽 Sorting logic
    if (this.sortKey) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = String(a[this.sortKey] ?? '').toLowerCase();
        const bVal = String(b[this.sortKey] ?? '').toLowerCase();
        return this.sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }

    return filtered;
  }

  sortBy(key: string) {
    if (this.sortKey === key) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortKey = key;
      this.sortAsc = true;
    }
  }

  clearSearch() {
    this.searchTerm = '';
  }

}
