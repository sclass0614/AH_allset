/**
 * Supabase 인증 모듈 (auth-module.js)
 * 
 * 이 모듈은 Supabase의 인증 서비스를 사용하여 로그인, 로그아웃, 세션 관리 등의
 * 사용자 인증 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 로그인 (직원번호 + 비밀번호) 처리
 * 2. 로그아웃 처리
 * 3. 세션 확인 및 관리
 * 4. 사용자 등록 (필요시 사용)
 */

// Supabase JS 라이브러리에서 createClient 함수 가져오기
// ESM(ECMAScript Module) 방식으로 불러옴
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Supabase 설정 정보
// URL: Supabase 프로젝트 URL
// KEY: 익명(anon) 키, 클라이언트에서 안전하게 사용 가능
const supabaseUrl = "https://dfomeijvzayyszisqflo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmb21laWp2emF5eXN6aXNxZmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjYwNDIsImV4cCI6MjA2MDQ0MjA0Mn0.-r1iL04wvPNdBeIvgxqXLF2rWqIUX5Ot-qGQRdYo_qk";

// Supabase 클라이언트 인스턴스 생성
// 이 클라이언트를 통해 인증 관련 API 호출
const authClient = createClient(supabaseUrl, supabaseKey);

// 전역으로 노출하여 다른 모듈에서 접근 가능하게 함
window.authClient = authClient;

/**
 * 현재 로그인된 세션을 확인하는 함수
 * 
 * 브라우저의 로컬 스토리지에 저장된 토큰을 검증하여
 * 현재 로그인 상태인지 확인합니다.
 * 
 * @returns {Promise<Object>} 세션 정보와 오류 객체를 포함한 Promise
 *   - session: 로그인된 세션 정보 (없으면 null)
 *   - error: 오류 정보 (없으면 null)
 */
export async function checkSession() {
    try {
        // Supabase의 getSession() 메서드 호출
        // 이 메서드는 로컬 스토리지에 저장된 토큰을 자동으로 확인
        const { data: { session } } = await authClient.auth.getSession();
        return { session, error: null };
    } catch (error) {
        console.error('세션 확인 오류:', error);
        return { session: null, error };
    }
}

/**
 * 직원번호와 비밀번호로 로그인하는 함수
 * 
 * 직원번호는 이메일 형식이 아니므로, 이메일 형식으로 변환하여
 * Supabase 인증 서비스에 전달합니다.
 * 
 * @param {string} employeeId - 사용자의 직원번호 (예: S12345)
 * @param {string} password - 사용자 비밀번호
 * @returns {Promise<Object>} 로그인 결과와 오류 객체를 포함한 Promise
 *   - user: 로그인된 사용자 정보 (실패 시 null)
 *   - error: 오류 정보 (성공 시 null)
 */
export async function login(employeeId, password) {
    try {
        // 직원번호와 비밀번호가 모두 입력되었는지 확인
        if (!employeeId || !password) {
            throw new Error('직원번호와 비밀번호를 모두 입력해주세요.');
        }
        
        // 직원번호 형식 정규화 (대소문자 구분 없이 처리)
        let normalizedEmployeeId = employeeId.trim();
        
        // admin 계정 확인
        const isAdmin = normalizedEmployeeId.toLowerCase() === 'admin';
        
        // 관리자가 아닌 경우에만 형식 검사
        if (!isAdmin) {
            // 정규식으로 형식 확인 (S 또는 s로 시작하고 숫자 5자리)
            // ^ : 문자열 시작
            // [sS] : 소문자 s 또는 대문자 S
            // \d{5} : 숫자 5개
            // $ : 문자열 끝
            const employeeIdPattern = /^[sS]\d{5}$/;
            
            // 형식이 맞지 않으면 오류 발생
            if (!employeeIdPattern.test(normalizedEmployeeId)) {
                throw new Error('직원번호는 S로 시작하는 5자리 형식이어야 합니다 (예: S12345)');
            }
            
            // 첫 글자를 소문자 s로 통일 (대소문자 구분 없이 인식)
            normalizedEmployeeId = 's' + normalizedEmployeeId.substring(1);
        }
        
        // 직원번호를 이메일 형식으로 변환 (Supabase Auth 요구사항)
        // Supabase 인증은 이메일과 비밀번호 방식을 사용하므로 변환 필요
        const email = `${normalizedEmployeeId.toLowerCase()}@example.com`;
        
        // Supabase 로그인 시도
        // signInWithPassword: 이메일과 비밀번호로 로그인 시도
        const { data, error } = await authClient.auth.signInWithPassword({
            email,
            password
        });
        
        // 오류가 있으면 예외 발생
        if (error) {
            throw error;
        }
        
        // 로그인 성공 시 사용자 정보 반환
        return { user: data.user, error: null };
    } catch (error) {
        // 오류 로깅 후 오류 객체 반환
        console.error('로그인 오류:', error);
        return { user: null, error };
    }
}

/**
 * 현재 로그인된 사용자의 로그아웃을 처리하는 함수
 * 
 * 로그아웃 처리 시, 로컬 스토리지에 저장된 세션 토큰이 제거됩니다.
 * 
 * @returns {Promise<Object>} 로그아웃 결과를 포함한 Promise
 *   - error: 오류 정보 (성공 시 null)
 */
export async function logout() {
    try {
        // Supabase 로그아웃 메서드 호출
        // 이 메서드는 로컬 스토리지에서 세션 토큰을 제거
        await authClient.auth.signOut();
        return { error: null };
    } catch (error) {
        // 오류 로깅 후 오류 객체 반환
        console.error('로그아웃 오류:', error);
        return { error };
    }
}

/**
 * 새 사용자를 등록하는 함수 (필요시 사용)
 * 
 * 직원번호와 비밀번호로 새 계정을 생성합니다.
 * 실제 사용 시에는 관리자 권한 검증 등 추가 보안 조치 필요
 * 
 * @param {string} employeeId - 등록할 직원번호 (예: S12345)
 * @param {string} password - 설정할 비밀번호
 * @returns {Promise<Object>} 등록 결과와 오류 객체를 포함한 Promise
 *   - user: 등록된 사용자 정보 (실패 시 null)
 *   - error: 오류 정보 (성공 시 null)
 */
export async function register(employeeId, password) {
    try {
        // 직원번호와 비밀번호가 모두 입력되었는지 확인
        if (!employeeId || !password) {
            throw new Error('직원번호와 비밀번호를 모두 입력해주세요.');
        }
        
        // 직원번호 형식 정규화 (S 또는 s로 시작하는 5자리 숫자 형태로)
        let normalizedEmployeeId = employeeId.trim();
        
        // 정규식으로 형식 확인
        const employeeIdPattern = /^[sS]\d{5}$/;
        
        // 형식이 맞지 않으면 오류 발생
        if (!employeeIdPattern.test(normalizedEmployeeId)) {
            throw new Error('직원번호는 S로 시작하는 5자리 형식이어야 합니다 (예: S12345)');
        }
        
        // 첫 글자를 소문자 s로 통일 (대소문자 구분 없이 인식)
        normalizedEmployeeId = 's' + normalizedEmployeeId.substring(1);
        
        // 직원번호를 이메일 형식으로 변환
        const email = `${normalizedEmployeeId}@example.com`;
        
        // Supabase 회원가입 메서드 호출
        // signUp: 새 사용자 등록 (자동 로그인은 되지 않음)
        const { data, error } = await authClient.auth.signUp({
            email,
            password
        });
        
        // 오류가 있으면 예외 발생
        if (error) {
            throw error;
        }
        
        // 등록 성공 시 사용자 정보 반환
        return { user: data.user, error: null };
    } catch (error) {
        // 오류 로깅 후 오류 객체 반환
        console.error('회원가입 오류:', error);
        return { user: null, error };
    }
} 