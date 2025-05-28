/**
 * 예상 매출 Break-Down 차트 컴포넌트
 * 
 * 대시보드에 표시되는 예상 매출 Break-Down 막대 그래프를 생성합니다.
 * Chart.js 라이브러리를 사용합니다.
 */

/**
 * 예상 매출 Break-Down 차트 생성 함수
 * @param {Object} data - 차트 데이터
 * @param {Array} data.labels - 라벨 배열 (월 또는 분기)
 * @param {Array} data.confirmed - 확정 매출 배열
 * @param {Array} data.expected - 예상 매출 배열
 * @returns {HTMLElement} 차트 요소
 */
export function createBreakdownChart(data) {
  const container = document.createElement('div');
  container.className = 'chart-wrapper';
  
  const canvas = document.createElement('canvas');
  canvas.id = 'breakdown-chart';
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
  // 차트 생성
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: '확정 매출',
          data: data.confirmed,
          backgroundColor: 'rgba(46, 204, 113, 0.8)',
          borderColor: 'rgba(46, 204, 113, 1)',
          borderWidth: 1
        },
        {
          label: '예상 매출',
          data: data.expected,
          backgroundColor: 'rgba(52, 152, 219, 0.8)',
          borderColor: 'rgba(52, 152, 219, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: false,
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: "'Noto Sans KR', sans-serif",
              size: 12
            }
          }
        },
        y: {
          stacked: false,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            font: {
              family: "'Noto Sans KR', sans-serif",
              size: 12
            },
            callback: function(value) {
              return value.toLocaleString() + '만원';
            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
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
              const label = context.dataset.label || '';
              const value = context.raw;
              return `${label}: ${value.toLocaleString()}만원`;
            }
          }
        }
      }
    }
  });
}
