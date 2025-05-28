/**
 * 대시보드 페이지 컴포넌트
 * 
 * 주요 비즈니스 지표와 차트를 표시하는 대시보드 페이지를 구현합니다.
 * 총 매출 전망, 수주잔 합계, 계약 예정, 분기 달성률 등의 지표를 표시합니다.
 */

import { BasePage } from '../../components/base-page.js';
import { DashboardService } from '../../services/dashboard-service.js';
import { createMetricCard } from './components/metric-card.js';
import { createRevenueChart } from './components/revenue-chart.js';
import { createBreakdownChart } from './components/breakdown-chart.js';
import { createServiceKpiTable } from './components/service-kpi-table.js';

export default class DashboardPage extends BasePage {
  /**
   * DashboardPage 클래스 생성자
   * @param {Object} config - 페이지 설정 객체
   */
  constructor(config) {
    super(config);
    
    this.dashboardService = new DashboardService();
    
    this.state = {
      isLoading: true,
      metrics: null,
      revenueData: null,
      breakdownData: null,
      serviceKpis: null,
      activeServiceTab: 'hems', // 기본 탭
      currentWeek: this.app.state.currentWeek
    };
  }

  /**
   * 페이지 렌더링
   * @returns {Promise<HTMLElement>} 렌더링된 페이지 요소
   */
  async render() {
    this.element = document.createElement('div');
    this.element.className = 'page dashboard-page';
    
    // 기본 레이아웃 구조 생성
    this.element.innerHTML = `
      <div class="dashboard-header">
        <h1 class="dashboard-title">대시보드</h1>
        <div class="dashboard-actions">
          <div class="week-indicator">
            <i class="fas fa-calendar-week"></i>
            <span class="current-week">${this.state.currentWeek}</span>
          </div>
          <button class="btn btn-outline btn-sm refresh-button">
            <i class="fas fa-sync-alt"></i> 새로고침
          </button>
        </div>
      </div>
      
      <div class="dashboard-content">
        <!-- 지표 카드 영역 -->
        <div class="metrics-section">
          <div class="row">
            <div class="col-md-3 col-sm-6 col-xs-12">
              <div id="metric-revenue-forecast" class="metric-card-container"></div>
            </div>
            <div class="col-md-3 col-sm-6 col-xs-12">
              <div id="metric-backlog-total" class="metric-card-container"></div>
            </div>
            <div class="col-md-3 col-sm-6 col-xs-12">
              <div id="metric-pending-contracts" class="metric-card-container"></div>
            </div>
            <div class="col-md-3 col-sm-6 col-xs-12">
              <div id="metric-quarter-achievement" class="metric-card-container"></div>
            </div>
          </div>
        </div>
        
        <!-- 차트 영역 -->
        <div class="charts-section">
          <div class="row">
            <div class="col-md-6 col-xs-12">
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">매출 현황</h3>
                </div>
                <div class="card-body">
                  <div id="revenue-chart-container" class="chart-container"></div>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-xs-12">
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">예상 매출 Break-Down</h3>
                </div>
                <div class="card-body">
                  <div id="breakdown-chart-container" class="chart-container"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 서비스 KPI 영역 -->
        <div class="service-kpi-section">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">서비스 KPI</h3>
            </div>
            <div class="card-body">
              <div class="service-tabs">
                <button class="service-tab active" data-service="hems">HEMS</button>
                <button class="service-tab" data-service="bems">BEMS</button>
                <button class="service-tab" data-service="rems">REMS</button>
                <button class="service-tab" data-service="fems">FEMS</button>
              </div>
              <div id="service-kpi-table-container" class="service-kpi-table-container"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    return this.element;
  }

  /**
   * 페이지 마운트 후 호출
   */
  async mounted() {
    this.setTitle('대시보드');
    
    // 요소 참조
    this.metricContainers = {
      revenueForecast: this.$('#metric-revenue-forecast'),
      backlogTotal: this.$('#metric-backlog-total'),
      pendingContracts: this.$('#metric-pending-contracts'),
      quarterAchievement: this.$('#metric-quarter-achievement')
    };
    
    this.chartContainers = {
      revenue: this.$('#revenue-chart-container'),
      breakdown: this.$('#breakdown-chart-container')
    };
    
    this.serviceKpiContainer = this.$('#service-kpi-table-container');
    this.serviceTabs = this.$$('.service-tab');
    this.refreshButton = this.$('.refresh-button');
    
    // 이벤트 리스너 등록
    this.addEventListener(this.refreshButton, 'click', this.loadDashboardData.bind(this));
    
    // 서비스 탭 이벤트 리스너
    this.serviceTabs.forEach(tab => {
      this.addEventListener(tab, 'click', () => {
        const service = tab.dataset.service;
        this.setState({ activeServiceTab: service });
        this.updateServiceTabs();
        this.renderServiceKpiTable();
      });
    });
    
    // 데이터 로드
    await this.loadDashboardData();
  }

  /**
   * 대시보드 데이터 로드
   */
  async loadDashboardData() {
    try {
      this.setState({ isLoading: true });
      
      // 로딩 표시
      this.showLoadingState();
      
      // 대시보드 데이터 가져오기
      const dashboardData = await this.dashboardService.getDashboardData();
      
      // 상태 업데이트
      this.setState({
        isLoading: false,
        metrics: dashboardData.metrics,
        revenueData: dashboardData.revenueData,
        breakdownData: dashboardData.breakdownData,
        serviceKpis: dashboardData.serviceKpis
      });
      
      // UI 업데이트
      this.renderMetricCards();
      this.renderCharts();
      this.renderServiceKpiTable();
      
    } catch (error) {
      console.error('대시보드 데이터 로드 중 오류 발생:', error);
      
      this.setState({ isLoading: false });
      this.showNotification('데이터를 불러오는 중 오류가 발생했습니다.', 'danger');
    }
  }

  /**
   * 로딩 상태 표시
   */
  showLoadingState() {
    // 지표 카드 로딩
    Object.values(this.metricContainers).forEach(container => {
      container.innerHTML = `
        <div class="card loading">
          <div class="card-body">
            <div class="skeleton-loader"></div>
          </div>
        </div>
      `;
    });
    
    // 차트 로딩
    Object.values(this.chartContainers).forEach(container => {
      container.innerHTML = `
        <div class="skeleton-loader chart-skeleton"></div>
      `;
    });
    
    // 서비스 KPI 테이블 로딩
    this.serviceKpiContainer.innerHTML = `
      <div class="skeleton-loader table-skeleton"></div>
    `;
  }

  /**
   * 지표 카드 렌더링
   */
  renderMetricCards() {
    if (!this.state.metrics) return;
    
    const { metrics } = this.state;
    
    // 총 매출 전망 카드
    this.metricContainers.revenueForecast.innerHTML = '';
    this.metricContainers.revenueForecast.appendChild(
      createMetricCard({
        title: '총 매출 전망',
        value: metrics.revenueForecast.total.toLocaleString() + '만원',
        change: metrics.revenueForecast.change,
        icon: 'fa-chart-line',
        color: 'primary'
      })
    );
    
    // 수주잔 합계 카드
    this.metricContainers.backlogTotal.innerHTML = '';
    this.metricContainers.backlogTotal.appendChild(
      createMetricCard({
        title: '수주잔 합계',
        value: metrics.backlogTotal.amount.toLocaleString() + '만원',
        change: metrics.backlogTotal.change,
        icon: 'fa-coins',
        color: 'success'
      })
    );
    
    // 계약 예정 카드
    this.metricContainers.pendingContracts.innerHTML = '';
    this.metricContainers.pendingContracts.appendChild(
      createMetricCard({
        title: '계약 예정',
        value: metrics.pendingContracts.count + '건',
        subValue: metrics.pendingContracts.amount.toLocaleString() + '만원',
        icon: 'fa-file-signature',
        color: 'warning'
      })
    );
    
    // 분기 달성률 카드
    this.metricContainers.quarterAchievement.innerHTML = '';
    this.metricContainers.quarterAchievement.appendChild(
      createMetricCard({
        title: '분기 달성률',
        value: metrics.quarterAchievement.percentage + '%',
        subValue: metrics.quarterAchievement.current.toLocaleString() + '/' + 
                 metrics.quarterAchievement.target.toLocaleString() + '만원',
        icon: 'fa-trophy',
        color: 'info',
        progress: metrics.quarterAchievement.percentage
      })
    );
  }

  /**
   * 차트 렌더링
   */
  renderCharts() {
    if (!this.state.revenueData || !this.state.breakdownData) return;
    
    // 매출 현황 차트
    this.chartContainers.revenue.innerHTML = '';
    this.chartContainers.revenue.appendChild(
      createRevenueChart(this.state.revenueData)
    );
    
    // 예상 매출 Break-Down 차트
    this.chartContainers.breakdown.innerHTML = '';
    this.chartContainers.breakdown.appendChild(
      createBreakdownChart(this.state.breakdownData)
    );
  }

  /**
   * 서비스 KPI 테이블 렌더링
   */
  renderServiceKpiTable() {
    if (!this.state.serviceKpis) return;
    
    const serviceType = this.state.activeServiceTab;
    const kpiData = this.state.serviceKpis[serviceType];
    
    this.serviceKpiContainer.innerHTML = '';
    this.serviceKpiContainer.appendChild(
      createServiceKpiTable(kpiData, serviceType)
    );
  }

  /**
   * 서비스 탭 업데이트
   */
  updateServiceTabs() {
    this.serviceTabs.forEach(tab => {
      if (tab.dataset.service === this.state.activeServiceTab) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  /**
   * 상태 업데이트 후 UI 갱신
   */
  update() {
    if (!this.state.isLoading) {
      this.renderMetricCards();
      this.renderCharts();
      this.renderServiceKpiTable();
      this.updateServiceTabs();
    }
  }
}
