/**
 * 계약 목록 컴포넌트
 * 
 * 계약 목록을 테이블 형태로 표시합니다.
 */

/**
 * 계약 목록 테이블 생성 함수
 * @param {Array} contracts - 계약 데이터 배열
 * @param {Object} options - 테이블 옵션
 * @param {Function} options.onRowClick - 행 클릭 이벤트 핸들러
 * @param {string} options.sortBy - 정렬 기준
 * @param {string} options.sortOrder - 정렬 순서
 * @param {Function} options.onSortChange - 정렬 변경 이벤트 핸들러
 * @returns {HTMLElement} 테이블 요소
 */
export function createContractList(contracts, options = {}) {
  const container = document.createElement('div');
  container.className = 'contracts-table-wrapper';
  
  // 데이터가 없는 경우
  if (!contracts || contracts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-file-contract"></i>
        <p>계약 데이터가 없습니다.</p>
      </div>
    `;
    return container;
  }
  
  // 테이블 생성
  const table = document.createElement('table');
  table.className = 'contracts-table';
  
  // 테이블 헤더
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  // 헤더 컬럼 정의
  const columns = [
    { id: 'name', label: '계약명', sortable: true },
    { id: 'client', label: '고객사', sortable: true },
    { id: 'type', label: '유형', sortable: false },
    { id: 'startDate', label: '시작일', sortable: true },
    { id: 'endDate', label: '종료일', sortable: true },
    { id: 'amount', label: '금액', sortable: true },
    { id: 'status', label: '상태', sortable: false }
  ];
  
  // 헤더 생성
  columns.forEach(column => {
    const th = document.createElement('th');
    
    if (column.sortable) {
      th.className = `sortable ${options.sortBy === column.id ? 'sorted' : ''}`;
      
      th.innerHTML = `
        ${column.label}
        <span class="sort-icon">
          <i class="fas fa-${options.sortBy === column.id 
            ? (options.sortOrder === 'asc' ? 'sort-up' : 'sort-down') 
            : 'sort'}"></i>
        </span>
      `;
      
      // 정렬 클릭 이벤트
      th.addEventListener('click', () => {
        if (options.onSortChange) {
          const newOrder = options.sortBy === column.id && options.sortOrder === 'asc' ? 'desc' : 'asc';
          options.onSortChange(column.id, newOrder);
        }
      });
    } else {
      th.textContent = column.label;
    }
    
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // 테이블 바디
  const tbody = document.createElement('tbody');
  
  contracts.forEach(contract => {
    const tr = document.createElement('tr');
    tr.dataset.id = contract.id;
    
    // 계약 유형 텍스트 변환
    const typeText = getContractTypeText(contract.type);
    
    // 상태 텍스트 및 클래스 변환
    const statusText = getStatusText(contract.status);
    const statusClass = `status-${contract.status}`;
    
    tr.innerHTML = `
      <td>${contract.name}</td>
      <td>${contract.client}</td>
      <td>${typeText}</td>
      <td>${formatDate(contract.startDate)}</td>
      <td>${formatDate(contract.endDate)}</td>
      <td class="contract-amount">${contract.amount.toLocaleString()}만원</td>
      <td><span class="contract-status ${statusClass}">${statusText}</span></td>
    `;
    
    // 행 클릭 이벤트
    if (options.onRowClick) {
      tr.addEventListener('click', () => {
        options.onRowClick(contract);
      });
    }
    
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  container.appendChild(table);
  
  return container;
}

/**
 * 계약 유형 텍스트 변환
 * @param {string} type - 계약 유형 코드
 * @returns {string} 계약 유형 텍스트
 */
function getContractTypeText(type) {
  const typeMap = {
    'service': '서비스 계약',
    'product': '제품 계약',
    'maintenance': '유지보수 계약',
    'project': '프로젝트 계약'
  };
  
  return typeMap[type] || '기타';
}

/**
 * 상태 텍스트 변환
 * @param {string} status - 상태 코드
 * @returns {string} 상태 텍스트
 */
function getStatusText(status) {
  const statusMap = {
    'active': '진행 중',
    'pending': '대기 중',
    'expired': '만료됨'
  };
  
  return statusMap[status] || '알 수 없음';
}

/**
 * 날짜 포맷 변환
 * @param {string} dateString - YYYY-MM-DD 형식의 날짜 문자열
 * @returns {string} 포맷팅된 날짜 (YYYY.MM.DD)
 */
function formatDate(dateString) {
  if (!dateString) return '-';
  
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}
