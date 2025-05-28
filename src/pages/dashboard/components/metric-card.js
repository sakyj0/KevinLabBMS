/**
 * 지표 카드 컴포넌트
 * 
 * 대시보드에 표시되는 주요 지표 카드를 생성합니다.
 */

/**
 * 지표 카드 생성 함수
 * @param {Object} config - 카드 설정
 * @param {string} config.title - 카드 제목
 * @param {string} config.value - 주요 값
 * @param {string} [config.subValue] - 보조 값
 * @param {number} [config.change] - 변화율 (%)
 * @param {string} config.icon - Font Awesome 아이콘 클래스 (fa- 제외)
 * @param {string} config.color - 카드 색상 (primary, success, warning, info, danger)
 * @param {number} [config.progress] - 진행률 (0-100)
 * @returns {HTMLElement} 지표 카드 요소
 */
export function createMetricCard(config) {
  const card = document.createElement('div');
  card.className = `card metric-card metric-${config.color}`;
  
  // 변화율 표시 HTML
  let changeHtml = '';
  if (config.change !== undefined) {
    const changeClass = config.change >= 0 ? 'positive' : 'negative';
    const changeIcon = config.change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
    changeHtml = `
      <div class="metric-change ${changeClass}">
        <i class="fas ${changeIcon}"></i>
        <span>${Math.abs(config.change)}%</span>
      </div>
    `;
  }
  
  // 진행률 표시 HTML
  let progressHtml = '';
  if (config.progress !== undefined) {
    progressHtml = `
      <div class="metric-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${config.progress}%"></div>
        </div>
        <div class="progress-text">${config.progress}%</div>
      </div>
    `;
  }
  
  // 보조 값 HTML
  let subValueHtml = '';
  if (config.subValue) {
    subValueHtml = `<div class="metric-subvalue">${config.subValue}</div>`;
  }
  
  card.innerHTML = `
    <div class="card-body">
      <div class="metric-icon">
        <i class="fas ${config.icon}"></i>
      </div>
      <div class="metric-content">
        <div class="metric-title">${config.title}</div>
        <div class="metric-value">${config.value}</div>
        ${subValueHtml}
        ${changeHtml}
      </div>
    </div>
    ${progressHtml}
  `;
  
  return card;
}
