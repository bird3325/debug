console.log('AI Web Performance Analyzer - Background Service Worker loaded');

// Listen for tab updates to potentially inject content script or perform analysis
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        console.log('Page loaded:', tab.url);
    }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
