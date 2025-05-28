/**
 * 서비스 KPI 테이블 컴포넌트
 * 
 * 대시보드에 표시되는 서비스별 KPI 테이블을 생성합니다.
 */

/**
 * 서비스 KPI 테이블 생성 함수
 * @param {Array} data - KPI 데이터 배열
 * @param {string} serviceType - 서비스 유형 (hems, bems, rems, fems)
 * @returns {HTMLElement} 테이블 요소
 */
export function createServiceKpiTable(data, serviceType) {
  const container = document.createElement('div');
  container.className = 'service-kpi-table-wrapper';
  
  // 서비스 유형별 헤더 설정
  const headers = getServiceHeaders(serviceType);
  
  // 데이터가 없는 경우
  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-chart-bar"></i>
        <p>데이터가 없습니다.</p>
      </div>
    `;
    return container;
  }
  
  // 테이블 생성
  const table = document.createElement('table');
  table.className = 'table service-kpi-table';
  
  // 테이블 헤더
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>사업장</th>
      ${headers.map(header => `<th>${header.label}</th>`).join('')}
      <th>상태</th>
    </tr>
  `;
  table.appendChild(thead);
  
  // 테이블 바디
  const tbody = document.createElement('tbody');
  
  data.forEach(item => {
    const tr = document.createElement('tr');
    
    // 사업장 열
    tr.innerHTML = `<td class="business-name">${item.businessName}</td>`;
    
    // KPI 값 열
    headers.forEach(header => {
      const value = item.kpi[header.key];
      const formattedValue = formatKpiValue(value, header.unit);
      tr.innerHTML += `<td>${formattedValue}</td>`;
    });
    
    // 상태 열
    const statusClass = getStatusClass(item.status);
    tr.innerHTML += `
      <td>
        <span class="status-badge ${statusClass}">${item.status}</span>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  container.appendChild(table);
  
  return container;
}

/**
 * 서비스 유형별 헤더 정보 반환
 * @param {string} serviceType - 서비스 유형
 * @returns {Array} 헤더 정보 배열
 */
function getServiceHeaders(serviceType) {
  const headers = {
    hems: [
      { key: 'energySaved', label: '에너지 절감량', unit: 'kWh' },
      { key: 'area', label: '관리 면적', unit: 'm²' },
      { key: 'co2Reduced', label: 'CO2 감축량', unit: 'kg' }
    ],
    bems: [
      { key: 'energySaved', label: '에너지 절감량', unit: 'kWh' },
      { key: 'area', label: '관리 면적', unit: 'm²' },
      { key: 'co2Reduced', label: 'CO2 감축량', unit: 'kg' },
      { key: 'efficiency', label: '효율', unit: '%' }
    ],
    rems: [
      { key: 'energySaved', label: '에너지 절감량', unit: 'kWh' },
      { key: 'area', label: '관리 면적', unit: 'm²' },
      { key: 'co2Reduced', label: 'CO2 감축량', unit: 'kg' },
      { key: 'renewableRatio', label: '재생에너지 비율', unit: '%' }
    ],
    fems: [
      { key: 'energySaved', label: '에너지 절감량', unit: 'kWh' },
      { key: 'area', label: '관리 면적', unit: 'm²' },
      { key: 'co2Reduced', label: 'CO2 감축량', unit: 'kg' },
      { key: 'peakReduction', label: '피크 감축량', unit: 'kW' }
    ]
  };
  
  return headers[serviceType] || headers.hems;
}

/**
 * KPI 값 포맷팅
 * @param {number} value - KPI 값
 * @param {string} unit - 단위
 * @returns {string} 포맷팅된 값
 */
function formatKpiValue(value, unit) {
  if (value === undefined || value === null) {
    return '-';
  }
  
  // 천 단위 구분자 추가
  const formattedValue = value.toLocaleString();
  
  // 단위 추가
  return `${formattedValue} ${unit}`;
}

/**
 * 상태에 따른 CSS 클래스 반환
 * @param {string} status - 상태 문자열
 * @returns {string} CSS 클래스
 */
function getStatusClass(status) {
  switch (status) {
    case '정상':
      return 'status-normal';
    case '주의':
      return 'status-warning';
    case '위험':
      return 'status-danger';
    case '점검 중':
      return 'status-maintenance';
    default:
      return '';
  }
}
