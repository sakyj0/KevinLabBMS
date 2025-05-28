/**
 * 계약 관리 페이지 컴포넌트
 * 
 * 계약 목록, 계약 상세 정보, 계약 상태 관리 등의 기능을 제공합니다.
 * 계약 데이터를 표시하고 필터링하는 기능을 제공합니다.
 */

import { BasePage } from '../../components/base-page.js';
import { ContractsService } from '../../services/contracts-service.js';
import { createContractList } from './components/contract-list.js';
import { createContractSummary } from './components/contract-summary.js';
import { createContractDetails } from './components/contract-details.js';
import { createContractDocuments } from './components/contract-documents.js';

export default class ContractsPage extends BasePage {
  /**
   * ContractsPage 클래스 생성자
   * @param {Object} config - 페이지 설정 객체
   */
  constructor(config) {
    super(config);
    
    this.contractsService = new ContractsService();
    
    this.state = {
      isLoading: true,
      contracts: null,
      contractSummary: null,
      selectedContract: null,
      filterStatus: 'all', // 'all', 'active', 'expired', 'pending'
      filterPeriod: 'all', // 'all', 'month', 'quarter', 'year'
      searchQuery: '',
      sortBy: 'date', // 'date', 'amount', 'client'
      sortOrder: 'desc', // 'asc', 'desc'
      view: 'list' // 'list', 'details'
    };
  }

  /**
   * 페이지 렌더링
   * @returns {Promise<HTMLElement>} 렌더링된 페이지 요소
   */
  async render() {
    this.element = document.createElement('div');
    this.element.className = 'page contracts-page';
    
    // 기본 레이아웃 구조 생성
    this.element.innerHTML = `
      <div class="contracts-header">
        <h1 class="contracts-title">계약 관리</h1>
        <div class="contracts-actions">
          <div class="filter-group">
            <select id="status-filter" class="form-select">
              <option value="all">모든 상태</option>
              <option value="active">진행 중</option>
              <option value="pending">대기 중</option>
              <option value="expired">만료됨</option>
            </select>
            <select id="period-filter" class="form-select">
              <option value="all">전체 기간</option>
              <option value="month">이번 달</option>
              <option value="quarter">이번 분기</option>
              <option value="year">올해</option>
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
          <button class="btn btn-primary btn-sm add-contract-button">
            <i class="fas fa-plus"></i> 계약 추가
          </button>
        </div>
      </div>
      
      <div class="contracts-content">
        <!-- 계약 상태 요약 -->
        <div class="row">
          <div class="col-md-3 col-sm-6 col-xs-12">
            <div id="active-contracts-summary" class="summary-card-container"></div>
          </div>
          <div class="col-md-3 col-sm-6 col-xs-12">
            <div id="pending-contracts-summary" class="summary-card-container"></div>
          </div>
          <div class="col-md-3 col-sm-6 col-xs-12">
            <div id="expired-contracts-summary" class="summary-card-container"></div>
          </div>
          <div class="col-md-3 col-sm-6 col-xs-12">
            <div id="total-amount-summary" class="summary-card-container"></div>
          </div>
        </div>
        
        <!-- 계약 목록 또는 상세 정보 -->
        <div id="contracts-view-container" class="contracts-view-container">
          <!-- 여기에 계약 목록 또는 상세 정보가 표시됩니다 -->
          <div class="loading">
            <div class="spinner"></div>
            <p>로딩 중...</p>
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
    this.setTitle('계약 관리');
    
    // 요소 참조
    this.summaryContainers = {
      activeContracts: this.$('#active-contracts-summary'),
      pendingContracts: this.$('#pending-contracts-summary'),
      expiredContracts: this.$('#expired-contracts-summary'),
      totalAmount: this.$('#total-amount-summary')
    };
    
    this.viewContainer = this.$('#contracts-view-container');
    
    this.filterElements = {
      status: this.$('#status-filter'),
      period: this.$('#period-filter'),
      search: this.$('#search-input')
    };
    
    this.addContractButton = this.$('.add-contract-button');
    
    // 이벤트 리스너 등록
    this.addEventListener(this.filterElements.status, 'change', this.handleStatusChange.bind(this));
    this.addEventListener(this.filterElements.period, 'change', this.handlePeriodChange.bind(this));
    this.addEventListener(this.filterElements.search, 'input', this.handleSearch.bind(this));
    this.addEventListener(this.addContractButton, 'click', this.handleAddContract.bind(this));
    
    // 데이터 로드
    await this.loadContractsData();
  }

  /**
   * 계약 데이터 로드
   */
  async loadContractsData() {
    try {
      this.setState({ isLoading: true });
      
      // 로딩 표시
      this.showLoadingState();
      
      // 계약 데이터 가져오기
      const contractsData = await this.contractsService.getContractsData({
        status: this.state.filterStatus,
        period: this.state.filterPeriod,
        search: this.state.searchQuery,
        sortBy: this.state.sortBy,
        sortOrder: this.state.sortOrder
      });
      
      // 상태 업데이트
      this.setState({
        isLoading: false,
        contracts: contractsData.contracts,
        contractSummary: contractsData.summary
      });
      
      // UI 업데이트
      this.renderSummaryCards();
      this.renderContractsView();
      
    } catch (error) {
      console.error('계약 데이터 로드 중 오류 발생:', error);
      
      this.setState({ isLoading: false });
      this.showNotification('데이터를 불러오는 중 오류가 발생했습니다.', 'danger');
    }
  }

  /**
   * 로딩 상태 표시
   */
  showLoadingState() {
    // 요약 카드 로딩
    Object.values(this.summaryContainers).forEach(container => {
      container.innerHTML = `
        <div class="card loading">
          <div class="card-body">
            <div class="skeleton-loader"></div>
          </div>
        </div>
      `;
    });
    
    // 계약 목록 로딩
    this.viewContainer.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>로딩 중...</p>
      </div>
    `;
  }

  /**
   * 요약 카드 렌더링
   */
  renderSummaryCards() {
    if (!this.state.contractSummary) return;
    
    const { summary } = this.state.contractSummary;
    
    // 활성 계약 카드
    this.summaryContainers.activeContracts.innerHTML = '';
    this.summaryContainers.activeContracts.appendChild(
      createContractSummary({
        title: '활성 계약',
        count: summary.active.count,
        amount: summary.active.amount,
        icon: 'fa-file-contract',
        color: 'primary'
      })
    );
    
    // 대기 중 계약 카드
    this.summaryContainers.pendingContracts.innerHTML = '';
    this.summaryContainers.pendingContracts.appendChild(
      createContractSummary({
        title: '대기 중 계약',
        count: summary.pending.count,
        amount: summary.pending.amount,
        icon: 'fa-clock',
        color: 'warning'
      })
    );
    
    // 만료된 계약 카드
    this.summaryContainers.expiredContracts.innerHTML = '';
    this.summaryContainers.expiredContracts.appendChild(
      createContractSummary({
        title: '만료된 계약',
        count: summary.expired.count,
        amount: summary.expired.amount,
        icon: 'fa-calendar-times',
        color: 'danger'
      })
    );
    
    // 총 계약 금액 카드
    this.summaryContainers.totalAmount.innerHTML = '';
    this.summaryContainers.totalAmount.appendChild(
      createContractSummary({
        title: '총 계약 금액',
        value: summary.total.amount.toLocaleString() + '만원',
        subValue: `총 ${summary.total.count}건`,
        icon: 'fa-coins',
        color: 'success'
      })
    );
  }

  /**
   * 계약 뷰 렌더링
   */
  renderContractsView() {
    this.viewContainer.innerHTML = '';
    
    if (this.state.view === 'list') {
      // 계약 목록 표시
      if (this.state.contracts && this.state.contracts.length > 0) {
        this.viewContainer.appendChild(
          createContractList(this.state.contracts, {
            onRowClick: this.handleContractClick.bind(this),
            sortBy: this.state.sortBy,
            sortOrder: this.state.sortOrder,
            onSortChange: this.handleSortChange.bind(this)
          })
        );
      } else {
        this.viewContainer.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-file-contract"></i>
            <p>계약 데이터가 없습니다.</p>
          </div>
        `;
      }
    } else if (this.state.view === 'details' && this.state.selectedContract) {
      // 계약 상세 정보 표시
      const detailsContainer = document.createElement('div');
      detailsContainer.className = 'contract-details-container';
      
      // 뒤로 가기 버튼
      const backButton = document.createElement('button');
      backButton.className = 'btn btn-outline btn-sm back-button';
      backButton.innerHTML = '<i class="fas fa-arrow-left"></i> 목록으로 돌아가기';
      this.addEventListener(backButton, 'click', () => {
        this.setState({ view: 'list', selectedContract: null });
        this.renderContractsView();
      });
      
      detailsContainer.appendChild(backButton);
      
      // 계약 상세 정보
      const detailsContent = document.createElement('div');
      detailsContent.className = 'contract-details-content';
      
      // 계약 기본 정보
      const contractDetails = createContractDetails(this.state.selectedContract);
      detailsContent.appendChild(contractDetails);
      
      // 계약 문서 관리
      const contractDocuments = createContractDocuments(this.state.selectedContract.documents || []);
      detailsContent.appendChild(contractDocuments);
      
      detailsContainer.appendChild(detailsContent);
      this.viewContainer.appendChild(detailsContainer);
    }
  }

  /**
   * 상태 필터 변경 처리
   * @param {Event} event - 변경 이벤트
   */
  handleStatusChange(event) {
    this.setState({ filterStatus: event.target.value });
    this.loadContractsData();
  }

  /**
   * 기간 필터 변경 처리
   * @param {Event} event - 변경 이벤트
   */
  handlePeriodChange(event) {
    this.setState({ filterPeriod: event.target.value });
    this.loadContractsData();
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
      this.loadContractsData();
    }, 300);
  }

  /**
   * 정렬 변경 처리
   * @param {string} sortBy - 정렬 기준
   * @param {string} sortOrder - 정렬 순서
   */
  handleSortChange(sortBy, sortOrder) {
    this.setState({ sortBy, sortOrder });
    this.loadContractsData();
  }

  /**
   * 계약 클릭 처리
   * @param {Object} contract - 클릭된 계약 데이터
   */
  handleContractClick(contract) {
    this.setState({ 
      selectedContract: contract,
      view: 'details'
    });
    
    this.renderContractsView();
  }

  /**
   * 계약 추가 처리
   */
  handleAddContract() {
    // 계약 추가 모달 표시
    this.showAddContractModal();
  }

  /**
   * 계약 추가 모달 표시
   */
  showAddContractModal() {
    // 모달 콘텐츠 생성 (폼)
    const content = this.createContractForm();
    
    // 모달 생성
    const modal = this.createModal({
      title: '계약 추가',
      content: content,
      confirmText: '저장',
      cancelText: '취소',
      onConfirm: () => {
        // 폼 데이터 수집 및 저장
        const formData = this.collectFormData(content);
        this.saveContract(formData);
      }
    });
  }

  /**
   * 계약 폼 생성
   * @param {Object} [contract] - 기존 계약 데이터 (편집 시)
   * @returns {HTMLElement} 폼 요소
   */
  createContractForm(contract = null) {
    const form = document.createElement('form');
    form.className = 'contract-form';
    
    // 현재 날짜 (YYYY-MM-DD 형식)
    const today = new Date().toISOString().split('T')[0];
    
    form.innerHTML = `
      <div class="form-group">
        <label for="name" class="form-label">계약명 *</label>
        <input type="text" id="name" name="name" class="form-control" required
          value="${contract ? contract.name : ''}">
      </div>
      
      <div class="form-group">
        <label for="client" class="form-label">고객사 *</label>
        <input type="text" id="client" name="client" class="form-control" required
          value="${contract ? contract.client : ''}">
      </div>
      
      <div class="form-group">
        <label for="contactPerson" class="form-label">담당자</label>
        <input type="text" id="contactPerson" name="contactPerson" class="form-control"
          value="${contract ? contract.contactPerson : ''}">
      </div>
      
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label for="amount" class="form-label">계약 금액 (만원) *</label>
            <input type="number" id="amount" name="amount" class="form-control" required min="0"
              value="${contract ? contract.amount : ''}">
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <label for="type" class="form-label">계약 유형 *</label>
            <select id="type" name="type" class="form-control" required>
              <option value="service" ${contract && contract.type === 'service' ? 'selected' : ''}>서비스 계약</option>
              <option value="product" ${contract && contract.type === 'product' ? 'selected' : ''}>제품 계약</option>
              <option value="maintenance" ${contract && contract.type === 'maintenance' ? 'selected' : ''}>유지보수 계약</option>
              <option value="project" ${contract && contract.type === 'project' ? 'selected' : ''}>프로젝트 계약</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label for="startDate" class="form-label">시작일 *</label>
            <input type="date" id="startDate" name="startDate" class="form-control" required
              value="${contract ? contract.startDate : today}">
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <label for="endDate" class="form-label">종료일 *</label>
            <input type="date" id="endDate" name="endDate" class="form-control" required
              value="${contract ? contract.endDate : ''}">
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="status" class="form-label">상태 *</label>
        <select id="status" name="status" class="form-control" required>
          <option value="pending" ${!contract || contract.status === 'pending' ? 'selected' : ''}>대기 중</option>
          <option value="active" ${contract && contract.status === 'active' ? 'selected' : ''}>진행 중</option>
          <option value="expired" ${contract && contract.status === 'expired' ? 'selected' : ''}>만료됨</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="description" class="form-label">설명</label>
        <textarea id="description" name="description" class="form-control" rows="3">${contract ? contract.description || '' : ''}</textarea>
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
      client: form.querySelector('#client').value,
      contactPerson: form.querySelector('#contactPerson').value,
      amount: parseInt(form.querySelector('#amount').value, 10),
      type: form.querySelector('#type').value,
      startDate: form.querySelector('#startDate').value,
      endDate: form.querySelector('#endDate').value,
      status: form.querySelector('#status').value,
      description: form.querySelector('#description').value
    };
  }

  /**
   * 계약 저장
   * @param {Object} data - 저장할 데이터
   * @param {boolean} [isEdit=false] - 편집 모드 여부
   */
  async saveContract(data, isEdit = false) {
    try {
      if (isEdit) {
        await this.contractsService.updateContract(data);
        this.showNotification('계약이 수정되었습니다.', 'success');
      } else {
        await this.contractsService.createContract(data);
        this.showNotification('계약이 추가되었습니다.', 'success');
      }
      
      // 데이터 다시 로드
      this.loadContractsData();
    } catch (error) {
      console.error('계약 저장 중 오류 발생:', error);
      this.showNotification('계약 저장 중 오류가 발생했습니다.', 'danger');
    }
  }

  /**
   * 상태 업데이트 후 UI 갱신
   */
  update() {
    if (!this.state.isLoading) {
      this.renderSummaryCards();
      this.renderContractsView();
    }
  }
}
