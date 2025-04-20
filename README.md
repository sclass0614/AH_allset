# 우리집 데이케어센터 통합관리시스템

## 프로젝트 개요

이 프로젝트는 데이케어센터의 다양한 기능을 통합적으로 관리할 수 있는 웹 기반 시스템입니다.

## 기술 스택

- HTML/CSS/JavaScript
- Supabase (백엔드 서비스)

## 변경사항

- Google Apps Script에서 Supabase로 데이터 소스 마이그레이션 완료
- 기존 스프레드시트 기반 데이터 관리에서 Supabase 데이터베이스 활용으로 변경

## 주요 기능

- 카테고리별 메뉴 시스템
- 동적 네비게이션 생성
- 모달 알림 시스템

## 사용 방법

1. 웹 브라우저에서 index.html 파일을 엽니다
2. 필요한 카테고리와 메뉴를 선택하여 해당 기능에 접근합니다

## 데이터베이스 구조

Supabase의 `allsettingTable` 테이블은 다음과 같은 구조로 되어 있습니다:

- 통합관리\_ID: uuid (기본키)
- 카테고리순서: text
- 카테고리: text
- 업무구분: text
- 아이콘: text
- 연결주소: text
- created_at: timestamp with time zone
