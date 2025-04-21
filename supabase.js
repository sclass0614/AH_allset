// Supabase 설정
const SUPABASE_URL = "https://dfomeijvzayyszisqflo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmb21laWp2emF5eXN6aXNxZmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjYwNDIsImV4cCI6MjA2MDQ0MjA0Mn0.-r1iL04wvPNdBeIvgxqXLF2rWqIUX5Ot-qGQRdYo_qk";

// 가능한 테이블 이름 목록
const TABLE_NAMES = [
    "allsettingtable", // 원래 이름
    // "allsetting_table", // 언더스코어 버전
    // "allsettingTable", // 소문자 버전
    // "AllSettingTable", // 카멜케이스 버전
    // "allsetingtable" // 일반적인 오타 버전
];

// 헤더 생성 유틸리티 함수
function createHeaders() {
    return {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
    };
}

// 네비게이션 데이터 가져오기
async function getNavigationData() {
    let lastError = null;
    
    // 각 테이블 이름 시도
    for (const tableName of TABLE_NAMES) {
        try {
            console.log(`테이블 이름 시도: ${tableName}`);
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*`, {
                method: 'GET',
                headers: createHeaders()
            });
            
            console.log(`'${tableName}' 응답 상태:`, response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`'${tableName}' 데이터 가져오기 성공!`);
                return {
                    success: true,
                    data: data
                };
            }
            
            lastError = new Error(`HTTP error! status: ${response.status} for table ${tableName}`);
        } catch (error) {
            console.error(`'${tableName}' 시도 중 오류:`, error);
            lastError = error;
        }
    }
    
    // 모든 시도 실패
    console.error('모든 테이블 이름 시도 실패');
    return {
        success: false,
        error: lastError ? lastError.message : '알 수 없는 오류'
    };
}

// 수파베이스 스키마 정보 가져오기 (디버깅용)
async function getSchemaInfo() {
    try {
        // 스키마 정보 조회
        const response = await fetch(`${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_KEY}`, {
            method: 'GET',
            headers: createHeaders()
        });

        console.log('스키마 응답 상태:', response.status);
        
        if (!response.ok) {
            throw new Error(`스키마 정보 조회 실패: ${response.status}`);
        }

        const data = await response.json();
        console.log('스키마 정보:', data);
        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('스키마 정보 조회 오류:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 수파베이스 모듈 - 함수들을 객체로 노출
const supabase = {
    getNavigationData,
    getSchemaInfo
}; 
