/**
 * 기본 페이지 컴포넌트 클래스
 * 
 * 모든 페이지 컴포넌트의 부모 클래스로, 공통 기능을 제공합니다.
 * 페이지 생명주기 메서드와 기본 렌더링 로직을 포함합니다.
 */

import { createLayout } from './layout.js';

export class BasePage {
  /**
   * BasePage 클래스 생성자
   * @param {Object} config - 페이지 설정 객체
   * @param {App} config.app - 앱 인스턴스
   * @param {Router} config.router - 라우터 인스턴스
   */
  constructor(config) {
    this.app = config.app;
    this.router = config.router;
    this.element = null;
    this.state = {};
    this.eventListeners = [];
    this.requiresAuth = true; // 기본적으로 모든 페이지는 인증이 필요합니다 (로그인 페이지 제외)
  }

  /**
   * 페이지 렌더링 메서드 (자식 클래스에서 오버라이드)
   * @returns {Promise<HTMLElement>} 렌더링된 페이지 요소
   */
  async render() {
    // 기본 페이지 요소 생성
    this.element = document.createElement('div');
    this.element.className = 'page';
    
    // 자식 클래스에서 오버라이드할 내용
    this.element.innerHTML = '<p>페이지 내용이 정의되지 않았습니다.</p>';
    
    // 로그인 페이지가 아니고 인증된 상태인 경우 레이아웃 적용
    if (this.requiresAuth && this.app.isAuthenticated) {
      return this.applyLayout();
    }
    
    return this.element;
  }
  
  /**
   * 레이아웃 적용
   * @returns {HTMLElement} 레이아웃이 적용된 페이지 요소
   */
  applyLayout() {
    // 현재 라우트에서 페이지 ID 추출
    const route = this.router.getCurrentRoute();
    const pageId = route ? route.name.replace('-page', '') : '';
    
    // 레이아웃 생성 및 적용
    return createLayout({
      content: this.element,
      app: this.app,
      activePage: pageId
    });
  }

  /**
   * 페이지 마운트 후 호출되는 메서드 (자식 클래스에서 오버라이드)
   */
  mounted() {
    // 자식 클래스에서 오버라이드할 내용
  }

  /**
   * 페이지 언마운트 시 호출되는 메서드
   */
  unmount() {
    // 등록된 모든 이벤트 리스너 제거
    this.removeAllEventListeners();
    
    // 추가 정리 작업은 자식 클래스에서 오버라이드
  }

  /**
   * 이벤트 리스너 등록
   * @param {HTMLElement} element - 이벤트를 등록할 요소
   * @param {string} eventType - 이벤트 타입 (예: 'click')
   * @param {Function} callback - 이벤트 콜백 함수
   * @param {Object} options - 이벤트 리스너 옵션
   */
  addEventListener(element, eventType, callback, options = {}) {
    element.addEventListener(eventType, callback, options);
    
    // 이벤트 리스너 추적을 위해 저장
    this.eventListeners.push({
      element,
      eventType,
      callback,
      options
    });
  }

  /**
   * 이벤트 리스너 제거
   * @param {HTMLElement} element - 이벤트가 등록된 요소
   * @param {string} eventType - 이벤트 타입
   * @param {Function} callback - 이벤트 콜백 함수
   * @param {Object} options - 이벤트 리스너 옵션
   */
  removeEventListener(element, eventType, callback, options = {}) {
    element.removeEventListener(eventType, callback, options);
    
    // 추적 목록에서 제거
    this.eventListeners = this.eventListeners.filter(listener => 
      listener.element !== element || 
      listener.eventType !== eventType || 
      listener.callback !== callback
    );
  }

  /**
   * 모든 이벤트 리스너 제거
   */
  removeAllEventListeners() {
    this.eventListeners.forEach(({ element, eventType, callback, options }) => {
      element.removeEventListener(eventType, callback, options);
    });
    
    this.eventListeners = [];
  }

  /**
   * 상태 업데이트
   * @param {Object} newState - 새 상태 객체
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.update();
  }

  /**
   * 페이지 업데이트 (자식 클래스에서 오버라이드)
   */
  update() {
    // 자식 클래스에서 오버라이드할 내용
  }

  /**
   * 페이지 내 요소 찾기
   * @param {string} selector - CSS 선택자
   * @returns {HTMLElement|null} 찾은 요소 또는 null
   */
  $(selector) {
    return this.element.querySelector(selector);
  }

  /**
   * 페이지 내 모든 요소 찾기
   * @param {string} selector - CSS 선택자
   * @returns {NodeList} 찾은 요소 목록
   */
  $$(selector) {
    return this.element.querySelectorAll(selector);
  }

  /**
   * 페이지 제목 설정
   * @param {string} title - 페이지 제목
   */
  setTitle(title) {
    document.title = `${title} | 케빈랩 사업관리 시스템`;
  }

  /**
   * 알림 표시
   * @param {string} message - 알림 메시지
   * @param {string} type - 알림 타입 (success, warning, danger, info)
   * @param {number} duration - 알림 표시 시간 (ms)
   */
  showNotification(message, type = 'info', duration = 3000) {
    this.app.addNotification({
      message,
      type,
      duration
    });
  }

  /**
   * 로딩 표시
   * @param {HTMLElement} container - 로딩을 표시할 컨테이너 요소
   * @returns {HTMLElement} 로딩 요소
   */
  showLoading(container) {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading';
    loadingElement.innerHTML = `
      <div class="spinner"></div>
      <p>로딩 중...</p>
    `;
    
    if (container) {
      container.appendChild(loadingElement);
    }
    
    return loadingElement;
  }

  /**
   * 로딩 숨김
   * @param {HTMLElement} loadingElement - 로딩 요소
   */
  hideLoading(loadingElement) {
    if (loadingElement && loadingElement.parentNode) {
      loadingElement.parentNode.removeChild(loadingElement);
    }
  }

  /**
   * 모달 생성
   * @param {Object} options - 모달 옵션
   * @param {string} options.title - 모달 제목
   * @param {string|HTMLElement} options.content - 모달 내용
   * @param {Function} options.onConfirm - 확인 버튼 클릭 시 콜백
   * @param {Function} options.onCancel - 취소 버튼 클릭 시 콜백
   * @param {string} options.confirmText - 확인 버튼 텍스트
   * @param {string} options.cancelText - 취소 버튼 텍스트
   * @param {boolean} options.showCancel - 취소 버튼 표시 여부
   * @returns {Object} 모달 컨트롤러
   */
  createModal(options) {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop';
    
    const modalElement = document.createElement('div');
    modalElement.className = 'modal';
    
    // 모달 헤더
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.innerHTML = `
      <h3 class="modal-title">${options.title || '알림'}</h3>
      <button class="modal-close">&times;</button>
    `;
    
    // 모달 내용
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    
    if (typeof options.content === 'string') {
      modalBody.innerHTML = options.content;
    } else if (options.content instanceof HTMLElement) {
      modalBody.appendChild(options.content);
    }
    
    // 모달 푸터
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    
    if (options.showCancel !== false) {
      const cancelButton = document.createElement('button');
      cancelButton.className = 'btn btn-outline';
      cancelButton.textContent = options.cancelText || '취소';
      cancelButton.addEventListener('click', () => {
        closeModal();
        if (typeof options.onCancel === 'function') {
          options.onCancel();
        }
      });
      modalFooter.appendChild(cancelButton);
    }
    
    const confirmButton = document.createElement('button');
    confirmButton.className = 'btn btn-primary';
    confirmButton.textContent = options.confirmText || '확인';
    confirmButton.addEventListener('click', () => {
      if (typeof options.onConfirm === 'function') {
        options.onConfirm();
      }
      closeModal();
    });
    modalFooter.appendChild(confirmButton);
    
    // 모달 조립
    modalElement.appendChild(modalHeader);
    modalElement.appendChild(modalBody);
    modalElement.appendChild(modalFooter);
    modalBackdrop.appendChild(modalElement);
    
    // 닫기 버튼 이벤트
    const closeButton = modalHeader.querySelector('.modal-close');
    closeButton.addEventListener('click', () => {
      closeModal();
      if (typeof options.onCancel === 'function') {
        options.onCancel();
      }
    });
    
    // 배경 클릭 시 닫기
    modalBackdrop.addEventListener('click', (event) => {
      if (event.target === modalBackdrop) {
        closeModal();
        if (typeof options.onCancel === 'function') {
          options.onCancel();
        }
      }
    });
    
    // 모달 닫기 함수
    const closeModal = () => {
      modalBackdrop.classList.remove('show');
      setTimeout(() => {
        if (modalBackdrop.parentNode) {
          modalBackdrop.parentNode.removeChild(modalBackdrop);
        }
      }, 300);
    };
    
    // 모달 표시
    document.body.appendChild(modalBackdrop);
    
    // 애니메이션을 위한 지연
    setTimeout(() => {
      modalBackdrop.classList.add('show');
    }, 10);
    
    // 모달 컨트롤러 반환
    return {
      close: closeModal,
      element: modalElement
    };
  }

  /**
   * 확인 대화상자 표시
   * @param {string} message - 메시지
   * @param {Function} onConfirm - 확인 시 콜백
   * @param {Function} onCancel - 취소 시 콜백
   * @returns {Object} 모달 컨트롤러
   */
  confirm(message, onConfirm, onCancel) {
    return this.createModal({
      title: '확인',
      content: message,
      onConfirm,
      onCancel,
      confirmText: '확인',
      cancelText: '취소',
      showCancel: true
    });
  }

  /**
   * 알림 대화상자 표시
   * @param {string} message - 메시지
   * @param {Function} onClose - 닫기 시 콜백
   * @returns {Object} 모달 컨트롤러
   */
  alert(message, onClose) {
    return this.createModal({
      title: '알림',
      content: message,
      onConfirm: onClose,
      confirmText: '확인',
      showCancel: false
    });
  }
}
