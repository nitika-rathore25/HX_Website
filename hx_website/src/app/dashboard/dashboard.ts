import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerComponent, NgxSpinnerService } from 'ngx-spinner';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { AgentTable } from '../agent-table/agent-table';

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
  agent_count: number | null = null;
  columns: string[] = [];
  agents: any[] = [];
  showTable = false;

  @ViewChild('resultSection') resultSection!: ElementRef;
  @ViewChild('agentDetailsSection') agentDetailsSection!: ElementRef;

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
        this.agent_count = response?.agent_count ?? 0;
        this.toastr.success('Filters applied!', 'Success');

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
    this.agent_count = null;
    this.showTable = false;
    this.columns = [];
    this.agents = [];
    this.toastr.info('Filters cleared!', 'Notice');
  }

  getAgentDetails() {
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
