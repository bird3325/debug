console.log('AI Web Performance Analyzer - Background Service Worker loaded');

// Listen for tab updates to potentially inject content script or perform analysis
chrome.tabs.onUpdated.addListener((_tabId: number, changeInfo: any, tab: any) => {
   if (changeInfo.status === 'complete' && tab.url) {
      console.log('Page loaded:', tab.url);
   }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
   if (request.type === 'PERFORMANCE_DATA') {
      console.log('Performance data received:', request.data);
      // Here we could store data, trigger AI analysis, etc.
      sendResponse({ success: true });
   }

   if (request.type === 'GET_AI_SUGGESTION') {
      // Mock AI response for now
      const mockSuggestion = generateMockAISuggestion(request.issue);
      sendResponse({ suggestion: mockSuggestion });
   }

   return true; // Keep message channel open for async response
});

function generateMockAISuggestion(issue: any): string {
   if (issue.type === 'error' && issue.message) {
      const msg = issue.message.toLowerCase();
      if (msg.includes('image') || msg.includes('load') || msg.includes('failed')) {
         return `리소스 로딩 오류 분석:

1. 이미지/리소스 경로 확인
   - URL이 올바른지 확인하세요.
   - 파일이 서버에 존재하는지 확인하세요.

2. 네트워크 문제
   - CDN 설정이나 방화벽 규칙을 확인하세요.
   - 브라우저의 네트워크 탭에서 상태 코드를 확인하세요 (404, 403 등).

3. 대체 콘텐츠 제공
   - 이미지의 경우 alt 속성을 제공하세요.
   - 에러 발생 시 대체 이미지를 보여주는 로직을 추가하세요.`;
      }
      if (msg.includes('script') || msg.includes('undefined') || msg.includes('null')) {
         return `스크립트 오류 분석:

1. 변수/객체 초기화 확인
   - undefined나 null 값에 접근하고 있는지 확인하세요.
   - 옵셔널 체이닝(?.)을 사용하세요.

2. 스크립트 로딩 순서
   - 의존성 있는 스크립트가 먼저 로드되었는지 확인하세요.
   - async/defer 속성을 적절히 사용하세요.

3. 디버깅
   - console.log로 변수 상태를 추적하세요.
   - 중단점(Breakpoint)을 사용하여 실행 흐름을 파악하세요.`;
      }
      return `오류 분석: "${issue.message}"

1. 에러 메시지 검색
   - 해당 에러 메시지를 검색 엔진에 검색하여 유사한 사례를 찾아보세요.

2. 코드 리뷰
   - 에러가 발생한 라인 주변의 코드를 검토하세요.
   - 최근 변경 사항이 영향을 주었는지 확인하세요.`;
   }

   const suggestions: Record<string, string> = {
      'lcp': `LCP (Largest Contentful Paint) 개선 방법:
    
1. 이미지 최적화
   - WebP 포맷 사용
   - lazy loading 적용
   - 적절한 이미지 크기 사용

2. 서버 응답 시간 개선
   - CDN 사용
   - 캐싱 전략 개선

3. 렌더링 차단 리소스 제거
   - CSS/JS 최소화
   - Critical CSS 인라인화`,

      'inp': `INP (Interaction to Next Paint) 개선 방법:

1. 긴 작업(Long Tasks) 분할
   - 메인 스레드 차단 시간 줄이기
   - requestIdleCallback 활용

2. 이벤트 핸들러 최적화
   - 복잡한 로직은 Web Worker로 이동
   - 디바운싱/쓰로틀링 적용

3. 렌더링 업데이트 최적화
   - 레이아웃 스래싱 방지
   - content-visibility 속성 활용`,

      'cls': `CLS (Cumulative Layout Shift) 개선 방법:
    
1. 이미지/비디오에 명시적 크기 지정
   - width/height 속성 사용
   - aspect-ratio CSS 속성 활용

2. 동적 콘텐츠 삽입 최소화
   - 광고/임베드는 공간 미리 확보

3. 웹 폰트 최적화
   - font-display: swap 사용`,

      'error': `JavaScript 오류 해결 방법:
    
1. 개발자 도구에서 상세 스택 트레이스 확인
2. try-catch로 에러 핸들링 추가
3. 외부 스크립트는 onerror 이벤트 처리
4. 최신 라이브러리 버전으로 업데이트`
   };

   return suggestions[issue.type] || '이 문제에 대한 AI 분석을 준비중입니다.';
}

export { };
