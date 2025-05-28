/**
 * 영업 활동 타임라인 컴포넌트
 * 
 * 최근 영업 활동을 타임라인 형태로 표시합니다.
 */

/**
 * 영업 활동 타임라인 생성 함수
 * @param {Array} data - 영업 활동 데이터 배열
 * @returns {HTMLElement} 타임라인 요소
 */
export function createActivitiesTimeline(data) {
  const container = document.createElement('div');
  container.className = 'timeline-wrapper';
  
  // 데이터가 없는 경우
  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-calendar-check"></i>
        <p>최근 영업 활동이 없습니다.</p>
      </div>
    `;
    return container;
  }
  
  // 타임라인 생성
  const timeline = document.createElement('div');
  timeline.className = 'timeline';
  
  data.forEach(activity => {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    
    // 활동 유형에 따른 아이콘 설정
    const iconClass = getActivityIcon(activity.type);
    
    timelineItem.innerHTML = `
      <div class="timeline-icon">
        <i class="${iconClass}"></i>
      </div>
      <div class="timeline-content">
        <div class="timeline-header">
          <h4 class="timeline-title">${activity.title}</h4>
          <span class="timeline-date">${formatDate(activity.date)}</span>
        </div>
        <div class="timeline-body">
          <p>${activity.description}</p>
          ${activity.opportunity ? `<p><strong>영업 기회:</strong> ${activity.opportunity}</p>` : ''}
          ${activity.contact ? `<p><strong>담당자:</strong> ${activity.contact}</p>` : ''}
        </div>
      </div>
    `;
    
    timeline.appendChild(timelineItem);
  });
  
  container.appendChild(timeline);
  
  return container;
}

/**
 * 활동 유형에 따른 아이콘 클래스 반환
 * @param {string} type - 활동 유형
 * @returns {string} Font Awesome 아이콘 클래스
 */
function getActivityIcon(type) {
  const iconMap = {
    'meeting': 'fas fa-handshake',
    'call': 'fas fa-phone',
    'email': 'fas fa-envelope',
    'proposal': 'fas fa-file-contract',
    'demo': 'fas fa-laptop',
    'follow-up': 'fas fa-reply',
    'negotiation': 'fas fa-comments-dollar',
    'contract': 'fas fa-file-signature'
  };
  
  return iconMap[type] || 'fas fa-calendar-check';
}

/**
 * 날짜 및 시간 포맷 변환
 * @param {string} dateTimeString - ISO 형식의 날짜 및 시간 문자열
 * @returns {string} 포맷팅된 날짜 및 시간 (YYYY.MM.DD HH:MM)
 */
function formatDate(dateTimeString) {
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
