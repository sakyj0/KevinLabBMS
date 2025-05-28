/**
 * 영업 서비스 클래스
 * 
 * 영업 관련 데이터를 가져오고 관리하는 서비스 클래스입니다.
 * 현재는 목업 데이터를 사용하고, 나중에 Firebase 연동 시 실제 데이터로 교체할 수 있습니다.
 */

export class SalesService {
  /**
   * 영업 데이터 가져오기
   * @param {Object} options - 옵션
   * @param {string} options.period - 기간 필터 (week, month, quarter, year)
   * @param {string} options.status - 상태 필터 (all, active, won, lost)
   * @param {string} options.search - 검색어
   * @param {string} options.sortBy - 정렬 기준 (date, amount, probability)
   * @param {string} options.sortOrder - 정렬 순서 (asc, desc)
   * @returns {Promise<Object>} 영업 데이터
   */
  async getSalesData(options = {}) {
    // 실제 구현에서는 API 호출 또는 Firebase에서 데이터 가져오기
    // 현재는 목업 데이터 반환
    return new Promise((resolve) => {
      setTimeout(() => {
        // 목업 데이터 가져오기
        let opportunities = this.getMockOpportunities();
        
        // 필터링
        opportunities = this.filterOpportunities(opportunities, options);
        
        // 정렬
        opportunities = this.sortOpportunities(opportunities, options);
        
        // 파이프라인 데이터 생성
        const pipelineData = this.createPipelineData(opportunities);
        
        // 퍼널 데이터 생성
        const funnelData = this.createFunnelData(opportunities);
        
        // 활동 데이터 가져오기
        const activitiesData = this.getMockActivities();
        
        resolve({
          pipelineData,
          opportunitiesData: opportunities,
          activitiesData,
          funnelData
        });
      }, 1000); // 1초 지연으로 로딩 시뮬레이션
    });
  }

  /**
   * 영업 기회 생성
   * @param {Object} data - 영업 기회 데이터
   * @returns {Promise<Object>} 생성된 영업 기회
   */
  async createOpportunity(data) {
    // 실제 구현에서는 API 호출 또는 Firebase에 데이터 저장
    return new Promise((resolve) => {
      setTimeout(() => {
        // ID 생성 (실제로는 서버에서 생성)
        const id = 'opp_' + Math.random().toString(36).substr(2, 9);
        
        // 생성일 추가
        const createdAt = new Date().toISOString();
        
        // 새 영업 기회 객체 생성
        const newOpportunity = {
          id,
          createdAt,
          ...data
        };
        
        resolve(newOpportunity);
      }, 500);
    });
  }

  /**
   * 영업 기회 업데이트
   * @param {Object} data - 업데이트할 영업 기회 데이터
   * @returns {Promise<Object>} 업데이트된 영업 기회
   */
  async updateOpportunity(data) {
    // 실제 구현에서는 API 호출 또는 Firebase 데이터 업데이트
    return new Promise((resolve) => {
      setTimeout(() => {
        // 업데이트일 추가
        const updatedAt = new Date().toISOString();
        
        // 업데이트된 영업 기회 객체 생성
        const updatedOpportunity = {
          ...data,
          updatedAt
        };
        
        resolve(updatedOpportunity);
      }, 500);
    });
  }

  /**
   * 영업 기회 삭제
   * @param {string} id - 삭제할 영업 기회 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deleteOpportunity(id) {
    // 실제 구현에서는 API 호출 또는 Firebase 데이터 삭제
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }

  /**
   * 영업 기회 필터링
   * @param {Array} opportunities - 영업 기회 배열
   * @param {Object} options - 필터 옵션
   * @returns {Array} 필터링된 영업 기회 배열
   */
  filterOpportunities(opportunities, options) {
    let filtered = [...opportunities];
    
    // 상태 필터
    if (options.status && options.status !== 'all') {
      filtered = filtered.filter(opp => opp.status === options.status);
    }
    
    // 기간 필터
    if (options.period) {
      const today = new Date();
      let startDate;
      
      switch (options.period) {
        case 'week':
          // 이번 주 시작일 (일요일)
          startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay());
          break;
        case 'month':
          // 이번 달 1일
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case 'quarter':
          // 이번 분기 시작월 1일
          const quarter = Math.floor(today.getMonth() / 3);
          startDate = new Date(today.getFullYear(), quarter * 3, 1);
          break;
        case 'year':
          // 올해 1월 1일
          startDate = new Date(today.getFullYear(), 0, 1);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        filtered = filtered.filter(opp => {
          const oppDate = new Date(opp.expectedCloseDate);
          return oppDate >= startDate;
        });
      }
    }
    
    // 검색어 필터
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.name.toLowerCase().includes(searchLower) ||
        opp.company.toLowerCase().includes(searchLower) ||
        (opp.contact && opp.contact.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }

  /**
   * 영업 기회 정렬
   * @param {Array} opportunities - 영업 기회 배열
   * @param {Object} options - 정렬 옵션
   * @returns {Array} 정렬된 영업 기회 배열
   */
  sortOpportunities(opportunities, options) {
    const sorted = [...opportunities];
    
    // 정렬 기준
    const sortBy = options.sortBy || 'date';
    const sortOrder = options.sortOrder || 'desc';
    const direction = sortOrder === 'asc' ? 1 : -1;
    
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return direction * (new Date(a.expectedCloseDate) - new Date(b.expectedCloseDate));
        case 'amount':
          return direction * (a.amount - b.amount);
        case 'probability':
          return direction * (a.probability - b.probability);
        default:
          return 0;
      }
    });
    
    return sorted;
  }

  /**
   * 파이프라인 데이터 생성
   * @param {Array} opportunities - 영업 기회 배열
   * @returns {Object} 파이프라인 차트 데이터
   */
  createPipelineData(opportunities) {
    // 단계별 금액 합계 계산
    const stageMap = {
      'initial': { label: '초기 접촉', value: 0 },
      'qualification': { label: '검증', value: 0 },
      'proposal': { label: '제안', value: 0 },
      'negotiation': { label: '협상', value: 0 },
      'closing': { label: '종료', value: 0 }
    };
    
    // 진행 중인 영업 기회만 필터링
    const activeOpportunities = opportunities.filter(opp => opp.status === 'active');
    
    // 단계별 금액 합산
    activeOpportunities.forEach(opp => {
      if (stageMap[opp.stage]) {
        stageMap[opp.stage].value += opp.amount;
      }
    });
    
    // 차트 데이터 형식으로 변환
    const labels = Object.values(stageMap).map(item => item.label);
    const values = Object.values(stageMap).map(item => item.value);
    
    return { labels, values };
  }

  /**
   * 퍼널 데이터 생성
   * @param {Array} opportunities - 영업 기회 배열
   * @returns {Object} 퍼널 차트 데이터
   */
  createFunnelData(opportunities) {
    // 단계별 건수 및 금액 합계 계산
    const stageMap = {
      'initial': { label: '초기 접촉', count: 0, amount: 0 },
      'qualification': { label: '검증', count: 0, amount: 0 },
      'proposal': { label: '제안', count: 0, amount: 0 },
      'negotiation': { label: '협상', count: 0, amount: 0 },
      'closing': { label: '종료', count: 0, amount: 0 }
    };
    
    // 진행 중인 영업 기회만 필터링
    const activeOpportunities = opportunities.filter(opp => opp.status === 'active');
    
    // 단계별 건수 및 금액 합산
    activeOpportunities.forEach(opp => {
      if (stageMap[opp.stage]) {
        stageMap[opp.stage].count += 1;
        stageMap[opp.stage].amount += opp.amount;
      }
    });
    
    // 차트 데이터 형식으로 변환
    const labels = Object.values(stageMap).map(item => item.label);
    const values = Object.values(stageMap).map(item => item.count);
    const amounts = Object.values(stageMap).map(item => item.amount);
    
    return { labels, values, amounts };
  }

  /**
   * 목업 영업 기회 데이터 가져오기
   * @returns {Array} 영업 기회 배열
   */
  getMockOpportunities() {
    return [
      {
        id: 'opp_1',
        name: '케빈랩 HEMS 구축 프로젝트',
        company: '스마트빌딩 주식회사',
        contact: '김영수',
        amount: 12000,
        probability: 80,
        stage: 'negotiation',
        status: 'active',
        expectedCloseDate: '2025-06-15',
        description: '스마트빌딩 주식회사의 신규 건물에 HEMS 시스템 구축 프로젝트',
        createdAt: '2025-05-01T09:00:00Z'
      },
      {
        id: 'opp_2',
        name: '그린에너지 BEMS 유지보수 계약',
        company: '그린에너지 주식회사',
        contact: '박지민',
        amount: 8500,
        probability: 90,
        stage: 'closing',
        status: 'active',
        expectedCloseDate: '2025-06-05',
        description: '그린에너지 주식회사의 기존 BEMS 시스템 유지보수 계약 갱신',
        createdAt: '2025-05-10T10:30:00Z'
      },
      {
        id: 'opp_3',
        name: '스마트시티 FEMS 구축 사업',
        company: '스마트시티 개발공사',
        contact: '이태호',
        amount: 45000,
        probability: 60,
        stage: 'proposal',
        status: 'active',
        expectedCloseDate: '2025-07-20',
        description: '스마트시티 개발공사의 신규 산업단지 FEMS 구축 사업',
        createdAt: '2025-05-15T14:00:00Z'
      },
      {
        id: 'opp_4',
        name: '에코빌딩 REMS 업그레이드',
        company: '에코빌딩 관리단',
        contact: '최서연',
        amount: 6800,
        probability: 75,
        stage: 'qualification',
        status: 'active',
        expectedCloseDate: '2025-06-30',
        description: '에코빌딩의 기존 REMS 시스템 업그레이드 및 기능 확장',
        createdAt: '2025-05-18T11:15:00Z'
      },
      {
        id: 'opp_5',
        name: '테크놀로지파크 통합 에너지 관리 시스템',
        company: '테크놀로지파크 운영사',
        contact: '정민준',
        amount: 32000,
        probability: 40,
        stage: 'initial',
        status: 'active',
        expectedCloseDate: '2025-08-15',
        description: '테크놀로지파크 전체 건물에 대한 통합 에너지 관리 시스템 구축',
        createdAt: '2025-05-20T16:45:00Z'
      },
      {
        id: 'opp_6',
        name: '스마트팩토리 FEMS 구축',
        company: '한국제조 주식회사',
        contact: '한지훈',
        amount: 28000,
        probability: 100,
        stage: 'closing',
        status: 'won',
        expectedCloseDate: '2025-05-25',
        description: '한국제조 주식회사의 스마트팩토리 FEMS 구축 프로젝트 완료',
        createdAt: '2025-04-10T09:30:00Z'
      },
      {
        id: 'opp_7',
        name: '리조트 HEMS 도입 제안',
        company: '파라다이스 리조트',
        contact: '송은지',
        amount: 15000,
        probability: 0,
        stage: 'proposal',
        status: 'lost',
        expectedCloseDate: '2025-05-10',
        description: '파라다이스 리조트 객실 및 부대시설 HEMS 도입 제안',
        createdAt: '2025-04-05T13:20:00Z'
      }
    ];
  }

  /**
   * 목업 영업 활동 데이터 가져오기
   * @returns {Array} 영업 활동 배열
   */
  getMockActivities() {
    return [
      {
        id: 'act_1',
        type: 'meeting',
        title: '스마트빌딩 주식회사 미팅',
        description: '프로젝트 요구사항 및 예산 논의',
        date: '2025-05-27T14:00:00Z',
        opportunity: '케빈랩 HEMS 구축 프로젝트',
        contact: '김영수'
      },
      {
        id: 'act_2',
        type: 'proposal',
        title: '제안서 제출',
        description: '그린에너지 주식회사 BEMS 유지보수 제안서 제출',
        date: '2025-05-26T10:30:00Z',
        opportunity: '그린에너지 BEMS 유지보수 계약',
        contact: '박지민'
      },
      {
        id: 'act_3',
        type: 'call',
        title: '스마트시티 개발공사 전화 상담',
        description: 'FEMS 구축 사업 관련 기술 문의 응대',
        date: '2025-05-25T16:15:00Z',
        opportunity: '스마트시티 FEMS 구축 사업',
        contact: '이태호'
      },
      {
        id: 'act_4',
        type: 'email',
        title: '에코빌딩 견적서 발송',
        description: 'REMS 업그레이드 견적서 및 일정 계획 이메일 발송',
        date: '2025-05-24T09:45:00Z',
        opportunity: '에코빌딩 REMS 업그레이드',
        contact: '최서연'
      },
      {
        id: 'act_5',
        type: 'demo',
        title: '테크놀로지파크 데모 시연',
        description: '통합 에너지 관리 시스템 데모 시연 및 질의응답',
        date: '2025-05-23T13:00:00Z',
        opportunity: '테크놀로지파크 통합 에너지 관리 시스템',
        contact: '정민준'
      },
      {
        id: 'act_6',
        type: 'contract',
        title: '계약 체결',
        description: '한국제조 주식회사와 FEMS 구축 계약 체결',
        date: '2025-05-22T11:30:00Z',
        opportunity: '스마트팩토리 FEMS 구축',
        contact: '한지훈'
      },
      {
        id: 'act_7',
        type: 'follow-up',
        title: '그린에너지 후속 조치',
        description: '제안서 검토 후 추가 요청사항 대응',
        date: '2025-05-21T15:20:00Z',
        opportunity: '그린에너지 BEMS 유지보수 계약',
        contact: '박지민'
      }
    ];
  }
}
