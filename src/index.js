/**
 * 케빈랩 사업관리 시스템 (BMS) 진입점
 * 
 * 이 파일은 애플리케이션의 진입점으로, 앱 초기화 및 라우팅을 담당합니다.
 */

import { App } from './app.js';
import { Router } from './utils/router.js';

// DOM이 로드된 후 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 라우터 초기화
  const router = new Router();
  
  // 라우트 정의
  router.addRoute('/', 'pages/login/login.js', 'login-page');
  router.addRoute('/dashboard', 'pages/dashboard/dashboard.js', 'dashboard-page');
  router.addRoute('/sales', 'pages/sales/sales.js', 'sales-page');
  router.addRoute('/contracts', 'pages/contracts/contracts.js', 'contracts-page');
  router.addRoute('/backlog', 'pages/backlog/backlog.js', 'backlog-page');
  router.addRoute('/services', 'pages/services/services.js', 'services-page');
  router.addRoute('/settings', 'pages/settings/settings.js', 'settings-page');
  router.addRoute('*', 'pages/not-found/not-found.js', 'not-found-page');
  
  // 앱 인스턴스 생성 및 초기화
  const app = new App({
    router,
    appElement: document.getElementById('app')
  });
  
  // 앱 시작
  app.init();
});
