/**
 * 영업 기회 테이블 컴포넌트
 * 
 * 영업 기회 목록을 테이블 형태로 표시합니다.
 */

/**
 * 영업 기회 테이블 생성 함수
 * @param {Array} data - 영업 기회 데이터 배열
 * @param {Object} options - 테이블 옵션
 * @param {Function} options.onRowClick - 행 클릭 이벤트 핸들러
 * @returns {HTMLElement} 테이블 요소
 */
export function createOpportunitiesTable(data, options = {}) {
  const container = document.createElement('div');
  container.className = 'opportunities-table-wrapper';
  
  // 데이터가 없는 경우
  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-file-invoice-dollar"></i>
        <p>영업 기회 데이터가 없습니다.</p>
      </div>
    `;
    return container;
  }
  
  // 테이블 생성
  const table = document.createElement('table');
  table.className = 'opportunities-table';
  
  // 테이블 헤더
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>영업 기회명</th>
      <th>고객사</th>
      <th>담당자</th>
      <th>단계</th>
      <th>예상 종료일</th>
      <th>확률</th>
      <th>금액</th>
      <th>상태</th>
    </tr>
  `;
  table.appendChild(thead);
  
  // 테이블 바디
  const tbody = document.createElement('tbody');
  
  data.forEach(opportunity => {
    const tr = document.createElement('tr');
    tr.dataset.id = opportunity.id;
    
    // 영업 단계 텍스트 변환
    const stageText = getStageText(opportunity.stage);
    
    // 상태 텍스트 및 클래스 변환
    const statusText = getStatusText(opportunity.status);
    const statusClass = `status-${opportunity.status}`;
    
    tr.innerHTML = `
      <td>${opportunity.name}</td>
      <td>${opportunity.company}</td>
      <td>${opportunity.contact || '-'}</td>
      <td>${stageText}</td>
      <td>${formatDate(opportunity.expectedCloseDate)}</td>
      <td class="opportunity-probability">${opportunity.probability}%</td>
      <td class="opportunity-amount">${opportunity.amount.toLocaleString()}만원</td>
      <td><span class="opportunity-status ${statusClass}">${statusText}</span></td>
    `;
    
    // 행 클릭 이벤트
    if (options.onRowClick) {
      tr.addEventListener('click', () => {
        options.onRowClick(opportunity);
      });
    }
    
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  container.appendChild(table);
  
  return container;
}

/**
 * 영업 단계 텍스트 변환
 * @param {string} stage - 영업 단계 코드
 * @returns {string} 영업 단계 텍스트
 */
function getStageText(stage) {
  const stageMap = {
    'initial': '초기 접촉',
    'qualification': '검증',
    'proposal': '제안',
    'negotiation': '협상',
    'closing': '종료'
  };
  
  return stageMap[stage] || '알 수 없음';
}

/**
 * 상태 텍스트 변환
 * @param {string} status - 상태 코드
 * @returns {string} 상태 텍스트
 */
function getStatusText(status) {
  const statusMap = {
    'active': '진행 중',
    'won': '성공',
    'lost': '실패'
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
