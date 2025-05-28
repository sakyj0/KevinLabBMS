/**
 * 대시보드 서비스 클래스
 * 
 * 대시보드에 표시될 데이터를 가져오는 서비스 클래스입니다.
 * 현재는 목업 데이터를 사용하고, 나중에 Firebase 연동 시 실제 데이터로 교체할 수 있습니다.
 */

export class DashboardService {
  /**
   * 대시보드 데이터 가져오기
   * @returns {Promise<Object>} 대시보드 데이터
   */
  async getDashboardData() {
    // 실제 구현에서는 API 호출 또는 Firebase에서 데이터 가져오기
    // 현재는 목업 데이터 반환
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          metrics: this.getMockMetrics(),
          revenueData: this.getMockRevenueData(),
          breakdownData: this.getMockBreakdownData(),
          serviceKpis: this.getMockServiceKpis()
        });
      }, 1000); // 1초 지연으로 로딩 시뮬레이션
    });
  }

  /**
   * 목업 지표 데이터 가져오기
   * @returns {Object} 지표 데이터
   */
  getMockMetrics() {
    return {
      revenueForecast: {
        total: 125000,
        change: 5.2
      },
      backlogTotal: {
        amount: 85000,
        change: -2.1
      },
      pendingContracts: {
        count: 3,
        amount: 45000
      },
      quarterAchievement: {
        percentage: 68,
        current: 34000,
        target: 50000
      }
    };
  }

  /**
   * 목업 매출 현황 데이터 가져오기
   * @returns {Object} 매출 현황 데이터
   */
  getMockRevenueData() {
    return {
      labels: ['HEMS', 'BEMS', 'REMS', 'FEMS', '기타'],
      values: [35000, 42000, 18000, 25000, 5000]
    };
  }

  /**
   * 목업 예상 매출 Break-Down 데이터 가져오기
   * @returns {Object} 예상 매출 Break-Down 데이터
   */
  getMockBreakdownData() {
    return {
      labels: ['1분기', '2분기', '3분기', '4분기'],
      confirmed: [28000, 32000, 15000, 10000],
      expected: [0, 5000, 15000, 20000]
    };
  }

  /**
   * 목업 서비스 KPI 데이터 가져오기
   * @returns {Object} 서비스 KPI 데이터
   */
  getMockServiceKpis() {
    return {
      hems: [
        {
          businessName: '케빈랩 본사',
          kpi: {
            energySaved: 12500,
            area: 2500,
            co2Reduced: 6250
          },
          status: '정상'
        },
        {
          businessName: '케빈랩 연구소',
          kpi: {
            energySaved: 8700,
            area: 1800,
            co2Reduced: 4350
          },
          status: '정상'
        },
        {
          businessName: '케빈랩 공장',
          kpi: {
            energySaved: 15200,
            area: 3200,
            co2Reduced: 7600
          },
          status: '주의'
        }
      ],
      bems: [
        {
          businessName: '스마트 빌딩 A',
          kpi: {
            energySaved: 28500,
            area: 5200,
            co2Reduced: 14250,
            efficiency: 92
          },
          status: '정상'
        },
        {
          businessName: '스마트 빌딩 B',
          kpi: {
            energySaved: 32100,
            area: 6800,
            co2Reduced: 16050,
            efficiency: 88
          },
          status: '정상'
        },
        {
          businessName: '스마트 빌딩 C',
          kpi: {
            energySaved: 18700,
            area: 4100,
            co2Reduced: 9350,
            efficiency: 78
          },
          status: '주의'
        }
      ],
      rems: [
        {
          businessName: '태양광 발전소 A',
          kpi: {
            energySaved: 42500,
            area: 8500,
            co2Reduced: 21250,
            renewableRatio: 95
          },
          status: '정상'
        },
        {
          businessName: '태양광 발전소 B',
          kpi: {
            energySaved: 38700,
            area: 7800,
            co2Reduced: 19350,
            renewableRatio: 92
          },
          status: '점검 중'
        }
      ],
      fems: [
        {
          businessName: '스마트 팩토리 A',
          kpi: {
            energySaved: 52500,
            area: 12500,
            co2Reduced: 26250,
            peakReduction: 750
          },
          status: '정상'
        },
        {
          businessName: '스마트 팩토리 B',
          kpi: {
            energySaved: 48700,
            area: 11800,
            co2Reduced: 24350,
            peakReduction: 680
          },
          status: '위험'
        },
        {
          businessName: '스마트 팩토리 C',
          kpi: {
            energySaved: 35200,
            area: 9200,
            co2Reduced: 17600,
            peakReduction: 520
          },
          status: '정상'
        }
      ]
    };
  }
}
