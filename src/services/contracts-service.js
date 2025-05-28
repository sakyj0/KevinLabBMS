/**
 * 계약 서비스 클래스
 * 
 * 계약 관련 데이터를 가져오고 관리하는 서비스 클래스입니다.
 * 현재는 목업 데이터를 사용하고, 나중에 Firebase 연동 시 실제 데이터로 교체할 수 있습니다.
 */

export class ContractsService {
  /**
   * 계약 데이터 가져오기
   * @param {Object} options - 옵션
   * @param {string} options.status - 상태 필터 (all, active, pending, expired)
   * @param {string} options.period - 기간 필터 (all, month, quarter, year)
   * @param {string} options.search - 검색어
   * @param {string} options.sortBy - 정렬 기준 (date, amount, client)
   * @param {string} options.sortOrder - 정렬 순서 (asc, desc)
   * @returns {Promise<Object>} 계약 데이터
   */
  async getContractsData(options = {}) {
    // 실제 구현에서는 API 호출 또는 Firebase에서 데이터 가져오기
    // 현재는 목업 데이터 반환
    return new Promise((resolve) => {
      setTimeout(() => {
        // 목업 데이터 가져오기
        let contracts = this.getMockContracts();
        
        // 필터링
        contracts = this.filterContracts(contracts, options);
        
        // 정렬
        contracts = this.sortContracts(contracts, options);
        
        // 요약 데이터 생성
        const summary = this.createContractSummary(contracts);
        
        resolve({
          contracts,
          summary
        });
      }, 1000); // 1초 지연으로 로딩 시뮬레이션
    });
  }

  /**
   * 계약 생성
   * @param {Object} data - 계약 데이터
   * @returns {Promise<Object>} 생성된 계약
   */
  async createContract(data) {
    // 실제 구현에서는 API 호출 또는 Firebase에 데이터 저장
    return new Promise((resolve) => {
      setTimeout(() => {
        // ID 생성 (실제로는 서버에서 생성)
        const id = 'contract_' + Math.random().toString(36).substr(2, 9);
        
        // 생성일 추가
        const createdAt = new Date().toISOString();
        
        // 새 계약 객체 생성
        const newContract = {
          id,
          createdAt,
          ...data
        };
        
        resolve(newContract);
      }, 500);
    });
  }

  /**
   * 계약 업데이트
   * @param {Object} data - 업데이트할 계약 데이터
   * @returns {Promise<Object>} 업데이트된 계약
   */
  async updateContract(data) {
    // 실제 구현에서는 API 호출 또는 Firebase 데이터 업데이트
    return new Promise((resolve) => {
      setTimeout(() => {
        // 업데이트일 추가
        const updatedAt = new Date().toISOString();
        
        // 업데이트된 계약 객체 생성
        const updatedContract = {
          ...data,
          updatedAt
        };
        
        resolve(updatedContract);
      }, 500);
    });
  }

  /**
   * 계약 삭제
   * @param {string} id - 삭제할 계약 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deleteContract(id) {
    // 실제 구현에서는 API 호출 또는 Firebase 데이터 삭제
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }

  /**
   * 계약 필터링
   * @param {Array} contracts - 계약 배열
   * @param {Object} options - 필터 옵션
   * @returns {Array} 필터링된 계약 배열
   */
  filterContracts(contracts, options) {
    let filtered = [...contracts];
    
    // 상태 필터
    if (options.status && options.status !== 'all') {
      filtered = filtered.filter(contract => contract.status === options.status);
    }
    
    // 기간 필터
    if (options.period && options.period !== 'all') {
      const today = new Date();
      let startDate;
      
      switch (options.period) {
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
        filtered = filtered.filter(contract => {
          const contractDate = new Date(contract.startDate);
          return contractDate >= startDate;
        });
      }
    }
    
    // 검색어 필터
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      filtered = filtered.filter(contract => 
        contract.name.toLowerCase().includes(searchLower) ||
        contract.client.toLowerCase().includes(searchLower) ||
        (contract.contactPerson && contract.contactPerson.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }

  /**
   * 계약 정렬
   * @param {Array} contracts - 계약 배열
   * @param {Object} options - 정렬 옵션
   * @returns {Array} 정렬된 계약 배열
   */
  sortContracts(contracts, options) {
    const sorted = [...contracts];
    
    // 정렬 기준
    const sortBy = options.sortBy || 'date';
    const sortOrder = options.sortOrder || 'desc';
    const direction = sortOrder === 'asc' ? 1 : -1;
    
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return direction * (new Date(a.startDate) - new Date(b.startDate));
        case 'amount':
          return direction * (a.amount - b.amount);
        case 'client':
          return direction * a.client.localeCompare(b.client);
        default:
          return 0;
      }
    });
    
    return sorted;
  }

  /**
   * 계약 요약 데이터 생성
   * @param {Array} contracts - 계약 배열
   * @returns {Object} 요약 데이터
   */
  createContractSummary(contracts) {
    // 상태별 계약 건수 및 금액 합계 계산
    const summary = {
      active: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      expired: { count: 0, amount: 0 },
      total: { count: 0, amount: 0 }
    };
    
    // 상태별 집계
    contracts.forEach(contract => {
      // 전체 합계
      summary.total.count += 1;
      summary.total.amount += contract.amount;
      
      // 상태별 합계
      if (summary[contract.status]) {
        summary[contract.status].count += 1;
        summary[contract.status].amount += contract.amount;
      }
    });
    
    return { summary };
  }

  /**
   * 목업 계약 데이터 가져오기
   * @returns {Array} 계약 배열
   */
  getMockContracts() {
    return [
      {
        id: 'contract_1',
        name: '스마트빌딩 HEMS 구축 계약',
        client: '스마트빌딩 주식회사',
        contactPerson: '김영수',
        amount: 12000,
        type: 'project',
        startDate: '2025-04-01',
        endDate: '2025-09-30',
        status: 'active',
        description: '스마트빌딩 주식회사의 신규 건물에 HEMS 시스템 구축 프로젝트 계약',
        createdAt: '2025-03-15T10:30:00Z',
        documents: [
          {
            id: 'doc_1_1',
            name: '스마트빌딩 HEMS 계약서.pdf',
            type: 'pdf',
            size: 2457600,
            uploadedAt: '2025-03-15T10:35:00Z'
          },
          {
            id: 'doc_1_2',
            name: '스마트빌딩 HEMS 요구사항 명세서.docx',
            type: 'docx',
            size: 1548800,
            uploadedAt: '2025-03-15T10:40:00Z'
          }
        ]
      },
      {
        id: 'contract_2',
        name: '그린에너지 BEMS 유지보수 계약',
        client: '그린에너지 주식회사',
        contactPerson: '박지민',
        amount: 8500,
        type: 'maintenance',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        status: 'active',
        description: '그린에너지 주식회사의 기존 BEMS 시스템 유지보수 연간 계약',
        createdAt: '2024-12-10T14:20:00Z',
        documents: [
          {
            id: 'doc_2_1',
            name: '그린에너지 BEMS 유지보수 계약서.pdf',
            type: 'pdf',
            size: 1843200,
            uploadedAt: '2024-12-10T14:25:00Z'
          }
        ]
      },
      {
        id: 'contract_3',
        name: '스마트시티 FEMS 구축 계약',
        client: '스마트시티 개발공사',
        contactPerson: '이태호',
        amount: 45000,
        type: 'project',
        startDate: '2025-07-01',
        endDate: '2026-06-30',
        status: 'pending',
        description: '스마트시티 개발공사의 신규 산업단지 FEMS 구축 프로젝트 계약',
        createdAt: '2025-05-20T09:15:00Z',
        documents: [
          {
            id: 'doc_3_1',
            name: '스마트시티 FEMS 계약서(초안).pdf',
            type: 'pdf',
            size: 3145728,
            uploadedAt: '2025-05-20T09:20:00Z'
          },
          {
            id: 'doc_3_2',
            name: '스마트시티 FEMS 제안서.pptx',
            type: 'pptx',
            size: 5242880,
            uploadedAt: '2025-05-20T09:25:00Z'
          }
        ]
      },
      {
        id: 'contract_4',
        name: '에코빌딩 REMS 업그레이드 계약',
        client: '에코빌딩 관리단',
        contactPerson: '최서연',
        amount: 6800,
        type: 'service',
        startDate: '2025-06-01',
        endDate: '2025-08-31',
        status: 'pending',
        description: '에코빌딩의 기존 REMS 시스템 업그레이드 및 기능 확장 계약',
        createdAt: '2025-05-15T11:00:00Z',
        documents: []
      },
      {
        id: 'contract_5',
        name: '테크놀로지파크 에너지 관리 시스템 컨설팅',
        client: '테크놀로지파크 운영사',
        contactPerson: '정민준',
        amount: 3500,
        type: 'service',
        startDate: '2025-05-15',
        endDate: '2025-07-15',
        status: 'active',
        description: '테크놀로지파크의 에너지 관리 시스템 구축을 위한 컨설팅 계약',
        createdAt: '2025-05-10T16:30:00Z',
        documents: [
          {
            id: 'doc_5_1',
            name: '테크놀로지파크 컨설팅 계약서.pdf',
            type: 'pdf',
            size: 1228800,
            uploadedAt: '2025-05-10T16:35:00Z'
          }
        ]
      },
      {
        id: 'contract_6',
        name: '한국제조 FEMS 구축 계약',
        client: '한국제조 주식회사',
        contactPerson: '한지훈',
        amount: 28000,
        type: 'project',
        startDate: '2024-09-01',
        endDate: '2025-02-28',
        status: 'expired',
        description: '한국제조 주식회사의 스마트팩토리 FEMS 구축 프로젝트 계약',
        createdAt: '2024-08-05T10:00:00Z',
        documents: [
          {
            id: 'doc_6_1',
            name: '한국제조 FEMS 계약서.pdf',
            type: 'pdf',
            size: 2097152,
            uploadedAt: '2024-08-05T10:05:00Z'
          },
          {
            id: 'doc_6_2',
            name: '한국제조 FEMS 완료보고서.pdf',
            type: 'pdf',
            size: 4194304,
            uploadedAt: '2025-03-05T15:30:00Z'
          }
        ]
      },
      {
        id: 'contract_7',
        name: '파라다이스 리조트 HEMS 도입 계약',
        client: '파라다이스 리조트',
        contactPerson: '송은지',
        amount: 15000,
        type: 'project',
        startDate: '2024-11-01',
        endDate: '2025-04-30',
        status: 'expired',
        description: '파라다이스 리조트 객실 및 부대시설 HEMS 도입 계약',
        createdAt: '2024-10-15T13:45:00Z',
        documents: [
          {
            id: 'doc_7_1',
            name: '파라다이스 리조트 HEMS 계약서.pdf',
            type: 'pdf',
            size: 1843200,
            uploadedAt: '2024-10-15T13:50:00Z'
          }
        ]
      },
      {
        id: 'contract_8',
        name: '시티뱅크 본사 BEMS 유지보수 계약',
        client: '시티뱅크 코리아',
        contactPerson: '장현우',
        amount: 7200,
        type: 'maintenance',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        status: 'active',
        description: '시티뱅크 코리아 본사 건물의 BEMS 시스템 유지보수 연간 계약',
        createdAt: '2024-12-20T11:30:00Z',
        documents: [
          {
            id: 'doc_8_1',
            name: '시티뱅크 BEMS 유지보수 계약서.pdf',
            type: 'pdf',
            size: 1638400,
            uploadedAt: '2024-12-20T11:35:00Z'
          }
        ]
      }
    ];
  }
}
