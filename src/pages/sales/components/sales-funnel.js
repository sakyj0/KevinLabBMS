/**
 * 영업 단계별 현황 퍼널 차트 컴포넌트
 * 
 * 영업 단계별 현황을 퍼널 차트로 시각화합니다.
 * Chart.js 라이브러리를 사용합니다.
 */

/**
 * 영업 퍼널 차트 생성 함수
 * @param {Object} data - 차트 데이터
 * @param {Array} data.labels - 라벨 배열 (영업 단계)
 * @param {Array} data.values - 값 배열 (건수)
 * @param {Array} data.amounts - 금액 배열 (만원)
 * @returns {HTMLElement} 차트 요소
 */
export function createSalesFunnel(data) {
  const container = document.createElement('div');
  container.className = 'chart-wrapper';
  
  // 퍼널 차트 생성
  const funnelContainer = document.createElement('div');
  funnelContainer.className = 'funnel-container';
  
  // 데이터 역순으로 정렬 (퍼널 형태로 표시하기 위해)
  const reversedLabels = [...data.labels].reverse();
  const reversedValues = [...data.values].reverse();
  const reversedAmounts = [...data.amounts].reverse();
  
  // 최대값 계산 (너비 비율 계산용)
  const maxValue = Math.max(...reversedValues);
  
  // 퍼널 아이템 생성
  reversedLabels.forEach((label, index) => {
    const value = reversedValues[index];
    const amount = reversedAmounts[index];
    const widthPercent = (value / maxValue) * 100;
    
    const funnelItem = document.createElement('div');
    funnelItem.className = 'funnel-item';
    
    funnelItem.innerHTML = `
      <div class="funnel-bar" style="width: ${widthPercent}%"></div>
      <div class="funnel-label">${label}</div>
      <div class="funnel-value">${value}건 (${amount.toLocaleString()}만원)</div>
    `;
    
    funnelContainer.appendChild(funnelItem);
  });
  
  container.appendChild(funnelContainer);
  
  // 퍼널 차트 스타일 추가
  const style = document.createElement('style');
  style.textContent = `
    .funnel-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
      height: 100%;
      justify-content: space-between;
    }
    
    .funnel-item {
      display: flex;
      align-items: center;
      position: relative;
      height: 40px;
    }
    
    .funnel-bar {
      height: 100%;
      background: linear-gradient(to right, rgba(52, 152, 219, 0.8), rgba(52, 152, 219, 0.4));
      border-radius: 4px;
      transition: width 0.5s ease;
    }
    
    .funnel-label {
      position: absolute;
      left: 10px;
      color: white;
      font-weight: 500;
      font-size: 12px;
      z-index: 1;
    }
    
    .funnel-value {
      position: absolute;
      right: 10px;
      color: var(--gray-700);
      font-size: 12px;
    }
  `;
  
  document.head.appendChild(style);
  
  return container;
}
