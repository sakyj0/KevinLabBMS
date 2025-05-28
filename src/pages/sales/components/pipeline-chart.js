/**
 * 영업 파이프라인 차트 컴포넌트
 * 
 * 영업 파이프라인 현황을 막대 그래프로 시각화합니다.
 * Chart.js 라이브러리를 사용합니다.
 */

/**
 * 영업 파이프라인 차트 생성 함수
 * @param {Object} data - 차트 데이터
 * @param {Array} data.labels - 라벨 배열 (영업 단계)
 * @param {Array} data.values - 값 배열 (금액)
 * @returns {HTMLElement} 차트 요소
 */
export function createPipelineChart(data) {
  const container = document.createElement('div');
  container.className = 'chart-wrapper';
  
  const canvas = document.createElement('canvas');
  canvas.id = 'pipeline-chart';
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
  // 그라데이션 배경 생성
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(52, 152, 219, 0.8)');
  gradient.addColorStop(1, 'rgba(52, 152, 219, 0.2)');
  
  // 차트 생성
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: '금액 (만원)',
        data: data.values,
        backgroundColor: gradient,
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
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
          beginAtZero: true,
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
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.raw.toLocaleString() + '만원';
            }
          }
        }
      }
    }
  });
}
