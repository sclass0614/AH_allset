const SUPABASE_URL = "https://dfomeijvzayyszisqflo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmb21laWp2emF5eXN6aXNxZmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjYwNDIsImV4cCI6MjA2MDQ0MjA0Mn0.-r1iL04wvPNdBeIvgxqXLF2rWqIUX5Ot-qGQRdYo_qk";

const TABLE_NAMES = [
    "allsettingtable",
];

const EMPLOYEE_APPROACH_TABLE_NAMES = [
    "employees_approach",
    "employees_approach_table",
    "employeesApproach",
    "EmployeesApproach",
    "employee_approach",
    "employee_approach_table"
];

function createHeaders(accessToken = null) {
    const headers = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY
    };
    
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
        headers['Authorization'] = `Bearer ${SUPABASE_KEY}`;
    }
    
    return headers;
}

async function getEmployeeApproach(employeeId, accessToken = null) {
    try {
        const normalizedEmployeeId = employeeId.toLowerCase();
        
        let allData = [];
        let workingTableName = null;
        
        for (const tableName of EMPLOYEE_APPROACH_TABLE_NAMES) {
            try {
                const testApiUrl = `${SUPABASE_URL}/rest/v1/${tableName}?select=*`;
                
                const testResponse = await fetch(testApiUrl, {
                    method: 'GET',
                    headers: createHeaders(accessToken)
                });
                
                if (testResponse.ok) {
                    const testData = await testResponse.json();
                    
                    if (testData.length > 0) {
                        allData = testData;
                        workingTableName = tableName;
                        break;
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        const specificApiUrl = `${SUPABASE_URL}/rest/v1/employees_approach?직원번호=eq.${normalizedEmployeeId}&select=*`;
        
        const response = await fetch(specificApiUrl, {
            method: 'GET',
            headers: createHeaders(accessToken)
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data && data.length > 0) {
                return {
                    success: true,
                    data: data
                };
            } else {
                return {
                    success: false,
                    error: '해당 직원번호에 대한 접근 권한 정보를 찾을 수 없습니다.'
                };
            }
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function getNavigationData(employeeInfo = null) {
    let lastError = null;
    
    for (const tableName of TABLE_NAMES) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?select=*`, {
                method: 'GET',
                headers: createHeaders()
            });
            
            if (response.ok) {
                let data = await response.json();
                
                if (employeeInfo) {
                    const employeePermissions = Array.isArray(employeeInfo) ? employeeInfo : [employeeInfo];
                    
                    data = data.filter(item => {
                        const hasPermission = employeePermissions.some(permission => {
                            if (permission.카테고리순서 && item.카테고리순서 !== permission.카테고리순서) {
                                return false;
                            }
                            
                            if (permission.업무구분 && item.업무구분 !== permission.업무구분) {
                                return false;
                            }
                            
                            if (permission.연결주소 && item.연결주소 !== permission.연결주소) {
                                return false;
                            }
                            
                            return true;
                        });
                        
                        return hasPermission;
                    });
                }
                
                return {
                    success: true,
                    data: data
                };
            }
            
            lastError = new Error(`HTTP error! status: ${response.status} for table ${tableName}`);
        } catch (error) {
            lastError = error;
        }
    }
    
    return {
        success: false,
        error: lastError ? lastError.message : '알 수 없는 오류'
    };
}

async function getSchemaInfo() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_KEY}`, {
            method: 'GET',
            headers: createHeaders()
        });

        if (!response.ok) {
            throw new Error(`스키마 정보 조회 실패: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data: data
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

const supabase = {
    getNavigationData,
    getEmployeeApproach,
    getSchemaInfo
}; 