
export interface AwardSummary {
    total_value: number;
    total_count: number;
    avg_value: number;
  }
  
  export interface AwardTimeSeriesItem {
    period: string;
    count: number;
    total_value: number;
  }
  
  export interface AwardSectorItem {
    sector: string;
    sector_code: string;
    count: number;
    total_value: number;
  }
  
  export interface RegionItem {
    region_code: string;
    region_name: string;
    count: number;
    total_value: number;
  }
  
  export interface WinnerItem {
    winner: string;
    count: number;
    total_value: number;
    sectors: string[];
  }
  
  export interface SupplierItem {
    supplier_name: string;
    supplier_id?: string;
    count: number;
    total_value: number;
    sectors: string[];
  }
  
  export interface ContractItem {
    publication_id: string;
    title: string;
    award_date?: string;
    winner: string;
    suppliers: Array<{ name: string; id?: string }>;
    value: number;
    sector: string;
    cpv_code: string;
    buyer: string;
  }
  
  export interface WinnerDetailResponse {
    winner: string;
    summary: AwardSummary;
    time_series: AwardTimeSeriesItem[];
    sectors: AwardSectorItem[];
    contracts: ContractItem[];
  }
  
  export interface SupplierDetailResponse {
    supplier_name: string;
    supplier_id?: string;
    summary: AwardSummary;
    time_series: AwardTimeSeriesItem[];
    sectors: AwardSectorItem[];
    contracts: ContractItem[];
  }
  
  export interface SectorDetailResponse {
    sector: string;
    sector_code: string;
    summary: AwardSummary;
    time_series: AwardTimeSeriesItem[];
    winners: WinnerItem[];
    suppliers: SupplierItem[];
    contracts: ContractItem[];
  }