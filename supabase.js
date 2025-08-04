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

// employees_approach 테이블의 가능한 이름들
const EMPLOYEE_APPROACH_TABLE_NAMES = [
    "employees_approach",
    "employees_approach_table",
    "employeesApproach",
    "EmployeesApproach",
    "employee_approach",
    "employee_approach_table"
];

// 헤더 생성 유틸리티 함수
function createHeaders(accessToken = null) {
    const headers = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY
    };
    
    // 인증된 사용자의 토큰이 있으면 사용, 없으면 익명 키 사용
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
        headers['Authorization'] = `Bearer ${SUPABASE_KEY}`;
    }
    
    return headers;
}

// 직원 접근 권한 정보 가져오기
async function getEmployeeApproach(employeeId, accessToken = null) {
    try {
        console.log(`=== 직원 접근 정보 조회 시작 ===`);
        console.log(`입력된 직원번호: ${employeeId}`);
        console.log(`액세스 토큰: ${accessToken ? '있음' : '없음'}`);
        
        // 직원번호를 소문자로 정규화 (CSV 데이터와 일치시키기 위해)
        const normalizedEmployeeId = employeeId.toLowerCase();
        console.log(`정규화된 직원번호: ${normalizedEmployeeId}`);
        
        // 먼저 스키마 정보 확인
        console.log(`\n=== 스키마 정보 확인 ===`);
        const schemaResponse = await fetch(`${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_KEY}`, {
            method: 'GET',
            headers: createHeaders(accessToken)
        });
        
        if (schemaResponse.ok) {
            const schemaData = await schemaResponse.json();
            console.log('사용 가능한 테이블들:', Object.keys(schemaData));
        } else {
            console.log('스키마 정보 조회 실패:', schemaResponse.status);
        }
        
        // API URL 확인
        const apiUrl = `${SUPABASE_URL}/rest/v1/employees_approach?select=*`;
        console.log(`API URL: ${apiUrl}`);
        
        // 헤더 확인
        const headers = createHeaders(accessToken);
        console.log(`요청 헤더:`, headers);
        
        // 먼저 전체 데이터를 조회해서 디버깅
        console.log(`\n=== 전체 데이터 조회 시작 ===`);
        
        // 여러 가능한 테이블 이름 시도
        let allData = [];
        let workingTableName = null;
        
        for (const tableName of EMPLOYEE_APPROACH_TABLE_NAMES) {
            console.log(`\n--- ${tableName} 테이블 시도 ---`);
            const testApiUrl = `${SUPABASE_URL}/rest/v1/${tableName}?select=*`;
            console.log(`테스트 API URL: ${testApiUrl}`);
            
            try {
                const testResponse = await fetch(testApiUrl, {
                    method: 'GET',
                    headers: headers
                });
                
                console.log(`${tableName} 응답 상태:`, testResponse.status);
                
                if (testResponse.ok) {
                    const testData = await testResponse.json();
                    console.log(`${tableName} 데이터 개수:`, testData.length);
                    
                    if (testData.length > 0) {
                        console.log(`${tableName} 첫 번째 레코드:`, testData[0]);
                        allData = testData;
                        workingTableName = tableName;
                        console.log(`✅ ${tableName} 테이블에서 데이터 발견!`);
                        break;
                    }
                } else {
                    console.log(`${tableName} 조회 실패:`, testResponse.status, testResponse.statusText);
                }
            } catch (error) {
                console.log(`${tableName} 오류:`, error.message);
            }
        }
        
        if (workingTableName) {
            console.log(`\n=== ${workingTableName} 테이블 사용 ===`);
            console.log('전체 데이터 개수:', allData.length);
            
            // 데이터 구조 확인
            if (allData.length > 0) {
                console.log('첫 번째 레코드 구조:', allData[0]);
                console.log('첫 번째 레코드의 직원번호:', allData[0].직원번호);
                console.log('직원번호 타입:', typeof allData[0].직원번호);
            }
        } else {
            console.log('\n❌ 모든 테이블에서 데이터를 찾을 수 없습니다.');
        }
        
        // employees_approach 테이블에서 해당 직원번호의 정보 조회
        console.log(`\n=== 특정 직원번호 조회 시작 ===`);
        const specificApiUrl = `${SUPABASE_URL}/rest/v1/employees_approach?직원번호=eq.${normalizedEmployeeId}&select=*`;
        console.log(`특정 직원번호 조회 API URL: ${specificApiUrl}`);
        
        const response = await fetch(specificApiUrl, {
            method: 'GET',
            headers: headers
        });
        
        console.log(`특정 직원번호 조회 응답 상태:`, response.status);
        console.log(`특정 직원번호 조회 응답 상태 텍스트:`, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`특정 직원번호 조회 결과:`, data);
            console.log(`조회된 레코드 개수:`, data.length);
            
            if (data && data.length > 0) {
                console.log(`=== 조회 성공 ===`);
                console.log(`매칭된 레코드들:`, data);
                return {
                    success: true,
                    data: data // 모든 매칭되는 레코드 반환 (한 직원이 여러 권한을 가질 수 있음)
                };
            } else {
                console.log(`=== 조회 실패: 매칭되는 레코드 없음 ===`);
                console.log(`검색한 직원번호: ${normalizedEmployeeId}`);
                console.log(`전체 데이터에서 직원번호 목록:`, allData.map(item => item.직원번호));
                return {
                    success: false,
                    error: '해당 직원번호에 대한 접근 권한 정보를 찾을 수 없습니다.'
                };
            }
        } else {
            console.log(`=== API 호출 실패 ===`);
            const errorText = await response.text();
            console.log('에러 응답 내용:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('직원 접근 정보 조회 오류:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 네비게이션 데이터 가져오기 (직원 정보 기반으로 필터링)
async function getNavigationData(employeeInfo = null) {
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
                let data = await response.json();
                console.log(`'${tableName}' 데이터 가져오기 성공!`);
                
                // 직원 정보가 제공된 경우 필터링 적용
                if (employeeInfo) {
                    console.log('직원 정보 기반 필터링 적용:', employeeInfo);
                    console.log('원본 데이터 개수:', data.length);
                    
                    // employeeInfo가 배열인 경우 (한 직원이 여러 권한을 가질 수 있음)
                    const employeePermissions = Array.isArray(employeeInfo) ? employeeInfo : [employeeInfo];
                    
                    // 직원 정보의 카테고리순서, 업무구분, 연결주소를 기반으로 데이터 필터링
                    data = data.filter(item => {
                        // 직원의 권한 중 하나라도 일치하는지 확인
                        const hasPermission = employeePermissions.some(permission => {
                            // 카테고리순서가 일치하는 항목만 포함
                            if (permission.카테고리순서 && item.카테고리순서 !== permission.카테고리순서) {
                                return false;
                            }
                            
                            // 업무구분이 일치하는 항목만 포함
                            if (permission.업무구분 && item.업무구분 !== permission.업무구분) {
                                return false;
                            }
                            
                            // 연결주소가 일치하는 항목만 포함 (선택적)
                            if (permission.연결주소 && item.연결주소 !== permission.연결주소) {
                                return false;
                            }
                            
                            return true;
                        });
                        
                        if (!hasPermission) {
                            console.log('필터링된 항목:', item);
                        }
                        
                        return hasPermission;
                    });
                    
                    console.log('필터링된 데이터 개수:', data.length);
                    console.log('필터링된 데이터:', data);
                }
                
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
    getEmployeeApproach,
    getSchemaInfo
}; 