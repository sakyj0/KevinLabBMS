/**
 * 로그인 페이지 컴포넌트
 * 
 * 사용자 인증을 위한 로그인 페이지를 구현합니다.
 * 이메일과 비밀번호를 입력받아 인증을 처리합니다.
 */

import { BasePage } from '../../components/base-page.js';

export default class LoginPage extends BasePage {
  /**
   * LoginPage 클래스 생성자
   * @param {Object} config - 페이지 설정 객체
   */
  constructor(config) {
    super(config);
    
    // 로그인 페이지는 인증이 필요하지 않음
    this.requiresAuth = false;
    
    this.state = {
      email: '',
      password: '',
      isLoading: false,
      errorMessage: ''
    };
  }

  /**
   * 페이지 렌더링
   * @returns {Promise<HTMLElement>} 렌더링된 페이지 요소
   */
  async render() {
    this.element = document.createElement('div');
    this.element.className = 'page login-page';
    
    this.element.innerHTML = `
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <div class="logo">
              <img src="/public/logo.svg" alt="케빈랩 로고" class="logo-image">
            </div>
            <h1 class="login-title">케빈랩 사업관리 시스템</h1>
          </div>
          
          <div class="login-body">
            <form id="loginForm" class="login-form">
              <div class="form-group">
                <label for="email" class="form-label">이메일</label>
                <input 
                  type="email" 
                  id="email" 
                  class="form-control" 
                  placeholder="이메일 주소를 입력하세요"
                  required
                  autocomplete="email"
                >
              </div>
              
              <div class="form-group">
                <label for="password" class="form-label">비밀번호</label>
                <div class="password-input-wrapper">
                  <input 
                    type="password" 
                    id="password" 
                    class="form-control" 
                    placeholder="비밀번호를 입력하세요"
                    required
                    autocomplete="current-password"
                  >
                  <button type="button" class="password-toggle" tabindex="-1">
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </div>
              
              <div class="form-group">
                <div class="remember-me">
                  <input type="checkbox" id="rememberMe" class="remember-checkbox">
                  <label for="rememberMe" class="remember-label">로그인 상태 유지</label>
                </div>
              </div>
              
              <div class="alert alert-danger error-message" style="display: none;"></div>
              
              <div class="form-group">
                <button type="submit" class="btn btn-primary btn-lg btn-block login-button">
                  <span class="button-text">로그인</span>
                  <span class="button-loader" style="display: none;">
                    <i class="fas fa-spinner fa-spin"></i>
                  </span>
                </button>
              </div>
            </form>
          </div>
          
          <div class="login-footer">
            <p class="login-footer-text">© ${new Date().getFullYear()} KevinLab. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
    
    return this.element;
  }

  /**
   * 페이지 마운트 후 호출
   */
  mounted() {
    this.setTitle('로그인');
    
    // 폼 요소 참조
    this.loginForm = this.$('#loginForm');
    this.emailInput = this.$('#email');
    this.passwordInput = this.$('#password');
    this.rememberMeCheckbox = this.$('#rememberMe');
    this.errorMessageElement = this.$('.error-message');
    this.loginButton = this.$('.login-button');
    this.buttonText = this.$('.button-text');
    this.buttonLoader = this.$('.button-loader');
    this.passwordToggle = this.$('.password-toggle');
    
    // 저장된 이메일 복원
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.emailInput.value = savedEmail;
      this.rememberMeCheckbox.checked = true;
    }
    
    // 이벤트 리스너 등록
    this.addEventListener(this.loginForm, 'submit', this.handleSubmit.bind(this));
    this.addEventListener(this.passwordToggle, 'click', this.togglePasswordVisibility.bind(this));
  }

  /**
   * 폼 제출 처리
   * @param {Event} event - 폼 제출 이벤트
   */
  async handleSubmit(event) {
    event.preventDefault();
    
    // 입력값 가져오기
    const email = this.emailInput.value.trim();
    const password = this.passwordInput.value.trim();
    const rememberMe = this.rememberMeCheckbox.checked;
    
    // 입력값 검증
    if (!this.validateInputs(email, password)) {
      return;
    }
    
    // 로딩 상태 표시
    this.setState({ isLoading: true });
    this.updateLoadingState();
    
    try {
      // 로그인 처리 (목업 데이터 사용)
      await this.mockLogin(email, password);
      
      // 이메일 저장 처리
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // 로그인 성공 처리
      this.app.login(
        { email, name: '관리자', role: 'admin' }, // 목업 사용자 데이터
        'mock-token-12345' // 목업 토큰
      );
      
      // 대시보드로 이동 (app.login에서 처리)
    } catch (error) {
      // 에러 메시지 표시
      this.setState({ 
        errorMessage: error.message,
        isLoading: false
      });
      this.updateErrorMessage();
      this.updateLoadingState();
    }
  }

  /**
   * 입력값 검증
   * @param {string} email - 이메일 주소
   * @param {string} password - 비밀번호
   * @returns {boolean} 검증 결과
   */
  validateInputs(email, password) {
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.setState({ 
        errorMessage: '유효한 이메일 주소를 입력해주세요.',
        isLoading: false
      });
      this.updateErrorMessage();
      return false;
    }
    
    // 비밀번호 길이 검증
    if (password.length < 6) {
      this.setState({ 
        errorMessage: '비밀번호는 6자 이상이어야 합니다.',
        isLoading: false
      });
      this.updateErrorMessage();
      return false;
    }
    
    return true;
  }

  /**
   * 목업 로그인 처리
   * @param {string} email - 이메일 주소
   * @param {string} password - 비밀번호
   * @returns {Promise<void>} 로그인 결과
   */
  mockLogin(email, password) {
    return new Promise((resolve, reject) => {
      // 로그인 지연 시뮬레이션 (1초)
      setTimeout(() => {
        // 목업 사용자 정보
        const mockUsers = [
          { email: 'admin@kevinlab.co.kr', password: 'admin123' },
          { email: 'user@kevinlab.co.kr', password: 'user123' }
        ];
        
        // 사용자 확인
        const user = mockUsers.find(u => u.email === email);
        
        if (user && user.password === password) {
          resolve();
        } else {
          reject(new Error('이메일 또는 비밀번호가 올바르지 않습니다.'));
        }
      }, 1000);
    });
  }

  /**
   * 비밀번호 표시/숨김 토글
   */
  togglePasswordVisibility() {
    const isPasswordVisible = this.passwordInput.type === 'text';
    
    // 입력 타입 변경
    this.passwordInput.type = isPasswordVisible ? 'password' : 'text';
    
    // 아이콘 변경
    const icon = this.passwordToggle.querySelector('i');
    icon.className = isPasswordVisible ? 'fas fa-eye' : 'fas fa-eye-slash';
  }

  /**
   * 로딩 상태 업데이트
   */
  updateLoadingState() {
    if (this.state.isLoading) {
      this.buttonText.style.display = 'none';
      this.buttonLoader.style.display = 'inline-block';
      this.loginButton.disabled = true;
    } else {
      this.buttonText.style.display = 'inline-block';
      this.buttonLoader.style.display = 'none';
      this.loginButton.disabled = false;
    }
  }

  /**
   * 에러 메시지 업데이트
   */
  updateErrorMessage() {
    if (this.state.errorMessage) {
      this.errorMessageElement.textContent = this.state.errorMessage;
      this.errorMessageElement.style.display = 'block';
    } else {
      this.errorMessageElement.style.display = 'none';
    }
  }

  /**
   * 상태 업데이트 후 UI 갱신
   */
  update() {
    this.updateLoadingState();
    this.updateErrorMessage();
  }
}
