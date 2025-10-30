import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerComponent, NgxSpinnerService } from 'ngx-spinner';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { AgentTable } from '../agent-table/agent-table';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
  animations: [
    trigger('expandCollapse', [
      state('void', style({ height: '0', opacity: 0 })),
      state('*', style({ height: '*', opacity: 1 })),
      transition('void <=> *', animate('250ms ease-in-out'))
    ])
  ]
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
  isExpanded = true;
  clickedKey: string | null = null;
  animatedValues: { [key in keyof FilterCount]?: number } = {};

  @ViewChild('resultSection') resultSection!: ElementRef;
  @ViewChild('agentDetailsSection') agentDetailsSection!: ElementRef;
  @ViewChild(AgentTable) agentTable!: AgentTable;

  objectKeys(obj: any): string[] {
    return Object.keys(obj).filter(key => key !== 'extra_filter');
  }



  ngOnInit(): void {
    this.getFilters();
  }

  togglePanel(): void {
    this.isExpanded = !this.isExpanded;
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


  private animateValue(
    key: keyof FilterCount,
    start: number,
    end: number,
    duration = 800
  ): void {
    const range = end - start;
    if (range === 0) return;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      this.animatedValues[key] = Math.round(start + range * progress);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }


  private updateAnimatedCounts(): void {
    (Object.keys(this.filterCount) as (keyof FilterCount)[]).forEach((key) => {
      const endValue = this.filterCount[key];
      if (endValue !== undefined && endValue !== null) {
        this.animateValue(key, this.animatedValues[key] || 0, endValue);
      }
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
        this.filterCount.agent_count = response?.agent_count;
        this.filterCount.hx_contact = response?.hx_contact;
        this.filterCount.hx_transaction = response?.hx_transaction;
        this.filterCount.hx_transaction_revenue = response?.hx_transaction_revenue;
        this.filterCount.not_in_hx_contact = response?.not_in_hx_contact;
        this.toastr.success('Filters applied!', 'Success');
        this.updateAnimatedCounts();
        this.agentTable?.clearSearch();
        this.isExpanded = false;

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
    this.filterCount.hx_contact = null;
    this.filterCount.hx_transaction = null;
    this.filterCount.hx_transaction_revenue = null;
    this.filterCount.not_in_hx_contact = null;
    this.showTable = false;
    this.columns = [];
    this.agents = [];
    this.toastr.info('Filters cleared!', 'Notice');
  }



  getAgentDetails(filterType: string): void {
    this.selectedFilters['extra_filter'] = filterType;
    this.spinner.show();
    this.clickedKey = filterType; // highlight clicked box
    setTimeout(() => (this.clickedKey = null), 800);
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
        }, 50);
        this.spinner.hide();
      },
    });
  }
}
