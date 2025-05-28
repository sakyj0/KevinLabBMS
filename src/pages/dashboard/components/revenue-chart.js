/**
 * 매출 현황 차트 컴포넌트
 * 
 * 대시보드에 표시되는 매출 현황 파이 차트를 생성합니다.
 * Chart.js 라이브러리를 사용합니다.
 */

/**
 * 매출 현황 차트 생성 함수
 * @param {Object} data - 차트 데이터
 * @param {Array} data.labels - 라벨 배열
 * @param {Array} data.values - 값 배열
 * @returns {HTMLElement} 차트 요소
 */
export function createRevenueChart(data) {
  const container = document.createElement('div');
  container.className = 'chart-wrapper';
  
  const canvas = document.createElement('canvas');
  canvas.id = 'revenue-chart';
  container.appendChild(canvas);
  
  // Chart.js 스크립트가 로드된 후 차트 생성
  setTimeout(() => {
    if (typeof Chart !== 'undefined') {
      renderChart(canvas, data);
    } else {
      // Chart.js가 로드되지 않은 경우 동적으로 로드
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => renderChart(canvas, data);
      document.head.appendChild(script);
    }
  }, 0);
  
  return container;
}

/**
 * 차트 렌더링 함수
 * @param {HTMLCanvasElement} canvas - 캔버스 요소
 * @param {Object} data - 차트 데이터
 */
function renderChart(canvas, data) {
  // 색상 설정
  const colors = [
    'rgba(52, 152, 219, 0.8)',  // 파랑
    'rgba(46, 204, 113, 0.8)',  // 초록
    'rgba(155, 89, 182, 0.8)',  // 보라
    'rgba(241, 196, 15, 0.8)',  // 노랑
    'rgba(230, 126, 34, 0.8)'   // 주황
  ];
  
  // 차트 생성
  new Chart(canvas, {
    type: 'pie',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        backgroundColor: colors.slice(0, data.values.length),
        borderColor: colors.map(color => color.replace('0.8', '1')),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: {
              family: "'Noto Sans KR', sans-serif",
              size: 12
            },
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value.toLocaleString()}만원 (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}
