/**
 * 계약 상세 정보 컴포넌트
 * 
 * 선택된 계약의 상세 정보를 표시합니다.
 */

/**
 * 계약 상세 정보 생성 함수
 * @param {Object} contract - 계약 데이터
 * @returns {HTMLElement} 상세 정보 요소
 */
export function createContractDetails(contract) {
  const container = document.createElement('div');
  container.className = 'contract-details-card';
  
  // 계약 유형 텍스트 변환
  const typeText = getContractTypeText(contract.type);
  
  // 상태 텍스트 및 클래스 변환
  const statusText = getStatusText(contract.status);
  const statusClass = `status-${contract.status}`;
  
  // 계약 기간 계산
  const durationText = calculateDuration(contract.startDate, contract.endDate);
  
  // 상세 정보 HTML 생성
  container.innerHTML = `
    <div class="contract-details-header">
      <h2 class="contract-details-title">${contract.name}</h2>
      <span class="contract-details-status ${statusClass}">${statusText}</span>
    </div>
    <div class="contract-details-body">
      <div class="contract-info-grid">
        <div class="contract-info-item">
          <span class="contract-info-label">고객사</span>
          <span class="contract-info-value">${contract.client}</span>
        </div>
        <div class="contract-info-item">
          <span class="contract-info-label">담당자</span>
          <span class="contract-info-value">${contract.contactPerson || '-'}</span>
        </div>
        <div class="contract-info-item">
          <span class="contract-info-label">계약 유형</span>
          <span class="contract-info-value">${typeText}</span>
        </div>
        <div class="contract-info-item">
          <span class="contract-info-label">계약 금액</span>
          <span class="contract-info-value">${contract.amount.toLocaleString()}만원</span>
        </div>
        <div class="contract-info-item">
          <span class="contract-info-label">시작일</span>
          <span class="contract-info-value">${formatDate(contract.startDate)}</span>
        </div>
        <div class="contract-info-item">
          <span class="contract-info-label">종료일</span>
          <span class="contract-info-value">${formatDate(contract.endDate)}</span>
        </div>
        <div class="contract-info-item">
          <span class="contract-info-label">계약 기간</span>
          <span class="contract-info-value">${durationText}</span>
        </div>
        <div class="contract-info-item">
          <span class="contract-info-label">생성일</span>
          <span class="contract-info-value">${formatDateTime(contract.createdAt)}</span>
        </div>
      </div>
      
      <div class="contract-description">
        <h4 class="contract-description-label">계약 설명</h4>
        <p>${contract.description || '계약 설명이 없습니다.'}</p>
      </div>
      
      <div class="contract-actions">
        <button class="btn btn-outline btn-sm edit-contract-button">
          <i class="fas fa-edit"></i> 편집
        </button>
        <button class="btn btn-outline btn-sm delete-contract-button">
          <i class="fas fa-trash"></i> 삭제
        </button>
        <button class="btn btn-primary btn-sm print-contract-button">
          <i class="fas fa-print"></i> 인쇄
        </button>
      </div>
    </div>
  `;
  
  // 버튼 이벤트 리스너 등록
  const editButton = container.querySelector('.edit-contract-button');
  const deleteButton = container.querySelector('.delete-contract-button');
  const printButton = container.querySelector('.print-contract-button');
  
  editButton.addEventListener('click', (event) => {
    event.stopPropagation();
    // 편집 이벤트 발생 (상위 컴포넌트에서 처리)
    const customEvent = new CustomEvent('edit-contract', { detail: contract });
    container.dispatchEvent(customEvent);
  });
  
  deleteButton.addEventListener('click', (event) => {
    event.stopPropagation();
    // 삭제 이벤트 발생 (상위 컴포넌트에서 처리)
    const customEvent = new CustomEvent('delete-contract', { detail: contract });
    container.dispatchEvent(customEvent);
  });
  
  printButton.addEventListener('click', (event) => {
    event.stopPropagation();
    // 인쇄 기능 구현
    printContract(contract);
  });
  
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

/**
 * 날짜 및 시간 포맷 변환
 * @param {string} dateTimeString - ISO 형식의 날짜 및 시간 문자열
 * @returns {string} 포맷팅된 날짜 및 시간 (YYYY.MM.DD HH:MM)
 */
function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '-';
  
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return dateTimeString;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

/**
 * 계약 기간 계산
 * @param {string} startDate - 시작일 (YYYY-MM-DD)
 * @param {string} endDate - 종료일 (YYYY-MM-DD)
 * @returns {string} 계약 기간 텍스트
 */
function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) return '-';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-';
  
  // 날짜 차이 계산 (밀리초)
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // 개월 수 계산
  const months = Math.floor(diffDays / 30);
  const remainingDays = diffDays % 30;
  
  if (months > 0 && remainingDays > 0) {
    return `${months}개월 ${remainingDays}일`;
  } else if (months > 0) {
    return `${months}개월`;
  } else {
    return `${diffDays}일`;
  }
}

/**
 * 계약 인쇄 기능
 * @param {Object} contract - 계약 데이터
 */
function printContract(contract) {
  // 인쇄용 창 생성
  const printWindow = window.open('', '_blank');
  
  // 인쇄용 HTML 생성
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${contract.name} - 계약 정보</title>
      <style>
        body {
          font-family: 'Noto Sans KR', sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 20px;
        }
        .print-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #333;
        }
        .print-title {
          font-size: 24px;
          font-weight: bold;
        }
        .print-subtitle {
          font-size: 16px;
          color: #666;
        }
        .print-section {
          margin-bottom: 30px;
        }
        .print-section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #ddd;
        }
        .print-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .print-info-item {
          display: flex;
          flex-direction: column;
        }
        .print-info-label {
          font-size: 14px;
          color: #666;
        }
        .print-info-value {
          font-weight: bold;
        }
        .print-description {
          margin-top: 20px;
        }
        .print-footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #999;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1 class="print-title">${contract.name}</h1>
        <p class="print-subtitle">계약 정보</p>
      </div>
      
      <div class="print-section">
        <h2 class="print-section-title">기본 정보</h2>
        <div class="print-info-grid">
          <div class="print-info-item">
            <span class="print-info-label">고객사</span>
            <span class="print-info-value">${contract.client}</span>
          </div>
          <div class="print-info-item">
            <span class="print-info-label">담당자</span>
            <span class="print-info-value">${contract.contactPerson || '-'}</span>
          </div>
          <div class="print-info-item">
            <span class="print-info-label">계약 유형</span>
            <span class="print-info-value">${getContractTypeText(contract.type)}</span>
          </div>
          <div class="print-info-item">
            <span class="print-info-label">계약 상태</span>
            <span class="print-info-value">${getStatusText(contract.status)}</span>
          </div>
        </div>
      </div>
      
      <div class="print-section">
        <h2 class="print-section-title">계약 조건</h2>
        <div class="print-info-grid">
          <div class="print-info-item">
            <span class="print-info-label">계약 금액</span>
            <span class="print-info-value">${contract.amount.toLocaleString()}만원</span>
          </div>
          <div class="print-info-item">
            <span class="print-info-label">계약 기간</span>
            <span class="print-info-value">${calculateDuration(contract.startDate, contract.endDate)}</span>
          </div>
          <div class="print-info-item">
            <span class="print-info-label">시작일</span>
            <span class="print-info-value">${formatDate(contract.startDate)}</span>
          </div>
          <div class="print-info-item">
            <span class="print-info-label">종료일</span>
            <span class="print-info-value">${formatDate(contract.endDate)}</span>
          </div>
        </div>
        
        <div class="print-description">
          <h3 class="print-section-title">계약 설명</h3>
          <p>${contract.description || '계약 설명이 없습니다.'}</p>
        </div>
      </div>
      
      <div class="print-footer">
        <p>출력일: ${new Date().toLocaleDateString()}</p>
        <p>케빈랩 사업관리 시스템</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;
  
  // 인쇄용 창에 내용 쓰기
  printWindow.document.write(printContent);
  printWindow.document.close();
}
