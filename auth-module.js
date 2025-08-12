import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://dfomeijvzayyszisqflo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmb21laWp2emF5eXN6aXNxZmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NjYwNDIsImV4cCI6MjA2MDQ0MjA0Mn0.-r1iL04wvPNdBeIvgxqXLF2rWqIUX5Ot-qGQRdYo_qk";

const authClient = createClient(supabaseUrl, supabaseKey);

window.authClient = authClient;

export async function checkSession() {
    try {
        const { data: { session } } = await authClient.auth.getSession();
        return { session, error: null };
    } catch (error) {
        console.error('세션 확인 오류:', error);
        return { session: null, error };
    }
}

export async function login(employeeId, password) {
    try {
        if (!employeeId || !password) {
            throw new Error('직원번호와 비밀번호를 모두 입력해주세요.');
        }
        
        let normalizedEmployeeId = employeeId.trim();
        
        const isAdmin = normalizedEmployeeId.toLowerCase() === 'admin';
        const isPublic = normalizedEmployeeId.toLowerCase() === 'public';
        
        console.log('로그인 시도:', { employeeId, normalizedEmployeeId, isAdmin, isPublic });
        
        if (!isAdmin && !isPublic) {
            const employeeIdPattern = /^[sS]\d{5}$/;
            
            if (!employeeIdPattern.test(normalizedEmployeeId)) {
                throw new Error('직원번호는 S로 시작하는 5자리 형식이어야 합니다 (예: S12345)');
            }
            
            normalizedEmployeeId = 's' + normalizedEmployeeId.substring(1);
        }
        
        const email = `${normalizedEmployeeId.toLowerCase()}@example.com`;
        
        const { data, error } = await authClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            throw error;
        }
        
        return { user: data.user, error: null };
    } catch (error) {
        console.error('로그인 오류:', error);
        return { user: null, error };
    }
}

export async function logout() {
    try {
        await authClient.auth.signOut();
        return { error: null };
    } catch (error) {
        console.error('로그아웃 오류:', error);
        return { error };
    }
}

export async function register(employeeId, password) {
    try {
        if (!employeeId || !password) {
            throw new Error('직원번호와 비밀번호를 모두 입력해주세요.');
        }
        
        let normalizedEmployeeId = employeeId.trim();
        
        const isAdmin = normalizedEmployeeId.toLowerCase() === 'admin';
        const isPublic = normalizedEmployeeId.toLowerCase() === 'public';
        
        if (!isAdmin && !isPublic) {
            const employeeIdPattern = /^[sS]\d{5}$/;
            
            if (!employeeIdPattern.test(normalizedEmployeeId)) {
                throw new Error('직원번호는 S로 시작하는 5자리 형식이어야 합니다 (예: S12345)');
            }
            
            normalizedEmployeeId = 's' + normalizedEmployeeId.substring(1);
        }
        
        const email = `${normalizedEmployeeId}@example.com`;
        
        const { data, error } = await authClient.auth.signUp({
            email,
            password
        });
        
        if (error) {
            throw error;
        }
        
        return { user: data.user, error: null };
    } catch (error) {
        console.error('회원가입 오류:', error);
        return { user: null, error };
    }
} 