/**
 * 영업현황 페이지 컴포넌트
 * 
 * 영업 파이프라인, 영업 기회, 영업 활동 등의 영업 관련 정보를 표시합니다.
 * 영업 데이터를 시각화하고 필터링하는 기능을 제공합니다.
 */

import { BasePage } from '../../components/base-page.js';
import { SalesService } from '../../services/sales-service.js';
import { createPipelineChart } from './components/pipeline-chart.js';
import { createOpportunitiesTable } from './components/opportunities-table.js';
import { createActivitiesTimeline } from './components/activities-timeline.js';
import { createSalesFunnel } from './components/sales-funnel.js';

export default class SalesPage extends BasePage {
  /**
   * SalesPage 클래스 생성자
   * @param {Object} config - 페이지 설정 객체
   */
  constructor(config) {
    super(config);
    
    this.salesService = new SalesService();
    
    this.state = {
      isLoading: true,
      pipelineData: null,
      opportunitiesData: null,
      activitiesData: null,
      funnelData: null,
      filterPeriod: 'month', // 'week', 'month', 'quarter', 'year'
      filterStatus: 'all', // 'all', 'active', 'won', 'lost'
      searchQuery: '',
      sortBy: 'date', // 'date', 'amount', 'probability'
      sortOrder: 'desc' // 'asc', 'desc'
    };
  }

  /**
   * 페이지 렌더링
   * @returns {Promise<HTMLElement>} 렌더링된 페이지 요소
   */
  async render() {
    this.element = document.createElement('div');
    this.element.className = 'page sales-page';
    
    // 기본 레이아웃 구조 생성
    this.element.innerHTML = `
      <div class="sales-header">
        <h1 class="sales-title">영업현황</h1>
        <div class="sales-actions">
          <div class="filter-group">
            <select id="period-filter" class="form-select">
              <option value="week">이번 주</option>
              <option value="month" selected>이번 달</option>
              <option value="quarter">이번 분기</option>
              <option value="year">올해</option>
            </select>
            <select id="status-filter" class="form-select">
              <option value="all">모든 상태</option>
              <option value="active">진행 중</option>
              <option value="won">성공</option>
              <option value="lost">실패</option>
            </select>
          </div>
          <div class="search-group">
            <div class="search-input-wrapper">
              <input type="text" id="search-input" class="form-control" placeholder="검색...">
              <button class="search-button">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
          <button class="btn btn-primary btn-sm add-opportunity-button">
            <i class="fas fa-plus"></i> 영업 기회 추가
          </button>
        </div>
      </div>
      
      <div class="sales-content">
        <!-- 영업 파이프라인 차트 -->
        <div class="row">
          <div class="col-md-8 col-xs-12">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">영업 파이프라인</h3>
              </div>
              <div class="card-body">
                <div id="pipeline-chart-container" class="chart-container"></div>
              </div>
            </div>
          </div>
          <div class="col-md-4 col-xs-12">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">영업 단계별 현황</h3>
              </div>
              <div class="card-body">
                <div id="sales-funnel-container" class="chart-container"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 영업 기회 테이블 -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">영업 기회</h3>
            <div class="card-actions">
              <div class="sort-group">
                <label for="sort-by" class="sort-label">정렬:</label>
                <select id="sort-by" class="form-select form-select-sm">
                  <option value="date">날짜</option>
                  <option value="amount">금액</option>
                  <option value="probability">확률</option>
                </select>
                <button id="sort-order" class="btn btn-icon btn-sm">
                  <i class="fas fa-sort-amount-down"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div id="opportunities-table-container" class="table-container"></div>
          </div>
        </div>
        
        <!-- 영업 활동 타임라인 -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">최근 영업 활동</h3>
          </div>
          <div class="card-body">
            <div id="activities-timeline-container" class="timeline-container"></div>
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
    this.setTitle('영업현황');
    
    // 요소 참조
    this.chartContainers = {
      pipeline: this.$('#pipeline-chart-container'),
      funnel: this.$('#sales-funnel-container')
    };
    
    this.tableContainers = {
      opportunities: this.$('#opportunities-table-container'),
      activities: this.$('#activities-timeline-container')
    };
    
    this.filterElements = {
      period: this.$('#period-filter'),
      status: this.$('#status-filter'),
      search: this.$('#search-input'),
      sortBy: this.$('#sort-by'),
      sortOrder: this.$('#sort-order')
    };
    
    this.addOpportunityButton = this.$('.add-opportunity-button');
    
    // 이벤트 리스너 등록
    this.addEventListener(this.filterElements.period, 'change', this.handlePeriodChange.bind(this));
    this.addEventListener(this.filterElements.status, 'change', this.handleStatusChange.bind(this));
    this.addEventListener(this.filterElements.search, 'input', this.handleSearch.bind(this));
    this.addEventListener(this.filterElements.sortBy, 'change', this.handleSortChange.bind(this));
    this.addEventListener(this.filterElements.sortOrder, 'click', this.handleSortOrderToggle.bind(this));
    this.addEventListener(this.addOpportunityButton, 'click', this.handleAddOpportunity.bind(this));
    
    // 데이터 로드
    await this.loadSalesData();
  }

  /**
   * 영업 데이터 로드
   */
  async loadSalesData() {
    try {
      this.setState({ isLoading: true });
      
      // 로딩 표시
      this.showLoadingState();
      
      // 영업 데이터 가져오기
      const salesData = await this.salesService.getSalesData({
        period: this.state.filterPeriod,
        status: this.state.filterStatus,
        search: this.state.searchQuery,
        sortBy: this.state.sortBy,
        sortOrder: this.state.sortOrder
      });
      
      // 상태 업데이트
      this.setState({
        isLoading: false,
        pipelineData: salesData.pipelineData,
        opportunitiesData: salesData.opportunitiesData,
        activitiesData: salesData.activitiesData,
        funnelData: salesData.funnelData
      });
      
      // UI 업데이트
      this.renderCharts();
      this.renderTables();
      
    } catch (error) {
      console.error('영업 데이터 로드 중 오류 발생:', error);
      
      this.setState({ isLoading: false });
      this.showNotification('데이터를 불러오는 중 오류가 발생했습니다.', 'danger');
    }
  }

  /**
   * 로딩 상태 표시
   */
  showLoadingState() {
    // 차트 로딩
    Object.values(this.chartContainers).forEach(container => {
      container.innerHTML = `
        <div class="skeleton-loader chart-skeleton"></div>
      `;
    });
    
    // 테이블 로딩
    Object.values(this.tableContainers).forEach(container => {
      container.innerHTML = `
        <div class="skeleton-loader table-skeleton"></div>
      `;
    });
  }

  /**
   * 차트 렌더링
   */
  renderCharts() {
    if (!this.state.pipelineData || !this.state.funnelData) return;
    
    // 영업 파이프라인 차트
    this.chartContainers.pipeline.innerHTML = '';
    this.chartContainers.pipeline.appendChild(
      createPipelineChart(this.state.pipelineData)
    );
    
    // 영업 단계별 현황 차트
    this.chartContainers.funnel.innerHTML = '';
    this.chartContainers.funnel.appendChild(
      createSalesFunnel(this.state.funnelData)
    );
  }

  /**
   * 테이블 렌더링
   */
  renderTables() {
    if (!this.state.opportunitiesData || !this.state.activitiesData) return;
    
    // 영업 기회 테이블
    this.tableContainers.opportunities.innerHTML = '';
    this.tableContainers.opportunities.appendChild(
      createOpportunitiesTable(this.state.opportunitiesData, {
        onRowClick: this.handleOpportunityClick.bind(this)
      })
    );
    
    // 영업 활동 타임라인
    this.tableContainers.activities.innerHTML = '';
    this.tableContainers.activities.appendChild(
      createActivitiesTimeline(this.state.activitiesData)
    );
  }

  /**
   * 기간 필터 변경 처리
   * @param {Event} event - 변경 이벤트
   */
  handlePeriodChange(event) {
    this.setState({ filterPeriod: event.target.value });
    this.loadSalesData();
  }

  /**
   * 상태 필터 변경 처리
   * @param {Event} event - 변경 이벤트
   */
  handleStatusChange(event) {
    this.setState({ filterStatus: event.target.value });
    this.loadSalesData();
  }

  /**
   * 검색 처리
   * @param {Event} event - 입력 이벤트
   */
  handleSearch(event) {
    this.setState({ searchQuery: event.target.value });
    
    // 디바운스 처리
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadSalesData();
    }, 300);
  }

  /**
   * 정렬 기준 변경 처리
   * @param {Event} event - 변경 이벤트
   */
  handleSortChange(event) {
    this.setState({ sortBy: event.target.value });
    this.loadSalesData();
  }

  /**
   * 정렬 순서 토글 처리
   */
  handleSortOrderToggle() {
    const newOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';
    this.setState({ sortOrder: newOrder });
    
    // 아이콘 업데이트
    const icon = this.filterElements.sortOrder.querySelector('i');
    icon.className = newOrder === 'asc' ? 'fas fa-sort-amount-up' : 'fas fa-sort-amount-down';
    
    this.loadSalesData();
  }

  /**
   * 영업 기회 클릭 처리
   * @param {Object} opportunity - 클릭된 영업 기회 데이터
   */
  handleOpportunityClick(opportunity) {
    // 영업 기회 상세 모달 표시
    this.showOpportunityDetails(opportunity);
  }

  /**
   * 영업 기회 추가 처리
   */
  handleAddOpportunity() {
    // 영업 기회 추가 모달 표시
    this.showAddOpportunityModal();
  }

  /**
   * 영업 기회 상세 모달 표시
   * @param {Object} opportunity - 영업 기회 데이터
   */
  showOpportunityDetails(opportunity) {
    // 모달 콘텐츠 생성
    const content = document.createElement('div');
    content.className = 'opportunity-details';
    
    content.innerHTML = `
      <div class="opportunity-header">
        <h4 class="opportunity-name">${opportunity.name}</h4>
        <span class="opportunity-status status-${opportunity.status}">${this.getStatusText(opportunity.status)}</span>
      </div>
      
      <div class="opportunity-info">
        <div class="info-item">
          <span class="info-label">고객사:</span>
          <span class="info-value">${opportunity.company}</span>
        </div>
        <div class="info-item">
          <span class="info-label">담당자:</span>
          <span class="info-value">${opportunity.contact}</span>
        </div>
        <div class="info-item">
          <span class="info-label">금액:</span>
          <span class="info-value">${opportunity.amount.toLocaleString()}만원</span>
        </div>
        <div class="info-item">
          <span class="info-label">확률:</span>
          <span class="info-value">${opportunity.probability}%</span>
        </div>
        <div class="info-item">
          <span class="info-label">예상 종료일:</span>
          <span class="info-value">${opportunity.expectedCloseDate}</span>
        </div>
        <div class="info-item">
          <span class="info-label">단계:</span>
          <span class="info-value">${opportunity.stage}</span>
        </div>
      </div>
      
      <div class="opportunity-description">
        <h5>설명</h5>
        <p>${opportunity.description || '설명이 없습니다.'}</p>
      </div>
      
      <div class="opportunity-actions">
        <button class="btn btn-outline btn-sm edit-opportunity">
          <i class="fas fa-edit"></i> 편집
        </button>
        <button class="btn btn-outline btn-sm delete-opportunity">
          <i class="fas fa-trash"></i> 삭제
        </button>
      </div>
    `;
    
    // 모달 생성
    const modal = this.createModal({
      title: '영업 기회 상세',
      content: content,
      confirmText: '닫기',
      showCancel: false
    });
    
    // 편집 버튼 이벤트
    const editButton = content.querySelector('.edit-opportunity');
    this.addEventListener(editButton, 'click', () => {
      modal.close();
      this.showEditOpportunityModal(opportunity);
    });
    
    // 삭제 버튼 이벤트
    const deleteButton = content.querySelector('.delete-opportunity');
    this.addEventListener(deleteButton, 'click', () => {
      modal.close();
      this.confirmDeleteOpportunity(opportunity);
    });
  }

  /**
   * 영업 기회 추가 모달 표시
   */
  showAddOpportunityModal() {
    // 모달 콘텐츠 생성 (폼)
    const content = this.createOpportunityForm();
    
    // 모달 생성
    const modal = this.createModal({
      title: '영업 기회 추가',
      content: content,
      confirmText: '저장',
      cancelText: '취소',
      onConfirm: () => {
        // 폼 데이터 수집 및 저장
        const formData = this.collectFormData(content);
        this.saveOpportunity(formData);
      }
    });
  }

  /**
   * 영업 기회 편집 모달 표시
   * @param {Object} opportunity - 편집할 영업 기회 데이터
   */
  showEditOpportunityModal(opportunity) {
    // 모달 콘텐츠 생성 (폼)
    const content = this.createOpportunityForm(opportunity);
    
    // 모달 생성
    const modal = this.createModal({
      title: '영업 기회 편집',
      content: content,
      confirmText: '저장',
      cancelText: '취소',
      onConfirm: () => {
        // 폼 데이터 수집 및 저장
        const formData = this.collectFormData(content);
        formData.id = opportunity.id; // ID 유지
        this.saveOpportunity(formData, true);
      }
    });
  }

  /**
   * 영업 기회 삭제 확인
   * @param {Object} opportunity - 삭제할 영업 기회 데이터
   */
  confirmDeleteOpportunity(opportunity) {
    this.confirm(
      `"${opportunity.name}" 영업 기회를 삭제하시겠습니까?`,
      () => {
        this.deleteOpportunity(opportunity.id);
      }
    );
  }

  /**
   * 영업 기회 폼 생성
   * @param {Object} [opportunity] - 기존 영업 기회 데이터 (편집 시)
   * @returns {HTMLElement} 폼 요소
   */
  createOpportunityForm(opportunity = null) {
    const form = document.createElement('form');
    form.className = 'opportunity-form';
    
    // 현재 날짜 (YYYY-MM-DD 형식)
    const today = new Date().toISOString().split('T')[0];
    
    form.innerHTML = `
      <div class="form-group">
        <label for="name" class="form-label">영업 기회명 *</label>
        <input type="text" id="name" name="name" class="form-control" required
          value="${opportunity ? opportunity.name : ''}">
      </div>
      
      <div class="form-group">
        <label for="company" class="form-label">고객사 *</label>
        <input type="text" id="company" name="company" class="form-control" required
          value="${opportunity ? opportunity.company : ''}">
      </div>
      
      <div class="form-group">
        <label for="contact" class="form-label">담당자</label>
        <input type="text" id="contact" name="contact" class="form-control"
          value="${opportunity ? opportunity.contact : ''}">
      </div>
      
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label for="amount" class="form-label">금액 (만원) *</label>
            <input type="number" id="amount" name="amount" class="form-control" required min="0"
              value="${opportunity ? opportunity.amount : ''}">
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <label for="probability" class="form-label">확률 (%) *</label>
            <input type="number" id="probability" name="probability" class="form-control" required min="0" max="100"
              value="${opportunity ? opportunity.probability : '50'}">
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label for="stage" class="form-label">단계 *</label>
            <select id="stage" name="stage" class="form-control" required>
              <option value="initial" ${opportunity && opportunity.stage === 'initial' ? 'selected' : ''}>초기 접촉</option>
              <option value="qualification" ${opportunity && opportunity.stage === 'qualification' ? 'selected' : ''}>검증</option>
              <option value="proposal" ${opportunity && opportunity.stage === 'proposal' ? 'selected' : ''}>제안</option>
              <option value="negotiation" ${opportunity && opportunity.stage === 'negotiation' ? 'selected' : ''}>협상</option>
              <option value="closing" ${opportunity && opportunity.stage === 'closing' ? 'selected' : ''}>종료</option>
            </select>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <label for="status" class="form-label">상태 *</label>
            <select id="status" name="status" class="form-control" required>
              <option value="active" ${!opportunity || opportunity.status === 'active' ? 'selected' : ''}>진행 중</option>
              <option value="won" ${opportunity && opportunity.status === 'won' ? 'selected' : ''}>성공</option>
              <option value="lost" ${opportunity && opportunity.status === 'lost' ? 'selected' : ''}>실패</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="expectedCloseDate" class="form-label">예상 종료일 *</label>
        <input type="date" id="expectedCloseDate" name="expectedCloseDate" class="form-control" required
          value="${opportunity ? opportunity.expectedCloseDate : today}">
      </div>
      
      <div class="form-group">
        <label for="description" class="form-label">설명</label>
        <textarea id="description" name="description" class="form-control" rows="3">${opportunity ? opportunity.description || '' : ''}</textarea>
      </div>
    `;
    
    return form;
  }

  /**
   * 폼 데이터 수집
   * @param {HTMLElement} form - 폼 요소
   * @returns {Object} 수집된 데이터
   */
  collectFormData(form) {
    return {
      name: form.querySelector('#name').value,
      company: form.querySelector('#company').value,
      contact: form.querySelector('#contact').value,
      amount: parseInt(form.querySelector('#amount').value, 10),
      probability: parseInt(form.querySelector('#probability').value, 10),
      stage: form.querySelector('#stage').value,
      status: form.querySelector('#status').value,
      expectedCloseDate: form.querySelector('#expectedCloseDate').value,
      description: form.querySelector('#description').value
    };
  }

  /**
   * 영업 기회 저장
   * @param {Object} data - 저장할 데이터
   * @param {boolean} [isEdit=false] - 편집 모드 여부
   */
  async saveOpportunity(data, isEdit = false) {
    try {
      if (isEdit) {
        await this.salesService.updateOpportunity(data);
        this.showNotification('영업 기회가 수정되었습니다.', 'success');
      } else {
        await this.salesService.createOpportunity(data);
        this.showNotification('영업 기회가 추가되었습니다.', 'success');
      }
      
      // 데이터 다시 로드
      this.loadSalesData();
    } catch (error) {
      console.error('영업 기회 저장 중 오류 발생:', error);
      this.showNotification('영업 기회 저장 중 오류가 발생했습니다.', 'danger');
    }
  }

  /**
   * 영업 기회 삭제
   * @param {string} id - 삭제할 영업 기회 ID
   */
  async deleteOpportunity(id) {
    try {
      await this.salesService.deleteOpportunity(id);
      this.showNotification('영업 기회가 삭제되었습니다.', 'success');
      
      // 데이터 다시 로드
      this.loadSalesData();
    } catch (error) {
      console.error('영업 기회 삭제 중 오류 발생:', error);
      this.showNotification('영업 기회 삭제 중 오류가 발생했습니다.', 'danger');
    }
  }

  /**
   * 상태 텍스트 반환
   * @param {string} status - 상태 코드
   * @returns {string} 상태 텍스트
   */
  getStatusText(status) {
    const statusMap = {
      active: '진행 중',
      won: '성공',
      lost: '실패'
    };
    
    return statusMap[status] || '알 수 없음';
  }

  /**
   * 상태 업데이트 후 UI 갱신
   */
  update() {
    if (!this.state.isLoading) {
      this.renderCharts();
      this.renderTables();
    }
  }
}
