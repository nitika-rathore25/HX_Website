import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerComponent, NgxSpinnerService } from 'ngx-spinner';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { AgentTable } from '../agent-table/agent-table';

export interface FilterCount {
  agent_count: number | null;
  hx_transaction?: number | null;
  hx_transaction_revenue?: number | null;
  hx_contact?: number | null;
  not_in_hx_contact?: number | null;
}


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, NgxSpinnerComponent, ToastrModule, AgentTable],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private apiCallingService = inject(ApiService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  filters: any[] = [];
  selectedFilters: any = {};
  // agent_count: number | null = null;
  filterCount: FilterCount = { agent_count: null, hx_transaction: null, hx_transaction_revenue: null, hx_contact: null, not_in_hx_contact: null };
  columns: string[] = [];
  agents: any[] = [];
  showTable = false;

  @ViewChild('resultSection') resultSection!: ElementRef;
  @ViewChild('agentDetailsSection') agentDetailsSection!: ElementRef;
  @ViewChild(AgentTable) agentTable!: AgentTable;

  ngOnInit(): void {
    this.getFilters();
  }

  getFilters(): void {
    this.spinner.show();
    (this.apiCallingService.getFilters() as any).subscribe({
      next: (response: any) => {
        if (response?.filters) this.filters = response.filters;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error('Failed to fetch filters', 'Error');
      },
    });
  }

  applyFilters(): void {
    this.spinner.show();
    if (Object.keys(this.selectedFilters).length === 0) {
      this.toastr.warning('Please select at least one filter', 'Warning');
      this.spinner.hide();
      return;
    }
    this.apiCallingService.getAgents(this.selectedFilters).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        this.showTable = false;

        // this.agent_count = response?.agent_count ?? 0;
        this.filterCount.agent_count = response?.agent_count ?? 0;
        this.toastr.success('Filters applied!', 'Success');
        this.agentTable?.clearSearch();

        setTimeout(() => {
          this.resultSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error('Failed to apply filters', 'Error');
      },
    });
  }

  clearFilters(): void {
    this.selectedFilters = {};
    this.filterCount.agent_count = null;
    this.showTable = false;
    this.columns = [];
    this.agents = [];
    this.toastr.info('Filters cleared!', 'Notice');
  }

  getAgentDetails(filterType: string): void {
    this.selectedFilters['extra_filter'] = filterType;
    this.apiCallingService.getAgentDetails(this.selectedFilters).subscribe({
      next: (res: any) => {
        this.columns = res.columns;
        this.agents = res.data;
        this.showTable = true;
        this.toastr.success('Agent details fetched!', 'Success');
        setTimeout(() => {
          this.agentDetailsSection.nativeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 100);
      },
    });
  }
}
