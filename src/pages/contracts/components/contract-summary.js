/**
 * 계약 요약 카드 컴포넌트
 * 
 * 계약 상태 요약 정보를 카드 형태로 표시합니다.
 */

/**
 * 계약 요약 카드 생성 함수
 * @param {Object} data - 요약 데이터
 * @param {string} data.title - 카드 제목
 * @param {number} [data.count] - 계약 건수
 * @param {number} [data.amount] - 계약 금액
 * @param {string} [data.value] - 직접 지정할 값 (count와 amount 대신 사용)
 * @param {string} [data.subValue] - 부가 정보
 * @param {string} data.icon - 아이콘 클래스 (Font Awesome)
 * @param {string} data.color - 색상 (primary, secondary, success, warning, danger)
 * @returns {HTMLElement} 카드 요소
 */
export function createContractSummary(data) {
  const container = document.createElement('div');
  container.className = 'summary-card-wrapper';
  
  // 색상 클래스 결정
  const colorClass = `bg-${data.color}-light text-${data.color}`;
  const iconColorClass = `bg-${data.color} text-white`;
  
  // 표시할 값 결정
  let displayValue = '';
  let displaySubValue = '';
  
  if (data.value) {
    // 직접 값이 제공된 경우
    displayValue = data.value;
  } else if (data.count !== undefined && data.amount !== undefined) {
    // 건수와 금액이 제공된 경우
    displayValue = data.count + '건';
    displaySubValue = data.amount.toLocaleString() + '만원';
  }
  
  if (data.subValue) {
    displaySubValue = data.subValue;
  }
  
  // 카드 HTML 생성
  container.innerHTML = `
    <div class="summary-card ${colorClass}">
      <div class="summary-card-header">
        <h3 class="summary-card-title">${data.title}</h3>
        <div class="summary-card-icon ${iconColorClass}">
          <i class="fas ${data.icon}"></i>
        </div>
      </div>
      <div class="summary-card-body">
        <p class="summary-card-value">${displayValue}</p>
        ${displaySubValue ? `<p class="summary-card-sub-value">${displaySubValue}</p>` : ''}
      </div>
    </div>
  `;
  
  return container;
}
