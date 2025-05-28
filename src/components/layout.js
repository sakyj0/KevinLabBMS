/**
 * 레이아웃 컴포넌트
 * 
 * 애플리케이션의 기본 레이아웃을 구성합니다.
 * 헤더, 사이드바 네비게이션, 메인 콘텐츠 영역을 포함합니다.
 */

/**
 * 레이아웃 생성 함수
 * @param {Object} config - 레이아웃 설정
 * @param {HTMLElement} config.content - 메인 콘텐츠 요소
 * @param {Object} config.app - 앱 인스턴스
 * @param {string} config.activePage - 현재 활성화된 페이지 ID
 * @returns {HTMLElement} 레이아웃 요소
 */
export function createLayout(config) {
  const { content, app, activePage } = config;
  
  // 레이아웃 컨테이너 생성
  const layoutElement = document.createElement('div');
  layoutElement.className = 'layout';
  
  // 사이드바 생성
  const sidebar = createSidebar(app, activePage);
  
  // 메인 영역 생성
  const main = document.createElement('div');
  main.className = 'main';
  
  // 헤더 생성
  const header = createHeader(app);
  
  // 콘텐츠 영역 생성
  const contentContainer = document.createElement('div');
  contentContainer.className = 'content';
  contentContainer.appendChild(content);
  
  // 메인 영역에 헤더와 콘텐츠 추가
  main.appendChild(header);
  main.appendChild(contentContainer);
  
  // 레이아웃에 사이드바와 메인 영역 추가
  layoutElement.appendChild(sidebar);
  layoutElement.appendChild(main);
  
  // 모바일 메뉴 토글 이벤트 리스너
  const menuToggle = header.querySelector('.menu-toggle');
  menuToggle.addEventListener('click', () => {
    layoutElement.classList.toggle('sidebar-open');
  });
  
  // 사이드바 외부 클릭 시 닫기 (모바일)
  document.addEventListener('click', (event) => {
    if (
      layoutElement.classList.contains('sidebar-open') &&
      !sidebar.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      layoutElement.classList.remove('sidebar-open');
    }
  });
  
  return layoutElement;
}

/**
 * 헤더 생성 함수
 * @param {Object} app - 앱 인스턴스
 * @returns {HTMLElement} 헤더 요소
 */
function createHeader(app) {
  const header = document.createElement('header');
  header.className = 'header';
  
  header.innerHTML = `
    <div class="header-left">
      <button class="menu-toggle">
        <i class="fas fa-bars"></i>
      </button>
    </div>
    
    <div class="header-right">
      <div class="theme-toggle">
        <button class="theme-toggle-button">
          <i class="fas ${app.state.darkMode ? 'fa-sun' : 'fa-moon'}"></i>
        </button>
      </div>
      
      <div class="user-menu">
        <button class="user-menu-button">
          <div class="user-avatar">
            <i class="fas fa-user"></i>
          </div>
          <span class="user-name">${app.user ? app.user.name : '사용자'}</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        
        <div class="user-dropdown">
          <div class="user-dropdown-header">
            <div class="user-info">
              <div class="user-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="user-details">
                <div class="user-name">${app.user ? app.user.name : '사용자'}</div>
                <div class="user-email">${app.user ? app.user.email : 'user@example.com'}</div>
              </div>
            </div>
          </div>
          
          <div class="user-dropdown-body">
            <a href="/settings" class="user-dropdown-item">
              <i class="fas fa-cog"></i>
              <span>설정</span>
            </a>
            <button class="user-dropdown-item logout-button">
              <i class="fas fa-sign-out-alt"></i>
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // 이벤트 리스너 등록
  setTimeout(() => {
    // 테마 토글 버튼
    const themeToggleButton = header.querySelector('.theme-toggle-button');
    themeToggleButton.addEventListener('click', () => {
      app.toggleTheme();
      const icon = themeToggleButton.querySelector('i');
      icon.className = `fas ${app.state.darkMode ? 'fa-sun' : 'fa-moon'}`;
    });
    
    // 사용자 메뉴 토글
    const userMenuButton = header.querySelector('.user-menu-button');
    const userDropdown = header.querySelector('.user-dropdown');
    
    userMenuButton.addEventListener('click', (event) => {
      event.stopPropagation();
      userDropdown.classList.toggle('show');
    });
    
    // 사용자 메뉴 외부 클릭 시 닫기
    document.addEventListener('click', () => {
      userDropdown.classList.remove('show');
    });
    
    userDropdown.addEventListener('click', (event) => {
      event.stopPropagation();
    });
    
    // 로그아웃 버튼
    const logoutButton = header.querySelector('.logout-button');
    logoutButton.addEventListener('click', () => {
      app.logout();
    });
  }, 0);
  
  return header;
}

/**
 * 사이드바 생성 함수
 * @param {Object} app - 앱 인스턴스
 * @param {string} activePage - 현재 활성화된 페이지 ID
 * @returns {HTMLElement} 사이드바 요소
 */
function createSidebar(app, activePage) {
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  
  // 네비게이션 항목 정의
  const navItems = [
    { id: 'dashboard', label: '대시보드', icon: 'fa-chart-pie', url: '/dashboard' },
    { id: 'sales', label: '영업현황', icon: 'fa-handshake', url: '/sales' },
    { id: 'contracts', label: '계약 관리', icon: 'fa-file-signature', url: '/contracts' },
    { id: 'backlog', label: '수주잔', icon: 'fa-coins', url: '/backlog' },
    { id: 'services', label: '서비스 현황', icon: 'fa-server', url: '/services' },
    { id: 'settings', label: '설정', icon: 'fa-cog', url: '/settings' }
  ];
  
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="logo">
        <img src="/public/logo.svg" alt="케빈랩 로고" class="logo-image">
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <ul class="nav-list">
        ${navItems.map(item => `
          <li class="nav-item ${item.id === activePage ? 'active' : ''}">
            <a href="${item.url}" class="nav-link">
              <i class="fas ${item.icon}"></i>
              <span class="nav-label">${item.label}</span>
            </a>
          </li>
        `).join('')}
      </ul>
    </nav>
    
    <div class="sidebar-footer">
      <div class="version">v1.0.0</div>
    </div>
  `;
  
  return sidebar;
}
