/**
 * 계약 문서 관리 컴포넌트
 * 
 * 계약과 관련된 문서 목록을 표시하고 관리하는 기능을 제공합니다.
 */

/**
 * 계약 문서 관리 컴포넌트 생성 함수
 * @param {Array} documents - 문서 데이터 배열
 * @returns {HTMLElement} 문서 관리 요소
 */
export function createContractDocuments(documents) {
  const container = document.createElement('div');
  container.className = 'contract-documents-card';
  
  // 문서 관리 HTML 생성
  container.innerHTML = `
    <div class="contract-documents-header">
      <h3 class="contract-documents-title">계약 문서</h3>
    </div>
    <div class="contract-documents-body">
      ${documents && documents.length > 0 ? createDocumentsList(documents) : createEmptyState()}
      <button class="btn btn-outline btn-sm upload-document-button">
        <i class="fas fa-upload"></i> 문서 업로드
      </button>
    </div>
  `;
  
  // 업로드 버튼 이벤트 리스너 등록
  const uploadButton = container.querySelector('.upload-document-button');
  uploadButton.addEventListener('click', (event) => {
    event.stopPropagation();
    // 업로드 이벤트 발생 (상위 컴포넌트에서 처리)
    const customEvent = new CustomEvent('upload-document');
    container.dispatchEvent(customEvent);
  });
  
  // 문서 액션 버튼 이벤트 리스너 등록
  const viewButtons = container.querySelectorAll('.view-document-button');
  const downloadButtons = container.querySelectorAll('.download-document-button');
  const deleteButtons = container.querySelectorAll('.delete-document-button');
  
  viewButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const documentId = button.closest('.document-item').dataset.id;
      const document = documents.find(doc => doc.id === documentId);
      if (document) {
        viewDocument(document);
      }
    });
  });
  
  downloadButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const documentId = button.closest('.document-item').dataset.id;
      const document = documents.find(doc => doc.id === documentId);
      if (document) {
        downloadDocument(document);
      }
    });
  });
  
  deleteButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const documentId = button.closest('.document-item').dataset.id;
      const document = documents.find(doc => doc.id === documentId);
      if (document) {
        // 삭제 이벤트 발생 (상위 컴포넌트에서 처리)
        const customEvent = new CustomEvent('delete-document', { detail: document });
        container.dispatchEvent(customEvent);
      }
    });
  });
  
  return container;
}

/**
 * 문서 목록 HTML 생성
 * @param {Array} documents - 문서 데이터 배열
 * @returns {string} 문서 목록 HTML
 */
function createDocumentsList(documents) {
  return `
    <ul class="documents-list">
      ${documents.map(document => `
        <li class="document-item" data-id="${document.id}">
          <i class="document-icon fas ${getDocumentIcon(document.type)}"></i>
          <div class="document-info">
            <h4 class="document-name">${document.name}</h4>
            <div class="document-meta">
              <span>${formatFileSize(document.size)}</span>
              <span>•</span>
              <span>${formatDateTime(document.uploadedAt)}</span>
            </div>
          </div>
          <div class="document-actions">
            <button class="document-action-button view-document-button" title="보기">
              <i class="fas fa-eye"></i>
            </button>
            <button class="document-action-button download-document-button" title="다운로드">
              <i class="fas fa-download"></i>
            </button>
            <button class="document-action-button delete-document-button" title="삭제">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </li>
      `).join('')}
    </ul>
  `;
}

/**
 * 빈 상태 HTML 생성
 * @returns {string} 빈 상태 HTML
 */
function createEmptyState() {
  return `
    <div class="empty-state">
      <i class="fas fa-file-alt"></i>
      <p>등록된 문서가 없습니다.</p>
    </div>
  `;
}

/**
 * 문서 유형에 따른 아이콘 클래스 반환
 * @param {string} type - 문서 유형
 * @returns {string} Font Awesome 아이콘 클래스
 */
function getDocumentIcon(type) {
  const iconMap = {
    'pdf': 'fa-file-pdf',
    'doc': 'fa-file-word',
    'docx': 'fa-file-word',
    'xls': 'fa-file-excel',
    'xlsx': 'fa-file-excel',
    'ppt': 'fa-file-powerpoint',
    'pptx': 'fa-file-powerpoint',
    'txt': 'fa-file-alt',
    'jpg': 'fa-file-image',
    'jpeg': 'fa-file-image',
    'png': 'fa-file-image',
    'zip': 'fa-file-archive',
    'rar': 'fa-file-archive'
  };
  
  return iconMap[type] || 'fa-file';
}

/**
 * 파일 크기 포맷 변환
 * @param {number} bytes - 파일 크기 (바이트)
 * @returns {string} 포맷팅된 파일 크기
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 날짜 및 시간 포맷 변환
 * @param {string} dateTimeString - ISO 형식의 날짜 및 시간 문자열
 * @returns {string} 포맷팅된 날짜 및 시간 (YYYY.MM.DD)
 */
function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '-';
  
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return dateTimeString;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}.${month}.${day}`;
}

/**
 * 문서 보기 기능
 * @param {Object} document - 문서 데이터
 */
function viewDocument(document) {
  // 실제 구현에서는 문서 미리보기 또는 뷰어 열기
  // 현재는 알림만 표시
  alert(`"${document.name}" 문서를 볼 수 있는 기능은 아직 구현되지 않았습니다.`);
}

/**
 * 문서 다운로드 기능
 * @param {Object} document - 문서 데이터
 */
function downloadDocument(document) {
  // 실제 구현에서는 문서 다운로드 처리
  // 현재는 알림만 표시
  alert(`"${document.name}" 문서 다운로드 기능은 아직 구현되지 않았습니다.`);
}
